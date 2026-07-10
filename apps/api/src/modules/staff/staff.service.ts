import { prisma } from '@atlas/db'
import bcrypt from 'bcryptjs'
import { ConflictError, ForbiddenError, NotFoundError } from '../../shared/errors.js'
import { buildPagination } from '../../shared/response.js'
import type { CreateStaffInput, ListStaffInput, ResetPINInput, UpdateStaffInput } from './staff.schema.js'

const SELECT = {
  id: true, name: true, phone: true, email: true, role: true,
  isActive: true, isOwner: true, lastLoginAt: true,
  createdAt: true, updatedAt: true,
}

export async function listStaff(tenantId: string, query: ListStaffInput) {
  const where = {
    tenantId,
    deletedAt: null,
    ...(query.role     ? { role: query.role }         : {}),
    ...(query.isActive !== undefined ? { isActive: query.isActive } : {}),
    ...(query.search   ? { name: { contains: query.search, mode: 'insensitive' as const } } : {}),
  }

  const [items, total] = await Promise.all([
    prisma.user.findMany({ where, select: SELECT, orderBy: { createdAt: 'asc' } }),
    prisma.user.count({ where }),
  ])

  return { items, pagination: buildPagination(1, total, total) }
}

export async function getStaffMember(tenantId: string, id: string) {
  const user = await prisma.user.findFirst({
    where: { id, tenantId, deletedAt: null },
    select: SELECT,
  })
  if (!user) throw new NotFoundError('Staff member', id)
  return user
}

export async function createStaff(tenantId: string, input: CreateStaffInput) {
  const existing = await prisma.user.findFirst({
    where: { tenantId, phone: input.phone, deletedAt: null },
  })
  if (existing) throw new ConflictError(`Phone ${input.phone} is already registered to another staff member.`)

  const pin = await bcrypt.hash(input.pin, 10)

  return prisma.user.create({
    data: { tenantId, name: input.name, phone: input.phone, email: input.email, role: input.role, pin },
    select: SELECT,
  })
}

export async function updateStaff(tenantId: string, id: string, input: UpdateStaffInput, _requesterId: string) {
  const user = await prisma.user.findFirst({ where: { id, tenantId, deletedAt: null } })
  if (!user) throw new NotFoundError('Staff member', id)

  // Cannot change an OWNER's role unless the requester is also an OWNER
  if (user.isOwner) throw new ForbiddenError('Cannot modify the account owner.')

  if (input.phone && input.phone !== user.phone) {
    const conflict = await prisma.user.findFirst({
      where: { tenantId, phone: input.phone, deletedAt: null, NOT: { id } },
    })
    if (conflict) throw new ConflictError(`Phone ${input.phone} is already in use.`)
  }

  return prisma.user.update({
    where: { id },
    data: {
      ...(input.name  ? { name: input.name }   : {}),
      ...(input.phone ? { phone: input.phone }  : {}),
      ...(input.email !== undefined ? { email: input.email } : {}),
      ...(input.role  ? { role: input.role }    : {}),
    },
    select: SELECT,
  })
}

export async function resetPIN(tenantId: string, id: string, input: ResetPINInput) {
  const user = await prisma.user.findFirst({ where: { id, tenantId, deletedAt: null } })
  if (!user) throw new NotFoundError('Staff member', id)

  const pin = await bcrypt.hash(input.pin, 10)
  return prisma.user.update({ where: { id }, data: { pin, failedLoginAttempts: 0, lockedUntil: null }, select: SELECT })
}

export async function toggleStaffStatus(tenantId: string, id: string, requesterId: string) {
  const user = await prisma.user.findFirst({ where: { id, tenantId, deletedAt: null } })
  if (!user) throw new NotFoundError('Staff member', id)
  if (user.isOwner) throw new ForbiddenError('Cannot deactivate the account owner.')
  if (id === requesterId) throw new ForbiddenError('Cannot deactivate your own account.')

  return prisma.user.update({ where: { id }, data: { isActive: !user.isActive }, select: SELECT })
}

export async function deleteStaff(tenantId: string, id: string, requesterId: string) {
  const user = await prisma.user.findFirst({ where: { id, tenantId, deletedAt: null } })
  if (!user) throw new NotFoundError('Staff member', id)
  if (user.isOwner) throw new ForbiddenError('Cannot delete the account owner.')
  if (id === requesterId) throw new ForbiddenError('Cannot delete your own account.')

  await prisma.user.update({ where: { id }, data: { deletedAt: new Date(), isActive: false } })
  return { deleted: true }
}
