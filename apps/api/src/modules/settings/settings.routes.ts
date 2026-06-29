import type { FastifyInstance } from 'fastify'
import { z } from 'zod'
import { ok } from '../../shared/response.js'
import { ValidationError } from '../../shared/errors.js'
import { authenticate } from '../../shared/middleware/authenticate.js'
import { requireRole } from '../../shared/middleware/require-role.js'
import { UserRole } from '@atlas/types'
import { UpdateOutletBody, UpdateSettingsBody, UpdateTenantBody } from './settings.schema.js'
import { getSettings, updateOutlet, updateSettings, updateTenant } from './settings.service.js'

function validate<S extends z.ZodTypeAny>(schema: S, data: unknown): z.output<S> {
  const result = schema.safeParse(data)
  if (!result.success) throw new ValidationError('Invalid request', result.error.errors)
  return result.data as z.output<S>
}

const MANAGER_GUARD = [authenticate, requireRole(UserRole.OWNER, UserRole.MANAGER)]
const OWNER_GUARD   = [authenticate, requireRole(UserRole.OWNER)]

export async function settingsRoutes(app: FastifyInstance): Promise<void> {
  // Get all settings (tenant info + POS settings + outlet)
  app.get('/', { preHandler: MANAGER_GUARD }, async (request, reply) => {
    return ok(reply, await getSettings(request.user.tenantId))
  })

  // Update POS / operational settings — OWNER only
  app.patch('/', { preHandler: OWNER_GUARD }, async (request, reply) => {
    const body = validate(UpdateSettingsBody, request.body)
    return ok(reply, await updateSettings(request.user.tenantId, body))
  })

  // Update outlet address / phone — OWNER/MANAGER
  app.patch('/outlet', { preHandler: MANAGER_GUARD }, async (request, reply) => {
    const body = validate(UpdateOutletBody, request.body)
    return ok(reply, await updateOutlet(request.user.tenantId, body))
  })

  // Update tenant legal / contact info — OWNER only
  app.patch('/tenant', { preHandler: OWNER_GUARD }, async (request, reply) => {
    const body = validate(UpdateTenantBody, request.body)
    return ok(reply, await updateTenant(request.user.tenantId, body))
  })
}
