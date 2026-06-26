import { prisma } from '@atlas/db'
import { OrderStatus, OrderType, TableStatus } from '@atlas/types'
import { BadRequestError, ConflictError, NotFoundError } from '../../shared/errors.js'
import { buildPagination } from '../../shared/response.js'
import type {
  AddItemsInput,
  CreateOrderInput,
  FireKOTInput,
  ListOrdersInput,
  OrderItemInputType,
  UpdateItemInput,
  UpdateOrderInput,
} from './orders.schema.js'

// ─── Select shapes ────────────────────────────────────────────────────────────

const ORDER_DETAIL_INCLUDE = {
  items: {
    include: {
      addOns: true,
      variant: { select: { id: true, name: true, priceInPaise: true } },
    },
    orderBy: { createdAt: 'asc' as const },
  },
  table: { select: { id: true, name: true, capacity: true, floorId: true } },
  customer: { select: { id: true, name: true, phone: true, email: true } },
  staff: { select: { id: true, name: true, role: true } },
  kots: {
    select: { id: true, kotNumber: true, status: true, createdAt: true },
    orderBy: { createdAt: 'asc' as const },
  },
} as const

const ORDER_LIST_INCLUDE = {
  table: { select: { id: true, name: true } },
  customer: { select: { id: true, name: true, phone: true } },
  staff: { select: { id: true, name: true, role: true } },
  _count: { select: { items: true, kots: true } },
} as const

// ─── Helpers ──────────────────────────────────────────────────────────────────

function isPrismaUniqueError(err: unknown): boolean {
  return typeof err === 'object' && err !== null && 'code' in err && (err as { code: string }).code === 'P2002'
}

async function resolveItemPrices(tenantId: string, items: OrderItemInputType[]) {
  if (items.length === 0) return []

  const menuItemIds = [...new Set(items.map((i) => i.menuItemId))]
  const variantIds = items.flatMap((i) => (i.variantId ? [i.variantId] : []))
  const addOnIds = items.flatMap((i) => i.addOns.map((a) => a.addOnId))

  const [menuItems, variants, addOns] = await Promise.all([
    prisma.menuItem.findMany({
      where: { id: { in: menuItemIds }, tenantId, deletedAt: null, isAvailable: true },
    }),
    variantIds.length > 0
      ? prisma.menuItemVariant.findMany({ where: { id: { in: variantIds } } })
      : Promise.resolve([]),
    addOnIds.length > 0
      ? prisma.menuItemAddOn.findMany({ where: { id: { in: addOnIds } } })
      : Promise.resolve([]),
  ])

  const menuItemMap = new Map(menuItems.map((m) => [m.id, m]))
  const variantMap = new Map(variants.map((v) => [v.id, v]))
  const addOnMap = new Map(addOns.map((a) => [a.id, a]))

  return items.map((item) => {
    const menuItem = menuItemMap.get(item.menuItemId)
    if (!menuItem) throw new NotFoundError('Menu item', item.menuItemId)

    let unitPriceInPaise = menuItem.priceInPaise
    let variantName: string | null = null

    if (item.variantId) {
      const variant = variantMap.get(item.variantId)
      if (!variant || variant.menuItemId !== item.menuItemId) throw new NotFoundError('Variant', item.variantId)
      unitPriceInPaise = variant.priceInPaise
      variantName = variant.name
    }

    const resolvedAddOns = item.addOns.map((addOnInput) => {
      const addOn = addOnMap.get(addOnInput.addOnId)
      if (!addOn || addOn.menuItemId !== item.menuItemId) throw new NotFoundError('Add-on', addOnInput.addOnId)
      return { addOnId: addOn.id, addOnName: addOn.name, priceInPaise: addOn.priceInPaise }
    })

    const addOnTotal = resolvedAddOns.reduce((sum, a) => sum + a.priceInPaise, BigInt(0))
    const totalPriceInPaise = (unitPriceInPaise + addOnTotal) * BigInt(item.quantity)

    return {
      menuItemId: menuItem.id,
      menuItemName: menuItem.name,
      variantId: item.variantId as string | undefined,
      variantName,
      quantity: item.quantity,
      unitPriceInPaise,
      totalPriceInPaise,
      gstRate: menuItem.gstRate,
      isGSTInclusive: menuItem.isGSTInclusive,
      note: item.note as string | undefined,
      addOns: resolvedAddOns,
    }
  })
}

