import bcrypt from 'bcryptjs'
import { prisma } from '@atlas/db'
import { ConflictError } from '../../shared/errors.js'
import { config } from '../../config/index.js'
import type { RestaurantType } from '@atlas/db'

export interface RegisterInput {
  restaurantName: string
  restaurantType: RestaurantType
  city: string
  state: string
  ownerName: string
  ownerPhone: string
  pin: string
}

function generateSlugBase(name: string, city: string): string {
  return `${name}-${city}`
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '')
    .slice(0, 50)
}

async function makeUniqueSlug(name: string, city: string): Promise<string> {
  const base = generateSlugBase(name, city)

  const existing = await prisma.tenant.findUnique({ where: { slug: base } })
  if (!existing) return base

  // Append 4-char hex suffix
  const { randomBytes } = await import('node:crypto')
  const suffix = randomBytes(2).toString('hex')
  const candidate = `${base}-${suffix}`.slice(0, 60)

  const existing2 = await prisma.tenant.findUnique({ where: { slug: candidate } })
  if (!existing2) return candidate

  // Final fallback: base36 timestamp
  return `${base}-${Date.now().toString(36)}`.slice(0, 60)
}

export async function registerRestaurant(input: RegisterInput) {
  // Phone must not already be an OWNER in any tenant
  const existingOwner = await prisma.user.findFirst({
    where: { phone: input.ownerPhone, role: 'OWNER', deletedAt: null },
    select: { id: true },
  })
  if (existingOwner) {
    throw new ConflictError('This phone number is already registered as a restaurant owner.')
  }

  const slug = await makeUniqueSlug(input.restaurantName, input.city)
  const hashedPin = await bcrypt.hash(input.pin, config.BCRYPT_ROUNDS)

  const result = await prisma.$transaction(async (tx) => {
    const tenant = await tx.tenant.create({
      data: {
        name: input.restaurantName,
        slug,
        type: input.restaurantType,
        planStatus: 'PENDING_PAYMENT',
        city: input.city,
        state: input.state,
        addressLine1: input.city,
        pincode: '000000',
        phone: input.ownerPhone,
      },
    })

    const owner = await tx.user.create({
      data: {
        tenantId: tenant.id,
        name: input.ownerName,
        phone: input.ownerPhone,
        role: 'OWNER',
        isOwner: true,
        pin: hashedPin,
      },
    })

    await tx.outlet.create({
      data: {
        tenantId: tenant.id,
        name: input.restaurantName,
        addressLine1: input.city,
        city: input.city,
        state: input.state,
        pincode: '000000',
        phone: input.ownerPhone,
      },
    })

    await tx.tenantSettings.create({ data: { tenantId: tenant.id } })
    await tx.tenantOnboardingStep.create({ data: { tenantId: tenant.id } })

    return { tenant, owner }
  })

  return {
    tenantId: result.tenant.id,
    slug: result.tenant.slug,
    name: result.tenant.name,
    message: 'Registration submitted. Our team will contact you within 24 hours to activate your account.',
  }
}
