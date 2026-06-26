import { prisma } from '@atlas/db'
import { PaymentStatus } from '@atlas/types'
import type {
  DailyReportInput,
  DateRangeInput,
  GSTReportInput,
  InventoryValuationInput,
} from './reports.schema.js'

// ─── Helpers ──────────────────────────────────────────────────────────────────

function dayBounds(dateStr: string): { gte: Date; lt: Date } {
  const gte = new Date(`${dateStr}T00:00:00.000Z`)
  const lt = new Date(`${dateStr}T00:00:00.000Z`)
  lt.setUTCDate(lt.getUTCDate() + 1)
  return { gte, lt }
}

function rangeBounds(from: string, to: string): { gte: Date; lt: Date } {
  const gte = new Date(`${from}T00:00:00.000Z`)
  const lt = new Date(`${to}T00:00:00.000Z`)
  lt.setUTCDate(lt.getUTCDate() + 1)
  return { gte, lt }
}

function paise(n: bigint): number {
  return Number(n)
}

// ─── Daily Sales Summary ──────────────────────────────────────────────────────

export async function getDailySummary(tenantId: string, query: DailyReportInput) {
  const { date, outletId } = query
  const { gte, lt } = dayBounds(date)
  const billWhere = {
    tenantId,
    paymentStatus: PaymentStatus.PAID,
    createdAt: { gte, lt },
    ...(outletId ? { outletId } : {}),
  }

  const [bills, cancelledCount, totalOrderCount] = await Promise.all([
    prisma.bill.findMany({
      where: billWhere,
      include: {
        payments: { select: { method: true, amountInPaise: true } },
        order: {
          select: {
            items: {
              where: { status: { not: 'CANCELLED' } },
              select: { menuItemName: true, quantity: true, totalPriceInPaise: true },
            },
          },
        },
      },
    }),
    prisma.order.count({
      where: {
        tenantId,
        status: 'CANCELLED',
        createdAt: { gte, lt },
        ...(outletId ? { outletId } : {}),
      },
    }),
    prisma.order.count({
      where: {
        tenantId,
        createdAt: { gte, lt },
        ...(outletId ? { outletId } : {}),
      },
    }),
  ])

  // Revenue aggregation
  let grossRevenue = 0n
  let discountTotal = 0n
  let cgstTotal = 0n
  let sgstTotal = 0n
  let igstTotal = 0n

  const paymentBreakdown: Record<string, number> = {}
  const itemQty: Record<string, number> = {}
  const itemRevenue: Record<string, bigint> = {}

  for (const bill of bills) {
    grossRevenue += bill.grandTotalInPaise
    discountTotal += bill.discountInPaise
    cgstTotal += bill.cgstInPaise
    sgstTotal += bill.sgstInPaise
    igstTotal += bill.igstInPaise

    for (const payment of bill.payments) {
      const method = payment.method as string
      paymentBreakdown[method] = (paymentBreakdown[method] ?? 0) + paise(payment.amountInPaise)
    }

    for (const item of bill.order.items) {
      itemQty[item.menuItemName] = (itemQty[item.menuItemName] ?? 0) + item.quantity
      itemRevenue[item.menuItemName] = (itemRevenue[item.menuItemName] ?? 0n) + item.totalPriceInPaise
    }
  }

  const paidOrders = bills.length
  const avgCheckInPaise = paidOrders > 0 ? grossRevenue / BigInt(paidOrders) : 0n

  // Top 10 items by quantity
  const topItems = Object.entries(itemQty)
    .map(([name, qty]) => ({ name, qty, revenueInPaise: paise(itemRevenue[name] ?? 0n) }))
    .sort((a, b) => b.qty - a.qty)
    .slice(0, 10)

  return {
    date,
    totalOrders: totalOrderCount,
    paidOrders,
    cancelledOrders: cancelledCount,
    grossRevenueInPaise: paise(grossRevenue),
    discountInPaise: paise(discountTotal),
    netRevenueInPaise: paise(grossRevenue - discountTotal),
    avgCheckInPaise: paise(avgCheckInPaise),
    tax: {
      cgstInPaise: paise(cgstTotal),
      sgstInPaise: paise(sgstTotal),
      igstInPaise: paise(igstTotal),
      totalInPaise: paise(cgstTotal + sgstTotal + igstTotal),
    },
    paymentBreakdown,
    topItems,
  }
}

// Re-exported for the nightly summary notification
export { getDailySummary as computeDailySummary }

// ─── Item-wise Sales Report ───────────────────────────────────────────────────

