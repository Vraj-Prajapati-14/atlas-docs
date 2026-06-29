'use client'

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { apiClient } from '@/lib/api-client'
import type { AggregatorCredential, AggregatorOrder, AggregatorPlatform, AggregatorOrderStatus } from '@/lib/api-types'

interface AggregatorOrdersResponse {
  data: AggregatorOrder[]
  meta: { pagination: { page: number; limit: number; total: number; totalPages: number } }
}

export function useAggregatorCredentials() {
  return useQuery({
    queryKey: ['aggregator-credentials'],
    queryFn: () => apiClient.get<AggregatorCredential[]>('/api/v1/aggregators/credentials'),
  })
}

export function useAggregatorOrders(query?: { platform?: AggregatorPlatform; status?: AggregatorOrderStatus; page?: number }) {
  const params = new URLSearchParams()
  if (query?.platform) params.set('platform', query.platform)
  if (query?.status)   params.set('status', query.status)
  if (query?.page)     params.set('page', String(query.page))
  const qs = params.toString()

  return useQuery({
    queryKey: ['aggregator-orders', query],
    queryFn: () => apiClient.get<AggregatorOrdersResponse>(`/api/v1/aggregators/orders${qs ? `?${qs}` : ''}`),
    refetchInterval: 30 * 1000,
  })
}

export function useCreateCredential() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (body: { platform: AggregatorPlatform; outletId: string; apiKey: string; secretKey?: string; restaurantId: string }) =>
      apiClient.post<AggregatorCredential>('/api/v1/aggregators/credentials', body),
    onSuccess() {
      qc.invalidateQueries({ queryKey: ['aggregator-credentials'] })
      toast.success('Integration added.')
    },
    onError(err: Error) { toast.error(err.message) },
  })
}

export function useUpdateCredential() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ id, ...body }: { id: string; apiKey?: string; secretKey?: string; restaurantId?: string; isActive?: boolean }) =>
      apiClient.patch<AggregatorCredential>(`/api/v1/aggregators/credentials/${id}`, body),
    onSuccess() {
      qc.invalidateQueries({ queryKey: ['aggregator-credentials'] })
      toast.success('Integration updated.')
    },
    onError(err: Error) { toast.error(err.message) },
  })
}

export function useDeleteCredential() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => apiClient.delete(`/api/v1/aggregators/credentials/${id}`),
    onSuccess() {
      qc.invalidateQueries({ queryKey: ['aggregator-credentials'] })
      toast.success('Integration removed.')
    },
    onError(err: Error) { toast.error(err.message) },
  })
}

export function useAcceptAggregatorOrder() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => apiClient.post<AggregatorOrder>(`/api/v1/aggregators/orders/${id}/accept`, {}),
    onSuccess() { qc.invalidateQueries({ queryKey: ['aggregator-orders'] }); toast.success('Order accepted.') },
    onError(err: Error) { toast.error(err.message) },
  })
}

export function useDispatchAggregatorOrder() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => apiClient.post<AggregatorOrder>(`/api/v1/aggregators/orders/${id}/dispatch`, {}),
    onSuccess() { qc.invalidateQueries({ queryKey: ['aggregator-orders'] }); toast.success('Order dispatched.') },
    onError(err: Error) { toast.error(err.message) },
  })
}

export function useCancelAggregatorOrder() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ id, reason }: { id: string; reason: string }) =>
      apiClient.post<AggregatorOrder>(`/api/v1/aggregators/orders/${id}/cancel`, { reason }),
    onSuccess() { qc.invalidateQueries({ queryKey: ['aggregator-orders'] }); toast.success('Order cancelled.') },
    onError(err: Error) { toast.error(err.message) },
  })
}
