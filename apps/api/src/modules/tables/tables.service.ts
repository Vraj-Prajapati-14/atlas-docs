import { prisma } from '@atlas/db'
import { TableStatus } from '@atlas/types'
import { BadRequestError, ConflictError, NotFoundError } from '../../shared/errors.js'
import type {
  CreateFloorInput,
  CreateTableInput,
  ListFloorsInput,
  ListTablesInput,
  UpdateFloorInput,
  UpdateTableInput,
} from './tables.schema.js'

// ─── Floors ──────────────────────────────────────────────────────────────────

export async function listFloors(tenantId: string, query: ListFloorsInput) {
  return prisma.floor.findMany({
    where: {
      tenantId,
      ...(query.outletId ? { outletId: query.outletId } : {}),
    },
    orderBy: [{ sortOrder: 'asc' }, { name: 'asc' }],
    include: {
      _count: { select: { tables: { where: { deletedAt: null } } } },
    },
  })
}

export async function createFloor(tenantId: string, data: CreateFloorInput) {
  const outlet = await prisma.outlet.findFirst({ where: { id: data.outletId, tenantId } })
  if (!outlet) throw new NotFoundError('Outlet', data.outletId)

  return prisma.floor.create({
    data: { tenantId, outletId: data.outletId, name: data.name, sortOrder: data.sortOrder },
  })
}

export async function updateFloor(tenantId: string, id: string, data: UpdateFloorInput) {
  const floor = await prisma.floor.findFirst({ where: { id, tenantId }, select: { id: true } })
  if (!floor) throw new NotFoundError('Floor', id)

  return prisma.floor.update({ where: { id }, data })
}

export async function deleteFloor(tenantId: string, id: string) {
  const floor = await prisma.floor.findFirst({
    where: { id, tenantId },
    include: { _count: { select: { tables: { where: { deletedAt: null } } } } },
  })
  if (!floor) throw new NotFoundError('Floor', id)
  if (floor._count.tables > 0) {
    throw new BadRequestError('Move or delete all tables on this floor before deleting the floor')
  }

  await prisma.floor.delete({ where: { id } })
}

// ─── Tables ──────────────────────────────────────────────────────────────────

export async function listTables(tenantId: string, query: ListTablesInput) {
  return prisma.table.findMany({
    where: {
      tenantId,
      deletedAt: null,
      ...(query.outletId ? { outletId: query.outletId } : {}),
      ...(query.floorId ? { floorId: query.floorId } : {}),
      ...(query.status ? { status: query.status } : {}),
    },
    orderBy: [{ name: 'asc' }],
    include: {
      floor: { select: { id: true, name: true } },
    },
  })
}

export async function getTable(tenantId: string, id: string) {
  const table = await prisma.table.findFirst({
    where: { id, tenantId, deletedAt: null },
    include: {
      floor: { select: { id: true, name: true } },
      outlet: { select: { id: true, name: true } },
    },
  })
  if (!table) throw new NotFoundError('Table', id)
  return table
}

export async function createTable(tenantId: string, data: CreateTableInput) {
  const outlet = await prisma.outlet.findFirst({ where: { id: data.outletId, tenantId } })
  if (!outlet) throw new NotFoundError('Outlet', data.outletId)

  if (data.floorId) {
    const floor = await prisma.floor.findFirst({ where: { id: data.floorId, tenantId } })
    if (!floor) throw new NotFoundError('Floor', data.floorId)
  }

  const qrCode = `${tenantId}:${data.outletId}:${crypto.randomUUID()}`

  try {
    return await prisma.table.create({
      data: {
        tenantId,
        outletId: data.outletId,
        ...(data.floorId ? { floorId: data.floorId } : {}),
        name: data.name,
        capacity: data.capacity,
        ...(data.positionX !== undefined ? { positionX: data.positionX } : {}),
        ...(data.positionY !== undefined ? { positionY: data.positionY } : {}),
        qrCode,
      },
      include: { floor: { select: { id: true, name: true } } },
    })
  } catch (err: unknown) {
    if (isPrismaUniqueError(err)) throw new ConflictError(`Table "${data.name}" already exists in this outlet`)
    throw err
  }
}

export async function updateTable(tenantId: string, id: string, data: UpdateTableInput) {
  const table = await prisma.table.findFirst({ where: { id, tenantId, deletedAt: null } })
  if (!table) throw new NotFoundError('Table', id)

  try {
    return await prisma.table.update({
      where: { id },
      data: {
        ...(data.name !== undefined ? { name: data.name } : {}),
        ...(data.capacity !== undefined ? { capacity: data.capacity } : {}),
        ...(data.floorId !== undefined ? { floorId: data.floorId } : {}),
        ...(data.positionX !== undefined ? { positionX: data.positionX } : {}),
        ...(data.positionY !== undefined ? { positionY: data.positionY } : {}),
      },
      include: { floor: { select: { id: true, name: true } } },
    })
  } catch (err: unknown) {
    if (isPrismaUniqueError(err)) throw new ConflictError(`Table "${data.name}" already exists in this outlet`)
    throw err
  }
}

export async function deleteTable(tenantId: string, id: string) {
  const table = await prisma.table.findFirst({
    where: { id, tenantId, deletedAt: null },
    select: { id: true, status: true },
  })
  if (!table) throw new NotFoundError('Table', id)
  if (table.status === TableStatus.OCCUPIED) {
    throw new BadRequestError('Cannot delete an occupied table — close the active order first')
  }

  await prisma.table.update({ where: { id }, data: { deletedAt: new Date() } })
}

export async function updateTableStatus(tenantId: string, id: string, status: TableStatus) {
  const table = await prisma.table.findFirst({
    where: { id, tenantId, deletedAt: null },
    select: { id: true },
  })
  if (!table) throw new NotFoundError('Table', id)

  return prisma.table.update({ where: { id }, data: { status } })
}

// ─── Internal ────────────────────────────────────────────────────────────────

function isPrismaUniqueError(err: unknown): boolean {
  return typeof err === 'object' && err !== null && 'code' in err && (err as { code: string }).code === 'P2002'
}
