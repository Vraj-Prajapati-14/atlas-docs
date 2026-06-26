import type { FastifyInstance } from 'fastify'
import { billingRoutes } from './billing.routes.js'

export async function billingPlugin(app: FastifyInstance): Promise<void> {
  await app.register(billingRoutes)
}
