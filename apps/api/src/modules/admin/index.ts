import type { FastifyInstance } from 'fastify'
import { adminRoutes } from './admin.routes.js'

export async function adminPlugin(app: FastifyInstance): Promise<void> {
  await app.register(adminRoutes)
}
