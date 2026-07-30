import type { FastifyInstance } from 'fastify'
import { permissionsRoutes } from './permissions.routes.js'

export async function permissionsPlugin(app: FastifyInstance): Promise<void> {
  await app.register(permissionsRoutes)
}
