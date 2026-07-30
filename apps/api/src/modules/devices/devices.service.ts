import { randomBytes } from 'node:crypto'
import { prisma } from '@atlas/db'
import { NotFoundError, ConflictError } from '../../shared/errors.js'
import type { CreateDeviceInput, UpdateDeviceInput, UpdateDeviceSettingsInput } from './devices.schema.js'

function generateDeviceToken(): string {
  return randomBytes(32).toString('hex')
}

async function findOwnedDevice(tenantId: string, deviceId: string) {
  const device = await prisma.device.findUnique({ where: { id: deviceId } })
  if (!device || device.tenantId !== tenantId) throw new NotFoundError('Device not found')
  return device
}

export async function listDevices(tenantId: string) {
  return prisma.device.findMany({
    where: { tenantId },
    include: { settings: true },
    orderBy: { createdAt: 'desc' },
  })
}

export async function getDevice(tenantId: string, deviceId: string) {
  const device = await prisma.device.findUnique({
    where: { id: deviceId },
    include: { settings: true },
  })
  if (!device || device.tenantId !== tenantId) throw new NotFoundError('Device not found')
  return device
}

export async function createDevice(tenantId: string, input: CreateDeviceInput) {
  const token = generateDeviceToken()

  const device = await prisma.device.create({
    data: {
      tenantId,
      name:       input.name,
      type:       input.type,
      token,
      defaultUrl: input.defaultUrl ?? null,
      floorId:    input.floorId   ?? null,
      settings: {
        create: {
          autoKotPrint:  true,
          autoBillPrint: true,
          soundAlerts:   true,
          displayMode:   'STANDARD',
        },
      },
    },
    include: { settings: true },
  })

  return device
}

export async function updateDevice(
  tenantId:  string,
  deviceId:  string,
  input:     UpdateDeviceInput,
) {
  await findOwnedDevice(tenantId, deviceId)

  return prisma.device.update({
    where: { id: deviceId },
    data: {
      ...(input.name       !== undefined && { name: input.name }),
      ...(input.type       !== undefined && { type: input.type }),
      ...(input.defaultUrl !== undefined && { defaultUrl: input.defaultUrl }),
      ...(input.floorId    !== undefined && { floorId:    input.floorId }),
    },
    include: { settings: true },
  })
}

export async function deactivateDevice(tenantId: string, deviceId: string) {
  const device = await findOwnedDevice(tenantId, deviceId)
  if (!device.isActive) throw new ConflictError('Device is already deactivated')

  return prisma.device.update({
    where: { id: deviceId },
    data:  { isActive: false },
    include: { settings: true },
  })
}

export async function rotateDeviceToken(tenantId: string, deviceId: string) {
  await findOwnedDevice(tenantId, deviceId)
  const token = generateDeviceToken()

  return prisma.device.update({
    where: { id: deviceId },
    data:  { token },
    include: { settings: true },
  })
}

export async function getDeviceSettings(tenantId: string, deviceId: string) {
  await findOwnedDevice(tenantId, deviceId)

  const settings = await prisma.deviceSettings.findUnique({ where: { deviceId } })
  if (!settings) throw new NotFoundError('Device settings not found')
  return settings
}

export async function updateDeviceSettings(
  tenantId:  string,
  deviceId:  string,
  input:     UpdateDeviceSettingsInput,
) {
  await findOwnedDevice(tenantId, deviceId)

  return prisma.deviceSettings.upsert({
    where:  { deviceId },
    update: input,
    create: {
      deviceId,
      autoKotPrint:  input.autoKotPrint  ?? true,
      autoBillPrint: input.autoBillPrint ?? true,
      soundAlerts:   input.soundAlerts   ?? true,
      displayMode:   input.displayMode   ?? 'STANDARD',
    },
  })
}
