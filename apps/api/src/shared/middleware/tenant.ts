/**
 * Tenant context middleware.
 * Extracts tenantId from the verified JWT and attaches it to the request.
 * Every authenticated request has request.tenant populated.
 */

import type { FastifyInstance, FastifyReply, FastifyRequest } from 'fastify'
import { prisma } from '@atlas/db'
import { UnauthorizedError } from '../errors.js'

declare module 'fastify' {
  interface FastifyRequest {
    tenant: {
      id: string
      name: string
      isActive: boolean
      plan: string
    }
  }
}

export function registerTenantHook(app: FastifyInstance): void {
  // This hook runs after auth verification on protected routes
  app.addHook('preHandler', async (request: FastifyRequest, _reply: FastifyReply) => {
    // Skip routes that don't have JWT data (public routes)
    if (!request.user) return

    const { tenantId } = request.user as { tenantId: string }

    const tenant = await prisma.tenant.findUnique({
      where: { id: tenantId },
      select: { id: true, name: true, isActive: true, plan: true },
    })

    if (!tenant) {
      throw new UnauthorizedError('Tenant not found')
    }

    if (!tenant.isActive) {
      throw new UnauthorizedError('Restaurant account is suspended')
    }

    request.tenant = tenant
  })
}
