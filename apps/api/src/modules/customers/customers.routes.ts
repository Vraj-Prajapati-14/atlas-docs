import type { FastifyInstance } from 'fastify'
import { z } from 'zod'
import { ok, created } from '../../shared/response.js'
import { ValidationError } from '../../shared/errors.js'
import { authenticate } from '../../shared/middleware/authenticate.js'
import { requireRole } from '../../shared/middleware/require-role.js'
import { UserRole } from '@atlas/types'
import {
  ListCustomersQuery,
  CreateCustomerBody,
  UpdateCustomerBody,
  CustomerIdParam,
} from './customers.schema.js'
import {
  listCustomers,
  getCustomer,
  createCustomer,
  updateCustomer,
} from './customers.service.js'

function validate<S extends z.ZodTypeAny>(schema: S, data: unknown): z.output<S> {
  const result = schema.safeParse(data)
  if (!result.success) throw new ValidationError('Invalid request', result.error.errors)
  return result.data as z.output<S>
}

const WRITE_GUARD = [authenticate, requireRole(UserRole.OWNER, UserRole.MANAGER, UserRole.CASHIER)]

export async function customersRoutes(app: FastifyInstance): Promise<void> {
  // List customers with search + pagination
  app.get('/', { preHandler: [authenticate] }, async (request, reply) => {
    const query = validate(ListCustomersQuery, request.query)
    return ok(reply, await listCustomers(request.user.tenantId, query))
  })

  // Get customer + order history
  app.get('/:id', { preHandler: [authenticate] }, async (request, reply) => {
    const { id } = validate(CustomerIdParam, request.params)
    return ok(reply, await getCustomer(request.user.tenantId, id))
  })

  // Create customer
  app.post('/', { preHandler: WRITE_GUARD }, async (request, reply) => {
    const body = validate(CreateCustomerBody, request.body)
    return created(reply, await createCustomer(request.user.tenantId, body))
  })

  // Update customer
  app.patch('/:id', { preHandler: WRITE_GUARD }, async (request, reply) => {
    const { id } = validate(CustomerIdParam, request.params)
    const body   = validate(UpdateCustomerBody, request.body)
    return ok(reply, await updateCustomer(request.user.tenantId, id, body))
  })
}
