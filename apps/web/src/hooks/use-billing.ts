'use client'

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { apiClient } from '@/lib/api-client'
import type { Bill, PaymentMethod } from '@/lib/api-types'

const KEYS = {
  bills: (q?: Record<string, string>) => ['bills', q ?? {}] as const,
  bill: (id: string) => ['bills', id] as const,
}

export function useBills(query?: { paymentStatus?: string; date?: string }) {
  const params = new URLSearchParams()
  if (query?.paymentStatus) params.set('paymentStatus', query.paymentStatus)
  if (query?.date) params.set('date', query.date)
  params.set('limit', '50')

  // paginated() sends items[] directly in json.data; apiClient returns Bill[].
  return useQuery({
    queryKey: KEYS.bills(query as Record<string, string>),
    queryFn: () => apiClient.get<Bill[]>(`/api/v1/bills?${params.toString()}`),
    refetchInterval: 30 * 1000,
  })
}

export function useBill(id: string | undefined) {
  return useQuery({
    queryKey: KEYS.bill(id ?? ''),
    queryFn: () => apiClient.get<Bill>(`/api/v1/bills/${id}`),
    enabled: !!id,
  })
}

export function useGenerateBill() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (payload: {
      orderId: string
      discountInPaise?: number
      discountReasonCode?: string
      loyaltyPointsRedeem?: number
      customerName?: string
      customerPhone?: string
      customerGSTIN?: string
    }) => apiClient.post<Bill>('/api/v1/bills', payload),
    onSuccess(bill) {
      qc.setQueryData(KEYS.bill(bill.id), bill)
      qc.invalidateQueries({ queryKey: ['bills'] })
      qc.invalidateQueries({ queryKey: ['orders'] })
      toast.success(`Bill #${bill.billNumber} generated`)
    },
    onError(err: Error) {
      toast.error(err.message)
    },
  })
}

export function useVerifyManagerPIN() {
  return useMutation({
    mutationFn: (pin: string) =>
      apiClient.post<{ valid: boolean }>('/api/v1/auth/verify-manager-pin', { pin }),
  })
}

export function useRecordPayment() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({
      billId,
      method,
      amountInPaise,
      referenceId,
    }: {
      billId: string
      method: PaymentMethod
      amountInPaise: number
      referenceId?: string
    }) =>
      apiClient.post<Bill>(`/api/v1/bills/${billId}/payments`, {
        method,
        amountInPaise,
        referenceId,
      }),
    onSuccess(bill) {
      qc.setQueryData(KEYS.bill(bill.id), bill)
      qc.invalidateQueries({ queryKey: ['bills'] })
      qc.invalidateQueries({ queryKey: ['orders'] })
      if (bill.paymentStatus === 'PAID') toast.success('Payment recorded — bill settled!')
      else toast.success('Partial payment recorded.')
    },
    onError(err: Error) {
      toast.error(err.message)
    },
  })
}

export function useVoidBill() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ billId, reason }: { billId: string; reason: string }) =>
      apiClient.post<Bill>(`/api/v1/bills/${billId}/void`, { reason }),
    onSuccess() {
      qc.invalidateQueries({ queryKey: ['bills'] })
      toast.success('Bill voided.')
    },
    onError(err: Error) {
      toast.error(err.message)
    },
  })
}
