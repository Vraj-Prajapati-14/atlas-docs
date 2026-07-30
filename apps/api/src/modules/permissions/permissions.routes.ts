import type { FastifyInstance } from 'fastify'
import { z } from 'zod'
import { noContent, ok } from '../../shared/response.js'
import { ValidationError } from '../../shared/errors.js'
import { authenticate } from '../../shared/middleware/authenticate.js'
import { requireRole } from '../../shared/middleware/require-role.js'
import { UserRole } from '@atlas/types'
import {
  AVAILABLE_PERMISSIONS,
  BulkSetPermissionsBody,
  GrantPermissionBody,
  RoleParam,
  RolePermissionParam,
} from './permissions.schema.js'
import {
  grantPermission,
  listAllPermissions,
  listPermissionsForRole,
  revokePermission,
  setPermissions,
} from './permissions.service.js'

function validate<S extends z.ZodTypeAny>(schema: S, data: unknown): z.output<S> {
  const result = schema.safeParse(data)
  if (!result.success) throw new ValidationError('Invalid request', result.error.errors)
  return result.data as z.output<S>
}

const OWNER_GUARD = [authenticate, requireRole(UserRole.OWNER)]

export async function permissionsRoutes(app: FastifyInstance): Promise<void> {
  // Static list of every permission string the system knows about
  app.get('/available', { preHandler: OWNER_GUARD }, async (_request, reply) => {
    return ok(reply, AVAILABLE_PERMISSIONS)
  })

  // All granted permissions across every role — grouped by role
  app.get('/', { preHandler: OWNER_GUARD }, async (request, reply) => {
    return ok(reply, await listAllPermissions(request.user.tenantId))
  })

  // Permissions for one role
  app.get('/:role', { preHandler: OWNER_GUARD }, async (request, reply) => {
    const { role } = validate(RoleParam, request.params)
    return ok(reply, await listPermissionsForRole(request.user.tenantId, role))
  })

  // Grant a single permission to a role
  app.post('/:role', { preHandler: OWNER_GUARD }, async (request, reply) => {
    const { role }       = validate(RoleParam, request.params)
    const { permission } = validate(GrantPermissionBody, request.body)
    return ok(
      reply,
      await grantPermission(request.user.tenantId, role, permission, request.user.sub),
    )
  })

  // Revoke a single permission from a role
  // :permission is URL-encoded by callers — Fastify decodes it automatically (e.g. BILLING%3Adiscount → BILLING:discount)
  app.delete('/:role/:permission', { preHandler: OWNER_GUARD }, async (request, reply) => {
    const { role, permission } = validate(RolePermissionParam, request.params)
    await revokePermission(request.user.tenantId, role, permission)
    return noContent(reply)
  })

  // Bulk replace — set exact permission list for a role in one transaction
  app.put('/:role', { preHandler: OWNER_GUARD }, async (request, reply) => {
    const { role } = validate(RoleParam, request.params)
    const body     = validate(BulkSetPermissionsBody, request.body)
    return ok(reply, await setPermissions(request.user.tenantId, role, body, request.user.sub))
  })
}
