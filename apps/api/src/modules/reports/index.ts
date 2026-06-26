import type { FastifyInstance } from 'fastify'
import { reportsRoutes } from './reports.routes.js'

export async function reportsPlugin(app: FastifyInstance): Promise<void> {
  await app.register(reportsRoutes)
}
