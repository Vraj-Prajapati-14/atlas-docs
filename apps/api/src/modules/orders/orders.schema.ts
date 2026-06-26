import { z } from 'zod'
import { OrderType, OrderStatus } from '@atlas/types'

// ─── Shared sub-schemas ───────────────────────────────────────────────────────

const AddOnInput = z.object({
  addOnId: z.string().min(1),
})

export const OrderItemInput = z.object({
  menuItemId: z.string().min(1),
  variantId: z.string().min(1).optional(),
  addOns: z.array(AddOnInput).default([]),
  quantity: z.number().int().min(1).max(50),
  note: z.string().max(200).trim().optional(),
})

// ─── Order ────────────────────────────────────────────────────────────────────

export const CreateOrderBody = z
  .object({
    outletId: z.string().min(1),
    type: z.nativeEnum(OrderType).default(OrderType.DINE_IN),
    tableId: z.string().min(1).optional(),
    customerId: z.string().min(1).optional(),
    guestCount: z.number().int().min(1).max(200).optional(),
    note: z.string().max(500).trim().optional(),
    items: z.array(OrderItemInput).default([]),
  })
  .refine((data) => data.type !== OrderType.DINE_IN || data.tableId !== undefined, {
    message: 'tableId is required for DINE_IN orders',
    path: ['tableId'],
  })

export const UpdateOrderBody = z.object({
  customerId: z.string().min(1).nullable().optional(),
  guestCount: z.number().int().min(1).max(200).nullable().optional(),
  note: z.string().max(500).trim().nullable().optional(),
})

export const AddItemsBody = z.object({
  items: z.array(OrderItemInput).min(1, 'At least one item is required'),
})

export const UpdateItemBody = z.object({
  quantity: z.number().int().min(1).max(50).optional(),
  note: z.string().max(200).trim().nullable().optional(),
})

export const TransferTableBody = z.object({
  newTableId: z.string().min(1),
})

export const ListOrdersQuery = z.object({
  outletId: z.string().min(1).optional(),
  status: z.nativeEnum(OrderStatus).optional(),
  type: z.nativeEnum(OrderType).optional(),
  date: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, 'date must be YYYY-MM-DD')
    .optional(),
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
})

// ─── Params ───────────────────────────────────────────────────────────────────

export const OrderIdParam = z.object({ id: z.string().min(1) })

export const OrderItemParams = z.object({
  id: z.string().min(1),
  itemId: z.string().min(1),
})

// ─── Inferred types ───────────────────────────────────────────────────────────

export type CreateOrderInput = z.output<typeof CreateOrderBody>
export type UpdateOrderInput = z.output<typeof UpdateOrderBody>
export type AddItemsInput = z.output<typeof AddItemsBody>
export type UpdateItemInput = z.output<typeof UpdateItemBody>
export type ListOrdersInput = z.output<typeof ListOrdersQuery>
export type OrderItemInputType = z.output<typeof OrderItemInput>
