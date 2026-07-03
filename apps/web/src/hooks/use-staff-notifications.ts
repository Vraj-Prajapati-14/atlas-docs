'use client'

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { apiClient } from '@/lib/api-client'
import type {
  StaffNotificationListResponse,
  StaffNotifUnreadCount,
  SendNotificationPayload,
} from '@/lib/api-types'

const BASE = '/api/v1/staff-notifications'

export function useStaffUnreadCount() {
  return useQuery({
    queryKey: ['staff-notifs', 'unread-count'],
    queryFn: () => apiClient.get<StaffNotifUnreadCount>(`${BASE}/unread-count`),
    refetchInterval: 60_000,
    staleTime:       30_000,
  })
}

export function useStaffNotifications(page = 1, limit = 20) {
  return useQuery({
    queryKey: ['staff-notifs', 'inbox', page, limit],
    queryFn:  () =>
      apiClient.get<StaffNotificationListResponse>(`${BASE}?page=${page}&limit=${limit}`),
  })
}

export function useSentNotifications(page = 1, limit = 20) {
  return useQuery({
    queryKey: ['staff-notifs', 'sent', page, limit],
    queryFn:  () =>
      apiClient.get<StaffNotificationListResponse>(`${BASE}/sent?page=${page}&limit=${limit}`),
  })
}

export function useMarkRead() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => apiClient.post(`${BASE}/${id}/read`, {}),
    onSuccess:  () => {
      void qc.invalidateQueries({ queryKey: ['staff-notifs'] })
    },
  })
}

export function useMarkAllRead() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: () => apiClient.post(`${BASE}/read-all`, {}),
    onSuccess:  () => {
      void qc.invalidateQueries({ queryKey: ['staff-notifs'] })
    },
  })
}

export function useSendNotification() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (payload: SendNotificationPayload) => apiClient.post(`${BASE}/send`, payload),
    onSuccess:  () => {
      void qc.invalidateQueries({ queryKey: ['staff-notifs', 'sent'] })
    },
  })
}
