import type { FastifyInstance } from 'fastify'
import { kotsRoutes } from './kots.routes.js'

export async function kotsPlugin(app: FastifyInstance): Promise<void> {
  await app.register(kotsRoutes)
}
