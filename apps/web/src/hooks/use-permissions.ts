'use client'

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { apiClient } from '@/lib/api-client'
import type { ConfigurableRole, PermissionsByRole, RolePermissionRow } from '@/lib/api-types'

const KEYS = {
  all:       () => ['permissions'] as const,
  forRole:   (role: ConfigurableRole) => ['permissions', role] as const,
  available: () => ['permissions', 'available'] as const,
}

export function useAllPermissions() {
  return useQuery({
    queryKey: KEYS.all(),
    queryFn:  () => apiClient.get<PermissionsByRole>('/api/v1/permissions'),
  })
}

export function useAvailablePermissions() {
  return useQuery({
    queryKey: KEYS.available(),
    queryFn:  () => apiClient.get<string[]>('/api/v1/permissions/available'),
    staleTime: Infinity, // static list — never refetch
  })
}

export function useGrantPermission() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ role, permission }: { role: ConfigurableRole; permission: string }) =>
      apiClient.post<RolePermissionRow>(`/api/v1/permissions/${role}`, { permission }),
    onSuccess(_, vars) {
      qc.invalidateQueries({ queryKey: KEYS.all() })
      qc.invalidateQueries({ queryKey: KEYS.forRole(vars.role) })
    },
    onError(err: Error) { toast.error(err.message) },
  })
}

export function useRevokePermission() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ role, permission }: { role: ConfigurableRole; permission: string }) =>
      apiClient.delete(`/api/v1/permissions/${role}/${encodeURIComponent(permission)}`),
    onSuccess(_, vars) {
      qc.invalidateQueries({ queryKey: KEYS.all() })
      qc.invalidateQueries({ queryKey: KEYS.forRole(vars.role) })
    },
    onError(err: Error) { toast.error(err.message) },
  })
}

export function useBulkSetPermissions() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ role, permissions }: { role: ConfigurableRole; permissions: string[] }) =>
      apiClient.put<string[]>(`/api/v1/permissions/${role}`, { permissions }),
    onSuccess(_, vars) {
      qc.invalidateQueries({ queryKey: KEYS.all() })
      qc.invalidateQueries({ queryKey: KEYS.forRole(vars.role) })
      toast.success(`Permissions updated for ${vars.role}.`)
    },
    onError(err: Error) { toast.error(err.message) },
  })
}
