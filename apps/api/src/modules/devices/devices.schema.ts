import { z } from 'zod'

const DEVICE_TYPES = ['POS', 'KDS', 'CAPTAIN', 'MANAGER', 'PRINT_AGENT', 'OWNER_MOBILE'] as const
const DISPLAY_MODES = ['STANDARD', 'KIOSK', 'KDS_DISPLAY'] as const

export const CreateDeviceBody = z.object({
  name:       z.string().trim().min(1).max(100),
  type:       z.enum(DEVICE_TYPES),
  defaultUrl: z.string().url().nullable().optional(),
  floorId:    z.string().cuid().nullable().optional(),
})

export const UpdateDeviceBody = z.object({
  name:       z.string().trim().min(1).max(100).optional(),
  type:       z.enum(DEVICE_TYPES).optional(),
  defaultUrl: z.string().url().nullable().optional(),
  floorId:    z.string().cuid().nullable().optional(),
})

export const UpdateDeviceSettingsBody = z.object({
  autoKotPrint:  z.boolean().optional(),
  autoBillPrint: z.boolean().optional(),
  soundAlerts:   z.boolean().optional(),
  displayMode:   z.enum(DISPLAY_MODES).optional(),
})

export const DeviceIdParam = z.object({
  id: z.string().cuid(),
})

export type CreateDeviceInput          = z.output<typeof CreateDeviceBody>
export type UpdateDeviceInput          = z.output<typeof UpdateDeviceBody>
export type UpdateDeviceSettingsInput  = z.output<typeof UpdateDeviceSettingsBody>
