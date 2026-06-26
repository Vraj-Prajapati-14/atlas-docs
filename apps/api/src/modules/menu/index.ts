import type { FastifyInstance } from 'fastify'
import { menuRoutes } from './menu.routes.js'

export async function menuPlugin(app: FastifyInstance): Promise<void> {
  await app.register(menuRoutes)
}
