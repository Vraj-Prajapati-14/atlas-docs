import { z } from 'zod'
import { AggregatorPlatform, AggregatorOrderStatus } from '@atlas/types'

// ─── Credentials ─────────────────────────────────────────────────────────────

export const CreateCredentialBody = z.object({
  platform: z.nativeEnum(AggregatorPlatform),
  outletId: z.string().min(1),
  apiKey: z.string().min(1),     // used to authenticate inbound webhooks
  secretKey: z.string().optional(), // HMAC signing secret (platform-specific)
  restaurantId: z.string().min(1),  // platform's ID for this outlet
})

export const UpdateCredentialBody = z.object({
  apiKey: z.string().min(1).optional(),
  secretKey: z.string().optional(),
  restaurantId: z.string().min(1).optional(),
  isActive: z.boolean().optional(),
})

// ─── Order queries / actions ──────────────────────────────────────────────────

export const ListAggregatorOrdersQuery = z.object({
  platform: z.nativeEnum(AggregatorPlatform).optional(),
  status: z.nativeEnum(AggregatorOrderStatus).optional(),
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
})

export const CancelOrderBody = z.object({
  reason: z.string().min(3).max(500).trim(),
})

// ─── Params ───────────────────────────────────────────────────────────────────

export const CredentialIdParam = z.object({ id: z.string().min(1) })
export const AggregatorOrderIdParam = z.object({ id: z.string().min(1) })

// ─── Webhook bodies (platform-specific) ──────────────────────────────────────

// Internal normalised order used by the service layer — not a Zod schema
export interface NormalizedAggregatorOrder {
  platformOrderId: string
  customerName?: string
  customerPhone?: string
  deliveryAddress?: string
  items: Array<{ name: string; quantity: number; unitPriceInPaise: number }>
  itemsTotalInPaise: number
  deliveryFeeInPaise: number
  platformFeeInPaise: number
  grandTotalInPaise: number
}

// ─── Inferred types ───────────────────────────────────────────────────────────

export type CreateCredentialInput = z.output<typeof CreateCredentialBody>
export type UpdateCredentialInput = z.output<typeof UpdateCredentialBody>
export type ListAggregatorOrdersInput = z.output<typeof ListAggregatorOrdersQuery>
export type CancelOrderInput = z.output<typeof CancelOrderBody>
