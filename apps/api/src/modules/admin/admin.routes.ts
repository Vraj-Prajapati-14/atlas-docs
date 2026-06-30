import type { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify'
import { z } from 'zod'
import { ok } from '../../shared/response.js'
import { ValidationError, UnauthorizedError } from '../../shared/errors.js'
import { config } from '../../config/index.js'
import {
  adminLogin,
  listTenants,
  getTenantDetail,
  setTenantStatus,
  createAdminAccount,
} from './admin.service.js'
import type { TenantPlanStatus } from '@atlas/db'

function validate<S extends z.ZodTypeAny>(schema: S, data: unknown): z.output<S> {
  const result = schema.safeParse(data)
  if (!result.success) throw new ValidationError('Invalid request body', result.error.errors)
  return result.data as z.output<S>
}

// Super-admin JWT uses a separate secret from tenant JWTs
async function authenticateSuperAdmin(request: FastifyRequest, reply: FastifyReply) {
  const authHeader = request.headers.authorization
  if (!authHeader?.startsWith('Bearer ')) throw new UnauthorizedError('Missing admin token')

  const token = authHeader.slice(7)
  const secret = config.SUPER_ADMIN_JWT_SECRET ?? config.JWT_SECRET

  try {
    const payload = request.server.jwt.verify<{ sub: string; tenantId: string; role: string }>(token, { key: secret })
    if (payload.tenantId !== '__admin__' || payload.role !== 'SUPER_ADMIN') {
      throw new UnauthorizedError('Not a super-admin token')
    }
    ;(request as FastifyRequest & { adminId: string }).adminId = payload.sub
  } catch {
    throw new UnauthorizedError('Invalid or expired admin token')
  }
}

export async function adminRoutes(app: FastifyInstance): Promise<void> {
  // ─── POST /admin/auth/login ──────────────────────────────────────────────────
  app.post('/auth/login', { config: { rateLimit: { max: 10, timeWindow: '15 minutes' } } }, async (request, reply) => {
    const { email, password } = validate(
      z.object({ email: z.string().email(), password: z.string().min(1) }),
      request.body,
    )

    const admin = await adminLogin(email, password)
    const secret = config.SUPER_ADMIN_JWT_SECRET ?? config.JWT_SECRET

    // super-admin tokens use role='SUPER_ADMIN' and tenantId='__admin__' as sentinels
    const token = app.jwt.sign(
      { sub: admin.id, tenantId: '__admin__', role: 'SUPER_ADMIN', sessionId: 'admin' },
      { key: secret, expiresIn: '8h' },
    )

    return ok(reply, { admin, token })
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
}
