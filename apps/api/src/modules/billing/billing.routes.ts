import type { FastifyInstance } from 'fastify'
import { z } from 'zod'
import { created, ok, paginated } from '../../shared/response.js'
import { ValidationError } from '../../shared/errors.js'
import { authenticate } from '../../shared/middleware/authenticate.js'
import { requireRole } from '../../shared/middleware/require-role.js'
import { UserRole } from '@atlas/types'
import {
  BillIdParam,
  GenerateBillBody,
  ListBillsQuery,
  RecordPaymentBody,
  VoidBillBody,
} from './billing.schema.js'
import {
  generateBill,
  getBill,
  listBills,
  recordPayment,
  voidBill,
} from './billing.service.js'

function validate<S extends z.ZodTypeAny>(schema: S, data: unknown): z.output<S> {
  const result = schema.safeParse(data)
  if (!result.success) throw new ValidationError('Invalid request', result.error.errors)
  return result.data as z.output<S>
}

// Only OWNER/MANAGER can void bills
const VOID_GUARD = [authenticate, requireRole(UserRole.OWNER, UserRole.MANAGER)]

export async function billingRoutes(app: FastifyInstance): Promise<void> {
  // ─── Generate bill ────────────────────────────────────────────────────────────
  app.post('/', { preHandler: authenticate }, async (request, reply) => {
    const body = validate(GenerateBillBody, request.body)
    const bill = await generateBill(request.user.tenantId, body)
    return created(reply, bill)
  })

  // ─── List bills ───────────────────────────────────────────────────────────────
  app.get('/', { preHandler: authenticate }, async (request, reply) => {
    const query = validate(ListBillsQuery, request.query)
    const { bills, pagination } = await listBills(request.user.tenantId, query)
    return paginated(reply, bills, pagination)
  })

  // ─── Get bill / receipt ───────────────────────────────────────────────────────
  app.get('/:id', { preHandler: authenticate }, async (request, reply) => {
    const { id } = validate(BillIdParam, request.params)
    const bill = await getBill(request.user.tenantId, id)
    return ok(reply, bill)
  })

  // ─── Record payment ───────────────────────────────────────────────────────────
  app.post('/:id/payments', { preHandler: authenticate }, async (request, reply) => {
    const { id } = validate(BillIdParam, request.params)
    const body = validate(RecordPaymentBody, request.body)
    const bill = await recordPayment(request.user.tenantId, id, body)
    return ok(reply, bill)
  })

  // ─── Void bill (OWNER / MANAGER only) ────────────────────────────────────────
  app.post('/:id/void', { preHandler: VOID_GUARD }, async (request, reply) => {
    const { id } = validate(BillIdParam, request.params)
    const body = validate(VoidBillBody, request.body)
    const bill = await voidBill(request.user.tenantId, id, request.user.sub, body)
    return ok(reply, bill)
  })
}