// Generates sequential daily order numbers inside a transaction to avoid TOCTOU.
function buildOrderNumber(
  lastNumber: string | null,
  prefix: string,
  pad: number,
): string {
  const seq = lastNumber ? parseInt(lastNumber.slice(prefix.length), 10) + 1 : 1
  return `${prefix}${String(seq).padStart(pad, '0')}`
}

function todayPrefix(label: string): string {
  const d = new Date().toISOString().slice(0, 10).replace(/-/g, '')
  return `${label}-${d}-`
}

// ─── Orders ──────────────────────────────────────────────────────────────────

export async function createOrder(tenantId: string, staffId: string, data: CreateOrderInput) {
  const outlet = await prisma.outlet.findFirst({
    where: { id: data.outletId, tenantId, isActive: true },
    select: { id: true },
  })
  if (!outlet) throw new NotFoundError('Outlet', data.outletId)

  if (data.type === OrderType.DINE_IN && data.tableId) {
    const table = await prisma.table.findFirst({
      where: { id: data.tableId, tenantId, deletedAt: null },
      select: { id: true, status: true },
    })
    if (!table) throw new NotFoundError('Table', data.tableId)
    if (table.status === TableStatus.OCCUPIED) throw new ConflictError('Table is already occupied')
    if (table.status === TableStatus.BLOCKED) throw new BadRequestError('Table is blocked')
  }

  if (data.customerId) {
    const customer = await prisma.customer.findFirst({
      where: { id: data.customerId, tenantId },
      select: { id: true },
    })
    if (!customer) throw new NotFoundError('Customer', data.customerId)
  }

  const resolvedItems = await resolveItemPrices(tenantId, data.items)

  try {
    return await prisma.$transaction(async (tx) => {
      const prefix = todayPrefix('ORD')
      const last = await tx.order.findFirst({
        where: { tenantId, orderNumber: { startsWith: prefix } },
        orderBy: { orderNumber: 'desc' },
        select: { orderNumber: true },
      })
      const orderNumber = buildOrderNumber(last?.orderNumber ?? null, prefix, 4)

      const order = await tx.order.create({
        data: {
          tenantId,
          outletId: data.outletId,
          orderNumber,
          type: data.type,
          status: OrderStatus.DRAFT,
          staffId,
          ...(data.tableId ? { tableId: data.tableId } : {}),
          ...(data.customerId ? { customerId: data.customerId } : {}),
          ...(data.guestCount !== undefined ? { guestCount: data.guestCount } : {}),
          ...(data.note ? { note: data.note } : {}),
          ...(resolvedItems.length > 0
            ? {
                items: {
                  create: resolvedItems.map((item) => ({
                    menuItemId: item.menuItemId,
                    menuItemName: item.menuItemName,
                    ...(item.variantId ? { variantId: item.variantId, variantName: item.variantName } : {}),
                    quantity: item.quantity,
                    unitPriceInPaise: item.unitPriceInPaise,
                    totalPriceInPaise: item.totalPriceInPaise,
                    gstRate: item.gstRate,
                    isGSTInclusive: item.isGSTInclusive,
                    ...(item.note ? { note: item.note } : {}),
                    ...(item.addOns.length > 0
                      ? {
                          addOns: {
                            create: item.addOns.map((a) => ({
                              addOnId: a.addOnId,
                              addOnName: a.addOnName,
                              priceInPaise: a.priceInPaise,
                            })),
                          },
                        }
                      : {}),
                  })),
                },
              }
            : {}),
        },
        include: ORDER_DETAIL_INCLUDE,
      })

      if (data.tableId && data.type === OrderType.DINE_IN) {
        await tx.table.update({ where: { id: data.tableId }, data: { status: TableStatus.OCCUPIED } })
      }

      return order
    })
  } catch (err: unknown) {
    if (isPrismaUniqueError(err)) throw new ConflictError('Order number conflict — please retry')
    throw err
  }
}

export async function listOrders(tenantId: string, query: ListOrdersInput) {
  const { page, limit, outletId, status, type, date } = query
  const skip = (page - 1) * limit

  let dateFilter: { gte: Date; lt: Date } | undefined
  if (date) {
    const start = new Date(`${date}T00:00:00.000Z`)
    const end = new Date(start)
    end.setUTCDate(end.getUTCDate() + 1)
    dateFilter = { gte: start, lt: end }
  }

  const where = {
    tenantId,
    ...(outletId ? { outletId } : {}),
    ...(status ? { status } : {}),
    ...(type ? { type } : {}),
    ...(dateFilter ? { createdAt: dateFilter } : {}),
  }

  const [orders, total] = await Promise.all([
    prisma.order.findMany({
      where,
      skip,
      take: limit,
      orderBy: { createdAt: 'desc' },
      include: ORDER_LIST_INCLUDE,
    }),
    prisma.order.count({ where }),
  ])

  return { orders, pagination: buildPagination(total, page, limit) }
}

