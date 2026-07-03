/**
 * Typed API client — wraps fetch with auth headers and response parsing.
 * All API calls go through this client.
 */

import type { ApiResponse } from '@atlas/types'

const API_BASE = process.env['NEXT_PUBLIC_API_URL'] ?? 'http://localhost:3001'

class ApiError extends Error {
  constructor(
    public readonly code: string,
    message: string,
    public readonly status: number,
  ) {
    super(message)
    this.name = 'ApiError'
  }
}

// Prevents concurrent refresh calls — all pending requests share one refresh promise.
let refreshPromise: Promise<boolean> | null = null

async function tryRefresh(): Promise<boolean> {
  if (refreshPromise) return refreshPromise
  refreshPromise = (async () => {
    try {
      const refreshToken = localStorage.getItem('atlas_refresh')
      if (!refreshToken) return false

      const res = await fetch(`${API_BASE}/api/v1/auth/refresh`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ refreshToken }),
        credentials: 'include',
      })
      const json = (await res.json()) as ApiResponse<{ accessToken: string; refreshToken: string }>
      if (!json.success) return false

      localStorage.setItem('atlas_token', json.data.accessToken)
      localStorage.setItem('atlas_refresh', json.data.refreshToken)
      return true
    } catch {
      return false
    } finally {
      refreshPromise = null
    }
  })()
  return refreshPromise
}

async function request<T>(
  path: string,
  options: RequestInit = {},
  isRetry = false,
): Promise<T> {
  const url = `${API_BASE}${path}`

  const headers: HeadersInit = {
    'Content-Type': 'application/json',
    ...options.headers,
  }

  // Attach JWT from localStorage (client-side only)
  if (typeof window !== 'undefined') {
    const token = localStorage.getItem('atlas_token')
    if (token) {
      ;(headers as Record<string, string>)['Authorization'] = `Bearer ${token}`
    }
  }

  const response = await fetch(url, {
    ...options,
    headers,
    credentials: 'include',
  })

  const json = (await response.json()) as ApiResponse<T>

  if (!json.success) {
    // On first 401, attempt a silent token refresh then retry once.
    if (response.status === 401 && !isRetry) {
      const refreshed = await tryRefresh()
      if (refreshed) return request<T>(path, options, true)
      // Refresh failed — clear auth and redirect to login.
      if (typeof window !== 'undefined') {
        localStorage.removeItem('atlas_token')
        localStorage.removeItem('atlas_refresh')
        document.cookie = 'atlas_auth=; path=/; max-age=0; SameSite=Lax'
        window.location.href = '/login'
        // Never resolves — page navigates away, preventing the ApiError throw from
        // reaching any onError toast handlers that are still mounted during navigation.
        return new Promise<never>(() => {})
      }
    }
    throw new ApiError(json.error.code, json.error.message, response.status)
  }

  return json.data
}

export const apiClient = {
  get: <T>(path: string, options?: RequestInit) =>
    request<T>(path, { method: 'GET', ...options }),

  post: <T>(path: string, body: unknown, options?: RequestInit) =>
    request<T>(path, {
      method: 'POST',
      body: JSON.stringify(body),
      ...options,
    }),

  put: <T>(path: string, body: unknown, options?: RequestInit) =>
    request<T>(path, {
      method: 'PUT',
      body: JSON.stringify(body),
      ...options,
    }),

  patch: <T>(path: string, body: unknown, options?: RequestInit) =>
    request<T>(path, {
      method: 'PATCH',
      body: JSON.stringify(body),
      ...options,
    }),

  delete: <T>(path: string, options?: RequestInit) =>
    request<T>(path, { method: 'DELETE', ...options }),
}

export { ApiError }
