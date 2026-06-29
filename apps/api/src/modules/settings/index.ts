import type { FastifyInstance } from 'fastify'
import { settingsRoutes } from './settings.routes.js'

export async function settingsPlugin(app: FastifyInstance): Promise<void> {
  await app.register(settingsRoutes)
}
