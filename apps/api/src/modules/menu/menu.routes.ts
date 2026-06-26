import type { FastifyInstance } from 'fastify'
import { z } from 'zod'
import { ok, created, noContent, paginated } from '../../shared/response.js'
import { ValidationError } from '../../shared/errors.js'
import { authenticate } from '../../shared/middleware/authenticate.js'
import { requireRole } from '../../shared/middleware/require-role.js'
import { UserRole } from '@atlas/types'
import {
  CreateCategoryBody,
  UpdateCategoryBody,
  CreateItemBody,
  UpdateItemBody,
  ListItemsQuery,
  CreateVariantBody,
  UpdateVariantBody,
  CreateAddOnBody,
  UpdateAddOnBody,
  IdParam,
  ItemVariantParams,
  ItemAddOnParams,
} from './menu.schema.js'
import {
  listCategories,
  getCategory,
  createCategory,
  updateCategory,
  deleteCategory,
  listItems,
  getItem,
  createItem,
  updateItem,
  deleteItem,
  createVariant,
  updateVariant,
  deleteVariant,
  createAddOn,
  updateAddOn,
  deleteAddOn,
} from './menu.service.js'

function validate<S extends z.ZodTypeAny>(schema: S, data: unknown): z.output<S> {
  const result = schema.safeParse(data)
  if (!result.success) throw new ValidationError('Invalid request', result.error.errors)
  return result.data as z.output<S>
}

const WRITE_ROLES = [UserRole.OWNER, UserRole.MANAGER]
const writeGuard = [authenticate, requireRole(...WRITE_ROLES)]
const readGuard = [authenticate]

export async function menuRoutes(app: FastifyInstance): Promise<void> {
  // ─── Categories ────────────────────────────────────────────────────────────

  app.get('/categories', { preHandler: readGuard }, async (request, reply) => {
    const cats = await listCategories(request.user.tenantId)
    return ok(reply, cats)
  })

  app.get('/categories/:id', { preHandler: readGuard }, async (request, reply) => {
    const { id } = validate(IdParam, request.params)
    const cat = await getCategory(request.user.tenantId, id)
    return ok(reply, cat)
  })

  app.post('/categories', { preHandler: writeGuard }, async (request, reply) => {
    const body = validate(CreateCategoryBody, request.body)
    const cat = await createCategory(request.user.tenantId, body)
    return created(reply, cat)
  })

  app.patch('/categories/:id', { preHandler: writeGuard }, async (request, reply) => {
    const { id } = validate(IdParam, request.params)
    const body = validate(UpdateCategoryBody, request.body)
    const cat = await updateCategory(request.user.tenantId, id, body)
    return ok(reply, cat)
  })

  app.delete('/categories/:id', { preHandler: writeGuard }, async (request, reply) => {
    const { id } = validate(IdParam, request.params)
    await deleteCategory(request.user.tenantId, id)
    return noContent(reply)
  })

  // ─── Items ─────────────────────────────────────────────────────────────────

  app.get('/items', { preHandler: readGuard }, async (request, reply) => {
    const query = validate(ListItemsQuery, request.query)
    const { items, pagination } = await listItems(request.user.tenantId, query)
    return paginated(reply, items, pagination)
  })

  app.get('/items/:id', { preHandler: readGuard }, async (request, reply) => {
    const { id } = validate(IdParam, request.params)
    const item = await getItem(request.user.tenantId, id)
    return ok(reply, item)
  })

  app.post('/items', { preHandler: writeGuard }, async (request, reply) => {
    const body = validate(CreateItemBody, request.body)
    const item = await createItem(request.user.tenantId, body)
    return created(reply, item)
  })

  app.patch('/items/:id', { preHandler: writeGuard }, async (request, reply) => {
    const { id } = validate(IdParam, request.params)
    const body = validate(UpdateItemBody, request.body)
    const item = await updateItem(request.user.tenantId, id, body)
    return ok(reply, item)
  })

  app.delete('/items/:id', { preHandler: writeGuard }, async (request, reply) => {
    const { id } = validate(IdParam, request.params)
    await deleteItem(request.user.tenantId, id)
    return noContent(reply)
  })

  // ─── Variants ──────────────────────────────────────────────────────────────

  app.post('/items/:id/variants', { preHandler: writeGuard }, async (request, reply) => {
    const { id } = validate(IdParam, request.params)
    const body = validate(CreateVariantBody, request.body)
    const variant = await createVariant(request.user.tenantId, id, body)
    return created(reply, variant)
  })

  app.patch('/items/:id/variants/:variantId', { preHandler: writeGuard }, async (request, reply) => {
    const { id, variantId } = validate(ItemVariantParams, request.params)
    const body = validate(UpdateVariantBody, request.body)
    const variant = await updateVariant(request.user.tenantId, id, variantId, body)
    return ok(reply, variant)
  })

  app.delete('/items/:id/variants/:variantId', { preHandler: writeGuard }, async (request, reply) => {
    const { id, variantId } = validate(ItemVariantParams, request.params)
    await deleteVariant(request.user.tenantId, id, variantId)
    return noContent(reply)
  })

  // ─── Add-ons ───────────────────────────────────────────────────────────────

  app.post('/items/:id/addons', { preHandler: writeGuard }, async (request, reply) => {
    const { id } = validate(IdParam, request.params)
    const body = validate(CreateAddOnBody, request.body)
    const addOn = await createAddOn(request.user.tenantId, id, body)
    return created(reply, addOn)
  })

  app.patch('/items/:id/addons/:addOnId', { preHandler: writeGuard }, async (request, reply) => {
    const { id, addOnId } = validate(ItemAddOnParams, request.params)
    const body = validate(UpdateAddOnBody, request.body)
    const addOn = await updateAddOn(request.user.tenantId, id, addOnId, body)
    return ok(reply, addOn)
  })

  app.delete('/items/:id/addons/:addOnId', { preHandler: writeGuard }, async (request, reply) => {
    const { id, addOnId } = validate(ItemAddOnParams, request.params)
    await deleteAddOn(request.user.tenantId, id, addOnId)
    return noContent(reply)
  })
}
