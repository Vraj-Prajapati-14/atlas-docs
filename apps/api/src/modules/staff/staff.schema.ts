import { z } from 'zod'
import { UserRole } from '@atlas/types'

export const ListStaffQuery = z.object({
  role:     z.nativeEnum(UserRole).optional(),
  isActive: z.coerce.boolean().optional(),
  search:   z.string().trim().max(100).optional(),
})

export const CreateStaffBody = z.object({
  name:  z.string().trim().min(2).max(100),
  phone: z.string().regex(/^[6-9]\d{9}$/, 'Invalid Indian mobile number'),
  email: z.string().email().optional(),
  role:  z.nativeEnum(UserRole),
  pin:   z.string().regex(/^\d{4}$/, 'PIN must be exactly 4 digits'),
})

export const UpdateStaffBody = z.object({
  name:  z.string().trim().min(2).max(100).optional(),
  phone: z.string().regex(/^[6-9]\d{9}$/).optional(),
  email: z.string().email().optional(),
  role:  z.nativeEnum(UserRole).optional(),
})

export const ResetPINBody = z.object({
  pin: z.string().regex(/^\d{4}$/, 'PIN must be exactly 4 digits'),
})

export const StaffIdParam = z.object({ id: z.string().min(1) })

export type ListStaffInput   = z.output<typeof ListStaffQuery>
export type CreateStaffInput = z.output<typeof CreateStaffBody>
export type UpdateStaffInput = z.output<typeof UpdateStaffBody>
export type ResetPINInput    = z.output<typeof ResetPINBody>
