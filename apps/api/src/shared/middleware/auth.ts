/**
 * Authentication middleware helpers.
 * Use requireAuth() to protect routes.
 * Use requireRole() for role-based access control.
 */

import type { FastifyReply, FastifyRequest } from 'fastify'
import type { UserRole } from '@atlas/types'
import { ForbiddenError, UnauthorizedError } from '../errors.js'

export interface AuthUser {
  sub: string       // userId
  tenantId: string
  role: UserRole
  iat: number
  exp: number
}

/**
 * Prehandler: verify JWT is present and valid.
 * Attach to route options: { preHandler: [requireAuth] }
 */
export async function requireAuth(
  request: FastifyRequest,
  _reply: FastifyReply,
): Promise<void> {
  try {
    await request.jwtVerify()
  } catch {
    throw new UnauthorizedError('Authentication required')
  }
}

/**
 * Prehandler factory: require one of the specified roles.
 * Always includes OWNER (owners can do everything).
 *
 * Usage: preHandler: [requireAuth, requireRole('MANAGER', 'CASHIER')]
 */
export function requireRole(...roles: UserRole[]) {
  return async function roleGuard(
    request: FastifyRequest,
    _reply: FastifyReply,
  ): Promise<void> {
    const user = request.user as AuthUser | undefined
    if (!user) throw new UnauthorizedError()

    const allowed: string[] = ['OWNER', ...roles]
    if (!allowed.includes(user.role)) {
      throw new ForbiddenError(
        `This action requires one of: ${allowed.join(', ')}. Your role: ${user.role}`,
      )
    }
  }
}

/** Get the authenticated user from the request (throws if not authenticated). */
export function getAuthUser(request: FastifyRequest): AuthUser {
  const user = request.user as AuthUser | undefined
  if (!user) throw new UnauthorizedError()
  return user
}
