import type { FastifyInstance } from 'fastify'
import { z } from 'zod'
import { ok } from '../../shared/response.js'
import { ValidationError, NotFoundError } from '../../shared/errors.js'
import { authenticate } from '../../shared/middleware/authenticate.js'
import { requireRole } from '../../shared/middleware/require-role.js'
import { UserRole, StaffNotifSenderType, StaffNotifType, StaffNotifPriority, StaffNotifTargetType } from '@atlas/types'
import {
  createStaffNotification,
  getNotificationsForUser,
  getUnreadCount,
  markRead,
  markAllRead,
  getSentNotifications,
} from './staff-notifications.service.js'

function validate<S extends z.ZodTypeAny>(schema: S, data: unknown): z.output<S> {
  const result = schema.safeParse(data)
  if (!result.success) throw new ValidationError('Invalid request', result.error.errors)
  return result.data as z.output<S>
}

const SENDER_GUARD = [authenticate, requireRole(
  UserRole.OWNER,
  UserRole.MANAGER,
)]

const SendSchema = z.object({
  type:          z.nativeEnum(StaffNotifType).optional(),
  title:         z.string().min(1).max(120),
  body:          z.string().min(1).max(2000),
  priority:      z.nativeEnum(StaffNotifPriority).optional(),
  targetType:    z.nativeEnum(StaffNotifTargetType).optional(),
  targetRoles:   z.array(z.nativeEnum(UserRole)).optional(),
  targetUserIds: z.array(z.string().cuid()).optional(),
  expiresAt:     z.string().datetime().optional(),
})

export async function staffNotificationsRoutes(app: FastifyInstance): Promise<void> {
  // ─── Inbox: notifications for the logged-in user ──────────────────────────

  // GET /staff-notifications — inbox list
  app.get('/', { preHandler: authenticate }, async (request, reply) => {
    const { page, limit } = validate(
      z.object({
        page:  z.coerce.number().int().positive().default(1),
        limit: z.coerce.number().int().min(1).max(50).default(20),
      }),
      request.query,
    )
    const { tenantId, sub: userId, role } = request.user
    return ok(reply, await getNotificationsForUser(tenantId, userId, role, page, limit))
  })

  // GET /staff-notifications/unread-count
  app.get('/unread-count', { preHandler: authenticate }, async (request, reply) => {
    const { tenantId, sub: userId, role } = request.user
    return ok(reply, await getUnreadCount(tenantId, userId, role))
  })

  // POST /staff-notifications/:id/read — mark one as read
  app.post('/:id/read', { preHandler: authenticate }, async (request, reply) => {
    const { id } = validate(z.object({ id: z.string().min(1) }), request.params)
    const { tenantId, sub: userId } = request.user
    try {
      return ok(reply, await markRead(id, userId, tenantId))
    } catch {
      throw new NotFoundError('Notification not found')
    }
  })

  // POST /staff-notifications/read-all — mark all as read
  app.post('/read-all', { preHandler: authenticate }, async (request, reply) => {
    const { tenantId, sub: userId, role } = request.user
    return ok(reply, await markAllRead(tenantId, userId, role))
  })

  // ─── Sent: notifications sent by this user ────────────────────────────────

  // GET /staff-notifications/sent
  app.get('/sent', { preHandler: SENDER_GUARD }, async (request, reply) => {
    const { page, limit } = validate(
      z.object({
        page:  z.coerce.number().int().positive().default(1),
        limit: z.coerce.number().int().min(1).max(50).default(20),
      }),
      request.query,
    )
    const { tenantId, sub: senderId } = request.user
    return ok(reply, await getSentNotifications(tenantId, senderId, page, limit))
  })

  // ─── Send: create a new staff notification ────────────────────────────────

  // POST /staff-notifications/send
  app.post('/send', { preHandler: SENDER_GUARD }, async (request, reply) => {
    const body = validate(SendSchema, request.body)
    const { tenantId, sub: senderId, role } = request.user

    const senderType = role === UserRole.OWNER
      ? StaffNotifSenderType.OWNER
      : StaffNotifSenderType.MANAGER

    const notification = await createStaffNotification({
      tenantId,
      senderId,
      senderType,
      senderName: senderId, // service resolves actual name from DB
      type:          body.type,
      title:         body.title,
      body:          body.body,
      priority:      body.priority,
      targetType:    body.targetType,
      targetRoles:   body.targetRoles,
      targetUserIds: body.targetUserIds,
      expiresAt:     body.expiresAt ? new Date(body.expiresAt) : undefined,
    })

    return ok(reply, notification, 201)
  })
}
