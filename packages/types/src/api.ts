/**
 * API response envelope shapes.
 * All API endpoints return one of these shapes.
 */

/** Successful response with data */
export interface ApiSuccess<T> {
  success: true
  data: T
  meta?: ResponseMeta
}

/** Error response */
export interface ApiError {
  success: false
  error: {
    code: string           // machine-readable: "NOT_FOUND", "VALIDATION_ERROR"
    message: string        // human-readable
    details?: unknown      // validation error field details
  }
}

export type ApiResponse<T> = ApiSuccess<T> | ApiError

/** Pagination metadata included in list responses */
export interface PaginationMeta {
  page: number
  limit: number
  total: number
  totalPages: number
  hasNext: boolean
  hasPrev: boolean
}

export interface ResponseMeta {
  pagination?: PaginationMeta
  requestId?: string
  duration?: number         // ms (dev only)
}

/** Paginated list response */
export interface PaginatedResponse<T> {
  success: true
  data: T[]
  meta: Required<Pick<ResponseMeta, 'pagination'>> & ResponseMeta
}

/** Standard query params for list endpoints */
export interface ListQueryParams {
  page?: number
  limit?: number
  search?: string
  sortBy?: string
  sortOrder?: 'asc' | 'desc'
}

/** Standard path param for single-resource endpoints */
export interface IdParam {
  id: string
}

/** Tenant context injected by middleware after auth */
export interface TenantContext {
  tenantId: string
  outletId: string
  userId: string
  userRole: string
}

/** JWT payload shape */
export interface JWTPayload {
  sub: string              // userId
  tenantId: string
  role: string
  iat: number
  exp: number
}
