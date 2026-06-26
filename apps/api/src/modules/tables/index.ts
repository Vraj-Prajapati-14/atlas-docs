import type { FastifyInstance } from 'fastify'
import { tablesRoutes } from './tables.routes.js'

export async function tablesPlugin(app: FastifyInstance): Promise<void> {
  await app.register(tablesRoutes)
}
