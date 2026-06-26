/**
 * Fastify application factory.
 * Separates app setup from server startup so tests can import the app without binding to a port.
 */

import Fastify from 'fastify'
import cors from '@fastify/cors'
import helmet from '@fastify/helmet'
import rateLimit from '@fastify/rate-limit'
import jwt from '@fastify/jwt'
import { config } from './config/index.js'
import { registerErrorHandler } from './shared/middleware/error.js'
import { healthRoutes } from './modules/health/index.js'
import { authPlugin } from './modules/auth/index.js'
import { menuPlugin } from './modules/menu/index.js'
import { uploadsPlugin } from './modules/uploads/index.js'

export async function buildApp() {
  const app = Fastify({
    logger: {
      level: config.LOG_LEVEL,
      ...(config.NODE_ENV === 'development'
        ? {
            transport: {
              target: 'pino-pretty',
              options: { colorize: true, translateTime: 'HH:MM:ss', ignore: 'pid,hostname' },
            },
          }
        : {}),
    },
    requestIdHeader: 'x-request-id',
    requestIdLogLabel: 'requestId',
    disableRequestLogging: false,
    trustProxy: true,
  })

  // ─── Security ──────────────────────────────────────────────────────────────
  await app.register(helmet, {
    contentSecurityPolicy: false, // API-only, not serving HTML
    crossOriginEmbedderPolicy: false,
  })

  await app.register(cors, {
    origin: config.CORS_ORIGIN.split(',').map((o) => o.trim()),
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Tenant-ID', 'X-Request-ID'],
    credentials: true,
    maxAge: 86400,
  })

  await app.register(rateLimit, {
    global: true,
    max: 200,
    timeWindow: '1 minute',
    errorResponseBuilder: (_request, context) => ({
      success: false,
      error: {
        code: 'TOO_MANY_REQUESTS',
        message: `Rate limit exceeded. Retry after ${context.after}.`,
      },
    }),
  })

  // ─── Auth ──────────────────────────────────────────────────────────────────
  await app.register(jwt, {
    secret: config.JWT_SECRET,
    sign: {
      expiresIn: config.JWT_EXPIRES_IN,
      algorithm: 'HS256',
    },
    decode: { complete: false },
  })

  // ─── BigInt serialisation ──────────────────────────────────────────────────
  // Prisma stores all monetary values as BigInt (paise). JSON.stringify throws on
  // BigInt, so we convert to Number before sending. Menu prices and bill totals
  // for a restaurant fit safely within Number.MAX_SAFE_INTEGER.
  app.addHook('preSerialization', (_request, _reply, payload, done) => {
    done(null, convertBigInts(payload))
  })

  // ─── Error handling ────────────────────────────────────────────────────────
  registerErrorHandler(app)

  // ─── Routes ────────────────────────────────────────────────────────────────
  await app.register(healthRoutes, { prefix: '/api' })

  // ─── API v1 ────────────────────────────────────────────────────────────────
  await app.register(
    async (v1) => {
      await v1.register(authPlugin, { prefix: '/auth' })
      await v1.register(menuPlugin, { prefix: '/menu' })
      await v1.register(uploadsPlugin, { prefix: '/uploads' })
      v1.log.info('API v1 routes registered')
    },
    { prefix: '/api/v1' },
  )

  return app
}

function convertBigInts(value: unknown): unknown {
  if (typeof value === 'bigint') return Number(value)
  if (Array.isArray(value)) return value.map(convertBigInts)
  if (value !== null && typeof value === 'object') {
    const out: Record<string, unknown> = {}
    for (const [k, v] of Object.entries(value as Record<string, unknown>)) {
      out[k] = convertBigInts(v)
    }
    return out
  }
  return value
}
