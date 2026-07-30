import { createHash, randomBytes } from 'node:crypto'
import bcrypt from 'bcryptjs'
import type { FastifyInstance } from 'fastify'
import { prisma } from '@atlas/db'
import { config } from '../../config/index.js'
import {
  UnauthorizedError,
  NotFoundError,
  BadRequestError,
  ConflictError,
  TooManyRequestsError,
  ServiceUnavailableError,
} from '../../shared/errors.js'
import type {
  LoginEmailInput,
  LoginPINInput,
  RefreshInput,
  SendOTPInput,
  VerifyOTPInput,
  UpdateMeInput,
  ChangePasswordInput,
  SetPINInput,
} from './auth.schema.js'

export interface TokenPair {
  accessToken: string
  refreshToken: string
  expiresIn: number
}

export interface AuthUser {
  id: string
  name: string
  email: string | null
  phone: string
  role: string
  tenantId: string
}

// Prisma's Json? fields only accept JSON-safe primitives, not `unknown`
type AuditMeta = Record<string, string | number | boolean | null>

const REFRESH_TTL_DAYS = 30
const LOCKOUT_MS = 30 * 60 * 1000 // 30 minutes
const MAX_ATTEMPTS = 5
const ACCESS_TTL_SECONDS = 15 * 60

function hashToken(token: string): string {
  return createHash('sha256').update(token).digest('hex')
}

function makeRefreshToken(): string {
  return randomBytes(32).toString('hex')
}

async function createSession(
  app: FastifyInstance,
  user: { id: string; tenantId: string; role: string },
  deviceInfo?: string,
  ipAddress?: string,
): Promise<TokenPair> {
  const rawRefresh = makeRefreshToken()
  const expiresAt = new Date(Date.now() + REFRESH_TTL_DAYS * 24 * 60 * 60 * 1000)

  const [session, tenant] = await Promise.all([
    prisma.userSession.create({
      data: {
        userId: user.id,
        tenantId: user.tenantId,
        refreshToken: hashToken(rawRefresh),
        deviceInfo: deviceInfo ?? null,
        ipAddress: ipAddress ?? null,
        expiresAt,
      },
      select: { id: true },
    }),
    prisma.tenant.findUnique({
      where: { id: user.tenantId },
      select: { onboardingCompletedAt: true },
    }),
  ])

  const accessToken = app.jwt.sign({
    sub: user.id,
    tenantId: user.tenantId,
    role: user.role,
    sessionId: session.id,
    onboardingCompleted: tenant?.onboardingCompletedAt !== null && tenant?.onboardingCompletedAt !== undefined,
  })

  return { accessToken, refreshToken: rawRefresh, expiresIn: ACCESS_TTL_SECONDS }
}

function assertNotLocked(lockedUntil: Date | null): void {
  if (lockedUntil && lockedUntil > new Date()) {
    const mins = Math.ceil((lockedUntil.getTime() - Date.now()) / 60_000)
    throw new TooManyRequestsError(
      `Account locked due to too many failed attempts. Try again in ${mins} minute(s).`,
    )
  }
}

async function onFailedAttempt(userId: string): Promise<void> {
  const row = await prisma.user.findUnique({
    where: { id: userId },
    select: { failedLoginAttempts: true },
  })
  if (!row) return

  const attempts = row.failedLoginAttempts + 1
  await prisma.user.update({
    where: { id: userId },
    data: {
      failedLoginAttempts: attempts,
      ...(attempts >= MAX_ATTEMPTS ? { lockedUntil: new Date(Date.now() + LOCKOUT_MS) } : {}),
    },
  })
}

async function onLoginSuccess(userId: string): Promise<void> {
  await prisma.user.update({
    where: { id: userId },
    data: { failedLoginAttempts: 0, lockedUntil: null, lastLoginAt: new Date() },
  })
}

