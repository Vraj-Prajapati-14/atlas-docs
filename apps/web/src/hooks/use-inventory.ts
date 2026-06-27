'use client'

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { apiClient } from '@/lib/api-client'
import type { InventoryItem, InventoryUnit, PaginationMeta, StockAdjustment, StockAdjustmentType } from '@/lib/api-types'

interface InventoryPage {
  data: InventoryItem[]
  meta: { pagination: PaginationMeta }
}

const KEYS = {
  items: (q?: Record<string, string>) => ['inventory', q ?? {}] as const,
  item: (id: string) => ['inventory', id] as const,
}

export function useInventoryItems(query?: { search?: string; lowStockOnly?: boolean }) {
  const params = new URLSearchParams()
  if (query?.search) params.set('search', query.search)
  if (query?.lowStockOnly) params.set('lowStock', 'true')
  params.set('limit', '100')

  return useQuery({
    queryKey: KEYS.items(query as Record<string, string>),
    queryFn: () => apiClient.get<InventoryPage>(`/api/v1/inventory?${params.toString()}`),
    select: (res) => res.data,
    refetchInterval: 30 * 1000,
  })
}

export function useAdjustStock() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({
      itemId,
      type,
      quantity,
      note,
    }: {
      itemId: string
      type: StockAdjustmentType
      quantity: number
      note?: string
    }) =>
      apiClient.post<StockAdjustment>(`/api/v1/inventory/${itemId}/adjust`, {
        type,
        quantityInBaseUnit: quantity,
        note,
      }),
    onSuccess() {
      qc.invalidateQueries({ queryKey: ['inventory'] })
      toast.success('Stock updated')
    },
    onError: (e: Error) => toast.error(e.message),
  })
}

export function useCreateInventoryItem() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (payload: {
      name: string
      unit: InventoryUnit
      currentStockInBaseUnit?: number
      lowStockThreshold?: number
      costPerUnitInPaise?: number
      sku?: string
      category?: string
    }) => apiClient.post<InventoryItem>('/api/v1/inventory', payload),
    onSuccess(item) {
      qc.invalidateQueries({ queryKey: ['inventory'] })
      toast.success(`"${item.name}" added to inventory`)
    },
    onError: (e: Error) => toast.error(e.message),
  })
}
