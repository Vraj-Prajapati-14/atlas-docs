import type { FastifyInstance } from 'fastify'
import { staffNotificationsRoutes } from './staff-notifications.routes.js'

export async function staffNotificationsPlugin(app: FastifyInstance): Promise<void> {
  await app.register(staffNotificationsRoutes)
}

export { createStaffNotification } from './staff-notifications.service.js'
