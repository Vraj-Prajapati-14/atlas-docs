import type { FastifyInstance } from 'fastify'
import { uploadsRoutes } from './uploads.routes.js'

export async function uploadsPlugin(app: FastifyInstance): Promise<void> {
  await app.register(uploadsRoutes)
}
