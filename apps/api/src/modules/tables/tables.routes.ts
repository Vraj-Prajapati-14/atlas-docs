import type { FastifyInstance } from 'fastify'
import { z } from 'zod'
import { created, noContent, ok } from '../../shared/response.js'
import { ValidationError } from '../../shared/errors.js'
import { authenticate } from '../../shared/middleware/authenticate.js'
import { requireRole } from '../../shared/middleware/require-role.js'
import { UserRole } from '@atlas/types'
import {
  CreateFloorBody,
  CreateTableBody,
  FloorIdParam,
  ListFloorsQuery,
  ListTablesQuery,
  TableIdParam,
  UpdateFloorBody,
  UpdateTableBody,
  UpdateTableStatusBody,
} from './tables.schema.js'
import {
  createFloor,
  createTable,
  deleteFloor,
  deleteTable,
  listFloors,
  listTables,
  getTable,
  updateFloor,
  updateTable,
  updateTableStatus,
} from './tables.service.js'

function validate<S extends z.ZodTypeAny>(schema: S, data: unknown): z.output<S> {
  const result = schema.safeParse(data)
  if (!result.success) throw new ValidationError('Invalid request', result.error.errors)
  return result.data as z.output<S>
}

const WRITE_GUARD = [authenticate, requireRole(UserRole.OWNER, UserRole.MANAGER)]
const READ_GUARD = [authenticate]

export async function tablesRoutes(app: FastifyInstance): Promise<void> {
  // ─── Floors ─────────────────────────────────────────────────────────────────

  app.get('/floors', { preHandler: READ_GUARD }, async (request, reply) => {
    const query = validate(ListFloorsQuery, request.query)
    const floors = await listFloors(request.user.tenantId, query)
    return ok(reply, floors)
  })

  app.post('/floors', { preHandler: WRITE_GUARD }, async (request, reply) => {
    const body = validate(CreateFloorBody, request.body)
    const floor = await createFloor(request.user.tenantId, body)
    return created(reply, floor)
  })

  app.patch('/floors/:id', { preHandler: WRITE_GUARD }, async (request, reply) => {
    const { id } = validate(FloorIdParam, request.params)
    const body = validate(UpdateFloorBody, request.body)
    const floor = await updateFloor(request.user.tenantId, id, body)
    return ok(reply, floor)
  })

  app.delete('/floors/:id', { preHandler: WRITE_GUARD }, async (request, reply) => {
    const { id } = validate(FloorIdParam, request.params)
    await deleteFloor(request.user.tenantId, id)
    return noContent(reply)
  })

  // ─── Tables ─────────────────────────────────────────────────────────────────

  app.get('/', { preHandler: READ_GUARD }, async (request, reply) => {
    const query = validate(ListTablesQuery, request.query)
    const tables = await listTables(request.user.tenantId, query)
    return ok(reply, tables)
  })

  app.get('/:id', { preHandler: READ_GUARD }, async (request, reply) => {
    const { id } = validate(TableIdParam, request.params)
    const table = await getTable(request.user.tenantId, id)
    return ok(reply, table)
  })

  app.post('/', { preHandler: WRITE_GUARD }, async (request, reply) => {
    const body = validate(CreateTableBody, request.body)
    const table = await createTable(request.user.tenantId, body)
    return created(reply, table)
  })

  app.patch('/:id', { preHandler: WRITE_GUARD }, async (request, reply) => {
    const { id } = validate(TableIdParam, request.params)
    const body = validate(UpdateTableBody, request.body)
    const table = await updateTable(request.user.tenantId, id, body)
    return ok(reply, table)
  })

  app.delete('/:id', { preHandler: WRITE_GUARD }, async (request, reply) => {
    const { id } = validate(TableIdParam, request.params)
    await deleteTable(request.user.tenantId, id)
    return noContent(reply)
  })

  // ─── Table status (all staff can update) ────────────────────────────────────

  app.patch('/:id/status', { preHandler: READ_GUARD }, async (request, reply) => {
    const { id } = validate(TableIdParam, request.params)
    const body = validate(UpdateTableStatusBody, request.body)
    const table = await updateTableStatus(request.user.tenantId, id, body.status)
    return ok(reply, table)
  })
}
