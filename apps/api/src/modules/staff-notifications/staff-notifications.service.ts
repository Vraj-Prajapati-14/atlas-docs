import { prisma, Prisma } from '@atlas/db'
import { StaffNotifSenderType, StaffNotifType, StaffNotifPriority, StaffNotifTargetType, UserRole } from '@atlas/types'

export interface CreateNotificationInput {
  tenantId:       string
  senderId?:      string
  senderType:     StaffNotifSenderType
  senderName:     string
  type?:          StaffNotifType
  title:          string
  body:           string
  priority?:      StaffNotifPriority
  targetType?:    StaffNotifTargetType
  targetRoles?:   UserRole[]
  targetUserIds?: string[]
  expiresAt?:     Date
}

export async function createStaffNotification(input: CreateNotificationInput) {
  // Resolve senderName from DB if we only have an ID placeholder
  let senderName = input.senderName
  if (input.senderId && (!senderName || senderName === input.senderId)) {
    const user = await prisma.user.findUnique({
      where: { id: input.senderId },
      select: { name: true },
    })
    senderName = user?.name ?? 'Unknown'
  }

  return prisma.staffNotification.create({
    data: {
      tenantId:      input.tenantId,
      senderId:      input.senderId,
      senderType:    input.senderType,
      senderName,
      type:          input.type          ?? StaffNotifType.ANNOUNCEMENT,
      title:         input.title,
      body:          input.body,
      priority:      input.priority      ?? StaffNotifPriority.NORMAL,
      targetType:    input.targetType    ?? StaffNotifTargetType.ALL_STAFF,
      targetRoles:   input.targetRoles   ?? Prisma.JsonNull,
      targetUserIds: input.targetUserIds ?? Prisma.JsonNull,
      expiresAt:     input.expiresAt     ?? null,
    },
  })
}

function buildTargetFilter(userId: string, userRole: string) {
  return {
    OR: [
      { targetType: StaffNotifTargetType.ALL_STAFF },
      { targetType: StaffNotifTargetType.ROLE,          targetRoles:   { array_contains: userRole } },
      { targetType: StaffNotifTargetType.SPECIFIC_USER, targetUserIds: { array_contains: userId   } },
    ],
  }
}

function buildActiveFilter() {
  return {
    OR: [
      { expiresAt: null },
      { expiresAt: { gt: new Date() } },
    ],
  }
}

export async function getNotificationsForUser(
  tenantId: string,
  userId:   string,
  userRole: string,
  page    = 1,
  limit   = 20,
) {
  const skip = (page - 1) * limit
  const where = {
    tenantId,
    AND: [buildTargetFilter(userId, userRole), buildActiveFilter()],
  }

  const [items, total] = await Promise.all([
    prisma.staffNotification.findMany({
      where,
      include: {
        reads: { where: { userId }, select: { readAt: true } },
      },
      orderBy: { createdAt: 'desc' },
      skip,
      take: limit,
    }),
    prisma.staffNotification.count({ where }),
  ])

  return {
    items: items.map(({ reads, ...n }) => ({
      ...n,
      isRead: reads.length > 0,
      readAt: reads[0]?.readAt ?? null,
    })),
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
      hasNext: page * limit < total,
      hasPrev: page > 1,
    },
  }
}

export async function getUnreadCount(tenantId: string, userId: string, userRole: string) {
  const count = await prisma.staffNotification.count({
    where: {
      tenantId,
      AND: [buildTargetFilter(userId, userRole), buildActiveFilter()],
      reads: { none: { userId } },
    },
  })
  return { unread: count }
}

export async function markRead(notificationId: string, userId: string, tenantId: string) {
  const notification = await prisma.staffNotification.findFirst({
    where: { id: notificationId, tenantId },
  })
  if (!notification) throw new Error('Notification not found')

  await prisma.staffNotificationRead.upsert({
    where:  { notificationId_userId: { notificationId, userId } },
    create: { notificationId, userId },
    update: {},
  })
  return { ok: true }
}

export async function markAllRead(tenantId: string, userId: string, userRole: string) {
  const unread = await prisma.staffNotification.findMany({
    where: {
      tenantId,
      AND: [buildTargetFilter(userId, userRole), buildActiveFilter()],
      reads: { none: { userId } },
    },
    select: { id: true },
  })

  if (unread.length === 0) return { marked: 0 }

  await prisma.staffNotificationRead.createMany({
    data:           unread.map((n) => ({ notificationId: n.id, userId })),
    skipDuplicates: true,
  })
  return { marked: unread.length }
}

export async function getSentNotifications(
  tenantId: string,
  senderId: string,
  page    = 1,
  limit   = 20,
) {
  const skip = (page - 1) * limit
  const where = { tenantId, senderId }

  const [items, total] = await Promise.all([
    prisma.staffNotification.findMany({
      where,
      include: { _count: { select: { reads: true } } },
      orderBy: { createdAt: 'desc' },
      skip,
      take: limit,
    }),
    prisma.staffNotification.count({ where }),
  ])

  return {
    items: items.map(({ _count, ...n }) => ({ ...n, readCount: _count.reads })),
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
      hasNext: page * limit < total,
      hasPrev: page > 1,
    },
  }
}
