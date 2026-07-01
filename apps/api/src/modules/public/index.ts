import type { FastifyInstance } from 'fastify'
import { publicRoutes } from './public.routes.js'

export async function publicPlugin(app: FastifyInstance): Promise<void> {
  await app.register(publicRoutes)
}
