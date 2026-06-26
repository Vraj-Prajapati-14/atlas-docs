import type { FastifyInstance } from 'fastify'
import { z } from 'zod'
import { ok, paginated } from '../../shared/response.js'
import { ValidationError } from '../../shared/errors.js'
import { authenticate } from '../../shared/middleware/authenticate.js'
import { requireRole } from '../../shared/middleware/require-role.js'
import { UserRole } from '@atlas/types'
import { KOTIdParam, ListKOTsQuery } from './kots.schema.js'
import {
  acceptKOT,
  cancelKOT,
  doneKOT,
  getKOT,
  listKOTs,
  markPrinted,
  startKOT,
} from './kots.service.js'

function validate<S extends z.ZodTypeAny>(schema: S, data: unknown): z.output<S> {
  const result = schema.safeParse(data)
  if (!result.success) throw new ValidationError('Invalid request', result.error.errors)
  return result.data as z.output<S>
}

// Only OWNER/MANAGER can force-cancel a KOT
const CANCEL_GUARD = [authenticate, requireRole(UserRole.OWNER, UserRole.MANAGER)]

export async function kotsRoutes(app: FastifyInstance): Promise<void> {
  // ─── List KOTs (KDS main query: GET /kots?active=true) ──────────────────────
  app.get('/', { preHandler: authenticate }, async (request, reply) => {
    const query = validate(ListKOTsQuery, request.query)
    const { kots, pagination } = await listKOTs(request.user.tenantId, query)
    return paginated(reply, kots, pagination)
  })

  // ─── Get KOT detail ──────────────────────────────────────────────────────────
  app.get('/:id', { preHandler: authenticate }, async (request, reply) => {
    const { id } = validate(KOTIdParam, request.params)
    const kot = await getKOT(request.user.tenantId, id)
    return ok(reply, kot)
  })

  // ─── Kitchen: accept KOT (PENDING → ACCEPTED) ────────────────────────────────
  app.post('/:id/accept', { preHandler: authenticate }, async (request, reply) => {
    const { id } = validate(KOTIdParam, request.params)
    const kot = await acceptKOT(request.user.tenantId, id)
    return ok(reply, kot)
  })

  // ─── Kitchen: start cooking (PENDING|ACCEPTED → IN_PROGRESS, order → IN_PROGRESS) ──
  app.post('/:id/start', { preHandler: authenticate }, async (request, reply) => {
    const { id } = validate(KOTIdParam, request.params)
    const kot = await startKOT(request.user.tenantId, id)
    return ok(reply, kot)
  })

  // ─── Kitchen: food ready (IN_PROGRESS → DONE, order → READY if all KOTs done) ──
  app.post('/:id/done', { preHandler: authenticate }, async (request, reply) => {
    const { id } = validate(KOTIdParam, request.params)
    const kot = await doneKOT(request.user.tenantId, id)
    return ok(reply, kot)
  })

  // ─── Cancel KOT (OWNER / MANAGER only) ──────────────────────────────────────
  app.post('/:id/cancel', { preHandler: CANCEL_GUARD }, async (request, reply) => {
    const { id } = validate(KOTIdParam, request.params)
    const kot = await cancelKOT(request.user.tenantId, id)
    return ok(reply, kot)
  })

  // ─── Mark KOT as printed ─────────────────────────────────────────────────────
  app.post('/:id/print', { preHandler: authenticate }, async (request, reply) => {
    const { id } = validate(KOTIdParam, request.params)
    const kot = await markPrinted(request.user.tenantId, id)
    return ok(reply, kot)
  })
}
