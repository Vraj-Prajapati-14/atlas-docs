'use client'

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { apiClient } from '@/lib/api-client'
import type { CartItem, Order, OrderStatus } from '@/lib/api-types'

const KEYS = {
  orders: (q?: Record<string, string>) => ['orders', q ?? {}] as const,
  order: (id: string) => ['orders', id] as const,
  tableOrders: (tableId: string) => ['orders', 'table', tableId] as const,
}

export function useOrders(query?: {
  status?: OrderStatus
  tableId?: string
  page?: number
  limit?: number
}) {
  const params = new URLSearchParams()
  if (query?.status) params.set('status', query.status)
  if (query?.tableId) params.set('tableId', query.tableId)
  params.set('page', String(query?.page ?? 1))
  params.set('limit', String(query?.limit ?? 50))

  // paginated() sends items[] directly in json.data; apiClient returns Order[].
  return useQuery({
    queryKey: KEYS.orders(query as Record<string, string>),
    queryFn: () => apiClient.get<Order[]>(`/api/v1/orders?${params.toString()}`),
    refetchInterval: 20 * 1000,
  })
}

export function useActiveTableOrder(tableId: string | undefined) {
  return useQuery({
    queryKey: KEYS.tableOrders(tableId ?? ''),
    queryFn: async () => {
      const params = new URLSearchParams({ tableId: tableId!, limit: '1' })
      const orders = await apiClient.get<Order[]>(`/api/v1/orders?${params.toString()}`)
      return orders.find((o) =>
        ['DRAFT', 'CONFIRMED', 'IN_PROGRESS', 'READY'].includes(o.status),
      ) ?? null
    },
    enabled: !!tableId,
    staleTime: 10 * 1000,
  })
}

export function useOrder(id: string | undefined) {
  return useQuery({
    queryKey: KEYS.order(id ?? ''),
    queryFn: () => apiClient.get<Order>(`/api/v1/orders/${id}`),
    enabled: !!id,
    refetchInterval: 15 * 1000,
  })
}

// ─── Mutations ────────────────────────────────────────────────────────────────

interface CreateOrderPayload {
  outletId: string
  tableId: string
  type: 'DINE_IN'
  guestCount?: number
  items: {
    menuItemId: string
    variantId?: string
    addOns: { addOnId: string }[]
    quantity: number
    note?: string
  }[]
}

export function useCreateAndConfirmOrder() {
  const qc = useQueryClient()

  return useMutation({
    mutationFn: async ({
      outletId,
      tableId,
      cartItems,
      guestCount,
    }: {
      outletId: string
      tableId: string
      cartItems: CartItem[]
      guestCount?: number
    }) => {
      const payload: CreateOrderPayload = {
        outletId,
        tableId,
        type: 'DINE_IN',
        guestCount,
        items: cartItems.map((c) => ({
          menuItemId: c.menuItemId,
          variantId: c.variantId ?? undefined,
          addOns: c.addOns.map((a) => ({ addOnId: a.addOnId })),
          quantity: c.quantity,
          note: c.note || undefined,
        })),
      }
      const order = await apiClient.post<Order>('/api/v1/orders', payload)
      const confirmed = await apiClient.post<Order>(`/api/v1/orders/${order.id}/confirm`, {})
      return confirmed
    },
    onSuccess(order) {
      qc.invalidateQueries({ queryKey: ['orders'] })
      qc.invalidateQueries({ queryKey: ['tables'] })
      toast.success(`KOT #${order.orderNumber} sent to kitchen!`)
    },
    onError(err: Error) {
      toast.error(err.message ?? 'Failed to send KOT.')
    },
  })
}

export function useFireKOT() {
  const qc = useQueryClient()

  return useMutation({
    mutationFn: ({
      orderId,
      cartItems,
    }: {
      orderId: string
      cartItems: CartItem[]
    }) =>
      apiClient.post<Order>(`/api/v1/orders/${orderId}/kot`, {
        items: cartItems.map((c) => ({
          menuItemId: c.menuItemId,
          variantId: c.variantId ?? undefined,
          addOns: c.addOns.map((a) => ({ addOnId: a.addOnId })),
          quantity: c.quantity,
          note: c.note || undefined,
        })),
      }),
    onSuccess(_, vars) {
      qc.invalidateQueries({ queryKey: KEYS.order(vars.orderId) })
      toast.success('Additional KOT sent!')
    },
    onError(err: Error) {
      toast.error(err.message ?? 'Failed to fire KOT.')
    },
  })
}

export function useServeOrder() {
  const qc = useQueryClient()

  return useMutation({
    mutationFn: (orderId: string) =>
      apiClient.post<Order>(`/api/v1/orders/${orderId}/serve`, {}),
    onSuccess() {
      qc.invalidateQueries({ queryKey: ['orders'] })
      qc.invalidateQueries({ queryKey: ['tables'] })
    },
    onError(err: Error) {
      toast.error(err.message)
    },
  })
}

export function useCancelOrder() {
  const qc = useQueryClient()

  return useMutation({
    mutationFn: (orderId: string) =>
      apiClient.post<Order>(`/api/v1/orders/${orderId}/cancel`, {}),
    onSuccess() {
      qc.invalidateQueries({ queryKey: ['orders'] })
      qc.invalidateQueries({ queryKey: ['tables'] })
      toast.success('Order cancelled.')
    },
    onError(err: Error) {
      toast.error(err.message)
    },
  })
}