async function audit(params: {
  tenantId: string
  userId?: string
  action: string
  entityId?: string
  ipAddress?: string
  metadata?: AuditMeta
}): Promise<void> {
  try {
    await prisma.auditLog.create({
      data: {
        tenantId: params.tenantId,
        userId: params.userId ?? null,
        action: params.action,
        entityType: 'User',
        entityId: params.entityId ?? null,
        ipAddress: params.ipAddress ?? null,
        // Omit newValues entirely when undefined — Prisma requires Prisma.DbNull, not JS null
        ...(params.metadata !== undefined ? { newValues: params.metadata } : {}),
      },
    })
  } catch {
    // Audit failure is non-critical — never block the auth flow
  }
}

// ─── Public service functions ────────────────────────────────────────────────

export async function loginWithEmail(
  app: FastifyInstance,
  input: LoginEmailInput,
  ipAddress?: string,
): Promise<{ tokens: TokenPair; user: AuthUser }> {
  const user = await prisma.user.findFirst({
    where: { tenantId: input.tenantId, email: input.email.toLowerCase(), deletedAt: null },
    select: {
      id: true,
      tenantId: true,
      name: true,
      email: true,
      phone: true,
      role: true,
      passwordHash: true,
      failedLoginAttempts: true,
      lockedUntil: true,
      isActive: true,
    },
  })

  if (!user?.passwordHash) {
    throw new UnauthorizedError('Invalid email or password')
  }

  if (!user.isActive) {
    throw new UnauthorizedError('Account is deactivated. Contact your manager.')
  }

  assertNotLocked(user.lockedUntil)

  const valid = await bcrypt.compare(input.password, user.passwordHash)
  if (!valid) {
    await onFailedAttempt(user.id)
    await audit({
      tenantId: input.tenantId,
      userId: user.id,
      action: 'LOGIN_FAILED',
      entityId: user.id,
      ipAddress,
      metadata: { method: 'email' },
    })
    throw new UnauthorizedError('Invalid email or password')
  }

  await onLoginSuccess(user.id)
  await audit({
    tenantId: input.tenantId,
    userId: user.id,
    action: 'LOGIN_SUCCESS',
    entityId: user.id,
    ipAddress,
    metadata: { method: 'email' },
  })

  const tokens = await createSession(app, user, input.deviceInfo, ipAddress)
  return {
    tokens,
    user: {
      id: user.id,
      name: user.name,
      email: user.email,
      phone: user.phone,
      role: user.role,
      tenantId: user.tenantId,
    },
  }
}

export async function loginWithPIN(
  app: FastifyInstance,
  input: LoginPINInput,
  ipAddress?: string,
): Promise<{ tokens: TokenPair; user: AuthUser }> {
  const user = await prisma.user.findFirst({
    where: { tenantId: input.tenantId, phone: input.phone, deletedAt: null },
    select: {
      id: true,
      tenantId: true,
      name: true,
      email: true,
      phone: true,
      role: true,
      pin: true,
      failedLoginAttempts: true,
      lockedUntil: true,
      isActive: true,
    },
  })

  if (!user?.pin) {
    throw new UnauthorizedError('Invalid phone or PIN')
  }

  if (!user.isActive) {
    throw new UnauthorizedError('Account is deactivated. Contact your manager.')
  }

  assertNotLocked(user.lockedUntil)

  const valid = await bcrypt.compare(input.pin, user.pin)
  if (!valid) {
    await onFailedAttempt(user.id)
    await audit({
      tenantId: input.tenantId,
      userId: user.id,
      action: 'LOGIN_FAILED',
      entityId: user.id,
      ipAddress,
      metadata: { method: 'pin' },
    })
    throw new UnauthorizedError('Invalid phone or PIN')
  }

  await onLoginSuccess(user.id)
  await audit({
    tenantId: input.tenantId,
    userId: user.id,
    action: 'LOGIN_SUCCESS',
    entityId: user.id,
    ipAddress,
    metadata: { method: 'pin' },
  })

  const tokens = await createSession(app, user, input.deviceInfo, ipAddress)
  return {
    tokens,
    user: {
      id: user.id,
      name: user.name,
      email: user.email,
      phone: user.phone,
      role: user.role,
      tenantId: user.tenantId,
    },
  }
}

