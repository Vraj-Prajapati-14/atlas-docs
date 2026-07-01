import type { FastifyInstance } from 'fastify'
import { onboardingRoutes } from './onboarding.routes.js'

export async function onboardingPlugin(app: FastifyInstance): Promise<void> {
  await app.register(onboardingRoutes)
}
