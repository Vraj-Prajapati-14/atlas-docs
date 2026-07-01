import { prisma } from '@atlas/db'

export interface AuditLogRow {
  id: string
  adminId: string
  adminName: string
  action: string
  targetType: string | null
  targetId: string | null
  targetName: string | null
  meta: unknown
  ip: string | null
  createdAt: Date
}

export async function getPlatformSettings() {
  const existing = await prisma.platformSettings.findFirst()
  if (existing) return existing

  return prisma.platformSettings.create({ data: {} })
}

export async function updatePlatformSettings(
  data: Partial<{
    monthlyPricePaise: bigint
    yearlyPricePaise: bigint
    lifetimePricePaise: bigint
    gstPercent: number
    trialDays: number
    maxOutlets: number
    maxStaff: number
    kdsEnabled: boolean
    inventoryEnabled: boolean
    supportEmail: string
    supportPhone: string
    updatedBy: string
  }>,
) {
  const existing = await prisma.platformSettings.findFirst()

  if (existing) {
    return prisma.platformSettings.update({
      where: { id: existing.id },
      data,
    })
  }

  return prisma.platformSettings.create({ data: { ...data } })
}

export async function getAuditLog(filter: {
  adminId?: string
  action?: string
  page?: number
  limit?: number
}): Promise<{
  logs: AuditLogRow[]
  total: number
  page: number
  totalPages: number
}> {
  const page = filter.page ?? 1
  const limit = filter.limit ?? 20
  const skip = (page - 1) * limit

  const where = {
    ...(filter.adminId ? { adminId: filter.adminId } : {}),
    ...(filter.action ? { action: filter.action } : {}),
  }

  const [logs, total] = await Promise.all([
    prisma.adminAuditLog.findMany({
      where,
      skip,
      take: limit,
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        adminId: true,
        adminName: true,
        action: true,
        targetType: true,
        targetId: true,
        targetName: true,
        meta: true,
        ip: true,
        createdAt: true,
      },
    }),
    prisma.adminAuditLog.count({ where }),
  ])

  return {
    logs,
    total,
    page,
    totalPages: Math.ceil(total / limit),
  }
}

export async function writeAuditLog(data: {
  adminId: string
  adminName: string
  action: string
  targetType?: string
  targetId?: string
  targetName?: string
  meta?: object
  ip?: string
}): Promise<void> {
  await prisma.adminAuditLog.create({
    data: {
      adminId: data.adminId,
      adminName: data.adminName,
      action: data.action,
      targetType: data.targetType ?? null,
      targetId: data.targetId ?? null,
      targetName: data.targetName ?? null,
      meta: data.meta ?? undefined,
      ip: data.ip ?? null,
    },
  })
}

export async function listAdmins(): Promise<
  {
    id: string
    name: string
    email: string
    role: string
    isActive: boolean
    lastLoginAt: Date | null
    createdAt: Date
  }[]
> {
  return prisma.superAdmin.findMany({
    orderBy: { createdAt: 'asc' },
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      isActive: true,
      lastLoginAt: true,
      createdAt: true,
    },
  })
}

export async function toggleAdminActive(
  id: string,
  isActive: boolean,
): Promise<{ id: string; isActive: boolean }> {
  const updated = await prisma.superAdmin.update({
    where: { id },
    data: { isActive },
    select: { id: true, isActive: true },
  })
  return updated
}
