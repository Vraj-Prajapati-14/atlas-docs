import type { FastifyInstance } from 'fastify'
import { devicesRoutes } from './devices.routes.js'

export async function devicesPlugin(app: FastifyInstance): Promise<void> {
  await app.register(devicesRoutes)
}
