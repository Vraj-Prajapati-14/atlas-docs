import type { FastifyInstance } from 'fastify'
import { z } from 'zod'
import { ok } from '../../shared/response.js'
import { BadRequestError, ValidationError } from '../../shared/errors.js'
import { authenticate } from '../../shared/middleware/authenticate.js'
import { requireRole } from '../../shared/middleware/require-role.js'
import { UserRole } from '@atlas/types'
import {
  WIZARD_STEPS,
  enableTeamAssistedMode,
  getOnboardingSteps,
  skipOnboardingStep,
  updateOnboardingSteps,
} from './onboarding.service.js'

function validate<S extends z.ZodTypeAny>(schema: S, data: unknown): z.output<S> {
  const result = schema.safeParse(data)
  if (!result.success) throw new ValidationError('Invalid request body', result.error.errors)
  return result.data as z.output<S>
}

const UpdateStepsBody = z.object({
  brandingDone:          z.boolean().optional(),
  restaurantProfileDone: z.boolean().optional(),
  outletDone:            z.boolean().optional(),
  menuDone:              z.boolean().optional(),
  tablesDone:            z.boolean().optional(),
  staffDone:             z.boolean().optional(),
  paymentSetupDone:      z.boolean().optional(),
  firstOrderDone:        z.boolean().optional(),
})

const SkipBody = z.object({
  step: z.enum(WIZARD_STEPS),
})

const OWNER_MANAGER = [authenticate, requireRole(UserRole.OWNER, UserRole.MANAGER)]

export async function onboardingRoutes(app: FastifyInstance): Promise<void> {
  // GET /onboarding
  app.get('/', { preHandler: [authenticate] }, async (request, reply) => {
    return ok(reply, await getOnboardingSteps(request.user.tenantId))
  })

  // PATCH /onboarding — marks a step as genuinely completed (form submitted)
  app.patch('/', { preHandler: OWNER_MANAGER }, async (request, reply) => {
    const body = validate(UpdateStepsBody, request.body)
    return ok(reply, await updateOnboardingSteps(request.user.tenantId, body))
  })

  // POST /onboarding/skip — marks a step as intentionally skipped (does NOT set boolean to true)
  app.post('/skip', { preHandler: OWNER_MANAGER }, async (request, reply) => {
    const { step } = validate(SkipBody, request.body)
    return ok(reply, await skipOnboardingStep(request.user.tenantId, step))
  })

  // POST /onboarding/team-assist — enables Atlas team onboarding mode
  app.post('/team-assist', { preHandler: OWNER_MANAGER }, async (request, reply) => {
    const steps = await getOnboardingSteps(request.user.tenantId)
    if (steps.teamAssistedMode) {
      throw new BadRequestError('Team-assisted mode is already enabled')
    }
    return ok(reply, await enableTeamAssistedMode(request.user.tenantId))
  })
}
