import { prisma } from '@atlas/db'
import { BadRequestError, ConflictError, NotFoundError } from '../../shared/errors.js'
import { buildPagination } from '../../shared/response.js'
import { sendBillReceipt } from '../notifications/notifications.service.js'
import type {
  GenerateBillInput,
  ListBillsInput,
  RecordPaymentInput,
  VoidBillInput,
} from './billing.schema.js'

// ─── Select shapes ────────────────────────────────────────────────────────────

const BILL_INCLUDE = {
  order: {
    select: {
      id: true,
      orderNumber: true,
      type: true,
      guestCount: true,
      table: { select: { id: true, name: true } },
      items: {
        select: {
          id: true,
          menuItemName: true,
          variantName: true,
          quantity: true,
          unitPriceInPaise: true,
          totalPriceInPaise: true,
          gstRate: true,
          isGSTInclusive: true,
        },
        orderBy: { createdAt: 'asc' as const },
      },
    },
  },
  payments: {
    orderBy: { paidAt: 'asc' as const },
  },
  voidedBy: { select: { id: true, name: true, role: true } },
} as const

// ─── Bill calculation ─────────────────────────────────────────────────────────

type BillItem = {
  totalPriceInPaise: bigint
  gstRate: number
  isGSTInclusive: boolean
}

type BillAmounts = {
  subtotalInPaise: bigint
  discountInPaise: bigint
  serviceChargeInPaise: bigint
  cgstInPaise: bigint
  sgstInPaise: bigint
  igstInPaise: bigint
  roundOffInPaise: bigint
  grandTotalInPaise: bigint
}

