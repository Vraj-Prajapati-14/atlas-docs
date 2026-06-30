'use client'

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { apiClient } from '@/lib/api-client'

export interface OnboardingSteps {
  id: string
  tenantId: string
  restaurantProfileDone: boolean
  outletDone: boolean
  menuDone: boolean
  tablesDone: boolean
  staffDone: boolean
  firstOrderDone: boolean
  completedAt: string | null
}

export function useOnboardingSteps() {
  return useQuery<OnboardingSteps>({
    queryKey: ['onboarding-steps'],
    queryFn: () => apiClient.get<OnboardingSteps>('/api/v1/onboarding'),
    staleTime: 30_000,
  })
}

export function useUpdateOnboardingSteps() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (data: Partial<Omit<OnboardingSteps, 'id' | 'tenantId' | 'completedAt'>>) =>
      apiClient.patch<OnboardingSteps>('/api/v1/onboarding', data),
    onSuccess(steps) {
      qc.setQueryData(['onboarding-steps'], steps)
    },
  })
}
