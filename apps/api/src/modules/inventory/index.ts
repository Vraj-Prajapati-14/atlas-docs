import type { FastifyInstance } from 'fastify'
import { inventoryRoutes } from './inventory.routes.js'

export async function inventoryPlugin(app: FastifyInstance): Promise<void> {
  await app.register(inventoryRoutes)
}
