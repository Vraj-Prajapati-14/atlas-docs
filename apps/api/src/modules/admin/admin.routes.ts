import type { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify'
import { z } from 'zod'
import { ok } from '../../shared/response.js'
import { ValidationError, UnauthorizedError } from '../../shared/errors.js'
import {
  adminLogin,
  listTenants,
  getTenantDetail,
  setTenantStatus,
  createAdminAccount,
} from './admin.service.js'
import type { TenantPlanStatus } from '@atlas/db'
import { getDashboardStats, getAnalytics } from './stats.service.js'
import { listPayments, recordPayment, deletePayment, listCosts, recordCost, deleteCost } from './financial.service.js'
import { listTickets, getTicketDetail, createTicket, updateTicket, addComment } from './tickets.service.js'
import { listBroadcasts, createBroadcast, deleteBroadcast } from './broadcasts.service.js'
import { getPlatformSettings, updatePlatformSettings, getAuditLog, writeAuditLog, listAdmins, toggleAdminActive } from './platform.service.js'

function validate<S extends z.ZodTypeAny>(schema: S, data: unknown): z.output<S> {
  const result = schema.safeParse(data)
  if (!result.success) throw new ValidationError('Invalid request body', result.error.errors)
  return result.data as z.output<S>
}

// Super-admin JWT uses a separate secret from tenant JWTs
async function authenticateSuperAdmin(request: FastifyRequest, _reply: FastifyReply) {
  const authHeader = request.headers.authorization
  if (!authHeader?.startsWith('Bearer ')) throw new UnauthorizedError('Missing admin token')

  const token = authHeader.slice(7)

  try {
    const payload = request.server.jwt.verify<{ sub: string; tenantId: string; role: string }>(token)
    if (payload.tenantId !== '__admin__' || payload.role !== 'SUPER_ADMIN' || (payload as { sessionId?: string }).sessionId === 'admin_refresh') {
      throw new UnauthorizedError('Not a super-admin token')
    }
    (request as FastifyRequest & { adminId: string }).adminId = payload.sub
  } catch {
    throw new UnauthorizedError('Invalid or expired admin token')
  }
}

const ADMIN_ACCESS_TTL = 60 * 60              // 1 hour
const ADMIN_REFRESH_TTL = 30 * 24 * 60 * 60  // 30 days

function signAdminAccess(app: FastifyInstance, adminId: string) {
  const exp = Math.floor(Date.now() / 1000) + ADMIN_ACCESS_TTL
  return app.jwt.sign({ sub: adminId, tenantId: '__admin__', role: 'SUPER_ADMIN', sessionId: 'admin', exp } as never)
}

function signAdminRefresh(app: FastifyInstance, adminId: string) {
  const exp = Math.floor(Date.now() / 1000) + ADMIN_REFRESH_TTL
  return app.jwt.sign({ sub: adminId, tenantId: '__admin__', role: 'SUPER_ADMIN', sessionId: 'admin_refresh', exp } as never)
}

export async function adminRoutes(app: FastifyInstance): Promise<void> {
  // ─── POST /admin/auth/login ──────────────────────────────────────────────────
  app.post('/auth/login', { config: { rateLimit: { max: 10, timeWindow: '15 minutes' } } }, async (request, reply) => {
    const { email, password } = validate(
      z.object({ email: z.string().email(), password: z.string().min(1) }),
      request.body,
    )

    const admin = await adminLogin(email, password)

    // exp embedded in payload so the global JWT_EXPIRES_IN=15m plugin default is bypassed
    const accessToken = signAdminAccess(app, admin.id)
    const refreshToken = signAdminRefresh(app, admin.id)

    return ok(reply, { admin, accessToken, refreshToken })
  })

  // ─── POST /admin/auth/refresh ────────────────────────────────────────────────
  app.post('/auth/refresh', async (request, reply) => {
    const { refreshToken } = validate(
      z.object({ refreshToken: z.string().min(1) }),
      request.body,
    )

    let payload: { sub: string; tenantId: string; role: string; sessionId: string }
    try {
      payload = app.jwt.verify(refreshToken) as typeof payload
    } catch {
      throw new UnauthorizedError('Invalid or expired refresh token')
    }

    if (payload.tenantId !== '__admin__' || payload.role !== 'SUPER_ADMIN' || payload.sessionId !== 'admin_refresh') {
      throw new UnauthorizedError('Invalid refresh token')
    }

    const accessToken = signAdminAccess(app, payload.sub)
    return ok(reply, { accessToken })
  })

  // ─── All routes below require super-admin auth ───────────────────────────────

  // GET /admin/tenants
  app.get('/tenants', { preHandler: [authenticateSuperAdmin] }, async (request, reply) => {
    const query = validate(
      z.object({
        search: z.string().optional(),
        planStatus: z.enum(['PENDING_PAYMENT', 'ACTIVE', 'SUSPENDED']).optional(),
        page: z.coerce.number().int().positive().optional(),
        limit: z.coerce.number().int().positive().optional(),
      }),
      request.query,
    )
    return ok(reply, await listTenants(query as { planStatus?: TenantPlanStatus; search?: string; page?: number; limit?: number }))
  })

  // GET /admin/tenants/:id
  app.get('/tenants/:id', { preHandler: [authenticateSuperAdmin] }, async (request, reply) => {
    const { id } = validate(z.object({ id: z.string().min(1) }), request.params)
    return ok(reply, await getTenantDetail(id))
  })

  // PATCH /admin/tenants/:id/status — activate | suspend | pending
  app.patch('/tenants/:id/status', { preHandler: [authenticateSuperAdmin] }, async (request, reply) => {
    const { id } = validate(z.object({ id: z.string().min(1) }), request.params)
    const { status } = validate(
      z.object({ status: z.enum(['PENDING_PAYMENT', 'ACTIVE', 'SUSPENDED']) }),
      request.body,
    )
    return ok(reply, await setTenantStatus(id, status as TenantPlanStatus))
  })

  // POST /admin/setup — one-time: create the first super-admin account
  // Protected by SUPER_ADMIN_JWT_SECRET being set
  app.post('/setup', async (request, reply) => {
    const { name, email, password } = validate(
      z.object({
        name: z.string().min(2).max(100),
        email: z.string().email(),
        password: z.string().min(12, 'Admin password must be at least 12 characters'),
      }),
      request.body,
    )
    const admin = await createAdminAccount(name, email, password)
    return ok(reply, admin)
  })

  // ─── GET /admin/stats ────────────────────────────────────────────────────────
  app.get('/stats', { preHandler: [authenticateSuperAdmin] }, async (_request, reply) => {
    return ok(reply, await getDashboardStats())
  })

  // ─── GET /admin/analytics ────────────────────────────────────────────────────
  app.get('/analytics', { preHandler: [authenticateSuperAdmin] }, async (_request, reply) => {
    return ok(reply, await getAnalytics())
  })

  // ─── Payments ────────────────────────────────────────────────────────────────

  // GET /admin/payments?tenantId?&month?&page?&limit?
  app.get('/payments', { preHandler: [authenticateSuperAdmin] }, async (request, reply) => {
    const query = validate(
      z.object({
        tenantId: z.string().optional(),
        month: z.coerce.number().int().optional(),
        page: z.coerce.number().int().positive().optional(),
        limit: z.coerce.number().int().positive().optional(),
      }),
      request.query,
    )
    return ok(reply, await listPayments(query))
  })

  // POST /admin/payments
  app.post('/payments', { preHandler: [authenticateSuperAdmin] }, async (request, reply) => {
    const adminId = (request as FastifyRequest & { adminId: string }).adminId
    const body = validate(
      z.object({
        tenantId: z.string().min(1),
        amountPaise: z.number(),
        planType: z.enum(['MONTHLY', 'YEARLY', 'LIFETIME']),
        paymentMethod: z.string().min(1),
        paidAt: z.string().min(1),
        notes: z.string().optional(),
      }),
      request.body,
    )
    const payment = await recordPayment({
      tenantId: body.tenantId,
      adminId,
      amountPaise: BigInt(Math.round(body.amountPaise)),
      planType: body.planType,
      paymentMethod: body.paymentMethod,
      paidAt: new Date(body.paidAt),
      notes: body.notes,
    })
    await writeAuditLog({
      adminId,
      adminName: '',
      action: 'RECORD_PAYMENT',
      targetType: 'Tenant',
      targetId: body.tenantId,
      meta: { amountPaise: body.amountPaise, planType: body.planType },
    })
    return ok(reply, payment)
  })

  // DELETE /admin/payments/:id
  app.delete('/payments/:id', { preHandler: [authenticateSuperAdmin] }, async (request, reply) => {
    const { id } = validate(z.object({ id: z.string().min(1) }), request.params)
    return ok(reply, await deletePayment(id))
  })

  // ─── Costs ───────────────────────────────────────────────────────────────────

  // GET /admin/costs?month?&category?&page?&limit?
  app.get('/costs', { preHandler: [authenticateSuperAdmin] }, async (request, reply) => {
    const query = validate(
      z.object({
        month: z.coerce.number().int().optional(),
        category: z.string().optional(),
        page: z.coerce.number().int().positive().optional(),
        limit: z.coerce.number().int().positive().optional(),
      }),
      request.query,
    )
    return ok(reply, await listCosts(query))
  })

  // POST /admin/costs
  app.post('/costs', { preHandler: [authenticateSuperAdmin] }, async (request, reply) => {
    const adminId = (request as FastifyRequest & { adminId: string }).adminId
    const body = validate(
      z.object({
        month: z.coerce.number().int(),
        category: z.string().min(1),
        description: z.string().min(1),
        amountPaise: z.number(),
      }),
      request.body,
    )
    return ok(reply, await recordCost({
      month: body.month,
      category: body.category,
      description: body.description,
      amountPaise: BigInt(Math.round(body.amountPaise)),
      adminId,
    }))
  })

  // DELETE /admin/costs/:id
  app.delete('/costs/:id', { preHandler: [authenticateSuperAdmin] }, async (request, reply) => {
    const { id } = validate(z.object({ id: z.string().min(1) }), request.params)
    return ok(reply, await deleteCost(id))
  })

  // ─── Tickets ─────────────────────────────────────────────────────────────────

  // GET /admin/tickets?status?&priority?&category?&tenantId?&page?&limit?
  app.get('/tickets', { preHandler: [authenticateSuperAdmin] }, async (request, reply) => {
    const query = validate(
      z.object({
        status: z.string().optional(),
        priority: z.string().optional(),
        category: z.string().optional(),
        tenantId: z.string().optional(),
        page: z.coerce.number().int().positive().optional(),
        limit: z.coerce.number().int().positive().optional(),
      }),
      request.query,
    )
    return ok(reply, await listTickets(query))
  })

  // POST /admin/tickets
  app.post('/tickets', { preHandler: [authenticateSuperAdmin] }, async (request, reply) => {
    const adminId = (request as FastifyRequest & { adminId: string }).adminId
    const body = validate(
      z.object({
        tenantId: z.string().min(1),
        category: z.string().min(1),
        priority: z.string().min(1),
        title: z.string().min(1),
        body: z.string().min(1),
      }),
      request.body,
    )
    return ok(reply, await createTicket({
      ...body,
      raisedById: adminId,
      raisedByType: 'ADMIN',
    }))
  })

  // GET /admin/tickets/:id
  app.get('/tickets/:id', { preHandler: [authenticateSuperAdmin] }, async (request, reply) => {
    const { id } = validate(z.object({ id: z.string().min(1) }), request.params)
    return ok(reply, await getTicketDetail(id))
  })

  // PATCH /admin/tickets/:id
  app.patch('/tickets/:id', { preHandler: [authenticateSuperAdmin] }, async (request, reply) => {
    const { id } = validate(z.object({ id: z.string().min(1) }), request.params)
    const body = validate(
      z.object({
        status: z.string().optional(),
        priority: z.string().optional(),
        assignedTo: z.string().optional(),
        resolvedAt: z.string().optional(),
        closedAt: z.string().optional(),
      }),
      request.body,
    )
    return ok(reply, await updateTicket(id, {
      status: body.status,
      priority: body.priority,
      assignedTo: body.assignedTo,
      resolvedAt: body.resolvedAt ? new Date(body.resolvedAt) : undefined,
      closedAt: body.closedAt ? new Date(body.closedAt) : undefined,
    }))
  })

  // POST /admin/tickets/:id/comments
  app.post('/tickets/:id/comments', { preHandler: [authenticateSuperAdmin] }, async (request, reply) => {
    const adminId = (request as FastifyRequest & { adminId: string }).adminId
    const { id } = validate(z.object({ id: z.string().min(1) }), request.params)
    const body = validate(
      z.object({ body: z.string().min(1) }),
      request.body,
    )
    const admins = await listAdmins()
    const admin = admins.find((a: { id: string }) => a.id === adminId)
    const authorName = (admin as { name?: string } | undefined)?.name ?? 'Super Admin'
    return ok(reply, await addComment(id, {
      authorId: adminId,
      authorType: 'ADMIN',
      authorName,
      body: body.body,
    }))
  })

  // ─── Broadcasts ──────────────────────────────────────────────────────────────

  // GET /admin/broadcasts?page?&limit?
  app.get('/broadcasts', { preHandler: [authenticateSuperAdmin] }, async (request, reply) => {
    const query = validate(
      z.object({
        page: z.coerce.number().int().positive().optional(),
        limit: z.coerce.number().int().positive().optional(),
      }),
      request.query,
    )
    return ok(reply, await listBroadcasts(query))
  })

  // POST /admin/broadcasts
  app.post('/broadcasts', { preHandler: [authenticateSuperAdmin] }, async (request, reply) => {
    const adminId = (request as FastifyRequest & { adminId: string }).adminId
    const body = validate(
      z.object({
        type: z.string().min(1),
        title: z.string().min(1),
        body: z.string().min(1),
        targetType: z.string().min(1),
        targetValue: z.string().optional(),
        expiresAt: z.string().optional(),
      }),
      request.body,
    )
    const admins = await listAdmins()
    const admin = admins.find((a: { id: string }) => a.id === adminId)
    const adminName = (admin as { name?: string } | undefined)?.name ?? 'Super Admin'
    return ok(reply, await createBroadcast({
      adminId,
      adminName,
      type: body.type,
      title: body.title,
      body: body.body,
      targetType: body.targetType,
      targetValue: body.targetValue,
      expiresAt: body.expiresAt ? new Date(body.expiresAt) : undefined,
    }))
  })

  // DELETE /admin/broadcasts/:id
  app.delete('/broadcasts/:id', { preHandler: [authenticateSuperAdmin] }, async (request, reply) => {
    const { id } = validate(z.object({ id: z.string().min(1) }), request.params)
    return ok(reply, await deleteBroadcast(id))
  })

  // ─── Audit Log ───────────────────────────────────────────────────────────────

  // GET /admin/audit-log?adminId?&action?&page?&limit?
  app.get('/audit-log', { preHandler: [authenticateSuperAdmin] }, async (request, reply) => {
    const query = validate(
      z.object({
        adminId: z.string().optional(),
        action: z.string().optional(),
        page: z.coerce.number().int().positive().optional(),
        limit: z.coerce.number().int().positive().optional(),
      }),
      request.query,
    )
    return ok(reply, await getAuditLog(query))
  })

  // ─── Platform Settings ───────────────────────────────────────────────────────

  // GET /admin/platform-settings
  app.get('/platform-settings', { preHandler: [authenticateSuperAdmin] }, async (_request, reply) => {
    return ok(reply, await getPlatformSettings())
  })

  // PATCH /admin/platform-settings
  app.patch('/platform-settings', { preHandler: [authenticateSuperAdmin] }, async (request, reply) => {
    const body = validate(
      z.record(z.unknown()),
      request.body,
    )
    // Convert any amountPaise fields from Number to BigInt
    const converted: Record<string, unknown> = {}
    for (const [key, value] of Object.entries(body)) {
      if (key.toLowerCase().includes('amountpaise') && typeof value === 'number') {
        converted[key] = BigInt(Math.round(value))
      } else {
        converted[key] = value
      }
    }
    return ok(reply, await updatePlatformSettings(converted))
  })

  // ─── Admins Management ───────────────────────────────────────────────────────

  // GET /admin/admins
  app.get('/admins', { preHandler: [authenticateSuperAdmin] }, async (_request, reply) => {
    return ok(reply, await listAdmins())
  })

  // PATCH /admin/admins/:id
  app.patch('/admins/:id', { preHandler: [authenticateSuperAdmin] }, async (request, reply) => {
    const { id } = validate(z.object({ id: z.string().min(1) }), request.params)
    const { isActive } = validate(
      z.object({ isActive: z.boolean() }),
      request.body,
    )
    return ok(reply, await toggleAdminActive(id, isActive))
  })
}
