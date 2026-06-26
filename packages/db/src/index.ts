import { PrismaClient } from '@prisma/client'

declare global {
  // Prevent multiple instances in development hot-reload
  // eslint-disable-next-line no-var
  var __prisma: PrismaClient | undefined
}

function createPrismaClient(): PrismaClient {
  return new PrismaClient({
    log:
      process.env['NODE_ENV'] === 'development'
        ? ['query', 'error', 'warn']
        : ['error'],
    errorFormat: 'minimal',
  })
}

// In production: always create a new client.
// In development: reuse the global instance to avoid connection exhaustion during hot-reload.
export const prisma: PrismaClient =
  process.env['NODE_ENV'] === 'production'
    ? createPrismaClient()
    : (globalThis.__prisma ??= createPrismaClient())

export * from '@prisma/client'
