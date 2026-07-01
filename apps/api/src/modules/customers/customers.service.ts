import { prisma } from '@atlas/db'
import { ConflictError, NotFoundError } from '../../shared/errors.js'
import { buildPagination } from '../../shared/response.js'
import type { CreateCustomerInput, ListCustomersInput, UpdateCustomerInput } from './customers.schema.js'

export async function listCustomers(tenantId: string, query: ListCustomersInput) {
  const { search, page, limit } = query
  const skip = (page - 1) * limit

  const where = {
    tenantId,
    ...(search
      ? {
          OR: [
            { name:  { contains: search, mode: 'insensitive' as const } },
            { phone: { contains: search } },
            { email: { contains: search, mode: 'insensitive' as const } },
          ],
        }
      : {}),
  }

  const [items, total] = await Promise.all([
    prisma.customer.findMany({
      where,
      orderBy: [{ lastVisitAt: 'desc' }, { createdAt: 'desc' }],
      skip,
      take: limit,
    }),
    prisma.customer.count({ where }),
  ])

  return { items, pagination: buildPagination(page, limit, total) }
}

export async function getCustomer(tenantId: string, id: string) {
  const customer = await prisma.customer.findFirst({
    where: { id, tenantId },
    include: {
      orders: {
        where: { status: { notIn: ['DRAFT', 'CANCELLED', 'VOID'] } },
        orderBy: { createdAt: 'desc' },
        take: 20,
        include: {
          bill: {
            select: {
              billNumber: true,
              grandTotalInPaise: true,
              paymentStatus: true,
            },
          },
        },
      },
    },
  })

  if (!customer) throw new NotFoundError('Customer', id)
  return customer
}

export async function createCustomer(tenantId: string, input: CreateCustomerInput) {
  const existing = await prisma.customer.findUnique({
    where: { tenantId_phone: { tenantId, phone: input.phone } },
  })
  if (existing) throw new ConflictError(`Phone ${input.phone} already registered to a customer.`)

  return prisma.customer.create({ data: { tenantId, ...input } })
}

export async function updateCustomer(
  tenantId: string,
  id: string,
  input: UpdateCustomerInput,
) {
  const customer = await prisma.customer.findFirst({ where: { id, tenantId } })
  if (!customer) throw new NotFoundError('Customer', id)

  if (input.phone && input.phone !== customer.phone) {
    const conflict = await prisma.customer.findUnique({
      where: { tenantId_phone: { tenantId, phone: input.phone } },
    })
    if (conflict) throw new ConflictError(`Phone ${input.phone} is already in use.`)
  }

  return prisma.customer.update({ where: { id }, data: input })
}
