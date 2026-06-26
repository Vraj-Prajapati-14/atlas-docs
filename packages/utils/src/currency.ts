/**
 * Currency utilities — all monetary values stored as BigInt in paise.
 * 1 Indian Rupee = 100 paise.
 *
 * Rule: NEVER use floating point for money. Ever.
 * All DB columns are BIGINT. All calculations use BigInt.
 * Convert to number only for display/formatting.
 */

export const PAISE_PER_RUPEE = 100n

/**
 * Convert rupees (number) to paise (BigInt).
 * Rounds to nearest paise to handle floating point input.
 *
 * @example rupeesToPaise(320.5) → 32050n
 */
export function rupeesToPaise(rupees: number): bigint {
  if (!isFinite(rupees)) throw new Error(`Invalid rupee amount: ${rupees}`)
  return BigInt(Math.round(rupees * 100))
}

/**
 * Convert paise (BigInt) to rupees (number) — for display only.
 * Do NOT use the result in further monetary calculations.
 *
 * @example paiseToupees(32050n) → 320.5
 */
export function paiseToRupees(paise: bigint): number {
  return Number(paise) / 100
}

/**
 * Format paise as Indian Rupee string for display.
 *
 * @example formatINR(32050n) → "₹320.50"
 * @example formatINR(32050n, { compact: true }) → "₹320"
 */
export function formatINR(
  paise: bigint,
  options: { compact?: boolean; showSymbol?: boolean } = {},
): string {
  const rupees = paiseToRupees(paise)
  const { compact = false, showSymbol = true } = options

  const formatted = new Intl.NumberFormat('en-IN', {
    style: showSymbol ? 'currency' : 'decimal',
    currency: 'INR',
    minimumFractionDigits: compact ? 0 : 2,
    maximumFractionDigits: compact ? 0 : 2,
  }).format(rupees)

  return formatted
}

/** Add two paise amounts safely. */
export function addPaise(a: bigint, b: bigint): bigint {
  return a + b
}

/** Subtract b from a. Throws if result would be negative. */
export function subtractPaise(a: bigint, b: bigint): bigint {
  if (b > a) {
    throw new Error(
      `Underflow: cannot subtract ${formatINR(b)} from ${formatINR(a)}`,
    )
  }
  return a - b
}

/**
 * Multiply a paise amount by a quantity.
 * Handles fractional quantities (e.g. 2.5 portions).
 *
 * @example multiplyPaise(32050n, 2) → 64100n
 * @example multiplyPaise(10000n, 1.5) → 15000n
 */
export function multiplyPaise(paise: bigint, quantity: number): bigint {
  if (quantity < 0) throw new Error(`Quantity cannot be negative: ${quantity}`)
  return BigInt(Math.round(Number(paise) * quantity))
}

/**
 * Apply a percentage to a paise amount.
 * Used for GST, service charge, discounts.
 *
 * @example applyPercentage(10000n, 18) → 1800n  (18% on ₹100)
 */
export function applyPercentage(paise: bigint, percentage: number): bigint {
  if (percentage < 0 || percentage > 100) {
    throw new Error(`Invalid percentage: ${percentage}. Must be 0–100.`)
  }
  return BigInt(Math.round((Number(paise) * percentage) / 100))
}

/**
 * Round paise to nearest rupee (for round-off on bills).
 * Returns { rounded, roundOff } where roundOff can be negative.
 *
 * @example roundToRupee(32050n) → { rounded: 32100n, roundOff: 50n }
 * @example roundToRupee(32080n) → { rounded: 32100n, roundOff: 20n }
 * @example roundToRupee(32040n) → { rounded: 32000n, roundOff: -40n }
 */
export function roundToRupee(paise: bigint): { rounded: bigint; roundOff: bigint } {
  const rupees = Number(paise) / 100
  const roundedRupees = Math.round(rupees)
  const rounded = BigInt(roundedRupees * 100)
  const roundOff = rounded - paise
  return { rounded, roundOff }
}

/** Assert a value is non-negative paise. Throws on negative. */
export function assertPositivePaise(paise: bigint, label = 'amount'): void {
  if (paise < 0n) throw new Error(`${label} cannot be negative: ${paise}`)
}
