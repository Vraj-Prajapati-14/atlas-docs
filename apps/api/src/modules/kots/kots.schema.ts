import { z } from 'zod'
import { KOTStatus } from '@atlas/types'

// ─── Params ───────────────────────────────────────────────────────────────────

export const KOTIdParam = z.object({ id: z.string().min(1) })

// ─── Queries ─────────────────────────────────────────────────────────────────

export const ListKOTsQuery = z.object({
  outletId: z.string().min(1).optional(),
  status: z.nativeEnum(KOTStatus).optional(),
  // active=true is shorthand for status IN (PENDING, ACCEPTED, IN_PROGRESS) — use for KDS screens
  active: z
    .enum(['true', 'false'])
    .transform((v) => v === 'true')
    .optional(),
  date: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, 'date must be YYYY-MM-DD')
    .optional(),
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().min(1).max(200).default(50),
})


// ─── Inferred types ───────────────────────────────────────────────────────────

export type ListKOTsInput = z.output<typeof ListKOTsQuery>
