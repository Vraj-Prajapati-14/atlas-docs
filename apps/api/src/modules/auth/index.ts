import type { FastifyInstance } from 'fastify'
import { authRoutes } from './auth.routes.js'

export async function authPlugin(app: FastifyInstance): Promise<void> {
  await app.register(authRoutes)
}
