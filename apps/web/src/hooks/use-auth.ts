'use client'

import { useMutation } from '@tanstack/react-query'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { apiClient } from '@/lib/api-client'
import { useAuthStore, type AuthUser } from '@/lib/auth-store'

interface LoginEmailPayload {
  email: string
  password: string
}

interface LoginPINPayload {
  phone: string
  pin: string
}

interface LoginResponse {
  user: AuthUser
  accessToken: string
  refreshToken: string
  expiresIn: number
}

export function useLoginEmail() {
  const { setAuth } = useAuthStore()
  const router = useRouter()

  return useMutation({
    mutationFn: (payload: LoginEmailPayload) =>
      apiClient.post<LoginResponse>('/api/v1/auth/login/email', payload),
    onSuccess(data) {
      setAuth(data.user, data.accessToken, data.refreshToken)
      toast.success(`Welcome back, ${data.user.name.split(' ')[0]}!`)
      router.replace('/dashboard')
    },
    onError(error: Error) {
      toast.error(error.message ?? 'Login failed — check your credentials.')
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
      toast.success(`Welcome, ${data.user.name.split(' ')[0]}!`)
      router.replace('/dashboard')
    },
    onError(error: Error) {
      toast.error(error.message ?? 'Login failed.')
    },
  })
}

export function useLogout() {
  const { clearAuth, getRefreshToken } = useAuthStore()
  const router = useRouter()

  return useMutation({
    mutationFn: () =>
      apiClient.post('/api/v1/auth/logout', { refreshToken: getRefreshToken() }),
    onSettled() {
      clearAuth()
      toast.info('Logged out.')
      router.replace('/login')
    },
  })
}
