/**
 * Domain error hierarchy.
 * All errors extend AppError so the error handler can identify them.
 */

export class AppError extends Error {
  readonly statusCode: number
  readonly code: string
  readonly isOperational: boolean

  constructor(message: string, statusCode = 500, code = 'INTERNAL_ERROR') {
    super(message)
    this.name = this.constructor.name
    this.statusCode = statusCode
    this.code = code
    this.isOperational = true
    Error.captureStackTrace(this, this.constructor)
  }
}

export class NotFoundError extends AppError {
  constructor(resource = 'Resource', id?: string) {
    const msg = id ? `${resource} '${id}' not found` : `${resource} not found`
    super(msg, 404, 'NOT_FOUND')
  }
}

export class UnauthorizedError extends AppError {
  constructor(message = 'Authentication required') {
    super(message, 401, 'UNAUTHORIZED')
  }
}

export class ForbiddenError extends AppError {
  constructor(message = 'You do not have permission to perform this action') {
    super(message, 403, 'FORBIDDEN')
  }
}

export class ValidationError extends AppError {
  readonly details: unknown

  constructor(message: string, details?: unknown) {
    super(message, 422, 'VALIDATION_ERROR')
    this.details = details
  }
}

export class ConflictError extends AppError {
  constructor(message: string) {
    super(message, 409, 'CONFLICT')
  }
}

export class BadRequestError extends AppError {
  constructor(message: string) {
    super(message, 400, 'BAD_REQUEST')
  }
}

export class TooManyRequestsError extends AppError {
  constructor(message = 'Too many requests. Please slow down.') {
    super(message, 429, 'TOO_MANY_REQUESTS')
  }
}

export class ServiceUnavailableError extends AppError {
  constructor(service: string) {
    super(`${service} is temporarily unavailable`, 503, 'SERVICE_UNAVAILABLE')
  }
}

/** Type guard: is this error an operational error (expected, safe to send to client)? */
export function isAppError(error: unknown): error is AppError {
  return error instanceof AppError && error.isOperational
}
