import type { FastifyRequest, FastifyReply } from 'fastify'
import { prisma } from '@atlas/db'
import { UnauthorizedError } from '../errors.js'

export async function authenticate(
  request: FastifyRequest,
  reply: FastifyReply,
): Promise<void> {
  try {
    await request.jwtVerify()
  } catch {
    throw new UnauthorizedError('Invalid or expired token')
  }

  // After token is verified, check tenant plan status
  const tenantId = (request.user as { tenantId?: string }).tenantId
  if (!tenantId) return

  const tenant = await prisma.tenant.findUnique({
    where: { id: tenantId },
    select: { planStatus: true, isActive: true },
  })

  if (!tenant || !tenant.isActive) {
    return reply.code(402).send({
      success: false,
      error: { code: 'ACCOUNT_INACTIVE', message: 'Your account has been deactivated. Contact support.' },
    })
  }

  if (tenant.planStatus === 'PENDING_PAYMENT') {
    return reply.code(402).send({
      success: false,
      error: { code: 'PENDING_PAYMENT', message: 'Your account is pending activation. Our team will contact you within 24 hours.' },
    })
  }

  if (tenant.planStatus === 'SUSPENDED') {
    return reply.code(402).send({
      success: false,
      error: { code: 'ACCOUNT_SUSPENDED', message: 'Your account has been suspended. Please contact support.' },
    })
  }
}
