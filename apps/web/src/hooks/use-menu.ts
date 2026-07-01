'use client'

import { useQuery } from '@tanstack/react-query'
import { apiClient } from '@/lib/api-client'
import type { MenuCategory, MenuItem, PaginationMeta } from '@/lib/api-types'

const KEYS = {
  categories: ['menu-categories'] as const,
  items: (q?: Record<string, string | number | undefined>) => ['menu-items', q ?? {}] as const,
}

export function useMenuCategories() {
  return useQuery({
    queryKey: KEYS.categories,
    queryFn: () => apiClient.get<MenuCategory[]>('/api/v1/menu/categories'),
    staleTime: 5 * 60 * 1000,
  })
}

export function useMenuItems(query?: {
  categoryId?: string
  search?: string
  page?: number
  limit?: number
}) {
  const params = new URLSearchParams()
  if (query?.categoryId) params.set('categoryId', query.categoryId)
  if (query?.search) params.set('search', query.search)
  params.set('page', String(query?.page ?? 1))
  params.set('limit', String(query?.limit ?? 200))  // fetch all for POS
  const qs = params.toString()

  // The paginated() helper sends { success, data: items[], meta: { pagination } }.
  // apiClient extracts json.data, so we receive MenuItem[] directly — no select needed.
  return useQuery({
    queryKey: KEYS.items(query as Record<string, string | number | undefined>),
    queryFn: () => apiClient.get<MenuItem[]>(`/api/v1/menu/items?${qs}`),
    staleTime: 60 * 1000,
  })
}
