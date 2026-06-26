import { z } from 'zod'
import { FoodType } from '@atlas/types'

const GST_RATE = z.union([
  z.literal(0),
  z.literal(5),
  z.literal(12),
  z.literal(18),
  z.literal(28),
], { errorMap: () => ({ message: 'gstRate must be 0, 5, 12, 18, or 28' }) })

// ─── Categories ──────────────────────────────────────────────────────────────

export const CreateCategoryBody = z.object({
  name: z.string().min(1).max(100).trim(),
  description: z.string().max(500).trim().optional(),
  imageUrl: z.string().url('Invalid image URL').optional().nullable(),
  sortOrder: z.number().int().min(0).default(0),
})

export const UpdateCategoryBody = CreateCategoryBody.partial()

// ─── Items ───────────────────────────────────────────────────────────────────

export const CreateItemBody = z.object({
  categoryId: z.string().min(1, 'categoryId is required'),
  name: z.string().min(1).max(150).trim(),
  description: z.string().max(1000).trim().optional(),
  imageUrl: z.string().url('Invalid image URL').optional().nullable(),
  priceInPaise: z.number().int().positive('Price must be a positive integer in paise'),
  gstRate: GST_RATE,
  isGSTInclusive: z.boolean().default(false),
  foodType: z.nativeEnum(FoodType).default(FoodType.VEG),
  isAvailable: z.boolean().default(true),
  isFeatured: z.boolean().default(false),
  sortOrder: z.number().int().min(0).default(0),
})

export const UpdateItemBody = CreateItemBody.partial()

export const ListItemsQuery = z.object({
  categoryId: z.string().optional(),
  foodType: z.nativeEnum(FoodType).optional(),
  isAvailable: z
    .enum(['true', 'false'])
    .transform((v) => v === 'true')
    .optional(),
  search: z.string().max(100).trim().optional(),
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
})

// ─── Variants ────────────────────────────────────────────────────────────────

export const CreateVariantBody = z.object({
  name: z.string().min(1).max(100).trim(),
  priceInPaise: z.number().int().positive('Variant price must be a positive integer in paise'),
  isDefault: z.boolean().default(false),
  sortOrder: z.number().int().min(0).default(0),
})

export const UpdateVariantBody = CreateVariantBody.partial()

// ─── Add-ons ─────────────────────────────────────────────────────────────────

export const CreateAddOnBody = z.object({
  name: z.string().min(1).max(100).trim(),
  priceInPaise: z.number().int().min(0).default(0),
  isDefault: z.boolean().default(false),
  sortOrder: z.number().int().min(0).default(0),
})

export const UpdateAddOnBody = CreateAddOnBody.partial()

// ─── Path params ─────────────────────────────────────────────────────────────

export const IdParam = z.object({ id: z.string().min(1) })
export const ItemVariantParams = z.object({ id: z.string().min(1), variantId: z.string().min(1) })
export const ItemAddOnParams = z.object({ id: z.string().min(1), addOnId: z.string().min(1) })

// ─── Inferred types ──────────────────────────────────────────────────────────

export type CreateCategoryInput = z.infer<typeof CreateCategoryBody>
export type UpdateCategoryInput = z.infer<typeof UpdateCategoryBody>
export type CreateItemInput = z.infer<typeof CreateItemBody>
export type UpdateItemInput = z.infer<typeof UpdateItemBody>
export type ListItemsInput = z.infer<typeof ListItemsQuery>
export type CreateVariantInput = z.infer<typeof CreateVariantBody>
export type UpdateVariantInput = z.infer<typeof UpdateVariantBody>
export type CreateAddOnInput = z.infer<typeof CreateAddOnBody>
export type UpdateAddOnInput = z.infer<typeof UpdateAddOnBody>
