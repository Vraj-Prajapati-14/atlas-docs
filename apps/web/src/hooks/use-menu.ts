'use client'

import { useQuery } from '@tanstack/react-query'
import { apiClient } from '@/lib/api-client'
import type { MenuCategory, MenuItem, PaginationMeta } from '@/lib/api-types'

interface MenuItemsPage {
  data: MenuItem[]
  meta: { pagination: PaginationMeta }
}

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

  return useQuery({
    queryKey: KEYS.items(query as Record<string, string | number | undefined>),
    queryFn: () => apiClient.get<MenuItemsPage>(`/api/v1/menu/items?${qs}`),
    staleTime: 60 * 1000,
    select: (res) => res.data,  // unwrap .data from paginated response
  })
}
