import { prisma } from '@atlas/db'
import { NotFoundError } from '../../shared/errors.js'

export interface BroadcastRow {
  id: string
  adminId: string
  adminName: string
  type: string
  title: string
  body: string
  targetType: string
  targetValue: string | null
  expiresAt: Date | null
  createdAt: Date
  _count: { dismissals: number }
}

export async function listBroadcasts(filter: {
  page?: number
  limit?: number
}): Promise<{
  broadcasts: BroadcastRow[]
  total: number
  page: number
  totalPages: number
}> {
  const page = filter.page ?? 1
  const limit = filter.limit ?? 20
  const skip = (page - 1) * limit

  const [broadcasts, total] = await Promise.all([
    prisma.broadcast.findMany({
      skip,
      take: limit,
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        adminId: true,
        adminName: true,
        type: true,
        title: true,
        body: true,
        targetType: true,
        targetValue: true,
        expiresAt: true,
        createdAt: true,
        _count: { select: { dismissals: true } },
      },
    }),
    prisma.broadcast.count(),
  ])

  return {
    broadcasts,
    total,
    page,
    totalPages: Math.ceil(total / limit),
  }
}

export async function createBroadcast(data: {
  adminId: string
  adminName: string
  type: string
  title: string
  body: string
  targetType: string
  targetValue?: string
  expiresAt?: Date
}) {
  return prisma.broadcast.create({
    data: {
      adminId: data.adminId,
      adminName: data.adminName,
      type: data.type,
      title: data.title,
      body: data.body,
      targetType: data.targetType,
      targetValue: data.targetValue ?? null,
      expiresAt: data.expiresAt ?? null,
    },
  })
}

export async function deleteBroadcast(id: string): Promise<{ id: string }> {
  const existing = await prisma.broadcast.findUnique({ where: { id } })
  if (!existing) throw new NotFoundError('Broadcast not found')

  await prisma.broadcast.delete({ where: { id } })
  return { id }
}

export async function getUnreadBroadcasts(
  tenantId: string,
): Promise<{ id: string; type: string; title: string; body: string; createdAt: Date }[]> {
  const now = new Date()

  // Fetch broadcasts that are still active (not expired)
  const broadcasts = await prisma.broadcast.findMany({
    where: {
      AND: [
        {
          OR: [{ expiresAt: null }, { expiresAt: { gt: now } }],
        },
        {
          dismissals: {
            none: { tenantId },
          },
        },
      ],
    },
    orderBy: { createdAt: 'desc' },
    select: {
      id: true,
      type: true,
      title: true,
      body: true,
      targetType: true,
      targetValue: true,
      createdAt: true,
    },
  })

  // Get the tenant's plan status for ACTIVE targeting
  const tenant = await prisma.tenant.findUnique({
    where: { id: tenantId },
    select: { planStatus: true },
  })

  const tenantStatus = tenant?.planStatus ?? null

  // Filter by targetType
  const filtered = broadcasts.filter((b) => {
    if (b.targetType === 'ALL') return true
    if (b.targetType === 'ACTIVE') return tenantStatus === 'ACTIVE'
    if (b.targetType === 'PENDING') return tenantStatus === 'PENDING_PAYMENT'
    if (b.targetType === 'SPECIFIC') {
      if (!b.targetValue) return false
      const ids = b.targetValue.split(',').map((s) => s.trim())
      return ids.includes(tenantId)
    }
    return false
  })

  return filtered.map(({ id, type, title, body, createdAt }) => ({
    id,
    type,
    title,
    body,
    createdAt,
  }))
}

export async function dismissBroadcast(
  broadcastId: string,
  tenantId: string,
): Promise<{ broadcastId: string; tenantId: string }> {
  await prisma.broadcastDismissal.upsert({
    where: { broadcastId_tenantId: { broadcastId, tenantId } },
    update: { dismissedAt: new Date() },
    create: { broadcastId, tenantId },
  })
  return { broadcastId, tenantId }
}
