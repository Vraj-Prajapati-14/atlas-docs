import type { FastifyInstance } from 'fastify'
import { notificationsRoutes } from './notifications.routes.js'

export async function notificationsPlugin(app: FastifyInstance): Promise<void> {
  await app.register(notificationsRoutes)
}
