'use client'

import { useQuery, useMutation } from '@tanstack/react-query'
import { apiClient } from '@/lib/api-client'
import type { NotificationsListResponse, NotificationChannel } from '@/lib/api-types'

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
