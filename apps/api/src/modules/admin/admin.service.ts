import bcrypt from 'bcryptjs'
import { prisma } from '@atlas/db'
import { UnauthorizedError, NotFoundError, BadRequestError } from '../../shared/errors.js'
import { config } from '../../config/index.js'
import type { TenantPlanStatus } from '@atlas/db'

// ─── Super-admin auth ──────────────────────────────────────────────────────────

export async function adminLogin(email: string, password: string) {
  const admin = await prisma.superAdmin.findUnique({
    where: { email: email.toLowerCase() },
    select: { id: true, name: true, email: true, passwordHash: true, isActive: true },
  })

  if (!admin || !admin.isActive) throw new UnauthorizedError('Invalid credentials')

  const valid = await bcrypt.compare(password, admin.passwordHash)
  if (!valid) throw new UnauthorizedError('Invalid credentials')

  await prisma.superAdmin.update({
    where: { id: admin.id },
    data: { lastLoginAt: new Date() },
  })

  return { id: admin.id, name: admin.name, email: admin.email }
}

// ─── Tenant management ─────────────────────────────────────────────────────────

export interface ListTenantsFilter {
  search?: string
  planStatus?: TenantPlanStatus
  page?: number
  limit?: number
}

export async function listTenants(filter: ListTenantsFilter) {
  const page = filter.page ?? 1
  const limit = Math.min(filter.limit ?? 20, 100)
  const skip = (page - 1) * limit

  const where = {
    ...(filter.search
      ? {
          OR: [
            { name: { contains: filter.search, mode: 'insensitive' as const } },
            { phone: { contains: filter.search } },
            { city: { contains: filter.search, mode: 'insensitive' as const } },
          ],
        }
      : {}),
    ...(filter.planStatus ? { planStatus: filter.planStatus } : {}),
    deletedAt: null,
  }

  const [tenants, total] = await Promise.all([
    prisma.tenant.findMany({
      where,
      skip,
      take: limit,
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        name: true,
        slug: true,
        type: true,
        city: true,
        state: true,
        phone: true,
        email: true,
        plan: true,
        planStatus: true,
        isActive: true,
        createdAt: true,
        onboardingCompletedAt: true,
        _count: { select: { users: true, orders: true } },
      },
    }),
    prisma.tenant.count({ where }),
  ])

  return { tenants, total, page, limit, totalPages: Math.ceil(total / limit) }
}

export async function getTenantDetail(id: string) {
  const tenant = await prisma.tenant.findUnique({
    where: { id },
    include: {
      _count: { select: { users: true, orders: true, menuItems: true } },
      settings: true,
      onboardingSteps: true,
    },
  })
  if (!tenant) throw new NotFoundError('Tenant', id)
  return tenant
}

export async function setTenantStatus(id: string, status: TenantPlanStatus) {
  const tenant = await prisma.tenant.findUnique({ where: { id }, select: { id: true } })
  if (!tenant) throw new NotFoundError('Tenant', id)

  return prisma.tenant.update({
    where: { id },
    data: { planStatus: status },
    select: { id: true, name: true, planStatus: true },
  })
}

export async function createAdminAccount(
  name: string,
  email: string,
  password: string,
) {
  if (!config.SUPER_ADMIN_JWT_SECRET) {
    throw new BadRequestError('Super-admin creation requires SUPER_ADMIN_JWT_SECRET to be configured.')
  }

  const existing = await prisma.superAdmin.findUnique({
    where: { email: email.toLowerCase() },
  })
  if (existing) throw new BadRequestError('An admin with this email already exists.')

  const passwordHash = await bcrypt.hash(password, config.BCRYPT_ROUNDS)
  return prisma.superAdmin.create({
    data: { name, email: email.toLowerCase(), passwordHash },
    select: { id: true, name: true, email: true, createdAt: true },
  })
}
