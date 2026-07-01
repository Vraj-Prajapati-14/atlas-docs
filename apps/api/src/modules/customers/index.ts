import type { FastifyInstance } from 'fastify'
import { customersRoutes } from './customers.routes.js'

export async function customersPlugin(app: FastifyInstance): Promise<void> {
  await app.register(customersRoutes)
}
