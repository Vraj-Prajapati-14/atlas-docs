import type { FastifyInstance } from 'fastify'
import { z } from 'zod'
import { ok } from '../../shared/response.js'
import { ValidationError } from '../../shared/errors.js'
import { authenticate } from '../../shared/middleware/authenticate.js'
import { requireRole } from '../../shared/middleware/require-role.js'
import { UserRole, NotificationChannel } from '@atlas/types'
import { config } from '../../config/index.js'
import {
  listNotifications,
  sendBillReceipt,
  sendNightlySummary,
} from './notifications.service.js'

function validate<S extends z.ZodTypeAny>(schema: S, data: unknown): z.output<S> {
  const result = schema.safeParse(data)
  if (!result.success) throw new ValidationError('Invalid request', result.error.errors)
  return result.data as z.output<S>
}

const ListNotificationsQuery = z.object({
  type: z.string().optional(),
  channel: z.nativeEnum(NotificationChannel).optional(),
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
})

const MANAGER_GUARD = [authenticate, requireRole(UserRole.OWNER, UserRole.MANAGER)]

export async function notificationsRoutes(app: FastifyInstance): Promise<void> {
  // List notification history
  app.get('/', { preHandler: MANAGER_GUARD }, async (request, reply) => {
    const query = validate(ListNotificationsQuery, request.query)
    return ok(reply, await listNotifications(request.user.tenantId, query))
  })

  // Manually send bill receipt (e.g. customer asks again)
  app.post('/bill-receipt/:billId', { preHandler: authenticate }, async (request, reply) => {
    const { billId } = validate(z.object({ billId: z.string().min(1) }), request.params)
    const result = await sendBillReceipt(request.user.tenantId, billId)
    return ok(reply, result ?? { skipped: true, reason: 'No customer phone on bill' })
  })

  // Trigger nightly summary — callable by OWNER/MANAGER or cron job with CRON_SECRET
  app.post('/nightly-summary', async (request, reply) => {
    const cronSecret = (request.headers['x-cron-secret'] as string | undefined) ?? ''
    const hasCronAuth = config.CRON_SECRET && cronSecret === config.CRON_SECRET

    if (!hasCronAuth) {
      // Fall back to normal JWT auth for OWNER/MANAGER
      await authenticate(request, reply)
      await requireRole(UserRole.OWNER, UserRole.MANAGER)(request, reply)
    }

    const tenantId = hasCronAuth
      ? validate(z.object({ tenantId: z.string().min(1) }), request.body).tenantId
      : request.user.tenantId

    return ok(reply, await sendNightlySummary(tenantId))
  })
}
