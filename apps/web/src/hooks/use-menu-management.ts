'use client'

import { useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { apiClient } from '@/lib/api-client'
import type { FoodType, MenuCategory, MenuItem } from '@/lib/api-types'

// ─── Category mutations ───────────────────────────────────────────────────────

export function useCreateCategory() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (payload: { name: string; description?: string; sortOrder?: number }) =>
      apiClient.post<MenuCategory>('/api/v1/menu/categories', payload),
    onSuccess(cat) {
      qc.invalidateQueries({ queryKey: ['menu-categories'] })
      toast.success(`Category "${cat.name}" created`)
    },
    onError: (e: Error) => toast.error(e.message),
  })
}

export function useUpdateCategory() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ id, ...payload }: { id: string; name?: string; description?: string; sortOrder?: number }) =>
      apiClient.patch<MenuCategory>(`/api/v1/menu/categories/${id}`, payload),
    onSuccess() {
      qc.invalidateQueries({ queryKey: ['menu-categories'] })
    },
    onError: (e: Error) => toast.error(e.message),
  })
}

export function useDeleteCategory() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => apiClient.delete<void>(`/api/v1/menu/categories/${id}`),
    onSuccess() {
      qc.invalidateQueries({ queryKey: ['menu-categories'] })
      toast.success('Category deleted')
    },
    onError: (e: Error) => toast.error(e.message),
  })
}

// ─── Item mutations ───────────────────────────────────────────────────────────

export interface MenuItemPayload {
  categoryId: string
  name: string
  description?: string
  imageUrl?: string | null
  priceInPaise: number
  gstRate: 0 | 5 | 12 | 18 | 28
  isGSTInclusive: boolean
  foodType: FoodType
  isAvailable: boolean
  isFeatured: boolean
  sortOrder?: number
  variants?: { name: string; priceInPaise: number; isDefault?: boolean }[]
}

export function useCreateMenuItem() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (payload: MenuItemPayload) =>
      apiClient.post<MenuItem>('/api/v1/menu/items', payload),
    onSuccess(item) {
      qc.invalidateQueries({ queryKey: ['menu-items'] })
      toast.success(`"${item.name}" added to menu`)
    },
    onError: (e: Error) => toast.error(e.message),
  })
}

export function useUpdateMenuItem() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ id, ...payload }: { id: string } & Partial<MenuItemPayload>) =>
      apiClient.patch<MenuItem>(`/api/v1/menu/items/${id}`, payload),
    onSuccess(item) {
      qc.invalidateQueries({ queryKey: ['menu-items'] })
      toast.success(`"${item.name}" updated`)
    },
    onError: (e: Error) => toast.error(e.message),
  })
}

export function useToggleItemAvailability() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ id, isAvailable }: { id: string; isAvailable: boolean }) =>
      apiClient.patch<MenuItem>(`/api/v1/menu/items/${id}`, { isAvailable }),
    onMutate: async ({ id, isAvailable }) => {
      // Optimistic update across all cached item queries
      await qc.cancelQueries({ queryKey: ['menu-items'] })
      const prev = qc.getQueriesData<MenuItem[]>({ queryKey: ['menu-items'] })
      qc.setQueriesData<MenuItem[]>({ queryKey: ['menu-items'] }, (old) =>
        old ? old.map((i) => (i.id === id ? { ...i, isAvailable } : i)) : old,
      )
      return { prev }
    },
    onError(_e, _v, ctx) {
      if (ctx?.prev) {
        ctx.prev.forEach(([key, data]) => qc.setQueryData(key, data))
      }
    },
    onSettled() {
      qc.invalidateQueries({ queryKey: ['menu-items'] })
    },
  })
}

export function useDeleteMenuItem() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => apiClient.delete<void>(`/api/v1/menu/items/${id}`),
    onSuccess() {
      qc.invalidateQueries({ queryKey: ['menu-items'] })
      toast.success('Item removed from menu')
    },
    onError: (e: Error) => toast.error(e.message),
  })
}
