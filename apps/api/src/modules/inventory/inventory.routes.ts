import type { FastifyInstance } from 'fastify'
import { z } from 'zod'
import { created, ok, paginated } from '../../shared/response.js'
import { ValidationError } from '../../shared/errors.js'
import { authenticate } from '../../shared/middleware/authenticate.js'
import { requireRole } from '../../shared/middleware/require-role.js'
import { UserRole } from '@atlas/types'
import {
  CategoryIdParam,
  CreateCategoryBody,
  CreateItemBody,
  CreatePOBody,
  CreateSupplierBody,
  ItemIdParam,
  ListItemsQuery,
  ListPOsQuery,
  ListTransactionsQuery,
  MenuItemIdParam,
  POIdParam,
  ReceivePOBody,
  RecordTransactionBody,
  SetRecipeBody,
  SupplierIdParam,
  UpdateCategoryBody,
  UpdateItemBody,
  UpdateSupplierBody,
} from './inventory.schema.js'
import {
  createCategory,
  createItem,
  createPurchaseOrder,
  createSupplier,
  deactivateItem,
  deleteCategory,
  getItem,
  getPurchaseOrder,
  getRecipe,
  listCategories,
  listItemTransactions,
  listItems,
  listPurchaseOrders,
  listSuppliers,
  receivePurchaseOrder,
  recordTransaction,
  setRecipe,
  updateCategory,
  updateItem,
  updateSupplier,
} from './inventory.service.js'

function validate<S extends z.ZodTypeAny>(schema: S, data: unknown): z.output<S> {
  const result = schema.safeParse(data)
  if (!result.success) throw new ValidationError('Invalid request', result.error.errors)
  return result.data as z.output<S>
}

// OWNER/MANAGER/INVENTORY_MANAGER can write; any authenticated staff can read
const WRITE_GUARD = [
  authenticate,
  requireRole(UserRole.OWNER, UserRole.MANAGER, UserRole.INVENTORY_MANAGER),
]