export async function refreshTokens(
  app: FastifyInstance,
  input: RefreshInput,
): Promise<TokenPair> {
  const hashed = hashToken(input.refreshToken)

  const session = await prisma.userSession.findUnique({
    where: { refreshToken: hashed },
    include: {
      user: {
        select: { id: true, tenantId: true, role: true, isActive: true, deletedAt: true },
      },
    },
  })

  if (!session || session.revokedAt !== null || session.expiresAt < new Date()) {
    throw new UnauthorizedError('Invalid or expired refresh token')
  }

  if (!session.user.isActive || session.user.deletedAt !== null) {
    throw new UnauthorizedError('Account is deactivated')
  }

  const rawRefresh = makeRefreshToken()
  const newExpiresAt = new Date(Date.now() + REFRESH_TTL_DAYS * 24 * 60 * 60 * 1000)

  // Atomic rotation: revoke old session, create new one — query tenant in parallel
  const [newSession, tenant] = await Promise.all([
    prisma.$transaction(async (tx) => {
      await tx.userSession.update({
        where: { id: session.id },
        data: { revokedAt: new Date() },
      })
      return tx.userSession.create({
        data: {
          userId: session.userId,
          tenantId: session.tenantId,
          refreshToken: hashToken(rawRefresh),
          deviceInfo: session.deviceInfo,
          ipAddress: session.ipAddress,
          expiresAt: newExpiresAt,
        },
        select: { id: true },
      })
    }),
    prisma.tenant.findUnique({
      where: { id: session.tenantId },
      select: { onboardingCompletedAt: true },
    }),
  ])

  const accessToken = app.jwt.sign({
    sub: session.user.id,
    tenantId: session.user.tenantId,
    role: session.user.role,
    sessionId: newSession.id,
    onboardingCompleted: tenant?.onboardingCompletedAt !== null && tenant?.onboardingCompletedAt !== undefined,
  })

  return { accessToken, refreshToken: rawRefresh, expiresIn: ACCESS_TTL_SECONDS }
}

export async function logout(input: RefreshInput): Promise<void> {
  const hashed = hashToken(input.refreshToken)

  const session = await prisma.userSession.findUnique({
    where: { refreshToken: hashed },
    select: { id: true, revokedAt: true },
  })

  if (!session || session.revokedAt !== null) return // idempotent

  await prisma.userSession.update({
    where: { id: session.id },
    data: { revokedAt: new Date() },
  })
}

export interface ProfileMeDetailed extends AuthUser {
  lastLoginAt: Date | null
  passwordChangedAt: Date | null
  hasPIN: boolean
  hasPassword: boolean
}

export interface SessionItem {
  id: string
  deviceInfo: string | null
  ipAddress: string | null
  createdAt: Date
  expiresAt: Date
  isCurrent: boolean
}

export interface LoginHistoryItem {
  id: string
  action: string
  ipAddress: string | null
  createdAt: Date
  method: string | null
}

export async function getMe(userId: string): Promise<ProfileMeDetailed> {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      id: true, tenantId: true, name: true, email: true, phone: true, role: true,
      lastLoginAt: true, passwordChangedAt: true, pin: true, passwordHash: true,
    },
  })
  if (!user) throw new NotFoundError('User', userId)
  return {
    id: user.id,
    tenantId: user.tenantId,
    name: user.name,
    email: user.email,
    phone: user.phone,
    role: user.role,
    lastLoginAt: user.lastLoginAt,
    passwordChangedAt: user.passwordChangedAt,
    hasPIN: user.pin !== null,
    hasPassword: user.passwordHash !== null,
  }
}

