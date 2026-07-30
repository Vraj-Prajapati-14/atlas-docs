'use client'

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { apiClient } from '@/lib/api-client'
import type { Device, DeviceSettings, DeviceType, DeviceDisplayMode } from '@/lib/api-types'

const KEYS = {
  list: () => ['devices'] as const,
  one:  (id: string) => ['devices', id] as const,
}

export function useDevices() {
  return useQuery({
    queryKey: KEYS.list(),
    queryFn:  () => apiClient.get<Device[]>('/api/v1/devices'),
  })
}

export function useDevice(id: string) {
  return useQuery({
    queryKey: KEYS.one(id),
    queryFn:  () => apiClient.get<Device>(`/api/v1/devices/${id}`),
    enabled:  !!id,
  })
}

export function useCreateDevice() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (body: {
      name: string
      type: DeviceType
      defaultUrl?: string | null
      floorId?: string | null
    }) => apiClient.post<Device>('/api/v1/devices', body),
    onSuccess() {
      qc.invalidateQueries({ queryKey: KEYS.list() })
      toast.success('Device registered.')
    },
    onError(err: Error) { toast.error(err.message) },
  })
}

export function useUpdateDevice() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ id, ...body }: {
      id:         string
      name?:       string
      type?:       DeviceType
      defaultUrl?: string | null
      floorId?:    string | null
    }) => apiClient.patch<Device>(`/api/v1/devices/${id}`, body),
    onSuccess(_, vars) {
      qc.invalidateQueries({ queryKey: KEYS.list() })
      qc.invalidateQueries({ queryKey: KEYS.one(vars.id) })
      toast.success('Device updated.')
    },
    onError(err: Error) { toast.error(err.message) },
  })
}

export function useDeactivateDevice() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => apiClient.delete(`/api/v1/devices/${id}`),
    onSuccess() {
      qc.invalidateQueries({ queryKey: KEYS.list() })
      toast.success('Device deactivated.')
    },
    onError(err: Error) { toast.error(err.message) },
  })
}

export function useRotateDeviceToken() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => apiClient.post<Device>(`/api/v1/devices/${id}/rotate-token`, {}),
    onSuccess(_, id) {
      qc.invalidateQueries({ queryKey: KEYS.list() })
      qc.invalidateQueries({ queryKey: KEYS.one(id) })
      toast.success('Token rotated. Copy the new token now — it won\'t be shown again.')
    },
    onError(err: Error) { toast.error(err.message) },
  })
}

export function useUpdateDeviceSettings() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ id, ...body }: {
      id:             string
      autoKotPrint?:  boolean
      autoBillPrint?: boolean
      soundAlerts?:   boolean
      displayMode?:   DeviceDisplayMode
    }) => apiClient.patch<DeviceSettings>(`/api/v1/devices/${id}/settings`, body),
    onSuccess(_, vars) {
      qc.invalidateQueries({ queryKey: KEYS.list() })
      qc.invalidateQueries({ queryKey: KEYS.one(vars.id) })
      toast.success('Device settings saved.')
    },
    onError(err: Error) { toast.error(err.message) },
  })
}
