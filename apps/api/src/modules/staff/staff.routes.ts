import type { FastifyInstance } from 'fastify'
import { z } from 'zod'
import { created, noContent, ok } from '../../shared/response.js'
import { ValidationError } from '../../shared/errors.js'
import { authenticate } from '../../shared/middleware/authenticate.js'
import { requireRole } from '../../shared/middleware/require-role.js'
import { UserRole } from '@atlas/types'
import {
  CreateStaffBody,
  ListStaffQuery,
  ResetPINBody,
  StaffIdParam,
  UpdateStaffBody,
} from './staff.schema.js'
import {
  createStaff,
  deleteStaff,
  getStaffMember,
  listStaff,
  resetPIN,
  toggleStaffStatus,
  updateStaff,
} from './staff.service.js'

function validate<S extends z.ZodTypeAny>(schema: S, data: unknown): z.output<S> {
  const result = schema.safeParse(data)
  if (!result.success) throw new ValidationError('Invalid request', result.error.errors)
  return result.data as z.output<S>
}

const MANAGER_GUARD = [authenticate, requireRole(UserRole.OWNER, UserRole.MANAGER)]
const OWNER_GUARD   = [authenticate, requireRole(UserRole.OWNER)]

export async function staffRoutes(app: FastifyInstance): Promise<void> {
  // List all staff
  app.get('/', { preHandler: MANAGER_GUARD }, async (request, reply) => {
    const query = validate(ListStaffQuery, request.query)
    return ok(reply, await listStaff(request.user.tenantId, query))
  })

  // Get single staff member
  app.get('/:id', { preHandler: MANAGER_GUARD }, async (request, reply) => {
    const { id } = validate(StaffIdParam, request.params)
    return ok(reply, await getStaffMember(request.user.tenantId, id))
  })

  // Create staff member
  app.post('/', { preHandler: MANAGER_GUARD }, async (request, reply) => {
    const body = validate(CreateStaffBody, request.body)
    return created(reply, await createStaff(request.user.tenantId, body))
  })

  // Update name / role / phone / email
  app.patch('/:id', { preHandler: MANAGER_GUARD }, async (request, reply) => {
    const { id } = validate(StaffIdParam, request.params)
    const body   = validate(UpdateStaffBody, request.body)
    return ok(reply, await updateStaff(request.user.tenantId, id, body, request.user.sub))
  })

  // Reset PIN
  app.patch('/:id/pin', { preHandler: MANAGER_GUARD }, async (request, reply) => {
    const { id } = validate(StaffIdParam, request.params)
    const body   = validate(ResetPINBody, request.body)
    return ok(reply, await resetPIN(request.user.tenantId, id, body))
  })

  // Toggle active / inactive — OWNER only
  app.patch('/:id/status', { preHandler: OWNER_GUARD }, async (request, reply) => {
    const { id } = validate(StaffIdParam, request.params)
    return ok(reply, await toggleStaffStatus(request.user.tenantId, id, request.user.sub))
  })

  // Soft delete — OWNER only
  app.delete('/:id', { preHandler: OWNER_GUARD }, async (request, reply) => {
    const { id } = validate(StaffIdParam, request.params)
    await deleteStaff(request.user.tenantId, id, request.user.sub)
    return noContent(reply)
  })
}
