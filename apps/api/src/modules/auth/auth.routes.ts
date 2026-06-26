import type { FastifyInstance } from 'fastify'
import type { ZodType } from 'zod'
import { ok, noContent } from '../../shared/response.js'
import { ValidationError } from '../../shared/errors.js'
import {
  LoginEmailBody,
  LoginPINBody,
  RefreshBody,
  LogoutBody,
  SendOTPBody,
  VerifyOTPBody,
} from './auth.schema.js'
import {
  loginWithEmail,
  loginWithPIN,
  refreshTokens,
  logout,
  sendOTP,
  verifyOTP,
} from './auth.service.js'

function validate<T>(schema: ZodType<T>, data: unknown): T {
  const result = schema.safeParse(data)
  if (!result.success) {
    throw new ValidationError('Invalid request body', result.error.errors)
  }
  return result.data
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
}
