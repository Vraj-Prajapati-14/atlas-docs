/**
 * GST calculation utilities.
 *
 * India GST slabs: 0%, 5%, 12%, 18%, 28%
 * Restaurants typically use: 5% (AC) or 5% (non-AC, no ITC)
 *
 * Intra-state supply: CGST + SGST (split equally)
 * Inter-state supply: IGST (full rate)
 */

export type GSTRate = 0 | 5 | 12 | 18 | 28

export interface GSTBreakdown {
  subtotal: bigint   // pre-tax amount in paise
  cgst: bigint       // Central GST (intra-state: rate/2)
  sgst: bigint       // State GST  (intra-state: rate/2)
  igst: bigint       // Integrated GST (inter-state: full rate)
  totalTax: bigint   // cgst + sgst + igst
  total: bigint      // subtotal + totalTax
  effectiveRate: number
}

export interface BillItemForGST {
  amount: bigint  // pre-tax amount in paise
  gstRate: GSTRate
}

/**
 * Calculate GST for a single line item.
 *
 * @param subtotal - Pre-tax amount in paise
 * @param gstRate  - GST rate (0 | 5 | 12 | 18 | 28)
 * @param isInterState - true for IGST, false for CGST+SGST (default: false)
 */
export function calculateGST(
  subtotal: bigint,
  gstRate: GSTRate,
  isInterState = false,
): GSTBreakdown {
  if (subtotal < 0n) throw new Error(`Subtotal cannot be negative: ${subtotal}`)

  if (gstRate === 0) {
    return { subtotal, cgst: 0n, sgst: 0n, igst: 0n, totalTax: 0n, total: subtotal, effectiveRate: 0 }
  }

  const totalTaxAmount = BigInt(Math.round((Number(subtotal) * gstRate) / 100))

  if (isInterState) {
    return {
      subtotal,
      cgst: 0n,
      sgst: 0n,
      igst: totalTaxAmount,
      totalTax: totalTaxAmount,
      total: subtotal + totalTaxAmount,
      effectiveRate: gstRate,
    }
  }

  // Intra-state: split equally. Give any odd paise to SGST.
  const halfRate = gstRate / 2
  const cgst = BigInt(Math.round((Number(subtotal) * halfRate) / 100))
  const sgst = totalTaxAmount - cgst  // ensures cgst + sgst = totalTaxAmount exactly

  return {
    subtotal,
    cgst,
    sgst,
    igst: 0n,
    totalTax: cgst + sgst,
    total: subtotal + cgst + sgst,
    effectiveRate: gstRate,
  }
}

/**
 * Aggregate GST across multiple bill line items (mixed rates).
 * Used for computing bill totals.
 */
export function calculateBillGST(
  items: BillItemForGST[],
  isInterState = false,
): GSTBreakdown {
  const zero: GSTBreakdown = {
    subtotal: 0n, cgst: 0n, sgst: 0n, igst: 0n, totalTax: 0n, total: 0n, effectiveRate: 0,
  }

  return items.reduce((acc, item) => {
    const breakdown = calculateGST(item.amount, item.gstRate, isInterState)
    return {
      subtotal:      acc.subtotal  + breakdown.subtotal,
      cgst:          acc.cgst      + breakdown.cgst,
      sgst:          acc.sgst      + breakdown.sgst,
      igst:          acc.igst      + breakdown.igst,
      totalTax:      acc.totalTax  + breakdown.totalTax,
      total:         acc.total     + breakdown.total,
      effectiveRate: 0, // mixed rates — not meaningful
    }
  }, zero)
}

/**
 * Extract GST from an inclusive (tax-inclusive) price.
 * Used when GST is already included in the menu price.
 *
 * Formula: taxAmount = totalInclusive - (totalInclusive / (1 + rate/100))
 */
export function extractGSTFromInclusive(
  inclusiveAmount: bigint,
  gstRate: GSTRate,
): { subtotal: bigint; taxAmount: bigint } {
  if (gstRate === 0) return { subtotal: inclusiveAmount, taxAmount: 0n }
  const divisor = 1 + gstRate / 100
  const subtotal = BigInt(Math.round(Number(inclusiveAmount) / divisor))
  const taxAmount = inclusiveAmount - subtotal
  return { subtotal, taxAmount }
}

/** Validate a GST rate is one of the allowed slabs. */
export function isValidGSTRate(rate: number): rate is GSTRate {
  return [0, 5, 12, 18, 28].includes(rate)
}
