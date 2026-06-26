import type { FastifyInstance } from 'fastify'
import { z } from 'zod'
import { created, ok, paginated } from '../../shared/response.js'
import { ValidationError } from '../../shared/errors.js'
import { authenticate } from '../../shared/middleware/authenticate.js'
import { requireRole } from '../../shared/middleware/require-role.js'
import { UserRole, AggregatorPlatform } from '@atlas/types'
import {
  AggregatorOrderIdParam,
  CancelOrderBody,
  CreateCredentialBody,
  CredentialIdParam,
  ListAggregatorOrdersQuery,
  UpdateCredentialBody,
} from './aggregators.schema.js'
import {
  acceptOrder,
  cancelAggregatorOrder,
  createCredential,
  deleteCredential,
  deliverOrder,
  dispatchOrder,
  getAggregatorOrder,
  listAggregatorOrders,
  listCredentials,
  processWebhook,
  updateCredential,
} from './aggregators.service.js'

function validate<S extends z.ZodTypeAny>(schema: S, data: unknown): z.output<S> {
  const result = schema.safeParse(data)
  if (!result.success) throw new ValidationError('Invalid request', result.error.errors)
  return result.data as z.output<S>
}

const OWNER_GUARD = [authenticate, requireRole(UserRole.OWNER, UserRole.MANAGER)]

export async function aggregatorsRoutes(app: FastifyInstance): Promise<void> {
  // ─── Credentials ──────────────────────────────────────────────────────────

  app.get('/credentials', { preHandler: OWNER_GUARD }, async (request, reply) => {
    return ok(reply, await listCredentials(request.user.tenantId))
  })

  app.post('/credentials', { preHandler: OWNER_GUARD }, async (request, reply) => {
    const body = validate(CreateCredentialBody, request.body)
    return created(reply, await createCredential(request.user.tenantId, body))
  })

  app.patch('/credentials/:id', { preHandler: OWNER_GUARD }, async (request, reply) => {
    const { id } = validate(CredentialIdParam, request.params)
    const body = validate(UpdateCredentialBody, request.body)
    return ok(reply, await updateCredential(request.user.tenantId, id, body))
  })

  app.delete('/credentials/:id', { preHandler: OWNER_GUARD }, async (request, reply) => {
    const { id } = validate(CredentialIdParam, request.params)
    return ok(reply, await deleteCredential(request.user.tenantId, id))
  })

  // ─── Aggregator Orders ────────────────────────────────────────────────────

  app.get('/orders', { preHandler: authenticate }, async (request, reply) => {
    const query = validate(ListAggregatorOrdersQuery, request.query)
    const { orders, pagination } = await listAggregatorOrders(request.user.tenantId, query)
    return paginated(reply, orders, pagination)
  })

  app.get('/orders/:id', { preHandler: authenticate }, async (request, reply) => {
    const { id } = validate(AggregatorOrderIdParam, request.params)
    return ok(reply, await getAggregatorOrder(request.user.tenantId, id))
  })

  app.post('/orders/:id/accept', { preHandler: authenticate }, async (request, reply) => {
    const { id } = validate(AggregatorOrderIdParam, request.params)
    return ok(reply, await acceptOrder(request.user.tenantId, id))
  })

  app.post('/orders/:id/dispatch', { preHandler: authenticate }, async (request, reply) => {
    const { id } = validate(AggregatorOrderIdParam, request.params)
    return ok(reply, await dispatchOrder(request.user.tenantId, id))
  })

  app.post('/orders/:id/deliver', { preHandler: authenticate }, async (request, reply) => {
    const { id } = validate(AggregatorOrderIdParam, request.params)
    return ok(reply, await deliverOrder(request.user.tenantId, id))
  })

  app.post('/orders/:id/cancel', { preHandler: OWNER_GUARD }, async (request, reply) => {
    const { id } = validate(AggregatorOrderIdParam, request.params)
    const body = validate(CancelOrderBody, request.body)
    return ok(reply, await cancelAggregatorOrder(request.user.tenantId, id, body))
  })

  // ─── Webhooks (public — no auth; verified by API key / HMAC) ─────────────
  //
  // URL pattern: POST /aggregators/webhooks/:platform
  // The platform's restaurant ID is embedded in the payload so we can
  // look up the right credential and tenant.
  // Signature header (HMAC-SHA256): X-Zomato-Signature | X-Swiggy-Signature | X-Signature

  app.post(
    '/webhooks/:platform',
    { config: { rawBody: true } },
    async (request, reply) => {
      const { platform } = validate(
        z.object({ platform: z.nativeEnum(AggregatorPlatform) }),
        request.params,
      )

      // Collect platform-specific signature header
      const signature =
        (request.headers['x-zomato-signature'] as string | undefined) ??
        (request.headers['x-swiggy-signature'] as string | undefined) ??
        (request.headers['x-signature'] as string | undefined)

      // rawBody may not be set if @fastify/rawbody isn't installed; fall back to JSON stringify
      const rawBody =
        (request as unknown as { rawBody?: string }).rawBody ??
        JSON.stringify(request.body)

      const result = await processWebhook(platform, getRid(request.body, platform), rawBody, signature)
      return reply.send(result)
    },
  )
}

/**
 * Extract the platform-specific restaurant ID from the webhook payload.
 * Used to look up the right AggregatorCredential.
 */
function getRid(body: unknown, platform: AggregatorPlatform): string {
  const p = body as Record<string, unknown>
  if (platform === AggregatorPlatform.ZOMATO) {
    return String(p['restaurant_id'] ?? p['restaurantId'] ?? '')
  }
  if (platform === AggregatorPlatform.SWIGGY) {
    return String(p['restaurant_id'] ?? p['restaurantId'] ?? p['restaurant_ref_id'] ?? '')
  }
  // MAGICPIN, EATSURE — common field names
  return String(p['restaurant_id'] ?? p['outlet_id'] ?? p['restaurantId'] ?? '')
}
