import { prisma } from '@atlas/db'
import { KOTStatus } from '@atlas/types'
import { BadRequestError, NotFoundError } from '../../shared/errors.js'
import { buildPagination } from '../../shared/response.js'
import type { ListKOTsInput } from './kots.schema.js'

// ─── Select shapes ────────────────────────────────────────────────────────────

const KOT_DETAIL_INCLUDE = {
  items: {
    orderBy: { id: 'asc' as const },
  },
  order: {
    select: {
      id: true,
      orderNumber: true,
      type: true,
      guestCount: true,
      note: true,
      table: { select: { id: true, name: true, floorId: true } },
      customer: { select: { id: true, name: true, phone: true } },
    },
  },
} as const

// ─── Active statuses — used by KDS to show the work queue ────────────────────

const ACTIVE_STATUSES = [KOTStatus.PENDING, KOTStatus.ACCEPTED, KOTStatus.IN_PROGRESS]

// ─── Helpers ──────────────────────────────────────────────────────────────────

// Cascades order status to READY when all KOTs for an order are terminal (DONE / CANCELLED).
async function maybeCascadeOrderReady(
  tx: Omit<typeof prisma, '$connect' | '$disconnect' | '$on' | '$transaction' | '$use' | '$extends'>,
  orderId: string,
): Promise<void> {
  const pending = await tx.kOT.count({
    where: { orderId, status: { notIn: ['DONE', 'CANCELLED'] } },
  })
  if (pending === 0) {
    await tx.order.update({ where: { id: orderId }, data: { status: 'READY' } })
  }
}

// ─── KOT queries ─────────────────────────────────────────────────────────────

export async function listKOTs(tenantId: string, query: ListKOTsInput) {
  const { page, limit, outletId, status, active, date } = query
  const skip = (page - 1) * limit

  let statusFilter: object | undefined
  if (active === true) {
    statusFilter = { status: { in: ACTIVE_STATUSES } }
  } else if (status) {
    statusFilter = { status }
  }

  let dateFilter: { gte: Date; lt: Date } | undefined
  if (date) {
    const start = new Date(`${date}T00:00:00.000Z`)
    const end = new Date(start)
    end.setUTCDate(end.getUTCDate() + 1)
    dateFilter = { gte: start, lt: end }
  }

  // If outletId is given we join through order since KOT has no outletId directly.
  // Prisma nested where on relation covers this cleanly.
  const where = {
    tenantId,
    ...(statusFilter ?? {}),
    ...(dateFilter ? { createdAt: dateFilter } : {}),
    ...(outletId ? { order: { outletId } } : {}),
  }

  const [kots, total] = await Promise.all([
    prisma.kOT.findMany({
      where,
      skip,
      take: limit,
      orderBy: { createdAt: 'asc' }, // FIFO for kitchen
      include: KOT_DETAIL_INCLUDE,
    }),
    prisma.kOT.count({ where }),
  ])

  return { kots, pagination: buildPagination(total, page, limit) }
}

export async function getKOT(tenantId: string, id: string) {
  const kot = await prisma.kOT.findFirst({
    where: { id, tenantId },
    include: KOT_DETAIL_INCLUDE,
  })
  if (!kot) throw new NotFoundError('KOT', id)
  return kot
}

// ─── KOT status transitions ───────────────────────────────────────────────────

export async function acceptKOT(tenantId: string, id: string) {
  const kot = await prisma.kOT.findFirst({
    where: { id, tenantId },
    select: { id: true, status: true },
  })
  if (!kot) throw new NotFoundError('KOT', id)
  if (kot.status !== KOTStatus.PENDING) {
    throw new BadRequestError(`KOT must be PENDING to accept (current: ${kot.status})`)
  }

  return prisma.kOT.update({
    where: { id },
    data: { status: KOTStatus.ACCEPTED, acceptedAt: new Date() },
    include: KOT_DETAIL_INCLUDE,
  })
}

export async function startKOT(tenantId: string, id: string) {
  const kot = await prisma.kOT.findFirst({
    where: { id, tenantId },
    select: { id: true, status: true, orderId: true },
  })
  if (!kot) throw new NotFoundError('KOT', id)

  // Allow starting from PENDING too (some kitchens skip the accept step)
  const startableStatuses: string[] = [KOTStatus.PENDING, KOTStatus.ACCEPTED]
  if (!startableStatuses.includes(kot.status)) {
    throw new BadRequestError(`KOT must be PENDING or ACCEPTED to start (current: ${kot.status})`)
  }

  return prisma.$transaction(async (tx) => {
    const updated = await tx.kOT.update({
      where: { id },
      data: {
        status: KOTStatus.IN_PROGRESS,
        ...(kot.status === KOTStatus.PENDING ? { acceptedAt: new Date() } : {}),
        startedAt: new Date(),
      },
      include: KOT_DETAIL_INCLUDE,
    })

    // Cascade order to IN_PROGRESS on first KOT start
    await tx.order.updateMany({
      where: { id: kot.orderId, status: 'CONFIRMED' },
      data: { status: 'IN_PROGRESS' },
    })

    return updated
  })
}

export async function doneKOT(tenantId: string, id: string) {
  const kot = await prisma.kOT.findFirst({
    where: { id, tenantId },
    select: { id: true, status: true, orderId: true },
  })
  if (!kot) throw new NotFoundError('KOT', id)
  if (kot.status !== KOTStatus.IN_PROGRESS) {
    throw new BadRequestError(`KOT must be IN_PROGRESS to mark as done (current: ${kot.status})`)
  }

  return prisma.$transaction(async (tx) => {
    const updated = await tx.kOT.update({
      where: { id },
      data: { status: KOTStatus.DONE, doneAt: new Date() },
      include: KOT_DETAIL_INCLUDE,
    })

    // If all KOTs for the order are terminal, advance order to READY
    await maybeCascadeOrderReady(tx, kot.orderId)

    return updated
  })
}

export async function cancelKOT(tenantId: string, id: string) {
  const kot = await prisma.kOT.findFirst({
    where: { id, tenantId },
    select: { id: true, status: true, orderId: true },
  })
  if (!kot) throw new NotFoundError('KOT', id)

  const terminalStatuses: string[] = [KOTStatus.DONE, KOTStatus.CANCELLED]
  if (terminalStatuses.includes(kot.status)) {
    throw new BadRequestError(`KOT is already ${kot.status.toLowerCase()}`)
  }

  return prisma.$transaction(async (tx) => {
    // Cancel the order items associated with this KOT's items
    const kotItems = await tx.kOTItem.findMany({
      where: { kotId: id },
      select: { orderItemId: true },
    })
    const orderItemIds = kotItems.map((ki) => ki.orderItemId)

    if (orderItemIds.length > 0) {
      await tx.orderItem.updateMany({
        where: { id: { in: orderItemIds } },
        data: { status: 'CANCELLED' },
      })
    }

    const updated = await tx.kOT.update({
      where: { id },
      data: { status: KOTStatus.CANCELLED },
      include: KOT_DETAIL_INCLUDE,
    })

    // Cancelling a KOT may complete the order's kitchen work
    await maybeCascadeOrderReady(tx, kot.orderId)

    return updated
  })
}

export async function markPrinted(tenantId: string, id: string) {
  const kot = await prisma.kOT.findFirst({
    where: { id, tenantId },
    select: { id: true },
  })
  if (!kot) throw new NotFoundError('KOT', id)

  return prisma.kOT.update({
    where: { id },
    data: { printedAt: new Date() },
    include: KOT_DETAIL_INCLUDE,
  })
}
