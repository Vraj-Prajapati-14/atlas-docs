import { prisma } from '@atlas/db'
import { NotFoundError } from '../../shared/errors.js'
import type { UpdateOutletInput, UpdateSettingsInput, UpdateTenantInput } from './settings.schema.js'

export async function getSettings(tenantId: string) {
  const [tenant, settings, outlet] = await Promise.all([
    prisma.tenant.findUnique({
      where: { id: tenantId },
      select: {
        id: true, name: true, slug: true, type: true, plan: true,
        phone: true, email: true, website: true,
        logoUrl: true, coverImageUrl: true, cuisineType: true,
        gstin: true, fssaiLicense: true, panNumber: true,
        addressLine1: true, addressLine2: true, city: true, state: true, pincode: true,
        currency: true, timezone: true, createdAt: true,
      },
    }),
    prisma.tenantSettings.findUnique({ where: { tenantId } }),
    prisma.outlet.findFirst({
      where: { tenantId, isActive: true },
      select: {
        id: true, name: true, phone: true,
        addressLine1: true, addressLine2: true, city: true, state: true, pincode: true,
        isActive: true, createdAt: true,
      },
      orderBy: { createdAt: 'asc' },
    }),
  ])

  if (!tenant) throw new NotFoundError('Tenant')

  return { tenant, settings, outlet }
}

export async function updateSettings(tenantId: string, input: UpdateSettingsInput) {
  return prisma.tenantSettings.upsert({
    where: { tenantId },
    update: input,
    create: { tenantId, ...input },
  })
}

export async function updateOutlet(tenantId: string, input: UpdateOutletInput) {
  const outlet = await prisma.outlet.findFirst({
    where: { tenantId, isActive: true },
    orderBy: { createdAt: 'asc' },
  })
  if (!outlet) throw new NotFoundError('Outlet')

  return prisma.outlet.update({
    where: { id: outlet.id },
    data: input,
    select: {
      id: true, name: true, phone: true,
      addressLine1: true, addressLine2: true, city: true, state: true, pincode: true,
      isActive: true, createdAt: true, updatedAt: true,
    },
  })
}

export async function updateTenant(tenantId: string, input: UpdateTenantInput) {
  return prisma.tenant.update({
    where: { id: tenantId },
    data: input,
    select: {
      id: true, name: true, slug: true, type: true, plan: true,
      phone: true, email: true, website: true,
      logoUrl: true, coverImageUrl: true, cuisineType: true,
      gstin: true, fssaiLicense: true, panNumber: true,
      addressLine1: true, addressLine2: true, city: true, state: true, pincode: true,
      currency: true, timezone: true, updatedAt: true,
    },
  })
}
