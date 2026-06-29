'use client'

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { apiClient } from '@/lib/api-client'
import type {
  InventoryItem, InventoryUnit, PaginationMeta,
  StockAdjustment, StockAdjustmentType,
  Supplier, PurchaseOrder, RecipeIngredient,
} from '@/lib/api-types'

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

// ─── Suppliers ────────────────────────────────────────────────────────────────

export function useSuppliers() {
  return useQuery({
    queryKey: ['inventory-suppliers'],
    queryFn: () => apiClient.get<Supplier[]>('/api/v1/inventory/suppliers'),
  })
}

export function useCreateSupplier() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (body: { name: string; phone: string; contactPerson?: string; email?: string; gstin?: string; address?: string }) =>
      apiClient.post<Supplier>('/api/v1/inventory/suppliers', body),
    onSuccess() { qc.invalidateQueries({ queryKey: ['inventory-suppliers'] }); toast.success('Supplier added.') },
    onError: (e: Error) => toast.error(e.message),
  })
}

export function useUpdateSupplier() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ id, ...body }: { id: string; name?: string; phone?: string; contactPerson?: string; email?: string; gstin?: string; address?: string }) =>
      apiClient.patch<Supplier>(`/api/v1/inventory/suppliers/${id}`, body),
    onSuccess() { qc.invalidateQueries({ queryKey: ['inventory-suppliers'] }); toast.success('Supplier updated.') },
    onError: (e: Error) => toast.error(e.message),
  })
}

// ─── Purchase Orders ──────────────────────────────────────────────────────────

interface POPage { data: PurchaseOrder[]; meta: { pagination: PaginationMeta } }

export function usePurchaseOrders(query?: { supplierId?: string; status?: string; page?: number }) {
  const params = new URLSearchParams()
  if (query?.supplierId) params.set('supplierId', query.supplierId)
  if (query?.status)     params.set('status', query.status)
  if (query?.page)       params.set('page', String(query.page))
  const qs = params.toString()
  return useQuery({
    queryKey: ['purchase-orders', query],
    queryFn: () => apiClient.get<POPage>(`/api/v1/inventory/purchase-orders${qs ? `?${qs}` : ''}`),
  })
}

export function useCreatePurchaseOrder() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (body: {
      supplierId: string
      items: { inventoryItemId: string; quantity: number; unitPriceInPaise: number }[]
      note?: string
    }) => apiClient.post<PurchaseOrder>('/api/v1/inventory/purchase-orders', body),
    onSuccess() { qc.invalidateQueries({ queryKey: ['purchase-orders'] }); toast.success('Purchase order created.') },
    onError: (e: Error) => toast.error(e.message),
  })
}

export function useReceivePurchaseOrder() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ id, invoiceNumber, note }: { id: string; invoiceNumber?: string; note?: string }) =>
      apiClient.post<PurchaseOrder>(`/api/v1/inventory/purchase-orders/${id}/receive`, { invoiceNumber, note }),
    onSuccess() {
      qc.invalidateQueries({ queryKey: ['purchase-orders'] })
      qc.invalidateQueries({ queryKey: ['inventory'] })
      toast.success('Stock received and inventory updated.')
    },
    onError: (e: Error) => toast.error(e.message),
  })
}

// ─── Recipes ──────────────────────────────────────────────────────────────────

export function useRecipe(menuItemId: string | null) {
  return useQuery({
    queryKey: ['recipe', menuItemId],
    queryFn: () => apiClient.get<RecipeIngredient[]>(`/api/v1/inventory/recipes/${menuItemId}`),
    enabled: !!menuItemId,
  })
}

export function useSetRecipe() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ menuItemId, ingredients }: {
      menuItemId: string
      ingredients: { inventoryItemId: string; quantity: number }[]
    }) => apiClient.put<RecipeIngredient[]>(`/api/v1/inventory/recipes/${menuItemId}`, { ingredients }),
    onSuccess(_data, vars) {
      qc.invalidateQueries({ queryKey: ['recipe', vars.menuItemId] })
      toast.success('Recipe saved.')
    },
    onError: (e: Error) => toast.error(e.message),
  })
}

// ─── Items (create) ───────────────────────────────────────────────────────────

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
