'use client'

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { apiClient } from '@/lib/api-client'
import { useAuthStore } from '@/lib/auth-store'
import type { ProfileMe, UserSessionItem, LoginHistoryItem, NotifPrefs } from '@/lib/api-types'

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

export function useMySessions() {
  return useQuery({
    queryKey: ['profile-sessions'],
    queryFn: () => apiClient.get<UserSessionItem[]>('/api/v1/auth/me/sessions'),
    staleTime: 30 * 1000,
  })
}

export function useRevokeSession() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (sessionId: string) =>
      apiClient.delete<{ message: string }>(`/api/v1/auth/me/sessions/${sessionId}`),
    onSuccess() {
      qc.invalidateQueries({ queryKey: ['profile-sessions'] })
      toast.success('Device signed out.')
    },
    onError(err: Error) { toast.error(err.message) },
  })
}

export function useRevokeAllSessions() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: () => apiClient.delete<{ count: number }>('/api/v1/auth/me/sessions'),
    onSuccess(data) {
      qc.invalidateQueries({ queryKey: ['profile-sessions'] })
      toast.success(`Signed out of ${data.count} other device(s).`)
    },
    onError(err: Error) { toast.error(err.message) },
  })
}

export function useLoginHistory() {
  return useQuery({
    queryKey: ['profile-login-history'],
    queryFn: () => apiClient.get<LoginHistoryItem[]>('/api/v1/auth/me/login-history'),
    staleTime: 60 * 1000,
  })
}

export function useNotifPrefs() {
  return useQuery({
    queryKey: ['profile-notif-prefs'],
    queryFn: () => apiClient.get<NotifPrefs>('/api/v1/auth/me/notification-prefs'),
    staleTime: 5 * 60 * 1000,
  })
}

export function useUpdateNotifPrefs() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (body: Partial<NotifPrefs>) =>
      apiClient.patch<NotifPrefs>('/api/v1/auth/me/notification-prefs', body),
    onSuccess(data) {
      qc.setQueryData(['profile-notif-prefs'], data)
      toast.success('Notification preferences saved.')
    },
    onError(err: Error) { toast.error(err.message) },
  })
}
