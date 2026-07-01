/**
 * Shared admin API client.
 * Mirrors the shape of api-client.ts but targets /api/v1/admin/* endpoints
 * and stores tokens under separate localStorage keys so admin and tenant
 * sessions never collide.
 */

export const ACCESS_KEY = 'atlas_admin_token'
export const REFRESH_KEY = 'atlas_admin_refresh'
export const BASE_URL = process.env['NEXT_PUBLIC_API_URL'] ?? ''

// ─── Token helpers ─────────────────────────────────────────────────────────────

export function getAdminToken(): string | null {
  if (typeof window === 'undefined') return null
  return localStorage.getItem(ACCESS_KEY)
}

export function clearAdminTokens(): void {
  localStorage.removeItem(ACCESS_KEY)
  localStorage.removeItem(REFRESH_KEY)
}

// ─── Refresh ───────────────────────────────────────────────────────────────────

// Prevents concurrent refresh races — all in-flight calls share one promise.
let refreshPromise: Promise<boolean> | null = null

export async function tryRefreshAdminToken(): Promise<boolean> {
  if (refreshPromise) return refreshPromise
  refreshPromise = (async () => {
    try {
      const refreshToken = localStorage.getItem(REFRESH_KEY)
      if (!refreshToken) return false

      const res = await fetch(`${BASE_URL}/api/v1/admin/auth/refresh`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ refreshToken }),
      })
      if (!res.ok) return false

      const json = (await res.json()) as {
        success: boolean
        data?: { accessToken: string }
      }
      if (!json.success || !json.data?.accessToken) return false

      localStorage.setItem(ACCESS_KEY, json.data.accessToken)
      return true
    } catch {
      return false
    } finally {
      refreshPromise = null
    }
  })()
  return refreshPromise
}

// ─── Core fetch wrapper ────────────────────────────────────────────────────────

/**
 * Wraps fetch for admin endpoints:
 *  - Attaches Authorization: Bearer <token>
 *  - On 401 (first attempt): tries silent refresh, retries once
 *  - On refresh failure: clears tokens, redirects to /admin
 *  - Unwraps { success, data, error } response envelope
 */
export async function adminFetch<T>(
  path: string,
  options: RequestInit = {},
  isRetry = false,
): Promise<T> {
  const token = getAdminToken()

  const res = await fetch(`${BASE_URL}${path}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...options.headers,
    },
  })

  // Silent token refresh on first 401
  if (res.status === 401 && !isRetry) {
    const refreshed = await tryRefreshAdminToken()
    if (refreshed) return adminFetch<T>(path, options, true)
    clearAdminTokens()
    if (typeof window !== 'undefined') {
      window.location.href = '/admin'
    }
    throw new Error('Session expired — please log in again.')
  }

  const json = (await res.json()) as {
    success: boolean
    data?: T
    error?: { message?: string; code?: string }
  }

  if (!json.success) {
    throw new Error(json.error?.message ?? 'Request failed')
  }

  return json.data as T
}
