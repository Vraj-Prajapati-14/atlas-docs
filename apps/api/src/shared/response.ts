/**
 * Response builder utilities.
 * All API responses use these to ensure a consistent envelope.
 */

import type { FastifyReply } from 'fastify'
import type { PaginationMeta } from '@atlas/types'

export function ok<T>(reply: FastifyReply, data: T, statusCode = 200): FastifyReply {
  return reply.code(statusCode).send({ success: true, data })
}

export function created<T>(reply: FastifyReply, data: T): FastifyReply {
  return ok(reply, data, 201)
}

export function noContent(reply: FastifyReply): FastifyReply {
  return reply.code(204).send()
}

export function paginated<T>(
  reply: FastifyReply,
  data: T[],
  pagination: PaginationMeta,
): FastifyReply {
  return reply.code(200).send({
    success: true,
    data,
    meta: { pagination },
  })
}

export function fail(
  reply: FastifyReply,
  statusCode: number,
  code: string,
  message: string,
  details?: unknown,
): FastifyReply {
  const body: Record<string, unknown> = {
    success: false,
    error: { code, message },
  }
  if (details !== undefined) {
    ;(body['error'] as Record<string, unknown>)['details'] = details
  }
  return reply.code(statusCode).send(body)
}

/**
 * Build pagination metadata from query params and total count.
 */
export function buildPagination(
  page: number,
  limit: number,
  total: number,
): PaginationMeta {
  const totalPages = Math.ceil(total / limit)
  return {
    page,
    limit,
    total,
    totalPages,
    hasNext: page < totalPages,
    hasPrev: page > 1,
  }
}

/**
 * Parse page/limit from query params with safe defaults.
 */
export function parsePagination(query: {
  page?: unknown
  limit?: unknown
}): { page: number; limit: number; skip: number } {
  const page = Math.max(1, Number(query.page) || 1)
  const limit = Math.min(100, Math.max(1, Number(query.limit) || 20))
  return { page, limit, skip: (page - 1) * limit }
}