function calculateBillAmounts(
  items: BillItem[],
  discountInPaise: bigint,
  serviceChargePercent: number,
  applyServiceCharge: boolean,
  isInterState: boolean,
  roundOffBill: boolean,
): BillAmounts {
  // 1. Subtotal — sum of item totals as priced (exclusive prices are pre-tax; inclusive already include tax)
  const subtotalInPaise = items.reduce((sum, i) => sum + i.totalPriceInPaise, 0n)

  // 2. Clamp discount
  const safeDiscount = discountInPaise > subtotalInPaise ? subtotalInPaise : discountInPaise
  const discountedSubtotal = subtotalInPaise - safeDiscount

  // 3. Service charge applied on discounted subtotal
  const serviceChargeInPaise = applyServiceCharge
    ? (discountedSubtotal * BigInt(serviceChargePercent)) / 100n
    : 0n

  // 4. Taxable base = discounted subtotal + service charge
  const taxableBase = discountedSubtotal + serviceChargeInPaise

  // 5. GST calculation per rate group
  // For exclusive items: GST is added on top of their price
  // For inclusive items: GST is extracted from their price
  // Pro-rate the taxable base across GST rate groups proportionally to each group's subtotal share.

  let cgstInPaise = 0n
  let sgstInPaise = 0n
  let igstInPaise = 0n

  // Group by (gstRate, isGSTInclusive)
  const gstGroups = new Map<string, { subtotal: bigint; rate: number; inclusive: boolean }>()
  for (const item of items) {
    if (item.gstRate === 0) continue
    const key = `${item.gstRate}:${item.isGSTInclusive}`
    const existing = gstGroups.get(key)
    if (existing) {
      gstGroups.set(key, { ...existing, subtotal: existing.subtotal + item.totalPriceInPaise })
    } else {
      gstGroups.set(key, { subtotal: item.totalPriceInPaise, rate: item.gstRate, inclusive: item.isGSTInclusive })
    }
  }

  // Track GST separately: exclusive items have GST added on top; inclusive items have GST embedded in price.
  let exclusiveGSTTotal = 0n

  for (const group of gstGroups.values()) {
    // Pro-rate the taxable base for this group proportionally to its share of the subtotal
    const groupTaxableBase = subtotalInPaise > 0n ? (taxableBase * group.subtotal) / subtotalInPaise : 0n
    let groupGST: bigint

    if (group.inclusive) {
      // GST is already embedded in the price — extract it for the bill breakdown
      groupGST = (groupTaxableBase * BigInt(group.rate)) / (100n + BigInt(group.rate))
    } else {
      // GST is added on top — both shown on bill and added to grand total
      groupGST = (groupTaxableBase * BigInt(group.rate)) / 100n
      exclusiveGSTTotal += groupGST
    }

    if (isInterState) {
      igstInPaise += groupGST
    } else {
      cgstInPaise += groupGST / 2n
      sgstInPaise += groupGST - groupGST / 2n
    }
  }

  // 6. Grand total before round-off
  // Inclusive items: GST is already in taxableBase — don't add it again
  // Exclusive items: add GST on top of taxableBase
  const grandTotalBeforeRound = taxableBase + exclusiveGSTTotal

  // 7. Round to nearest rupee (100 paise)
  let roundOffInPaise = 0n
  let grandTotalInPaise = grandTotalBeforeRound

  if (roundOffBill && grandTotalBeforeRound > 0n) {
    const roundedTotal = BigInt(Math.round(Number(grandTotalBeforeRound) / 100)) * 100n
    roundOffInPaise = roundedTotal - grandTotalBeforeRound
    grandTotalInPaise = roundedTotal
  }

  return {
    subtotalInPaise,
    discountInPaise: safeDiscount,
    serviceChargeInPaise,
    cgstInPaise,
    sgstInPaise,
    igstInPaise,
    roundOffInPaise,
    grandTotalInPaise,
  }
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function todayMonthPrefix(): string {
  const d = new Date()
  const yyyymm = `${d.getUTCFullYear()}${String(d.getUTCMonth() + 1).padStart(2, '0')}`
  return `INV-${yyyymm}-`
}

// ─── Generate bill ────────────────────────────────────────────────────────────

const BILLABLE_STATUSES = new Set(['CONFIRMED', 'IN_PROGRESS', 'READY', 'SERVED'])

export async function generateBill(tenantId: string, data: GenerateBillInput) {
  const order = await prisma.order.findFirst({
    where: { id: data.orderId, tenantId },
    include: {
      items: {
        where: { status: { not: 'CANCELLED' } },
        select: {
          id: true,
          totalPriceInPaise: true,
          gstRate: true,
          isGSTInclusive: true,
        },
      },
      bill: { select: { id: true } },
    },
  })
  if (!order) throw new NotFoundError('Order', data.orderId)
  if (!BILLABLE_STATUSES.has(order.status)) {
    throw new BadRequestError(`Cannot bill an order in ${order.status} status`)
  }
  if (order.bill) throw new ConflictError('A bill already exists for this order — void it first to regenerate')
  if (order.items.length === 0) throw new BadRequestError('Order has no active items to bill')

  // Load tenant settings
  const settings = await prisma.tenantSettings.findUnique({ where: { tenantId } })
  const serviceChargePercent = settings?.serviceChargePercent ?? 0
  const serviceChargeOnTakeaway = settings?.serviceChargeOnTakeaway ?? false
  const isInterState = settings?.isInterState ?? false
  const roundOffBill = settings?.roundOffBill ?? true

  const applyServiceCharge = order.type !== 'TAKEAWAY' || serviceChargeOnTakeaway

  const amounts = calculateBillAmounts(
    order.items,
    BigInt(data.discountInPaise),
    serviceChargePercent,
    applyServiceCharge,
    isInterState,
    roundOffBill,
  )

  // Load customer info (if order has a linked customer)
  let customerName = data.customerName
  let customerPhone = data.customerPhone
  let customerGSTIN = data.customerGSTIN

  if (!customerName && order.customerId) {
    const customer = await prisma.customer.findUnique({
      where: { id: order.customerId },
      select: { name: true, phone: true, gstin: true },
    })
    if (customer) {
      customerName = customerName ?? customer.name
      customerPhone = customerPhone ?? customer.phone
      customerGSTIN = customerGSTIN ?? (customer.gstin ?? undefined)
    }
  }

  return prisma.$transaction(async (tx) => {
    // Generate bill number (monthly sequential)
    const prefix = todayMonthPrefix()
    const last = await tx.bill.findFirst({
      where: { tenantId, billNumber: { startsWith: prefix } },
      orderBy: { billNumber: 'desc' },
      select: { billNumber: true },
    })
    const seq = last ? parseInt(last.billNumber.slice(prefix.length), 10) + 1 : 1
    const billNumber = `${prefix}${String(seq).padStart(6, '0')}`

    const bill = await tx.bill.create({
      data: {
        tenantId,
        outletId: order.outletId,
        orderId: order.id,
        billNumber,
        subtotalInPaise: amounts.subtotalInPaise,
        discountInPaise: amounts.discountInPaise,
        ...(data.discountReasonCode ? { discountReasonCode: data.discountReasonCode } : {}),
        serviceChargePercent,
        serviceChargeInPaise: amounts.serviceChargeInPaise,
        cgstInPaise: amounts.cgstInPaise,
        sgstInPaise: amounts.sgstInPaise,
        igstInPaise: amounts.igstInPaise,
        roundOffInPaise: amounts.roundOffInPaise,
        grandTotalInPaise: amounts.grandTotalInPaise,
        paymentStatus: 'PENDING',
        ...(customerName ? { customerName } : {}),
        ...(customerPhone ? { customerPhone } : {}),
        ...(customerGSTIN ? { customerGSTIN } : {}),
      },
      include: BILL_INCLUDE,
    })

    // Advance order to BILLED
    await tx.order.update({ where: { id: order.id }, data: { status: 'BILLED' } })

    return bill
  })
}

// ─── List / get bills ─────────────────────────────────────────────────────────

export async function listBills(tenantId: string, query: ListBillsInput) {
  const { page, limit, outletId, paymentStatus, date } = query
  const skip = (page - 1) * limit

  let dateFilter: { gte: Date; lt: Date } | undefined
  if (date) {
    const start = new Date(`${date}T00:00:00.000Z`)
    const end = new Date(start)
    end.setUTCDate(end.getUTCDate() + 1)
    dateFilter = { gte: start, lt: end }
  }

  const where = {
    tenantId,
    ...(outletId ? { outletId } : {}),
    ...(paymentStatus ? { paymentStatus } : {}),
    ...(dateFilter ? { createdAt: dateFilter } : {}),
  }

  const [bills, total] = await Promise.all([
    prisma.bill.findMany({
      where,
      skip,
      take: limit,
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        billNumber: true,
        subtotalInPaise: true,
        discountInPaise: true,
        serviceChargeInPaise: true,
        cgstInPaise: true,
        sgstInPaise: true,
        igstInPaise: true,
        roundOffInPaise: true,
        grandTotalInPaise: true,
        paymentStatus: true,
        customerName: true,
        customerPhone: true,
        voidedAt: true,
        createdAt: true,
        order: {
          select: {
            id: true,
            orderNumber: true,
            type: true,
            table: { select: { id: true, name: true } },
          },
        },
        _count: { select: { payments: true } },
      },
    }),
    prisma.bill.count({ where }),
  ])

  return { bills, pagination: buildPagination(total, page, limit) }
}