export async function getMySessions(userId: string, currentSessionId: string): Promise<SessionItem[]> {
  const sessions = await prisma.userSession.findMany({
    where: { userId, revokedAt: null, expiresAt: { gt: new Date() } },
    select: { id: true, deviceInfo: true, ipAddress: true, createdAt: true, expiresAt: true },
    orderBy: { createdAt: 'desc' },
  })
  return sessions.map((s) => ({ ...s, isCurrent: s.id === currentSessionId }))
}

export async function revokeSession(userId: string, sessionId: string, currentSessionId: string): Promise<void> {
  if (sessionId === currentSessionId) {
    throw new BadRequestError('Cannot revoke the current session — use logout instead.')
  }
  const session = await prisma.userSession.findUnique({
    where: { id: sessionId },
    select: { id: true, userId: true, revokedAt: true },
  })
  if (!session || session.userId !== userId) throw new NotFoundError('Session', sessionId)
  if (session.revokedAt !== null) return
  await prisma.userSession.update({ where: { id: sessionId }, data: { revokedAt: new Date() } })
}

export async function revokeAllOtherSessions(userId: string, currentSessionId: string): Promise<{ count: number }> {
  const result = await prisma.userSession.updateMany({
    where: { userId, revokedAt: null, expiresAt: { gt: new Date() }, id: { not: currentSessionId } },
    data: { revokedAt: new Date() },
  })
  return { count: result.count }
}

export interface NotifPrefs {
  notifOrderAlerts: boolean
  notifLowStock:    boolean
  notifDailyReport: boolean
  notifLoginAlert:  boolean
}

export async function getNotifPrefs(userId: string): Promise<NotifPrefs> {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { notifOrderAlerts: true, notifLowStock: true, notifDailyReport: true, notifLoginAlert: true },
  })
  if (!user) throw new NotFoundError('User', userId)
  return user
}

export async function updateNotifPrefs(userId: string, prefs: Partial<NotifPrefs>): Promise<NotifPrefs> {
  const user = await prisma.user.update({
    where: { id: userId },
    data: prefs,
    select: { notifOrderAlerts: true, notifLowStock: true, notifDailyReport: true, notifLoginAlert: true },
  })
  return user
}

export async function getLoginHistory(userId: string, tenantId: string): Promise<LoginHistoryItem[]> {
  const logs = await prisma.auditLog.findMany({
    where: { tenantId, userId, action: { in: ['LOGIN_SUCCESS', 'LOGIN_FAILED'] } },
    select: { id: true, action: true, ipAddress: true, createdAt: true, newValues: true },
    orderBy: { createdAt: 'desc' },
    take: 20,
  })
  return logs.map((l) => {
    const meta = (l.newValues ?? {}) as Record<string, string>
    return { id: l.id, action: l.action, ipAddress: l.ipAddress, createdAt: l.createdAt, method: meta.method ?? null }
  })
}

export async function updateMe(userId: string, tenantId: string, input: UpdateMeInput): Promise<AuthUser> {
  if (input.phone) {
    const conflict = await prisma.user.findFirst({
      where: { tenantId, phone: input.phone, id: { not: userId }, deletedAt: null },
    })
    if (conflict) throw new ConflictError(`Phone ${input.phone} is already in use.`)
  }
  const user = await prisma.user.update({
    where: { id: userId },
    data: input,
    select: { id: true, tenantId: true, name: true, email: true, phone: true, role: true },
  })
  return user
}

export async function changePassword(userId: string, input: ChangePasswordInput): Promise<void> {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { passwordHash: true },
  })
  if (!user?.passwordHash) throw new BadRequestError('No password set — use PIN or OTP login.')

  const valid = await bcrypt.compare(input.currentPassword, user.passwordHash)
  if (!valid) throw new UnauthorizedError('Current password is incorrect.')

  const hash = await bcrypt.hash(input.newPassword, 12)
  await prisma.user.update({
    where: { id: userId },
    data: { passwordHash: hash, passwordChangedAt: new Date() },
  })
}

