'use client'

import { useQuery } from '@tanstack/react-query'
import { apiClient } from '@/lib/api-client'
import type {
  DailyReport,
  ItemsReport,
  PaymentsReport,
  GSTReport,
  InventoryValuationReport,
} from '@/lib/api-types'

export function useDailyReport(date: string) {
  return useQuery({
    queryKey: ['reports', 'daily', date],
    queryFn: () => apiClient.get<DailyReport>(`/api/v1/reports/daily?date=${date}`),
    enabled: !!date,
  })
}

export function useItemsReport(from: string, to: string) {
  return useQuery({
    queryKey: ['reports', 'items', from, to],
    queryFn: () => apiClient.get<ItemsReport>(`/api/v1/reports/items?from=${from}&to=${to}`),
    enabled: !!from && !!to,
  })
}

export function usePaymentsReport(from: string, to: string) {
  return useQuery({
    queryKey: ['reports', 'payments', from, to],
    queryFn: () => apiClient.get<PaymentsReport>(`/api/v1/reports/payments?from=${from}&to=${to}`),
    enabled: !!from && !!to,
  })
}

export function useGSTReport(month: string) {
  return useQuery({
    queryKey: ['reports', 'gst', month],
    queryFn: () => apiClient.get<GSTReport>(`/api/v1/reports/gst?month=${month}`),
    enabled: !!month,
  })
}

export function useInventoryValuation() {
  return useQuery({
    queryKey: ['reports', 'inventory-valuation'],
    queryFn: () => apiClient.get<InventoryValuationReport>('/api/v1/reports/inventory-valuation'),
  })
}