export async function getOrder(tenantId: string, id: string) {
  const order = await prisma.order.findFirst({
    where: { id, tenantId },
    include: ORDER_DETAIL_INCLUDE,
  })
  if (!order) throw new NotFoundError('Order', id)
  return order
}

export async function updateOrder(tenantId: string, id: string, data: UpdateOrderInput) {
  const order = await prisma.order.findFirst({
    where: { id, tenantId },
    select: { id: true, status: true },
  })
  if (!order) throw new NotFoundError('Order', id)

  const mutableStatuses: string[] = [OrderStatus.DRAFT, OrderStatus.CONFIRMED]
  if (!mutableStatuses.includes(order.status)) {
    throw new BadRequestError(`Cannot update an order in ${order.status} status`)
  }

  if (data.customerId) {
    const customer = await prisma.customer.findFirst({
      where: { id: data.customerId, tenantId },
      select: { id: true },
    })
    if (!customer) throw new NotFoundError('Customer', data.customerId)
  }

  return prisma.order.update({
    where: { id },
    data: {
      ...(data.customerId !== undefined ? { customerId: data.customerId } : {}),
      ...(data.guestCount !== undefined ? { guestCount: data.guestCount } : {}),
      ...(data.note !== undefined ? { note: data.note } : {}),
    },
    include: ORDER_DETAIL_INCLUDE,
  })
}

export async function addItems(tenantId: string, orderId: string, data: AddItemsInput) {
  const order = await prisma.order.findFirst({
    where: { id: orderId, tenantId },
    select: { id: true, status: true },
  })
  if (!order) throw new NotFoundError('Order', orderId)
  if (order.status !== OrderStatus.DRAFT) {
    throw new BadRequestError('Items can only be added to a DRAFT order — use a new KOT for confirmed orders')
  }

  const resolvedItems = await resolveItemPrices(tenantId, data.items)

  await prisma.orderItem.createMany({
    data: resolvedItems.map((item) => ({
      orderId,
      menuItemId: item.menuItemId,
      menuItemName: item.menuItemName,
      ...(item.variantId ? { variantId: item.variantId, variantName: item.variantName } : {}),
      quantity: item.quantity,
      unitPriceInPaise: item.unitPriceInPaise,
      totalPriceInPaise: item.totalPriceInPaise,
      gstRate: item.gstRate,
      isGSTInclusive: item.isGSTInclusive,
      ...(item.note ? { note: item.note } : {}),
    })),
  })

  // Create add-ons separately (createMany doesn't support nested creates)
  for (const item of resolvedItems) {
    if (item.addOns.length > 0) {
      const created = await prisma.orderItem.findFirst({
        where: { orderId, menuItemId: item.menuItemId },
        orderBy: { createdAt: 'desc' },
        select: { id: true },
      })
      if (created) {
        await prisma.orderItemAddOn.createMany({
          data: item.addOns.map((a) => ({
            orderItemId: created.id,
            addOnId: a.addOnId,
            addOnName: a.addOnName,
            priceInPaise: a.priceInPaise,
          })),
        })
      }
    }
  }

  return getOrder(tenantId, orderId)
}

export async function updateItem(
  tenantId: string,
  orderId: string,
  itemId: string,
  data: UpdateItemInput,
) {
  const order = await prisma.order.findFirst({
    where: { id: orderId, tenantId },
    select: { id: true, status: true },
  })
  if (!order) throw new NotFoundError('Order', orderId)
  if (order.status !== OrderStatus.DRAFT) {
    throw new BadRequestError('Items can only be updated on a DRAFT order')
  }

  const item = await prisma.orderItem.findFirst({
    where: { id: itemId, orderId },
    select: { id: true, unitPriceInPaise: true },
  })
  if (!item) throw new NotFoundError('Order item', itemId)

  const newQty = data.quantity ?? (await prisma.orderItem.findUnique({ where: { id: itemId }, select: { quantity: true } }))!.quantity
  const totalPriceInPaise = item.unitPriceInPaise * BigInt(newQty)

  return prisma.orderItem.update({
    where: { id: itemId },
    data: {
      ...(data.quantity !== undefined ? { quantity: data.quantity, totalPriceInPaise } : {}),
      ...(data.note !== undefined ? { note: data.note } : {}),
    },
  })
}