export async function setMyPIN(userId: string, input: SetPINInput): Promise<void> {
  const pin = await bcrypt.hash(input.pin, 10)
  await prisma.user.update({ where: { id: userId }, data: { pin } })
}

// Verify any active OWNER or MANAGER PIN — used for discount approval flow
export async function verifyManagerPIN(tenantId: string, pin: string): Promise<{ valid: boolean }> {
  const managers = await prisma.user.findMany({
    where: {
      tenantId,
      role: { in: ['OWNER', 'MANAGER'] },
      isActive: true,
      pin: { not: null },
      deletedAt: null,
    },
    select: { pin: true },
  })

  for (const manager of managers) {
    if (manager.pin && await bcrypt.compare(pin, manager.pin)) {
      return { valid: true }
    }
  }
  return { valid: false }
}

export async function lookupTenantsByPhone(phone: string) {
  const users = await prisma.user.findMany({
    where: { phone, isActive: true, deletedAt: null },
    select: {
      tenantId: true,
      tenant: {
        select: { id: true, name: true, slug: true, logoUrl: true, city: true, planStatus: true },
      },
    },
  })
  return users.map((u) => ({
    tenantId: u.tenantId,
    name: u.tenant.name,
    slug: u.tenant.slug,
    logoUrl: u.tenant.logoUrl,
    city: u.tenant.city,
    planStatus: u.tenant.planStatus,
  }))
}

export async function sendOTP(input: SendOTPInput): Promise<{ message: string }> {
  // Always return same message to avoid user enumeration
  const userExists = await prisma.user.findFirst({
    where: { tenantId: input.tenantId, phone: input.phone, deletedAt: null, isActive: true },
    select: { id: true },
  })

  if (!userExists) {
    return { message: 'OTP sent if account exists' }
  }

  if (!config.MSG91_AUTH_KEY || !config.MSG91_OTP_TEMPLATE_ID) {
    if (config.NODE_ENV !== 'production') {
      return { message: 'OTP sent (development mode)' }
    }
    throw new ServiceUnavailableError('OTP service')
  }

  const url = `https://control.msg91.com/api/v5/otp?authkey=${config.MSG91_AUTH_KEY}&template_id=${config.MSG91_OTP_TEMPLATE_ID}&mobile=91${input.phone}`
  const res = await fetch(url, { method: 'GET' })

  if (!res.ok) {
    throw new ServiceUnavailableError('OTP service')
  }

  return { message: 'OTP sent successfully' }
}

export async function verifyOTP(
  app: FastifyInstance,
  input: VerifyOTPInput,
  ipAddress?: string,
): Promise<{ tokens: TokenPair; user: AuthUser }> {
  if (!config.MSG91_AUTH_KEY) {
    throw new ServiceUnavailableError('OTP service not configured')
  }

  const url = `https://control.msg91.com/api/v5/otp/verify?authkey=${config.MSG91_AUTH_KEY}&mobile=91${input.phone}&otp=${input.otp}`
  const res = await fetch(url, { method: 'GET' })
  const body = (await res.json()) as { type?: string }

  if (!res.ok || body.type !== 'success') {
    throw new BadRequestError('Invalid or expired OTP')
  }

  const user = await prisma.user.findFirst({
    where: { tenantId: input.tenantId, phone: input.phone, deletedAt: null, isActive: true },
    select: {
      id: true,
      tenantId: true,
      name: true,
      email: true,
      phone: true,
      role: true,
    },
  })

  if (!user) {
    throw new NotFoundError('User', input.phone)
  }

  await onLoginSuccess(user.id)
  await audit({
    tenantId: input.tenantId,
    userId: user.id,
    action: 'LOGIN_SUCCESS',
    entityId: user.id,
    ipAddress,
    metadata: { method: 'otp' },
  })

  const tokens = await createSession(app, user, input.deviceInfo, ipAddress)
  return {
    tokens,
    user: {
      id: user.id,
      name: user.name,
      email: user.email,
      phone: user.phone,
      role: user.role,
      tenantId: user.tenantId,
    },
  }
}
