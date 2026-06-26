/**
 * Health check endpoint.
 * GET /api/health — returns 200 with system status.
 * Used by Railway health checks and load balancer probes.
 */

import type { FastifyInstance } from 'fastify'
import { prisma } from '@atlas/db'

export async function healthRoutes(app: FastifyInstance): Promise<void> {
  app.get(
    '/health',
    {
      schema: {
        response: {
          200: {
            type: 'object',
            properties: {
              status: { type: 'string' },
              timestamp: { type: 'string' },
              version: { type: 'string' },
              services: {
                type: 'object',
                properties: {
                  database: { type: 'string' },
                },
              },
            },
          },
        },
      },
    },
    async (_request, reply) => {
      // Check DB connectivity
      let dbStatus = 'ok'
      try {
        await prisma.$queryRaw`SELECT 1`
      } catch {
        dbStatus = 'error'
        reply.code(503)
      }

      return {
        status: dbStatus === 'ok' ? 'ok' : 'degraded',
        timestamp: new Date().toISOString(),
        version: process.env['npm_package_version'] ?? '0.0.1',
        services: {
          database: dbStatus,
        },
      }
    },
  )
}
