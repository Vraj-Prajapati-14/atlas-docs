'use client'

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { apiClient } from '@/lib/api-client'
import type { SettingsResponse, TenantSettings, TenantInfo, OutletInfo } from '@/lib/api-types'

export function useSettings() {
  return useQuery({
    queryKey: ['settings'],
    queryFn: () => apiClient.get<SettingsResponse>('/api/v1/settings'),
    staleTime: 5 * 60 * 1000,
  })
}

export function useUpdateSettings() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (body: Partial<Omit<TenantSettings, 'id' | 'tenantId' | 'updatedAt' | 'currencySymbol'>>) =>
      apiClient.patch<TenantSettings>('/api/v1/settings', body),
    onSuccess() {
      qc.invalidateQueries({ queryKey: ['settings'] })
      toast.success('Settings saved.')
    },
    onError(err: Error) { toast.error(err.message) },
  })
}

export function useUpdateOutlet() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (body: Partial<Pick<OutletInfo, 'name' | 'phone' | 'addressLine1' | 'addressLine2' | 'city' | 'state' | 'pincode'>>) =>
      apiClient.patch<OutletInfo>('/api/v1/settings/outlet', body),
    onSuccess() {
      qc.invalidateQueries({ queryKey: ['settings'] })
      toast.success('Outlet info saved.')
    },
    onError(err: Error) { toast.error(err.message) },
  })
}

export function useUpdateTenant() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (body: Partial<Pick<TenantInfo, 'name' | 'phone' | 'email' | 'website' | 'gstin' | 'fssaiLicense' | 'panNumber' | 'addressLine1' | 'addressLine2' | 'city' | 'state' | 'pincode'>>) =>
      apiClient.patch<TenantInfo>('/api/v1/settings/tenant', body),
    onSuccess() {
      qc.invalidateQueries({ queryKey: ['settings'] })
      toast.success('Restaurant info saved.')
    },
    onError(err: Error) { toast.error(err.message) },
  })
}
