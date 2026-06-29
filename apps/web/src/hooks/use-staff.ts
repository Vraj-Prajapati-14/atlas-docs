'use client'

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { apiClient } from '@/lib/api-client'
import type { StaffMember, StaffListResponse, UserRole } from '@/lib/api-types'

const KEYS = {
  list: (q?: Record<string, string>) => ['staff', q ?? {}] as const,
  one:  (id: string) => ['staff', id] as const,
}

export function useStaff(query?: { role?: UserRole; isActive?: boolean; search?: string }) {
  const params = new URLSearchParams()
  if (query?.role)                params.set('role', query.role)
  if (query?.isActive !== undefined) params.set('isActive', String(query.isActive))
  if (query?.search)              params.set('search', query.search)
  const qs = params.toString()

  return useQuery({
    queryKey: KEYS.list(query as Record<string, string>),
    queryFn: () => apiClient.get<StaffListResponse>(`/api/v1/staff${qs ? `?${qs}` : ''}`),
  })
}

export function useCreateStaff() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (body: { name: string; phone: string; email?: string; role: UserRole; pin: string }) =>
      apiClient.post<StaffMember>('/api/v1/staff', body),
    onSuccess() {
      qc.invalidateQueries({ queryKey: ['staff'] })
      toast.success('Staff member added.')
    },
    onError(err: Error) { toast.error(err.message) },
  })
}

export function useUpdateStaff() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ id, ...body }: { id: string; name?: string; phone?: string; email?: string; role?: UserRole }) =>
      apiClient.patch<StaffMember>(`/api/v1/staff/${id}`, body),
    onSuccess() {
      qc.invalidateQueries({ queryKey: ['staff'] })
      toast.success('Staff member updated.')
    },
    onError(err: Error) { toast.error(err.message) },
  })
}

export function useResetPIN() {
  return useMutation({
    mutationFn: ({ id, pin }: { id: string; pin: string }) =>
      apiClient.patch<StaffMember>(`/api/v1/staff/${id}/pin`, { pin }),
    onSuccess() { toast.success('PIN reset successfully.') },
    onError(err: Error) { toast.error(err.message) },
  })
}

export function useToggleStaffStatus() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => apiClient.patch<StaffMember>(`/api/v1/staff/${id}/status`, {}),
    onSuccess(data) {
      qc.invalidateQueries({ queryKey: ['staff'] })
      toast.success(`${data.name} ${data.isActive ? 'activated' : 'deactivated'}.`)
    },
    onError(err: Error) { toast.error(err.message) },
  })
}

export function useDeleteStaff() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => apiClient.delete(`/api/v1/staff/${id}`),
    onSuccess() {
      qc.invalidateQueries({ queryKey: ['staff'] })
      toast.success('Staff member removed.')
    },
    onError(err: Error) { toast.error(err.message) },
  })
}