export async function getItemSalesReport(tenantId: string, query: DateRangeInput) {
  const { from, to, outletId } = query
  const { gte, lt } = rangeBounds(from, to)

  // Paid orders in range
  const orders = await prisma.order.findMany({
    where: {
      tenantId,
      status: 'PAID',
      createdAt: { gte, lt },
      ...(outletId ? { outletId } : {}),
    },
    select: {
      items: {
        where: { status: { not: 'CANCELLED' } },
        select: {
          menuItemId: true,
          menuItemName: true,
          variantName: true,
          quantity: true,
          totalPriceInPaise: true,
          gstRate: true,
        },
      },
    },
  })

  const itemMap = new Map<
    string,
    { name: string; variantName: string | null; qty: number; revenueInPaise: bigint; gstRate: number }
  >()

  for (const order of orders) {
    for (const item of order.items) {
      const key = `${item.menuItemId}:${item.variantName ?? ''}`
      const existing = itemMap.get(key)
      if (existing) {
        existing.qty += item.quantity
        existing.revenueInPaise += item.totalPriceInPaise
      } else {
        itemMap.set(key, {
          name: item.menuItemName,
          variantName: item.variantName ?? null,
          qty: item.quantity,
          revenueInPaise: item.totalPriceInPaise,
          gstRate: item.gstRate,
        })
      }
    }
  }

  const items = [...itemMap.values()]
    .map((item) => ({ ...item, revenueInPaise: paise(item.revenueInPaise) }))
    .sort((a, b) => b.revenueInPaise - a.revenueInPaise)

  return { from, to, items, totalItems: items.length }
}

// ─── Payment Method Breakdown ─────────────────────────────────────────────────

export async function getPaymentReport(tenantId: string, query: DateRangeInput) {
  const { from, to, outletId } = query
  const { gte, lt } = rangeBounds(from, to)

  const payments = await prisma.payment.findMany({
    where: {
      paidAt: { gte, lt },
      bill: {
        tenantId,
        ...(outletId ? { outletId } : {}),
      },
    },
    select: { method: true, amountInPaise: true, paidAt: true },
  })

  const breakdown: Record<string, { count: number; totalInPaise: number }> = {}
  let grandTotal = 0n

  for (const payment of payments) {
    const method = payment.method as string
    if (!breakdown[method]) breakdown[method] = { count: 0, totalInPaise: 0 }
    breakdown[method].count += 1
    breakdown[method].totalInPaise += paise(payment.amountInPaise)
    grandTotal += payment.amountInPaise
  }

  return {
    from,
    to,
    breakdown,
    grandTotalInPaise: paise(grandTotal),
    transactionCount: payments.length,
  }
}

// ─── GST Summary ─────────────────────────────────────────────────────────────

export async function getGSTReport(tenantId: string, query: GSTReportInput) {
  const { month, outletId } = query
  const gte = new Date(`${month}-01T00:00:00.000Z`)
  const lt = new Date(gte)
  lt.setUTCMonth(lt.getUTCMonth() + 1)

  const bills = await prisma.bill.findMany({
    where: {
      tenantId,
      paymentStatus: PaymentStatus.PAID,
      createdAt: { gte, lt },
      ...(outletId ? { outletId } : {}),
      voidedAt: null,
    },
    select: {
      billNumber: true,
      subtotalInPaise: true,
      discountInPaise: true,
      serviceChargeInPaise: true,
      cgstInPaise: true,
      sgstInPaise: true,
      igstInPaise: true,
      grandTotalInPaise: true,
    },
  })

  let totalTaxable = 0n
  let totalCGST = 0n
  let totalSGST = 0n
  let totalIGST = 0n
  let totalRevenue = 0n

  for (const bill of bills) {
    totalTaxable += bill.subtotalInPaise - bill.discountInPaise + bill.serviceChargeInPaise
    totalCGST += bill.cgstInPaise
    totalSGST += bill.sgstInPaise
    totalIGST += bill.igstInPaise
    totalRevenue += bill.grandTotalInPaise
  }

  return {
    month,
    billCount: bills.length,
    taxableValueInPaise: paise(totalTaxable),
    cgstInPaise: paise(totalCGST),
    sgstInPaise: paise(totalSGST),
    igstInPaise: paise(totalIGST),
    totalGSTInPaise: paise(totalCGST + totalSGST + totalIGST),
    grossRevenueInPaise: paise(totalRevenue),
  }
}

// ─── Inventory Valuation ──────────────────────────────────────────────────────

export async function getInventoryValuation(tenantId: string, _query: InventoryValuationInput) {
  const items = await prisma.inventoryItem.findMany({
    where: { tenantId, isActive: true },
    include: { category: { select: { id: true, name: true } } },
    orderBy: { name: 'asc' },
  })

  let totalValueInPaise = 0n

  const rows = items.map((item) => {
    const qty = item.currentStock.toNumber()
    const costPaise = Number(item.pricePerUnitPaise)
    const valueInPaise = Math.round(qty * costPaise)
    totalValueInPaise += BigInt(valueInPaise)

    return {
      id: item.id,
      name: item.name,
      category: item.category?.name ?? null,
      unit: item.unit,
      currentStock: qty,
      lowStockThreshold: item.lowStockThreshold.toNumber(),
      pricePerUnitPaise: costPaise,
      valueInPaise,
      isLowStock: qty <= item.lowStockThreshold.toNumber(),
    }
  })

  return {
    items: rows,
    totalItems: rows.length,
    lowStockCount: rows.filter((r) => r.isLowStock).length,
    totalValueInPaise: paise(totalValueInPaise),
  }
}
