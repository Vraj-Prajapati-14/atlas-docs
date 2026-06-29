'use client'

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { apiClient } from '@/lib/api-client'
import type { Customer, CustomerDetail, CustomerListResponse } from '@/lib/api-types'

export function useCustomers(query?: { search?: string; page?: number; limit?: number }) {
  const params = new URLSearchParams()
  if (query?.search) params.set('search', query.search)
  if (query?.page)   params.set('page', String(query.page))
  if (query?.limit)  params.set('limit', String(query.limit))
  const qs = params.toString()

  return useQuery({
    queryKey: ['customers', query],
    queryFn: () => apiClient.get<CustomerListResponse>(`/api/v1/customers${qs ? `?${qs}` : ''}`),
  })
}

export function useCustomerDetail(id: string | null) {
  return useQuery({
    queryKey: ['customers', id],
    queryFn: () => apiClient.get<CustomerDetail>(`/api/v1/customers/${id}`),
    enabled: !!id,
  })
}

export function useCreateCustomer() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (body: {
      name: string; phone: string; email?: string
      gstin?: string; companyName?: string; address?: string
    }) => apiClient.post<Customer>('/api/v1/customers', body),
    onSuccess() {
      qc.invalidateQueries({ queryKey: ['customers'] })
      toast.success('Customer added.')
    },
    onError(err: Error) { toast.error(err.message) },
  })
}

export function useUpdateCustomer() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ id, ...body }: { id: string; name?: string; phone?: string; email?: string; address?: string; gstin?: string; companyName?: string }) =>
      apiClient.patch<Customer>(`/api/v1/customers/${id}`, body),
    onSuccess() {
      qc.invalidateQueries({ queryKey: ['customers'] })
      toast.success('Customer updated.')
    },
    onError(err: Error) { toast.error(err.message) },
  })
}
