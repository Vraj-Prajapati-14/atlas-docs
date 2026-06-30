import type { FastifyInstance } from 'fastify'
import { registerRoutes } from './register.routes.js'

export async function registerPlugin(app: FastifyInstance): Promise<void> {
  await app.register(registerRoutes)
}
