'use client'

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { apiClient } from '@/lib/api-client'
import type { Floor, Table, TableStatus } from '@/lib/api-types'

const KEYS = {
  floors: ['floors'] as const,
  tables: (q?: Record<string, string>) => ['tables', q ?? {}] as const,
  table: (id: string) => ['tables', id] as const,
}

export function useFloors() {
  return useQuery({
    queryKey: KEYS.floors,
    queryFn: () => apiClient.get<Floor[]>('/api/v1/tables/floors'),
    staleTime: 2 * 60 * 1000,
  })
}

export function useTables(query?: { outletId?: string; floorId?: string; status?: TableStatus }) {
  const params = new URLSearchParams()
  if (query?.outletId) params.set('outletId', query.outletId)
  if (query?.floorId) params.set('floorId', query.floorId)
  if (query?.status) params.set('status', query.status)
  const qs = params.toString()

  return useQuery({
    queryKey: KEYS.tables(query as Record<string, string>),
    queryFn: () => apiClient.get<Table[]>(`/api/v1/tables${qs ? `?${qs}` : ''}`),
    refetchInterval: 30 * 1000,   // auto-refresh floor plan every 30s
  })
}

export function useTable(id: string) {
  return useQuery({
    queryKey: KEYS.table(id),
    queryFn: () => apiClient.get<Table>(`/api/v1/tables/${id}`),
    enabled: !!id,
  })
}

export function useRefreshTableQR() {
  const qc = useQueryClient()

  return useMutation({
    mutationFn: (tableId: string) =>
      apiClient.post<Table>(`/api/v1/tables/${tableId}/qr`, {}),
    onSuccess(updated) {
      qc.setQueriesData<Table[]>({ queryKey: ['tables'] }, (prev) =>
        prev?.map((t) => (t.id === updated.id ? updated : t)),
      )
      qc.setQueryData(KEYS.table(updated.id), updated)
      toast.success('QR code refreshed.')
    },
    onError(err: Error) {
      toast.error(err.message)
    },
  })
}

export function useUpdateTableStatus() {
  const qc = useQueryClient()

  return useMutation({
    mutationFn: ({ tableId, status }: { tableId: string; status: TableStatus }) =>
      apiClient.patch<Table>(`/api/v1/tables/${tableId}/status`, { status }),
    onSuccess(updated) {
      qc.setQueriesData<Table[]>({ queryKey: ['tables'] }, (prev) =>
        prev?.map((t) => (t.id === updated.id ? updated : t)),
      )
      qc.setQueryData(KEYS.table(updated.id), updated)
    },
    onError(err: Error) {
      toast.error(err.message)
    },
  })
}