export async function getBill(tenantId: string, id: string) {
  const bill = await prisma.bill.findFirst({
    where: { id, tenantId },
    include: BILL_INCLUDE,
  })
  if (!bill) throw new NotFoundError('Bill', id)
  return bill
}

// ─── Record payment ───────────────────────────────────────────────────────────

export async function recordPayment(tenantId: string, billId: string, data: RecordPaymentInput) {
  const bill = await prisma.bill.findFirst({
    where: { id: billId, tenantId },
    include: { payments: { select: { amountInPaise: true } } },
  })
  if (!bill) throw new NotFoundError('Bill', billId)
  if (bill.voidedAt) throw new BadRequestError('Cannot add payment to a voided bill')
  if (bill.paymentStatus === 'PAID') throw new BadRequestError('Bill is already fully paid')

  const alreadyPaid = bill.payments.reduce((sum, p) => sum + p.amountInPaise, 0n)
  const remaining = bill.grandTotalInPaise - alreadyPaid

  if (BigInt(data.amountInPaise) > remaining + 100n) {
    // Allow up to ₹1 overpayment (change is common at counters), reject clear overpayments
    throw new BadRequestError(
      `Payment of ₹${(data.amountInPaise / 100).toFixed(2)} exceeds remaining balance of ₹${(Number(remaining) / 100).toFixed(2)}`,
    )
  }

  return prisma.$transaction(async (tx) => {
    await tx.payment.create({
      data: {
        billId,
        method: data.method,
        amountInPaise: BigInt(data.amountInPaise),
        ...(data.referenceId ? { referenceId: data.referenceId } : {}),
      },
    })

    const newTotal = alreadyPaid + BigInt(data.amountInPaise)
    const isPaid = newTotal >= bill.grandTotalInPaise

    const paymentStatus = isPaid ? 'PAID' : newTotal > 0n ? 'PARTIAL' : 'PENDING'

    await tx.bill.update({ where: { id: billId }, data: { paymentStatus } })

    if (isPaid) {
      // Advance order to PAID
      await tx.order.update({ where: { id: bill.orderId }, data: { status: 'PAID', closedAt: new Date() } })

      // Free the table for cleaning
      const order = await tx.order.findUnique({
        where: { id: bill.orderId },
        select: { tableId: true, type: true },
      })
      if (order?.type === 'DINE_IN' && order.tableId) {
        await tx.table.update({ where: { id: order.tableId }, data: { status: 'CLEANING' } })
      }

      // Update customer lifetime stats
      await tx.customer
        .updateMany({
          where: { id: { not: undefined }, orders: { some: { id: bill.orderId } } },
          data: {
            totalVisits: { increment: 1 },
            totalSpentPaise: { increment: bill.grandTotalInPaise },
            lastVisitAt: new Date(),
          },
        })
        .catch(() => undefined) // non-blocking; customer may be anonymous
    }

    const updatedBill = await tx.bill.findUnique({ where: { id: billId }, include: BILL_INCLUDE })
    return updatedBill
  }).then((updatedBill) => {
    // After the transaction commits, send receipt if bill is now fully paid
    if (updatedBill?.paymentStatus === 'PAID') {
      sendBillReceipt(tenantId, billId).catch(() => undefined)
    }
    return updatedBill
  })
}

