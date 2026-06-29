'use client'

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { apiClient } from '@/lib/api-client'
import type { KOT } from '@/lib/api-types'

const KEYS = {
  active: ['kots', 'active'] as const,
  kots: (q?: Record<string, string>) => ['kots', q ?? {}] as const,
}

export function useActiveKOTs() {
  return useQuery({
    queryKey: KEYS.active,
    queryFn: () => apiClient.get<KOT[]>('/api/v1/kots?active=true&limit=50'),
    refetchInterval: 10 * 1000,  // KDS polls every 10s
  })
}

function kotAction(endpoint: string) {
  return (kotId: string) => apiClient.post<KOT>(`/api/v1/kots/${kotId}/${endpoint}`, {})
}

function useKOTMutation(action: 'accept' | 'start' | 'done') {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: kotAction(action),
    onSuccess() {
      qc.invalidateQueries({ queryKey: ['kots'] })
      qc.invalidateQueries({ queryKey: ['orders'] })
    },
    onError(err: Error) {
      toast.error(err.message)
    },
  })
}

export function useAcceptKOT() { return useKOTMutation('accept') }
export function useStartKOT()  { return useKOTMutation('start') }
export function useDoneKOT()   { return useKOTMutation('done') }
