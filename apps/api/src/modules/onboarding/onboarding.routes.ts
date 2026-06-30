import type { FastifyInstance } from 'fastify'
import { z } from 'zod'
import { ok } from '../../shared/response.js'
import { ValidationError } from '../../shared/errors.js'
import { authenticate } from '../../shared/middleware/authenticate.js'
import { getOnboardingSteps, updateOnboardingSteps } from './onboarding.service.js'

function validate<S extends z.ZodTypeAny>(schema: S, data: unknown): z.output<S> {
  const result = schema.safeParse(data)
  if (!result.success) throw new ValidationError('Invalid request body', result.error.errors)
  return result.data as z.output<S>
}

const UpdateStepsBody = z.object({
  restaurantProfileDone: z.boolean().optional(),
  outletDone: z.boolean().optional(),
  menuDone: z.boolean().optional(),
  tablesDone: z.boolean().optional(),
  staffDone: z.boolean().optional(),
  firstOrderDone: z.boolean().optional(),
})

export async function onboardingRoutes(app: FastifyInstance): Promise<void> {
  // GET /onboarding — returns current onboarding step state
  app.get('/', { preHandler: [authenticate] }, async (request, reply) => {
    const steps = await getOnboardingSteps(request.user.tenantId)
    return ok(reply, steps)
  })

  // PATCH /onboarding — marks steps done (called by wizard on each step)
  app.patch('/', { preHandler: [authenticate] }, async (request, reply) => {
    const body = validate(UpdateStepsBody, request.body)
    const steps = await updateOnboardingSteps(request.user.tenantId, body)
    return ok(reply, steps)
  })
}