// ─── Void bill ────────────────────────────────────────────────────────────────

export async function voidBill(
  tenantId: string,
  billId: string,
  voidedById: string,
  data: VoidBillInput,
) {
  const bill = await prisma.bill.findFirst({
    where: { id: billId, tenantId },
    select: {
      id: true,
      billNumber: true,
      orderId: true,
      paymentStatus: true,
      voidedAt: true,
      order: { select: { tableId: true, type: true } },
    },
  })
  if (!bill) throw new NotFoundError('Bill', billId)
  if (bill.voidedAt) throw new BadRequestError('Bill is already voided')

  return prisma.$transaction(async (tx) => {
    await tx.bill.update({
      where: { id: billId },
      data: { voidedAt: new Date(), voidReason: data.reason, voidedById },
    })

    // Revert order to SERVED so cashier can regenerate bill
    await tx.order.update({ where: { id: bill.orderId }, data: { status: 'SERVED', closedAt: null } })

    // If bill was PAID, restore table to OCCUPIED
    if (bill.paymentStatus === 'PAID' && bill.order.type === 'DINE_IN' && bill.order.tableId) {
      await tx.table.update({ where: { id: bill.order.tableId }, data: { status: 'OCCUPIED' } })
    }

    // Audit trail — non-blocking within transaction
    await tx.auditLog.create({
      data: {
        tenantId,
        userId: voidedById,
        action: 'BILL_VOID',
        entityType: 'Bill',
        entityId: billId,
        newValues: { reason: data.reason, billNumber: bill.billNumber },
      },
    })

    return tx.bill.findUnique({ where: { id: billId }, include: BILL_INCLUDE })
  })
}
