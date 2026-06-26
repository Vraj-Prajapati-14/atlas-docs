import { prisma } from '@atlas/db'
import { InventoryTransactionType } from '@atlas/types'
import { BadRequestError, ConflictError, NotFoundError } from '../../shared/errors.js'
import { buildPagination } from '../../shared/response.js'
import { sendLowStockAlert } from '../notifications/notifications.service.js'
import type {
  CreateCategoryInput,
  UpdateCategoryInput,
  CreateItemInput,
  UpdateItemInput,
  ListItemsInput,
  RecordTransactionInput,
  ListTransactionsInput,
  CreateSupplierInput,
  UpdateSupplierInput,
  CreatePOInput,
  ReceivePOInput,
  ListPOsInput,
  SetRecipeInput,
} from './inventory.schema.js'

// ─── Helpers ──────────────────────────────────────────────────────────────────

/**
 * Determine the signed stock delta for a given transaction type.
 * WASTE and SALE_DEDUCTION reduce stock (negative).
 * ADJUSTMENT is passed as-is (caller provides signed value).
 * Everything else increases stock (positive).
 */
function stockDelta(type: InventoryTransactionType | string, quantity: number): number {
  if (type === InventoryTransactionType.WASTE || type === InventoryTransactionType.SALE_DEDUCTION) {
    return -Math.abs(quantity)
  }
  if (type === InventoryTransactionType.ADJUSTMENT) {
    return quantity // caller passes signed value
  }
  return Math.abs(quantity) // PURCHASE, RETURN, OPENING_STOCK
}

// ─── Categories ───────────────────────────────────────────────────────────────

export async function listCategories(tenantId: string) {
  return prisma.inventoryCategory.findMany({
    where: { tenantId },
    include: { _count: { select: { items: true } } },
    orderBy: { name: 'asc' },
  })
}

export async function createCategory(tenantId: string, data: CreateCategoryInput) {
  return prisma.inventoryCategory.create({
    data: { tenantId, name: data.name },
  })
}

export async function updateCategory(tenantId: string, id: string, data: UpdateCategoryInput) {
  const existing = await prisma.inventoryCategory.findFirst({ where: { id, tenantId } })
  if (!existing) throw new NotFoundError('InventoryCategory', id)

  return prisma.inventoryCategory.update({
    where: { id },
    data: { name: data.name },
  })
}

export async function deleteCategory(tenantId: string, id: string) {
  const existing = await prisma.inventoryCategory.findFirst({
    where: { id, tenantId },
    include: { _count: { select: { items: true } } },
  })
  if (!existing) throw new NotFoundError('InventoryCategory', id)
  if (existing._count.items > 0) {
    throw new BadRequestError('Cannot delete category with items — reassign them first')
  }

  await prisma.inventoryCategory.delete({ where: { id } })
  return { deleted: true }
}

// ─── Items ────────────────────────────────────────────────────────────────────

export async function listItems(tenantId: string, query: ListItemsInput) {
  const { categoryId, lowStock, isActive, page, limit } = query
  const skip = (page - 1) * limit
  const baseWhere = { tenantId, isActive, ...(categoryId ? { categoryId } : {}) }

  if (lowStock) {
    // Prisma can't compare two columns in a where clause, so load all and filter in JS.
    // Inventory sets are small (< 500 items per tenant) so this is fine.
    const all = await prisma.inventoryItem.findMany({
      where: baseWhere,
      include: { category: { select: { id: true, name: true } } },
      orderBy: { name: 'asc' },
    })
    const filtered = all.filter((item) => item.currentStock.toNumber() <= item.lowStockThreshold.toNumber())
    return {
      items: filtered.slice(skip, skip + limit),
      pagination: buildPagination(page, limit, filtered.length),
    }
  }

  const [items, total] = await Promise.all([
    prisma.inventoryItem.findMany({
      where: baseWhere,
      include: { category: { select: { id: true, name: true } } },
      orderBy: { name: 'asc' },
      skip,
      take: limit,
    }),
    prisma.inventoryItem.count({ where: baseWhere }),
  ])

  return { items, pagination: buildPagination(page, limit, total) }
}

export async function getItem(tenantId: string, id: string) {
  const item = await prisma.inventoryItem.findFirst({
    where: { id, tenantId },
    include: { category: { select: { id: true, name: true } } },
  })
  if (!item) throw new NotFoundError('InventoryItem', id)
  return item
}

