import { prisma } from '@atlas/db'
import { ConflictError, NotFoundError } from '../../shared/errors.js'
import type { ConfigurableRole, BulkSetPermissionsInput } from './permissions.schema.js'

export async function listAllPermissions(tenantId: string) {
  const rows = await prisma.rolePermission.findMany({
    where:   { tenantId },
    orderBy: [{ role: 'asc' }, { permission: 'asc' }],
  })

  // Group by role for convenience
  const grouped: Record<string, string[]> = {}
  for (const row of rows) {
    const key = row.role
    if (!grouped[key]) grouped[key] = []
    grouped[key].push(row.permission)
  }

  return grouped
}

export async function listPermissionsForRole(tenantId: string, role: ConfigurableRole) {
  const rows = await prisma.rolePermission.findMany({
    where:   { tenantId, role },
    orderBy: { permission: 'asc' },
  })
  return rows.map((r) => r.permission)
}

export async function grantPermission(
  tenantId:  string,
  role:      ConfigurableRole,
  permission: string,
  grantedBy: string,
) {
  const existing = await prisma.rolePermission.findUnique({
    where: { tenantId_role_permission: { tenantId, role, permission } },
  })
  if (existing) throw new ConflictError(`Permission "${permission}" is already granted to ${role}`)

  return prisma.rolePermission.create({
    data: { tenantId, role, permission, grantedBy },
  })
}

export async function revokePermission(
  tenantId:   string,
  role:       ConfigurableRole,
  permission: string,
) {
  const existing = await prisma.rolePermission.findUnique({
    where: { tenantId_role_permission: { tenantId, role, permission } },
  })
  if (!existing) throw new NotFoundError(`Permission "${permission}" is not granted to ${role}`)

  await prisma.rolePermission.delete({
    where: { tenantId_role_permission: { tenantId, role, permission } },
  })
}

export async function setPermissions(
  tenantId:  string,
  role:      ConfigurableRole,
  input:     BulkSetPermissionsInput,
  grantedBy: string,
) {
  const { permissions } = input

  // Deduplicate — guard against callers sending duplicates
  const unique = [...new Set(permissions)]

  await prisma.$transaction([
    prisma.rolePermission.deleteMany({ where: { tenantId, role } }),
    ...(unique.length > 0
      ? [
          prisma.rolePermission.createMany({
            data: unique.map((permission) => ({ tenantId, role, permission, grantedBy })),
          }),
        ]
      : []),
  ])

  return listPermissionsForRole(tenantId, role)
}
