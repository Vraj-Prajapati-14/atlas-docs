'use client'

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { apiClient } from '@/lib/api-client'
import { useAuthStore } from '@/lib/auth-store'
import type { ProfileMe } from '@/lib/api-types'

export function useProfile() {
  return useQuery({
    queryKey: ['profile-me'],
    queryFn: () => apiClient.get<ProfileMe>('/api/v1/auth/me'),
    staleTime: 5 * 60 * 1000,
  })
}

export function useUpdateProfile() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (body: { name?: string; phone?: string; email?: string | null }) =>
      apiClient.patch<ProfileMe>('/api/v1/auth/me', body),
    onSuccess(data) {
      qc.invalidateQueries({ queryKey: ['profile-me'] })
      // Sync Zustand store so sidebar name updates immediately
      const state = useAuthStore.getState()
      if (state.user) {
        state.setAuth(
          { ...state.user, name: data.name, phone: data.phone, email: data.email ?? null },
          localStorage.getItem('atlas_access') ?? '',
          localStorage.getItem('atlas_refresh') ?? '',
        )
      }
      toast.success('Profile updated.')
    },
    onError(err: Error) { toast.error(err.message) },
  })
}

export function useChangePassword() {
  return useMutation({
    mutationFn: (body: { currentPassword: string; newPassword: string }) =>
      apiClient.post<{ message: string }>('/api/v1/auth/me/change-password', body),
    onSuccess() { toast.success('Password changed successfully.') },
    onError(err: Error) { toast.error(err.message) },
  })
}

export function useSetPIN() {
  return useMutation({
    mutationFn: (body: { pin: string }) =>
      apiClient.post<{ message: string }>('/api/v1/auth/me/set-pin', body),
    onSuccess() { toast.success('PIN updated.') },
    onError(err: Error) { toast.error(err.message) },
  })
}
