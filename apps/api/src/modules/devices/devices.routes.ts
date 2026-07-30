import type { FastifyInstance } from 'fastify'
import { z } from 'zod'
import { created, noContent, ok } from '../../shared/response.js'
import { ValidationError } from '../../shared/errors.js'
import { authenticate } from '../../shared/middleware/authenticate.js'
import { requireRole } from '../../shared/middleware/require-role.js'
import { UserRole } from '@atlas/types'
import {
  CreateDeviceBody,
  DeviceIdParam,
  UpdateDeviceBody,
  UpdateDeviceSettingsBody,
} from './devices.schema.js'
import {
  createDevice,
  deactivateDevice,
  getDevice,
  getDeviceSettings,
  listDevices,
  rotateDeviceToken,
  updateDevice,
  updateDeviceSettings,
} from './devices.service.js'

function validate<S extends z.ZodTypeAny>(schema: S, data: unknown): z.output<S> {
  const result = schema.safeParse(data)
  if (!result.success) throw new ValidationError('Invalid request', result.error.errors)
  return result.data as z.output<S>
}

const MANAGER_GUARD = [authenticate, requireRole(UserRole.OWNER, UserRole.MANAGER)]
const OWNER_GUARD   = [authenticate, requireRole(UserRole.OWNER)]

export async function devicesRoutes(app: FastifyInstance): Promise<void> {
  // List all devices
  app.get('/', { preHandler: MANAGER_GUARD }, async (request, reply) => {
    return ok(reply, await listDevices(request.user.tenantId))
  })

  // Get single device
  app.get('/:id', { preHandler: MANAGER_GUARD }, async (request, reply) => {
    const { id } = validate(DeviceIdParam, request.params)
    return ok(reply, await getDevice(request.user.tenantId, id))
  })

  // Register a new device — OWNER only
  app.post('/', { preHandler: OWNER_GUARD }, async (request, reply) => {
    const body = validate(CreateDeviceBody, request.body)
    return created(reply, await createDevice(request.user.tenantId, body))
  })

  // Update device name / type / URL — OWNER only
  app.patch('/:id', { preHandler: OWNER_GUARD }, async (request, reply) => {
    const { id } = validate(DeviceIdParam, request.params)
    const body   = validate(UpdateDeviceBody, request.body)
    return ok(reply, await updateDevice(request.user.tenantId, id, body))
  })

  // Deactivate device — OWNER only
  app.delete('/:id', { preHandler: OWNER_GUARD }, async (request, reply) => {
    await deactivateDevice(request.user.tenantId, validate(DeviceIdParam, request.params).id)
    return noContent(reply)
  })

  // Rotate device token — OWNER only
  app.post('/:id/rotate-token', { preHandler: OWNER_GUARD }, async (request, reply) => {
    const { id } = validate(DeviceIdParam, request.params)
    return ok(reply, await rotateDeviceToken(request.user.tenantId, id))
  })

  // Get device settings
  app.get('/:id/settings', { preHandler: MANAGER_GUARD }, async (request, reply) => {
    const { id } = validate(DeviceIdParam, request.params)
    return ok(reply, await getDeviceSettings(request.user.tenantId, id))
  })

  // Update device settings — OWNER only
  app.patch('/:id/settings', { preHandler: OWNER_GUARD }, async (request, reply) => {
    const { id } = validate(DeviceIdParam, request.params)
    const body   = validate(UpdateDeviceSettingsBody, request.body)
    return ok(reply, await updateDeviceSettings(request.user.tenantId, id, body))
  })
}
