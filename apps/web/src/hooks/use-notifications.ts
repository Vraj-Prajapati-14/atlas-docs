'use client'

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { apiClient } from '@/lib/api-client'
import type { NotificationsListResponse, NotificationChannel, BroadcastItem } from '@/lib/api-types'

interface NotificationsQuery {
  channel?: NotificationChannel
  page?: number
  limit?: number
}

export function useNotifications(query: NotificationsQuery = {}) {
  const params = new URLSearchParams()
  if (query.channel) params.set('channel', query.channel)
  if (query.page) params.set('page', String(query.page))
  if (query.limit) params.set('limit', String(query.limit))
  const qs = params.toString()

  return useQuery({
    queryKey: ['notifications', query],
    queryFn: () =>
      apiClient.get<NotificationsListResponse>(`/api/v1/notifications${qs ? `?${qs}` : ''}`),
  })
}

export function useTriggerNightlySummary() {
  return useMutation({
    mutationFn: () => apiClient.post('/api/v1/notifications/nightly-summary', {}),
  })
}

// ─── Broadcasts (admin → tenant in-app messages) ──────────────────────────────

export function useUnreadBroadcasts() {
  return useQuery({
    queryKey: ['broadcasts', 'unread'],
    queryFn: () => apiClient.get<BroadcastItem[]>('/api/v1/notifications/broadcasts'),
    refetchInterval: 60_000, // re-check every minute
    staleTime: 30_000,
  })
}

export function useDismissBroadcast() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (broadcastId: string) =>
      apiClient.post(`/api/v1/notifications/broadcasts/${broadcastId}/dismiss`, {}),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['broadcasts', 'unread'] })
    },
  })
}