export async function removeItem(tenantId: string, orderId: string, itemId: string) {
  const order = await prisma.order.findFirst({
    where: { id: orderId, tenantId },
    select: { id: true, status: true, _count: { select: { items: true } } },
  })
  if (!order) throw new NotFoundError('Order', orderId)
  if (order.status !== OrderStatus.DRAFT) {
    throw new BadRequestError('Items can only be removed from a DRAFT order')
  }
  if (order._count.items <= 1) {
    throw new BadRequestError('Cannot remove the last item — cancel the order instead')
  }

  const item = await prisma.orderItem.findFirst({
    where: { id: itemId, orderId },
    select: { id: true },
  })
  if (!item) throw new NotFoundError('Order item', itemId)

  await prisma.orderItem.delete({ where: { id: itemId } })
}

export async function confirmOrder(tenantId: string, orderId: string) {
  const order = await prisma.order.findFirst({
    where: { id: orderId, tenantId },
    include: { items: { include: { addOns: true } } },
  })
  if (!order) throw new NotFoundError('Order', orderId)
  if (order.status !== OrderStatus.DRAFT) {
    throw new BadRequestError(`Order is already ${order.status.toLowerCase()} — cannot confirm again`)
  }
  if (order.items.length === 0) {
    throw new BadRequestError('Cannot confirm an empty order — add items first')
  }

  return prisma.$transaction(async (tx) => {
    // Generate KOT number
    const prefix = todayPrefix('KOT')
    const last = await tx.kOT.findFirst({
      where: { tenantId, kotNumber: { startsWith: prefix } },
      orderBy: { kotNumber: 'desc' },
      select: { kotNumber: true },
    })
    const kotNumber = buildOrderNumber(last?.kotNumber ?? null, prefix, 3)

    await tx.kOT.create({
      data: {
        tenantId,
        orderId,
        kotNumber,
        items: {
          create: order.items.map((item) => ({
            orderItemId: item.id,
            menuItemName: item.menuItemName,
            ...(item.variantName ? { variantName: item.variantName } : {}),
            quantity: item.quantity,
            ...(item.note ? { note: item.note } : {}),
          })),
        },
      },
    })

    return tx.order.update({
      where: { id: orderId },
      data: { status: OrderStatus.CONFIRMED },
      include: ORDER_DETAIL_INCLUDE,
    })
  })
}

export async function serveOrder(tenantId: string, orderId: string) {
  const order = await prisma.order.findFirst({
    where: { id: orderId, tenantId },
    select: { id: true, status: true },
  })
  if (!order) throw new NotFoundError('Order', orderId)

  const servableStatuses: string[] = [OrderStatus.CONFIRMED, OrderStatus.IN_PROGRESS, OrderStatus.READY]
  if (!servableStatuses.includes(order.status)) {
    throw new BadRequestError(`Cannot mark order as served — current status is ${order.status}`)
  }

  return prisma.order.update({
    where: { id: orderId },
    data: { status: OrderStatus.SERVED },
    include: ORDER_DETAIL_INCLUDE,
  })
}

export async function cancelOrder(tenantId: string, orderId: string) {
  const order = await prisma.order.findFirst({
    where: { id: orderId, tenantId },
    select: { id: true, status: true, tableId: true, type: true },
  })
  if (!order) throw new NotFoundError('Order', orderId)

  const cancellableStatuses: string[] = [
    OrderStatus.DRAFT,
    OrderStatus.CONFIRMED,
    OrderStatus.IN_PROGRESS,
    OrderStatus.READY,
  ]
  if (!cancellableStatuses.includes(order.status)) {
    throw new BadRequestError(`Cannot cancel an order in ${order.status} status`)
  }

  return prisma.$transaction(async (tx) => {
    // Free the table
    if (order.tableId && order.type === OrderType.DINE_IN) {
      await tx.table.update({
        where: { id: order.tableId },
        data: { status: TableStatus.AVAILABLE },
      })
    }

    // Cancel any pending KOTs
    await tx.kOT.updateMany({
      where: { orderId, status: { notIn: ['DONE', 'CANCELLED'] } },
      data: { status: 'CANCELLED' },
    })

    return tx.order.update({
      where: { id: orderId },
      data: { status: OrderStatus.CANCELLED, closedAt: new Date() },
      include: ORDER_DETAIL_INCLUDE,
    })
  })
}

