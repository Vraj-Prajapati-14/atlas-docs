import type { FastifyInstance } from 'fastify'
import { z } from 'zod'
import { created, noContent, ok, paginated } from '../../shared/response.js'
import { ValidationError } from '../../shared/errors.js'
import { authenticate } from '../../shared/middleware/authenticate.js'
import {
  AddItemsBody,
  CreateOrderBody,
  ListOrdersQuery,
  OrderIdParam,
  OrderItemParams,
  TransferTableBody,
  UpdateItemBody,
  UpdateOrderBody,
} from './orders.schema.js'
import {
  addItems,
  cancelOrder,
  confirmOrder,
  createOrder,
  getOrder,
  listOrders,
  removeItem,
  serveOrder,
  transferTable,
  updateItem,
  updateOrder,
} from './orders.service.js'

function validate<S extends z.ZodTypeAny>(schema: S, data: unknown): z.output<S> {
  const result = schema.safeParse(data)
  if (!result.success) throw new ValidationError('Invalid request', result.error.errors)
  return result.data as z.output<S>
}

export async function ordersRoutes(app: FastifyInstance): Promise<void> {
  // ─── Create order ────────────────────────────────────────────────────────────
  app.post('/', { preHandler: authenticate }, async (request, reply) => {
    const body = validate(CreateOrderBody, request.body)
    const order = await createOrder(request.user.tenantId, request.user.sub, body)
    return created(reply, order)
  })

  // ─── List orders ─────────────────────────────────────────────────────────────
  app.get('/', { preHandler: authenticate }, async (request, reply) => {
    const query = validate(ListOrdersQuery, request.query)
    const { orders, pagination } = await listOrders(request.user.tenantId, query)
    return paginated(reply, orders, pagination)
  })

  // ─── Get order ───────────────────────────────────────────────────────────────
  app.get('/:id', { preHandler: authenticate }, async (request, reply) => {
    const { id } = validate(OrderIdParam, request.params)
    const order = await getOrder(request.user.tenantId, id)
    return ok(reply, order)
  })

  // ─── Update order metadata ───────────────────────────────────────────────────
  app.patch('/:id', { preHandler: authenticate }, async (request, reply) => {
    const { id } = validate(OrderIdParam, request.params)
    const body = validate(UpdateOrderBody, request.body)
    const order = await updateOrder(request.user.tenantId, id, body)
    return ok(reply, order)
  })

  // ─── Add items to order ──────────────────────────────────────────────────────
  app.post('/:id/items', { preHandler: authenticate }, async (request, reply) => {
    const { id } = validate(OrderIdParam, request.params)
    const body = validate(AddItemsBody, request.body)
    const order = await addItems(request.user.tenantId, id, body)
    return ok(reply, order)
  })

  // ─── Update order item ───────────────────────────────────────────────────────
  app.patch('/:id/items/:itemId', { preHandler: authenticate }, async (request, reply) => {
    const { id, itemId } = validate(OrderItemParams, request.params)
    const body = validate(UpdateItemBody, request.body)
    const item = await updateItem(request.user.tenantId, id, itemId, body)
    return ok(reply, item)
  })

  // ─── Remove order item ───────────────────────────────────────────────────────
  app.delete('/:id/items/:itemId', { preHandler: authenticate }, async (request, reply) => {
    const { id, itemId } = validate(OrderItemParams, request.params)
    await removeItem(request.user.tenantId, id, itemId)
    return noContent(reply)
  })

  // ─── Confirm order (DRAFT → CONFIRMED + KOT created) ────────────────────────
  app.post('/:id/confirm', { preHandler: authenticate }, async (request, reply) => {
    const { id } = validate(OrderIdParam, request.params)
    const order = await confirmOrder(request.user.tenantId, id)
    return ok(reply, order)
  })

  // ─── Mark order served ───────────────────────────────────────────────────────
  app.post('/:id/serve', { preHandler: authenticate }, async (request, reply) => {
    const { id } = validate(OrderIdParam, request.params)
    const order = await serveOrder(request.user.tenantId, id)
    return ok(reply, order)
  })

  // ─── Cancel order ────────────────────────────────────────────────────────────
  app.post('/:id/cancel', { preHandler: authenticate }, async (request, reply) => {
    const { id } = validate(OrderIdParam, request.params)
    const order = await cancelOrder(request.user.tenantId, id)
    return ok(reply, order)
  })

  // ─── Transfer to another table ───────────────────────────────────────────────
  app.post('/:id/transfer', { preHandler: authenticate }, async (request, reply) => {
    const { id } = validate(OrderIdParam, request.params)
    const body = validate(TransferTableBody, request.body)
    const order = await transferTable(request.user.tenantId, id, body.newTableId)
    return ok(reply, order)
  })
}
