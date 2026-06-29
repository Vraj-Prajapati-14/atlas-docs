import type { FastifyInstance } from 'fastify'
import { z } from 'zod'
import { ok, created } from '../../shared/response.js'
import { BadRequestError, NotFoundError, ValidationError } from '../../shared/errors.js'
import { prisma } from '@atlas/db'
import { OrderStatus, OrderType, TableStatus } from '@atlas/types'

function validate<S extends z.ZodTypeAny>(schema: S, data: unknown): z.output<S> {
  const result = schema.safeParse(data)
  if (!result.success) throw new ValidationError('Invalid request', result.error.errors)
  return result.data as z.output<S>
}

// ─── Schemas ──────────────────────────────────────────────────────────────────

const MenuQuery = z.object({ qr: z.string().min(1) })

const PublicOrderItemSchema = z.object({
  menuItemId: z.string().min(1),
  variantId: z.string().optional(),
  quantity: z.number().int().positive().max(99),
  note: z.string().max(200).trim().optional(),
  addOns: z
    .array(z.object({ addOnId: z.string().min(1) }))
    .default([]),
})

const PlaceOrderBody = z.object({
  qr: z.string().min(1),
  items: z.array(PublicOrderItemSchema).min(1).max(50),
  customerName: z.string().max(100).trim().optional(),
})

// ─── Helpers ─────────────────────────────────────────────────────────────────

async function resolveTableFromQR(qr: string) {
  const table = await prisma.table.findFirst({
    where: { qrCode: qr, deletedAt: null },
    include: {
      outlet: { select: { id: true, name: true, tenantId: true } },
      floor: { select: { id: true, name: true } },
    },
  })
  if (!table) throw new NotFoundError('Table', 'QR code')
  return table
}

function todayPrefix(label: string): string {
  const d = new Date().toISOString().slice(0, 10).replace(/-/g, '')
  return `${label}-${d}-`
}

function buildOrderNumber(last: string | null, prefix: string): string {
  const seq = last ? parseInt(last.slice(prefix.length), 10) + 1 : 1
  return `${prefix}${String(seq).padStart(4, '0')}`
}

// ─── Routes ───────────────────────────────────────────────────────────────────

export async function publicRoutes(app: FastifyInstance): Promise<void> {
  // ─── GET /public/menu?qr=xxx ─────────────────────────────────────────────
  // Returns table info + available menu items grouped by category (no auth)
  app.get('/menu', async (request, reply) => {
    const { qr } = validate(MenuQuery, request.query)

    const table = await resolveTableFromQR(qr)
    const tenantId = table.outlet.tenantId

    const [categories, items] = await Promise.all([
      prisma.menuCategory.findMany({
        where: { tenantId, isActive: true, deletedAt: null },
        orderBy: [{ sortOrder: 'asc' }, { name: 'asc' }],
        select: { id: true, name: true, description: true, sortOrder: true },
      }),
      prisma.menuItem.findMany({
        where: { tenantId, isAvailable: true, deletedAt: null },
        orderBy: [{ sortOrder: 'asc' }, { name: 'asc' }],
        include: {
          variants: { orderBy: { sortOrder: 'asc' } },
          addOns: { orderBy: { sortOrder: 'asc' } },
        },
      }),
    ])

    return ok(reply, {
      table: {
        id: table.id,
        name: table.name,
        capacity: table.capacity,
        status: table.status,
        floor: table.floor,
        outlet: { id: table.outlet.id, name: table.outlet.name },
      },
      categories,
      items,
    })
  })

  // ─── POST /public/orders ─────────────────────────────────────────────────
  // Guest self-ordering via scanned QR. Creates a DRAFT order (visible in KDS).
  app.post('/orders', async (request, reply) => {
    const body = validate(PlaceOrderBody, request.body)

    const table = await resolveTableFromQR(body.qr)
    const tenantId = table.outlet.tenantId
    const outletId = table.outletId

    if (table.status === TableStatus.BLOCKED) {
      throw new BadRequestError('This table is currently unavailable')
    }

    // Validate + resolve item prices
    const menuItemIds = [...new Set(body.items.map((i) => i.menuItemId))]
    const variantIds = body.items.flatMap((i) => (i.variantId ? [i.variantId] : []))
    const addOnIds = body.items.flatMap((i) => i.addOns.map((a) => a.addOnId))

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

    const resolvedItems = body.items.map((item) => {
      const menuItem = menuItemMap.get(item.menuItemId)
      if (!menuItem) throw new NotFoundError('Menu item', item.menuItemId)

      let unitPriceInPaise = menuItem.priceInPaise
      let variantName: string | null = null

      if (item.variantId) {
        const variant = variantMap.get(item.variantId)
        if (!variant || variant.menuItemId !== item.menuItemId) {
          throw new NotFoundError('Variant', item.variantId)
        }
        unitPriceInPaise = variant.priceInPaise
        variantName = variant.name
      }

      const resolvedAddOns = item.addOns.map((a) => {
        const addOn = addOnMap.get(a.addOnId)
        if (!addOn || addOn.menuItemId !== item.menuItemId) {
          throw new NotFoundError('Add-on', a.addOnId)
        }
        return { addOnId: addOn.id, addOnName: addOn.name, priceInPaise: addOn.priceInPaise }
      })

      const addOnTotal = resolvedAddOns.reduce((sum, a) => sum + a.priceInPaise, BigInt(0))
      const totalPriceInPaise = (unitPriceInPaise + addOnTotal) * BigInt(item.quantity)

      return {
        menuItemId: menuItem.id,
        menuItemName: menuItem.name,
        variantId: item.variantId,
        variantName,
        quantity: item.quantity,
        unitPriceInPaise,
        totalPriceInPaise,
        gstRate: menuItem.gstRate,
        isGSTInclusive: menuItem.isGSTInclusive,
        note: item.note,
        addOns: resolvedAddOns,
      }
    })

    const order = await prisma.$transaction(async (tx) => {
      const prefix = todayPrefix('ORD')
      const last = await tx.order.findFirst({
        where: { tenantId, orderNumber: { startsWith: prefix } },
        orderBy: { orderNumber: 'desc' },
        select: { orderNumber: true },
      })
      const orderNumber = buildOrderNumber(last?.orderNumber ?? null, prefix)

      const created = await tx.order.create({
        data: {
          tenantId,
          outletId,
          orderNumber,
          type: OrderType.DINE_IN,
          status: OrderStatus.DRAFT,
          tableId: table.id,
          note: body.customerName ? `Self-order by ${body.customerName}` : 'Self-order via QR',
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
        },
        include: {
          items: { include: { addOns: true, variant: true } },
          table: { select: { id: true, name: true } },
        },
      })

      // Mark table occupied if it was available
      if (table.status === TableStatus.AVAILABLE) {
        await tx.table.update({
          where: { id: table.id },
          data: { status: TableStatus.OCCUPIED },
        })
      }

      return created
    })

    return created(reply, order)
  })
}
