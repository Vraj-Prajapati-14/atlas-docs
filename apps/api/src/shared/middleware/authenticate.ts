import type { FastifyRequest, FastifyReply } from 'fastify'
import { UnauthorizedError } from '../errors.js'

export async function authenticate(
  request: FastifyRequest,
  _reply: FastifyReply,
): Promise<void> {
  try {
    await request.jwtVerify()
  } catch {
    throw new UnauthorizedError('Invalid or expired token')
  }
}