export async function createItem(tenantId: string, data: CreateItemInput) {
  const { openingStock, ...rest } = data

  return prisma.$transaction(async (tx) => {
    const item = await tx.inventoryItem.create({
      data: {
        tenantId,
        categoryId: rest.categoryId ?? null,
        name: rest.name,
        unit: rest.unit,
        currentStock: openingStock,
        lowStockThreshold: rest.lowStockThreshold,
        pricePerUnitPaise: rest.pricePerUnitPaise,
      },
    })

    if (openingStock > 0) {
      await tx.inventoryTransaction.create({
        data: {
          tenantId,
          inventoryItemId: item.id,
          type: InventoryTransactionType.OPENING_STOCK,
          quantity: openingStock,
        },
      })
    }

    return item
  })
}

export async function updateItem(tenantId: string, id: string, data: UpdateItemInput) {
  const existing = await prisma.inventoryItem.findFirst({ where: { id, tenantId } })
  if (!existing) throw new NotFoundError('InventoryItem', id)

  return prisma.inventoryItem.update({
    where: { id },
    data: {
      ...(data.categoryId !== undefined ? { categoryId: data.categoryId } : {}),
      ...(data.name ? { name: data.name } : {}),
      ...(data.unit ? { unit: data.unit } : {}),
      ...(data.lowStockThreshold !== undefined ? { lowStockThreshold: data.lowStockThreshold } : {}),
      ...(data.pricePerUnitPaise !== undefined ? { pricePerUnitPaise: data.pricePerUnitPaise } : {}),
      ...(data.isActive !== undefined ? { isActive: data.isActive } : {}),
    },
    include: { category: { select: { id: true, name: true } } },
  })
}

export async function deactivateItem(tenantId: string, id: string) {
  const existing = await prisma.inventoryItem.findFirst({ where: { id, tenantId } })
  if (!existing) throw new NotFoundError('InventoryItem', id)

  await prisma.inventoryItem.update({ where: { id }, data: { isActive: false } })
  return { deleted: true }
}

// ─── Transactions ─────────────────────────────────────────────────────────────

export async function recordTransaction(tenantId: string, data: RecordTransactionInput, createdById: string) {
  const item = await prisma.inventoryItem.findFirst({
    where: { id: data.inventoryItemId, tenantId },
  })
  if (!item) throw new NotFoundError('InventoryItem', data.inventoryItemId)

  const delta = stockDelta(data.type, data.quantity)
  const newStock = item.currentStock.toNumber() + delta
  if (newStock < 0) {
    throw new BadRequestError(
      `Insufficient stock — current: ${item.currentStock.toNumber()} ${item.unit}, requested deduction: ${Math.abs(delta)}`,
    )
  }

  return prisma.$transaction(async (tx) => {
    await tx.inventoryItem.update({
      where: { id: item.id },
      data: {
        currentStock: { increment: delta },
        ...(data.pricePerUnitPaise != null && data.type === InventoryTransactionType.PURCHASE
          ? { pricePerUnitPaise: data.pricePerUnitPaise }
          : {}),
      },
    })

    return tx.inventoryTransaction.create({
      data: {
        tenantId,
        inventoryItemId: item.id,
        type: data.type,
        quantity: delta,
        note: data.note ?? null,
        referenceId: data.referenceId ?? null,
        createdById,
      },
    })
  }).then((txn) => {
    // After commit: fire low-stock alert if stock dropped below threshold
    if (newStock <= item.lowStockThreshold.toNumber()) {
      sendLowStockAlert(tenantId, item.id).catch(() => undefined)
    }
    return txn
  })
}

export async function listItemTransactions(
  tenantId: string,
  itemId: string,
  query: ListTransactionsInput,
) {
  const item = await prisma.inventoryItem.findFirst({ where: { id: itemId, tenantId } })
  if (!item) throw new NotFoundError('InventoryItem', itemId)

  const { page, limit } = query
  const skip = (page - 1) * limit

  const [transactions, total] = await Promise.all([
    prisma.inventoryTransaction.findMany({
      where: { inventoryItemId: itemId, tenantId },
      orderBy: { createdAt: 'desc' },
      skip,
      take: limit,
    }),
    prisma.inventoryTransaction.count({ where: { inventoryItemId: itemId, tenantId } }),
  ])

  return { transactions, pagination: buildPagination(page, limit, total) }
}

// ─── Suppliers ────────────────────────────────────────────────────────────────

export async function listSuppliers(tenantId: string) {
  return prisma.supplier.findMany({
    where: { tenantId },
    include: { _count: { select: { purchaseOrders: true } } },
    orderBy: { name: 'asc' },
  })
}

