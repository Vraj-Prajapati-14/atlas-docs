import type { FastifyInstance } from 'fastify'
import { z } from 'zod'
import { ok, noContent } from '../../shared/response.js'
import { ValidationError } from '../../shared/errors.js'
import { authenticate } from '../../shared/middleware/authenticate.js'
import {
  LoginEmailBody,
  LoginPINBody,
  RefreshBody,
  LogoutBody,
  SendOTPBody,
  VerifyOTPBody,
  UpdateMeBody,
  ChangePasswordBody,
  SetPINBody,
} from './auth.schema.js'
import {
  loginWithEmail,
  loginWithPIN,
  refreshTokens,
  logout,
  sendOTP,
  verifyOTP,
  getMe,
  updateMe,
  changePassword,
  setMyPIN,
  verifyManagerPIN,
  lookupTenantsByPhone,
} from './auth.service.js'

function validate<S extends z.ZodTypeAny>(schema: S, data: unknown): z.output<S> {
  const result = schema.safeParse(data)
  if (!result.success) {
    throw new ValidationError('Invalid request body', result.error.errors)
  }
  return result.data as z.output<S>
}

const STRICT_RATE_LIMIT = { max: 10, timeWindow: '15 minutes' }
const OTP_RATE_LIMIT = { max: 5, timeWindow: '15 minutes' }

export async function authRoutes(app: FastifyInstance): Promise<void> {
  // ─── Login with email + password ───────────────────────────────────────────
  app.post('/login/email', { config: { rateLimit: STRICT_RATE_LIMIT } }, async (request, reply) => {
    const body = validate(LoginEmailBody, request.body)
    const { tokens, user } = await loginWithEmail(app, body, request.ip)
    return ok(reply, { user, ...tokens })
  })

  // ─── Login with phone + 4-digit PIN ────────────────────────────────────────
  app.post('/login/pin', { config: { rateLimit: STRICT_RATE_LIMIT } }, async (request, reply) => {
    const body = validate(LoginPINBody, request.body)
    const { tokens, user } = await loginWithPIN(app, body, request.ip)
    return ok(reply, { user, ...tokens })
  })

  // ─── Rotate refresh token, issue new access + refresh ──────────────────────
  app.post('/refresh', async (request, reply) => {
    const body = validate(RefreshBody, request.body)
    const tokens = await refreshTokens(app, body)
    return ok(reply, tokens)
  })

  // ─── Revoke session ─────────────────────────────────────────────────────────
  app.post('/logout', async (request, reply) => {
    const body = validate(LogoutBody, request.body)
    await logout(body)
    return noContent(reply)
  })

  // ─── Lookup which tenant(s) a phone belongs to (public, no auth) ────────────
  app.post('/lookup-tenant', { config: { rateLimit: STRICT_RATE_LIMIT } }, async (request, reply) => {
    const { phone } = validate(
      z.object({ phone: z.string().regex(/^[6-9]\d{9}$/, 'Invalid mobile number') }),
      request.body,
    )
    const tenants = await lookupTenantsByPhone(phone)
    return ok(reply, { tenants })
  })

  // ─── Send OTP via MSG91 ─────────────────────────────────────────────────────
  app.post('/otp/send', { config: { rateLimit: OTP_RATE_LIMIT } }, async (request, reply) => {
    const body = validate(SendOTPBody, request.body)
    const result = await sendOTP(body)
    return ok(reply, result)
  })

  // ─── Verify OTP + issue tokens ──────────────────────────────────────────────
  app.post('/otp/verify', { config: { rateLimit: OTP_RATE_LIMIT } }, async (request, reply) => {
    const body = validate(VerifyOTPBody, request.body)
    const { tokens, user } = await verifyOTP(app, body, request.ip)
    return ok(reply, { user, ...tokens })
  })

  // ─── Profile (/me) — authenticated ──────────────────────────────────────────
  app.get('/me', { preHandler: [authenticate] }, async (request, reply) => {
    return ok(reply, await getMe(request.user.sub))
  })

  app.patch('/me', { preHandler: [authenticate] }, async (request, reply) => {
    const body = validate(UpdateMeBody, request.body)
    return ok(reply, await updateMe(request.user.sub, request.user.tenantId, body))
  })

  app.post('/me/change-password', { preHandler: [authenticate] }, async (request, reply) => {
    const body = validate(ChangePasswordBody, request.body)
    await changePassword(request.user.sub, body)
    return ok(reply, { message: 'Password updated successfully.' })
  })

  app.post('/me/set-pin', { preHandler: [authenticate] }, async (request, reply) => {
    const body = validate(SetPINBody, request.body)
    await setMyPIN(request.user.sub, body)
    return ok(reply, { message: 'PIN updated successfully.' })
  })

  // ─── Verify manager/owner PIN (discount approval gate) ──────────────────────
  app.post('/verify-manager-pin', { preHandler: [authenticate] }, async (request, reply) => {
    const { pin } = validate(z.object({ pin: z.string().length(4).regex(/^\d{4}$/) }), request.body)
    return ok(reply, await verifyManagerPIN(request.user.tenantId, pin))
  })
}
