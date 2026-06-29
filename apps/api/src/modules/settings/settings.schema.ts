import { z } from 'zod'

export const UpdateSettingsBody = z.object({
  serviceChargePercent:    z.number().int().min(0).max(100).optional(),
  serviceChargeOnTakeaway: z.boolean().optional(),
  roundOffBill:            z.boolean().optional(),
  printKOTAutomatically:   z.boolean().optional(),
  whatsappReceipts:        z.boolean().optional(),
  nightlySummaryPhone:     z.string().regex(/^[6-9]\d{9}$/).nullable().optional(),
  nightlySummaryTime:      z.string().regex(/^\d{2}:\d{2}$/).optional(),
  isInterState:            z.boolean().optional(),
  kotPrinterIp:            z.string().ip().nullable().optional(),
  billPrinterIp:           z.string().ip().nullable().optional(),
})

export const UpdateOutletBody = z.object({
  name:         z.string().trim().min(2).max(100).optional(),
  phone:        z.string().regex(/^[6-9]\d{9}$/).optional(),
  addressLine1: z.string().trim().min(5).max(200).optional(),
  addressLine2: z.string().trim().max(200).nullable().optional(),
  city:         z.string().trim().min(2).max(100).optional(),
  state:        z.string().trim().min(2).max(100).optional(),
  pincode:      z.string().regex(/^\d{6}$/).optional(),
})

export const UpdateTenantBody = z.object({
  name:         z.string().trim().min(2).max(200).optional(),
  phone:        z.string().regex(/^[6-9]\d{9}$/).optional(),
  email:        z.string().email().nullable().optional(),
  website:      z.string().url().nullable().optional(),
  gstin:        z.string().regex(/^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/).nullable().optional(),
  fssaiLicense: z.string().max(14).nullable().optional(),
  panNumber:    z.string().regex(/^[A-Z]{5}[0-9]{4}[A-Z]{1}$/).nullable().optional(),
  addressLine1: z.string().trim().min(5).max(200).optional(),
  addressLine2: z.string().trim().max(200).nullable().optional(),
  city:         z.string().trim().min(2).max(100).optional(),
  state:        z.string().trim().min(2).max(100).optional(),
  pincode:      z.string().regex(/^\d{6}$/).optional(),
})

export type UpdateSettingsInput = z.output<typeof UpdateSettingsBody>
export type UpdateOutletInput   = z.output<typeof UpdateOutletBody>
export type UpdateTenantInput   = z.output<typeof UpdateTenantBody>