export async function createSupplier(tenantId: string, data: CreateSupplierInput) {
  return prisma.supplier.create({
    data: { tenantId, ...data },
  })
}

export async function updateSupplier(tenantId: string, id: string, data: UpdateSupplierInput) {
  const existing = await prisma.supplier.findFirst({ where: { id, tenantId } })
  if (!existing) throw new NotFoundError('Supplier', id)

  return prisma.supplier.update({ where: { id }, data })
}

// ─── Purchase Orders ──────────────────────────────────────────────────────────

export async function listPurchaseOrders(tenantId: string, query: ListPOsInput) {
  const { supplierId, status, page, limit } = query
  const skip = (page - 1) * limit

  const where = {
    tenantId,
    ...(supplierId ? { supplierId } : {}),
    ...(status ? { status } : {}),
  }

  const [pos, total] = await Promise.all([
    prisma.purchaseOrder.findMany({
      where,
      include: {
        supplier: { select: { id: true, name: true } },
        _count: { select: { items: true } },
      },
      orderBy: { createdAt: 'desc' },
      skip,
      take: limit,
    }),
    prisma.purchaseOrder.count({ where }),
  ])

  return { purchaseOrders: pos, pagination: buildPagination(page, limit, total) }
}

export async function getPurchaseOrder(tenantId: string, id: string) {
  const po = await prisma.purchaseOrder.findFirst({
    where: { id, tenantId },
    include: {
      supplier: { select: { id: true, name: true, phone: true } },
      items: true,
    },
  })
  if (!po) throw new NotFoundError('PurchaseOrder', id)
  return po
}

export async function createPurchaseOrder(tenantId: string, data: CreatePOInput) {
  const supplier = await prisma.supplier.findFirst({
    where: { id: data.supplierId, tenantId },
  })
  if (!supplier) throw new NotFoundError('Supplier', data.supplierId)

  // Validate all inventory items belong to this tenant
  const itemIds = data.items.map((i) => i.inventoryItemId)
  const invItems = await prisma.inventoryItem.findMany({
    where: { id: { in: itemIds }, tenantId },
    select: { id: true },
  })
  if (invItems.length !== itemIds.length) {
    throw new NotFoundError('InventoryItem', 'one or more items not found')
  }

  const totalInPaise = data.items.reduce(
    (sum, item) => sum + BigInt(item.unitPriceInPaise) * BigInt(Math.round(item.quantity * 1000)) / 1000n,
    0n,
  )

  // Generate PO number: PO-YYYYMMDD-001
  const today = new Date()
  const prefix = `PO-${today.getUTCFullYear()}${String(today.getUTCMonth() + 1).padStart(2, '0')}${String(today.getUTCDate()).padStart(2, '0')}-`

  return prisma.$transaction(async (tx) => {
    const last = await tx.purchaseOrder.findFirst({
      where: { tenantId, poNumber: { startsWith: prefix } },
      orderBy: { poNumber: 'desc' },
      select: { poNumber: true },
    })
    const seq = last ? parseInt(last.poNumber.split('-').pop() ?? '0', 10) + 1 : 1
    const poNumber = `${prefix}${String(seq).padStart(3, '0')}`

    return tx.purchaseOrder.create({
      data: {
        tenantId,
        supplierId: data.supplierId,
        poNumber,
        status: 'DRAFT',
        totalInPaise,
        note: data.note ?? null,
        items: {
          create: data.items.map((item) => ({
            inventoryItemId: item.inventoryItemId,
            quantity: item.quantity,
            unitPriceInPaise: item.unitPriceInPaise,
            totalInPaise: BigInt(item.unitPriceInPaise) * BigInt(Math.round(item.quantity * 1000)) / 1000n,
          })),
        },
      },
      include: {
        supplier: { select: { id: true, name: true } },
        items: true,
      },
    })
  })
}

