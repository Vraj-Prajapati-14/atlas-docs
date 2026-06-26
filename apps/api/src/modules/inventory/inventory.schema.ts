import { z } from 'zod'
import { InventoryUnit, InventoryTransactionType } from '@atlas/types'

// ─── Categories ───────────────────────────────────────────────────────────────

export const CreateCategoryBody = z.object({
  name: z.string().min(1).max(100).trim(),
})

export const UpdateCategoryBody = z.object({
  name: z.string().min(1).max(100).trim(),
})

// ─── Items ────────────────────────────────────────────────────────────────────

export const CreateItemBody = z.object({
  categoryId: z.string().min(1).optional(),
  name: z.string().min(1).max(200).trim(),
  unit: z.nativeEnum(InventoryUnit),
  lowStockThreshold: z.number().min(0).default(0),
  pricePerUnitPaise: z.number().int().min(0).default(0),
  openingStock: z.number().min(0).default(0),
})

export const UpdateItemBody = z.object({
  categoryId: z.string().min(1).nullable().optional(),
  name: z.string().min(1).max(200).trim().optional(),
  unit: z.nativeEnum(InventoryUnit).optional(),
  lowStockThreshold: z.number().min(0).optional(),
  pricePerUnitPaise: z.number().int().min(0).optional(),
  isActive: z.boolean().optional(),
})

export const ListItemsQuery = z.object({
  categoryId: z.string().min(1).optional(),
  lowStock: z
    .string()
    .transform((v) => v === 'true')
    .optional(),
  isActive: z.coerce.boolean().default(true),
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
})

// ─── Transactions ─────────────────────────────────────────────────────────────

// SALE_DEDUCTION is system-only (auto on serve) — excluded from manual API
const MANUAL_TRANSACTION_TYPES = [
  InventoryTransactionType.PURCHASE,
  InventoryTransactionType.WASTE,
  InventoryTransactionType.ADJUSTMENT,
  InventoryTransactionType.RETURN,
  InventoryTransactionType.OPENING_STOCK,
] as const

export const RecordTransactionBody = z.object({
  inventoryItemId: z.string().min(1),
  type: z.enum(MANUAL_TRANSACTION_TYPES),
  // positive = stock in / adjustment increase; for WASTE pass positive (service negates it)
  // ADJUSTMENT: pass negative to reduce stock
  quantity: z.number().refine((v) => v !== 0, 'Quantity cannot be zero'),
  note: z.string().max(500).trim().optional(),
  referenceId: z.string().max(100).optional(),
  pricePerUnitPaise: z.number().int().min(0).optional(), // updates item's last cost if provided with PURCHASE
})

export const ListTransactionsQuery = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().min(1).max(100).default(50),
})

// ─── Suppliers ────────────────────────────────────────────────────────────────

export const CreateSupplierBody = z.object({
  name: z.string().min(1).max(200).trim(),
  contactPerson: z.string().max(100).trim().optional(),
  phone: z.string().regex(/^[6-9]\d{9}$/, 'Invalid phone number'),
  email: z.string().email().optional(),
  gstin: z
    .string()
    .regex(/^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/, 'Invalid GSTIN')
    .optional(),
  address: z.string().max(500).trim().optional(),
})

export const UpdateSupplierBody = CreateSupplierBody.partial().extend({
  isActive: z.boolean().optional(),
})

// ─── Purchase Orders ──────────────────────────────────────────────────────────

const POItemInput = z.object({
  inventoryItemId: z.string().min(1),
  quantity: z.number().positive('Quantity must be positive'),
  unitPriceInPaise: z.number().int().min(0),
})

export const CreatePOBody = z.object({
  supplierId: z.string().min(1),
  items: z.array(POItemInput).min(1, 'At least one item required'),
  note: z.string().max(500).trim().optional(),
})

export const ReceivePOBody = z.object({
  invoiceNumber: z.string().max(100).trim().optional(),
  note: z.string().max(500).trim().optional(),
})

export const ListPOsQuery = z.object({
  supplierId: z.string().min(1).optional(),
  status: z.enum(['DRAFT', 'ORDERED', 'RECEIVED', 'CANCELLED']).optional(),
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
})

// ─── Recipes ──────────────────────────────────────────────────────────────────

const RecipeIngredientInput = z.object({
  inventoryItemId: z.string().min(1),
  quantity: z.number().positive('Quantity per serving must be positive'),
})

export const SetRecipeBody = z.object({
  ingredients: z.array(RecipeIngredientInput),
})

// ─── Params ───────────────────────────────────────────────────────────────────

export const CategoryIdParam = z.object({ id: z.string().min(1) })
export const ItemIdParam = z.object({ id: z.string().min(1) })
export const SupplierIdParam = z.object({ id: z.string().min(1) })
export const POIdParam = z.object({ id: z.string().min(1) })
export const MenuItemIdParam = z.object({ menuItemId: z.string().min(1) })

// ─── Inferred types ───────────────────────────────────────────────────────────

export type CreateCategoryInput = z.output<typeof CreateCategoryBody>
export type UpdateCategoryInput = z.output<typeof UpdateCategoryBody>
export type CreateItemInput = z.output<typeof CreateItemBody>
export type UpdateItemInput = z.output<typeof UpdateItemBody>
export type ListItemsInput = z.output<typeof ListItemsQuery>
export type RecordTransactionInput = z.output<typeof RecordTransactionBody>
export type ListTransactionsInput = z.output<typeof ListTransactionsQuery>
export type CreateSupplierInput = z.output<typeof CreateSupplierBody>
export type UpdateSupplierInput = z.output<typeof UpdateSupplierBody>
export type CreatePOInput = z.output<typeof CreatePOBody>
export type ReceivePOInput = z.output<typeof ReceivePOBody>
export type ListPOsInput = z.output<typeof ListPOsQuery>
export type SetRecipeInput = z.output<typeof SetRecipeBody>
