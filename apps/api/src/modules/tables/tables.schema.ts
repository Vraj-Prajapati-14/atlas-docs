import { z } from 'zod'
import { TableStatus } from '@atlas/types'

// ─── Floors ──────────────────────────────────────────────────────────────────

export const CreateFloorBody = z.object({
  outletId: z.string().min(1),
  name: z.string().min(1).max(50).trim(),
  sortOrder: z.number().int().min(0).default(0),
})

export const UpdateFloorBody = z.object({
  name: z.string().min(1).max(50).trim().optional(),
  sortOrder: z.number().int().min(0).optional(),
})

export const FloorIdParam = z.object({ id: z.string().min(1) })

export const ListFloorsQuery = z.object({
  outletId: z.string().min(1).optional(),
})

// ─── Tables ──────────────────────────────────────────────────────────────────

export const CreateTableBody = z.object({
  outletId: z.string().min(1),
  floorId: z.string().min(1).optional(),
  name: z.string().min(1).max(50).trim(),
  capacity: z.number().int().min(1).max(200).default(4),
  positionX: z.number().optional(),
  positionY: z.number().optional(),
})

export const UpdateTableBody = z.object({
  floorId: z.string().min(1).nullable().optional(),
  name: z.string().min(1).max(50).trim().optional(),
  capacity: z.number().int().min(1).max(200).optional(),
  positionX: z.number().nullable().optional(),
  positionY: z.number().nullable().optional(),
})

export const UpdateTableStatusBody = z.object({
  status: z.nativeEnum(TableStatus),
})

export const ListTablesQuery = z.object({
  outletId: z.string().min(1).optional(),
  floorId: z.string().min(1).optional(),
  status: z.nativeEnum(TableStatus).optional(),
})

export const TableIdParam = z.object({ id: z.string().min(1) })

// ─── Inferred types ──────────────────────────────────────────────────────────

export type CreateFloorInput = z.output<typeof CreateFloorBody>
export type UpdateFloorInput = z.output<typeof UpdateFloorBody>
export type ListFloorsInput = z.output<typeof ListFloorsQuery>
export type CreateTableInput = z.output<typeof CreateTableBody>
export type UpdateTableInput = z.output<typeof UpdateTableBody>
export type ListTablesInput = z.output<typeof ListTablesQuery>