export async function receivePurchaseOrder(
  tenantId: string,
  id: string,
  data: ReceivePOInput,
  receivedById: string,
) {
  const po = await prisma.purchaseOrder.findFirst({
    where: { id, tenantId },
    include: { items: true },
  })
  if (!po) throw new NotFoundError('PurchaseOrder', id)
  if (po.status === 'RECEIVED') throw new ConflictError('Purchase order has already been received')
  if (po.status === 'CANCELLED') throw new BadRequestError('Cannot receive a cancelled purchase order')

  return prisma.$transaction(async (tx) => {
    // Create PURCHASE transactions + update stock for each line item
    for (const line of po.items) {
      const qty = line.quantity.toNumber()

      await tx.inventoryItem.update({
        where: { id: line.inventoryItemId },
        data: {
          currentStock: { increment: qty },
          pricePerUnitPaise: line.unitPriceInPaise, // update last purchase cost
        },
      })

      await tx.inventoryTransaction.create({
        data: {
          tenantId,
          inventoryItemId: line.inventoryItemId,
          type: InventoryTransactionType.PURCHASE,
          quantity: qty,
          referenceId: id,
          createdById: receivedById,
        },
      })
    }

    return tx.purchaseOrder.update({
      where: { id },
      data: {
        status: 'RECEIVED',
        receivedAt: new Date(),
        invoiceNumber: data.invoiceNumber ?? null,
        note: data.note ?? po.note,
      },
      include: {
        supplier: { select: { id: true, name: true } },
        items: true,
      },
    })
  })
}

// ─── Recipes ──────────────────────────────────────────────────────────────────

export async function getRecipe(tenantId: string, menuItemId: string) {
  const menuItem = await prisma.menuItem.findFirst({
    where: { id: menuItemId, tenantId },
    select: { id: true, name: true },
  })
  if (!menuItem) throw new NotFoundError('MenuItem', menuItemId)

  const ingredients = await prisma.recipeIngredient.findMany({
    where: { menuItemId },
    include: {
      inventoryItem: { select: { id: true, name: true, unit: true } },
    },
  })

  return { menuItem, ingredients }
}

export async function setRecipe(tenantId: string, menuItemId: string, data: SetRecipeInput) {
  const menuItem = await prisma.menuItem.findFirst({
    where: { id: menuItemId, tenantId },
    select: { id: true },
  })
  if (!menuItem) throw new NotFoundError('MenuItem', menuItemId)

  if (data.ingredients.length > 0) {
    const itemIds = data.ingredients.map((i) => i.inventoryItemId)
    const invItems = await prisma.inventoryItem.findMany({
      where: { id: { in: itemIds }, tenantId },
      select: { id: true },
    })
    if (invItems.length !== itemIds.length) {
      throw new NotFoundError('InventoryItem', 'one or more ingredients not found')
    }
  }

  return prisma.$transaction(async (tx) => {
    // Replace recipe: delete existing, create new
    await tx.recipeIngredient.deleteMany({ where: { menuItemId } })

    if (data.ingredients.length > 0) {
      await tx.recipeIngredient.createMany({
        data: data.ingredients.map((i) => ({
          menuItemId,
          inventoryItemId: i.inventoryItemId,
          quantity: i.quantity,
        })),
      })
    }

    return tx.recipeIngredient.findMany({
      where: { menuItemId },
      include: { inventoryItem: { select: { id: true, name: true, unit: true } } },
    })
  })
}

// ─── Auto-deduct on serve (called from orders.service) ───────────────────────

export async function deductStockForOrder(orderId: string, tenantId: string) {
  // Load non-cancelled order items with their menu IDs and quantities
  const orderItems = await prisma.orderItem.findMany({
    where: { orderId, status: { not: 'CANCELLED' } },
    select: { menuItemId: true, quantity: true },
  })
  if (orderItems.length === 0) return

  const menuItemIds = [...new Set(orderItems.map((i) => i.menuItemId))]
  const recipes = await prisma.recipeIngredient.findMany({
    where: { menuItemId: { in: menuItemIds } },
  })
  if (recipes.length === 0) return // no recipe configured, nothing to deduct

  // Aggregate deduction per inventory item across all order items
  const deductions = new Map<string, number>()
  for (const orderItem of orderItems) {
    const itemRecipes = recipes.filter((r) => r.menuItemId === orderItem.menuItemId)
    for (const recipe of itemRecipes) {
      const qty = recipe.quantity.toNumber() * orderItem.quantity
      deductions.set(recipe.inventoryItemId, (deductions.get(recipe.inventoryItemId) ?? 0) + qty)
    }
  }

  await prisma.$transaction(async (tx) => {
    for (const [inventoryItemId, qty] of deductions) {
      await tx.inventoryItem.update({
        where: { id: inventoryItemId },
        data: { currentStock: { decrement: qty } },
      })

      await tx.inventoryTransaction.create({
        data: {
          tenantId,
          inventoryItemId,
          type: InventoryTransactionType.SALE_DEDUCTION,
          quantity: -qty,
          referenceId: orderId,
        },
      })
    }
  })
}