export async function transferTable(tenantId: string, orderId: string, newTableId: string) {
  const order = await prisma.order.findFirst({
    where: { id: orderId, tenantId },
    select: { id: true, status: true, tableId: true, type: true },
  })
  if (!order) throw new NotFoundError('Order', orderId)
  if (order.type !== OrderType.DINE_IN) throw new BadRequestError('Table transfer is only for DINE_IN orders')

  const closedStatuses: string[] = [OrderStatus.CANCELLED, OrderStatus.PAID, OrderStatus.VOID]
  if (closedStatuses.includes(order.status)) {
    throw new BadRequestError(`Cannot transfer a ${order.status} order`)
  }

  const newTable = await prisma.table.findFirst({
    where: { id: newTableId, tenantId, deletedAt: null },
    select: { id: true, status: true },
  })
  if (!newTable) throw new NotFoundError('Table', newTableId)
  if (newTable.status === TableStatus.OCCUPIED) throw new ConflictError('Target table is already occupied')
  if (newTable.status === TableStatus.BLOCKED) throw new BadRequestError('Target table is blocked')

  return prisma.$transaction(async (tx) => {
    if (order.tableId) {
      await tx.table.update({ where: { id: order.tableId }, data: { status: TableStatus.AVAILABLE } })
    }
    await tx.table.update({ where: { id: newTableId }, data: { status: TableStatus.OCCUPIED } })
    return tx.order.update({
      where: { id: orderId },
      data: { tableId: newTableId },
      include: ORDER_DETAIL_INCLUDE,
    })
  })
}

// ─── Fire KOT: add items to a confirmed/in-progress order ────────────────────
// Used when a table wants to order more food after the first KOT was already sent to kitchen.

export async function fireKOT(tenantId: string, orderId: string, data: FireKOTInput) {
  const order = await prisma.order.findFirst({
    where: { id: orderId, tenantId },
    select: { id: true, status: true },
  })
  if (!order) throw new NotFoundError('Order', orderId)

  const fireableStatuses: string[] = [
    OrderStatus.CONFIRMED,
    OrderStatus.IN_PROGRESS,
    OrderStatus.READY,
    OrderStatus.SERVED,
  ]
  if (!fireableStatuses.includes(order.status)) {
    throw new BadRequestError(`Cannot add items to an order in ${order.status} status`)
  }

  const resolvedItems = await resolveItemPrices(tenantId, data.items)

  return prisma.$transaction(async (tx) => {
    // Create the new order items
    const createdItems = await Promise.all(
      resolvedItems.map((item) =>
        tx.orderItem.create({
          data: {
            orderId,
            menuItemId: item.menuItemId,
            menuItemName: item.menuItemName,
            ...(item.variantId ? { variantId: item.variantId, variantName: item.variantName } : {}),
            quantity: item.quantity,
            unitPriceInPaise: item.unitPriceInPaise,
            totalPriceInPaise: item.totalPriceInPaise,
            gstRate: item.gstRate,
            isGSTInclusive: item.isGSTInclusive,
            ...(item.note ? { note: item.note } : {}),
            ...(item.addOns.length > 0
              ? {
                  addOns: {
                    create: item.addOns.map((a) => ({
                      addOnId: a.addOnId,
                      addOnName: a.addOnName,
                      priceInPaise: a.priceInPaise,
                    })),
                  },
                }
              : {}),
          },
          select: { id: true, menuItemName: true, variantName: true, quantity: true, note: true },
        }),
      ),
    )

    // Generate KOT number
    const prefix = todayPrefix('KOT')
    const last = await tx.kOT.findFirst({
      where: { tenantId, kotNumber: { startsWith: prefix } },
      orderBy: { kotNumber: 'desc' },
      select: { kotNumber: true },
    })
    const kotNumber = buildOrderNumber(last?.kotNumber ?? null, prefix, 3)

    // Create new KOT
    const kot = await tx.kOT.create({
      data: {
        tenantId,
        orderId,
        kotNumber,
        items: {
          create: createdItems.map((item) => ({
            orderItemId: item.id,
            menuItemName: item.menuItemName,
            ...(item.variantName ? { variantName: item.variantName } : {}),
            quantity: item.quantity,
            ...(item.note ? { note: item.note } : {}),
          })),
        },
      },
      include: {
        items: true,
        order: { select: { id: true, orderNumber: true, type: true } },
      },
    })

    return kot
  })
}
