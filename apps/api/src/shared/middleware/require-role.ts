import type { FastifyRequest, FastifyReply } from 'fastify'
import { ForbiddenError } from '../errors.js'

export function requireRole(...roles: string[]) {
  return async function (request: FastifyRequest, _reply: FastifyReply): Promise<void> {
    if (!roles.includes(request.user.role)) {
      throw new ForbiddenError('Insufficient permissions for this action')
    }
  }
}
