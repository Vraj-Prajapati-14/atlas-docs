import { z } from 'zod'

const PHONE_REGEX = /^[6-9]\d{9}$/

export const LoginEmailBody = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(1, 'Password is required'),
  tenantId: z.string().min(1, 'tenantId is required'),
  deviceInfo: z.string().max(200).optional(),
})

export const LoginPINBody = z.object({
  phone: z.string().regex(PHONE_REGEX, 'Invalid Indian mobile number'),
  pin: z.string().length(4).regex(/^\d{4}$/, 'PIN must be exactly 4 digits'),
  tenantId: z.string().min(1, 'tenantId is required'),
  deviceInfo: z.string().max(200).optional(),
})

export const RefreshBody = z.object({
  refreshToken: z.string().min(1, 'refreshToken is required'),
})

export const LogoutBody = z.object({
  refreshToken: z.string().min(1, 'refreshToken is required'),
})

export const SendOTPBody = z.object({
  phone: z.string().regex(PHONE_REGEX, 'Invalid Indian mobile number'),
  tenantId: z.string().min(1, 'tenantId is required'),
})

export const VerifyOTPBody = z.object({
  phone: z.string().regex(PHONE_REGEX, 'Invalid Indian mobile number'),
  otp: z.string().length(6).regex(/^\d{6}$/, 'OTP must be exactly 6 digits'),
  tenantId: z.string().min(1, 'tenantId is required'),
  deviceInfo: z.string().max(200).optional(),
})

export type LoginEmailInput = z.infer<typeof LoginEmailBody>
export type LoginPINInput = z.infer<typeof LoginPINBody>
export type RefreshInput = z.infer<typeof RefreshBody>
export type LogoutInput = z.infer<typeof LogoutBody>
export type SendOTPInput = z.infer<typeof SendOTPBody>
export type VerifyOTPInput = z.infer<typeof VerifyOTPBody>
