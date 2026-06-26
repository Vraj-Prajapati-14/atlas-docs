/**
 * Global Fastify error handler.
 * Catches all unhandled errors and returns a consistent JSON envelope.
 */

import type { FastifyError, FastifyInstance, FastifyReply, FastifyRequest } from 'fastify'
import { isAppError } from '../errors.js'
import { fail } from '../response.js'

export function registerErrorHandler(app: FastifyInstance): void {
  app.setErrorHandler(
    (error: FastifyError | Error, request: FastifyRequest, reply: FastifyReply) => {
      // Operational errors: safe to send details to client
      if (isAppError(error)) {
        const details = 'details' in error ? error.details : undefined
        return fail(reply, error.statusCode, error.code, error.message, details)
      }

      // Fastify validation errors (schema mismatch)
      if ('validation' in error && error.validation) {
        return fail(reply, 422, 'VALIDATION_ERROR', 'Request validation failed', error.validation)
      }

      // JWT errors from @fastify/jwt
      if (error.name === 'JsonWebTokenError' || error.name === 'TokenExpiredError') {
        return fail(reply, 401, 'UNAUTHORIZED', 'Invalid or expired token')
      }

      // Rate limit exceeded (from @fastify/rate-limit)
      if (error.statusCode === 429) {
        return fail(reply, 429, 'TOO_MANY_REQUESTS', error.message)
      }

      // Unexpected errors: log and hide details from client
      app.log.error(
        { err: error, requestId: request.id, url: request.url },
        'Unexpected error',
      )

      return fail(
        reply,
        500,
        'INTERNAL_ERROR',
        process.env['NODE_ENV'] === 'production'
          ? 'An unexpected error occurred'
          : (error.message ?? 'Unknown error'),
      )
    },
  )

  // Handle 404
  app.setNotFoundHandler((request: FastifyRequest, reply: FastifyReply) => {
    return fail(reply, 404, 'NOT_FOUND', `Route ${request.method} ${request.url} not found`)
  })
}