export async function inventoryRoutes(app: FastifyInstance): Promise<void> {
  // ─── Categories ────────────────────────────────────────────────────────────

  app.get('/categories', { preHandler: authenticate }, async (request, reply) => {
    const categories = await listCategories(request.user.tenantId)
    return ok(reply, categories)
  })

  app.post('/categories', { preHandler: WRITE_GUARD }, async (request, reply) => {
    const body = validate(CreateCategoryBody, request.body)
    const category = await createCategory(request.user.tenantId, body)
    return created(reply, category)
  })

  app.patch('/categories/:id', { preHandler: WRITE_GUARD }, async (request, reply) => {
    const { id } = validate(CategoryIdParam, request.params)
    const body = validate(UpdateCategoryBody, request.body)
    const category = await updateCategory(request.user.tenantId, id, body)
    return ok(reply, category)
  })

  app.delete('/categories/:id', { preHandler: WRITE_GUARD }, async (request, reply) => {
    const { id } = validate(CategoryIdParam, request.params)
    const result = await deleteCategory(request.user.tenantId, id)
    return ok(reply, result)
  })

  // ─── Items ─────────────────────────────────────────────────────────────────

  app.get('/items', { preHandler: authenticate }, async (request, reply) => {
    const query = validate(ListItemsQuery, request.query)
    const { items, pagination } = await listItems(request.user.tenantId, query)
    return paginated(reply, items, pagination)
  })

  app.post('/items', { preHandler: WRITE_GUARD }, async (request, reply) => {
    const body = validate(CreateItemBody, request.body)
    const item = await createItem(request.user.tenantId, body)
    return created(reply, item)
  })

  app.get('/items/:id', { preHandler: authenticate }, async (request, reply) => {
    const { id } = validate(ItemIdParam, request.params)
    const item = await getItem(request.user.tenantId, id)
    return ok(reply, item)
  })

  app.patch('/items/:id', { preHandler: WRITE_GUARD }, async (request, reply) => {
    const { id } = validate(ItemIdParam, request.params)
    const body = validate(UpdateItemBody, request.body)
    const item = await updateItem(request.user.tenantId, id, body)
    return ok(reply, item)
  })

  app.delete('/items/:id', { preHandler: WRITE_GUARD }, async (request, reply) => {
    const { id } = validate(ItemIdParam, request.params)
    const result = await deactivateItem(request.user.tenantId, id)
    return ok(reply, result)
  })

  app.get('/items/:id/transactions', { preHandler: authenticate }, async (request, reply) => {
    const { id } = validate(ItemIdParam, request.params)
    const query = validate(ListTransactionsQuery, request.query)
    const { transactions, pagination } = await listItemTransactions(request.user.tenantId, id, query)
    return paginated(reply, transactions, pagination)
  })

  // ─── Transactions ──────────────────────────────────────────────────────────

  app.post('/transactions', { preHandler: WRITE_GUARD }, async (request, reply) => {
    const body = validate(RecordTransactionBody, request.body)
    const txn = await recordTransaction(request.user.tenantId, body, request.user.sub)
    return created(reply, txn)
  })

  // ─── Suppliers ─────────────────────────────────────────────────────────────

  app.get('/suppliers', { preHandler: authenticate }, async (request, reply) => {
    const suppliers = await listSuppliers(request.user.tenantId)
    return ok(reply, suppliers)
  })

  app.post('/suppliers', { preHandler: WRITE_GUARD }, async (request, reply) => {
    const body = validate(CreateSupplierBody, request.body)
    const supplier = await createSupplier(request.user.tenantId, body)
    return created(reply, supplier)
  })

  app.patch('/suppliers/:id', { preHandler: WRITE_GUARD }, async (request, reply) => {
    const { id } = validate(SupplierIdParam, request.params)
    const body = validate(UpdateSupplierBody, request.body)
    const supplier = await updateSupplier(request.user.tenantId, id, body)
    return ok(reply, supplier)
  })

  // ─── Purchase Orders ───────────────────────────────────────────────────────

  app.get('/purchase-orders', { preHandler: authenticate }, async (request, reply) => {
    const query = validate(ListPOsQuery, request.query)
    const { purchaseOrders, pagination } = await listPurchaseOrders(request.user.tenantId, query)
    return paginated(reply, purchaseOrders, pagination)
  })

  app.post('/purchase-orders', { preHandler: WRITE_GUARD }, async (request, reply) => {
    const body = validate(CreatePOBody, request.body)
    const po = await createPurchaseOrder(request.user.tenantId, body)
    return created(reply, po)
  })

  app.get('/purchase-orders/:id', { preHandler: authenticate }, async (request, reply) => {
    const { id } = validate(POIdParam, request.params)
    const po = await getPurchaseOrder(request.user.tenantId, id)
    return ok(reply, po)
  })

  app.post('/purchase-orders/:id/receive', { preHandler: WRITE_GUARD }, async (request, reply) => {
    const { id } = validate(POIdParam, request.params)
    const body = validate(ReceivePOBody, request.body)
    const po = await receivePurchaseOrder(request.user.tenantId, id, body, request.user.sub)
    return ok(reply, po)
  })

  // ─── Recipes ───────────────────────────────────────────────────────────────

  app.get('/recipes/:menuItemId', { preHandler: authenticate }, async (request, reply) => {
    const { menuItemId } = validate(MenuItemIdParam, request.params)
    const recipe = await getRecipe(request.user.tenantId, menuItemId)
    return ok(reply, recipe)
  })

  app.put('/recipes/:menuItemId', { preHandler: WRITE_GUARD }, async (request, reply) => {
    const { menuItemId } = validate(MenuItemIdParam, request.params)
    const body = validate(SetRecipeBody, request.body)
    const ingredients = await setRecipe(request.user.tenantId, menuItemId, body)
    return ok(reply, ingredients)
  })
}
