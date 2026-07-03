'use client'

import { useMutation } from '@tanstack/react-query'
import { useQueryClient } from '@tanstack/react-query'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { ApiError, apiClient } from '@/lib/api-client'
import { useAuthStore, type AuthUser } from '@/lib/auth-store'

interface LoginEmailPayload {
  email: string
  password: string
  tenantId: string
}

interface LoginPINPayload {
  phone: string
  pin: string
  tenantId: string
}

interface LoginResponse {
  user: AuthUser
  accessToken: string
  refreshToken: string
  expiresIn: number
}

export interface TenantOption {
  tenantId: string
  name: string
  slug: string
  logoUrl: string | null
  city: string
  planStatus: string
}

// 4xx auth errors (wrong password, locked account, deactivated) are shown inline
// in the form — no toast for those. Toast only for 5xx or network failures.
function toastIfUnexpected(error: Error) {
  if (error instanceof ApiError && error.status < 500) return
  const msg =
    error.message === 'Failed to fetch' ||
    error.message.toLowerCase().includes('networkerror') ||
    error.message.toLowerCase().includes('network request failed')
      ? 'Network error — check your connection and try again.'
      : error.message || 'Something went wrong. Please try again.'
  toast.error(msg)
}

export function useLookupTenant() {
  return useMutation({
    mutationFn: (phone: string) =>
      apiClient.post<{ tenants: TenantOption[] }>('/api/v1/auth/lookup-tenant', { phone }),
  })
}

export function useLoginEmail() {
  const { setAuth } = useAuthStore()
  const router = useRouter()

  return useMutation({
    mutationFn: (payload: LoginEmailPayload) =>
      apiClient.post<LoginResponse>('/api/v1/auth/login/email', payload),
    onSuccess(data) {
      setAuth(data.user, data.accessToken, data.refreshToken)
      // Welcome toast is shown by AuthTransitionToast on the dashboard — not here on login page.
      const firstName = encodeURIComponent(data.user.name.split(' ')[0] ?? data.user.name)
      router.replace(`/dashboard?welcome=${firstName}`)
    },
    onError(error: Error) {
      toastIfUnexpected(error)
    },
  })
}

export function useLoginPIN() {
  const { setAuth } = useAuthStore()
  const router = useRouter()

  return useMutation({
    mutationFn: (payload: LoginPINPayload) =>
      apiClient.post<LoginResponse>('/api/v1/auth/login/pin', payload),
    onSuccess(data) {
      setAuth(data.user, data.accessToken, data.refreshToken)
      // Welcome toast is shown by AuthTransitionToast on the dashboard — not here on login page.
      const firstName = encodeURIComponent(data.user.name.split(' ')[0] ?? data.user.name)
      router.replace(`/dashboard?welcome=${firstName}`)
    },
    onError(error: Error) {
      toastIfUnexpected(error)
    },
  })
}

export function useLogout() {
  const { clearAuth, getRefreshToken } = useAuthStore()
  const queryClient = useQueryClient()
  const router = useRouter()

  return useMutation({
    mutationFn: () =>
      apiClient.post('/api/v1/auth/logout', { refreshToken: getRefreshToken() }),
    onSettled() {
      // Cancel in-flight queries before clearing auth to prevent 401 refetch storms.
      queryClient.cancelQueries()
      queryClient.clear()
      clearAuth()
      // Logout toast is shown by LoggedOutNotice on the login page — not here.
      router.replace('/login?loggedOut=1')
    },
  })
}
