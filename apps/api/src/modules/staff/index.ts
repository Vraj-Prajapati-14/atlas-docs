import type { FastifyInstance } from 'fastify'
import { staffRoutes } from './staff.routes.js'

export async function staffPlugin(app: FastifyInstance): Promise<void> {
  await app.register(staffRoutes)
}
