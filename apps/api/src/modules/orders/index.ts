import type { FastifyInstance } from 'fastify'
import { ordersRoutes } from './orders.routes.js'

export async function ordersPlugin(app: FastifyInstance): Promise<void> {
  await app.register(ordersRoutes)
}
