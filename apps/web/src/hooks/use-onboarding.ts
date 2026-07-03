'use client'

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { apiClient } from '@/lib/api-client'

export interface OnboardingSteps {
  id: string
  tenantId: string
  // Wizard steps (boolean = actually completed; skippedSteps tracks intentional skips)
  brandingDone:          boolean
  restaurantProfileDone: boolean
  menuDone:              boolean
  tablesDone:            boolean
  staffDone:             boolean
  paymentSetupDone:      boolean
  firstOrderDone:        boolean
  // Legacy
  outletDone:            boolean
  // Tracking
  skippedSteps:          string[] | null
  teamAssistedMode:      boolean
  completedAt:           string | null
}

export type WizardStepKey =
  | 'brandingDone'
  | 'restaurantProfileDone'
  | 'menuDone'
  | 'tablesDone'
  | 'staffDone'
  | 'paymentSetupDone'
  | 'firstOrderDone'

export function stepIsResolved(steps: OnboardingSteps, key: WizardStepKey): boolean {
  const skipped = steps.skippedSteps ?? []
  return steps[key] || skipped.includes(key)
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
    mutationFn: (data: Partial<Omit<OnboardingSteps, 'id' | 'tenantId' | 'completedAt' | 'skippedSteps' | 'teamAssistedMode'>>) =>
      apiClient.patch<OnboardingSteps>('/api/v1/onboarding', data),
    onSuccess(steps) {
      qc.setQueryData(['onboarding-steps'], steps)
    },
  })
}

export function useSkipOnboardingStep() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (step: WizardStepKey) =>
      apiClient.post<OnboardingSteps>('/api/v1/onboarding/skip', { step }),
    onSuccess(steps) {
      qc.setQueryData(['onboarding-steps'], steps)
    },
  })
}

export function useEnableTeamAssist() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: () => apiClient.post<OnboardingSteps>('/api/v1/onboarding/team-assist', {}),
    onSuccess(steps) {
      qc.setQueryData(['onboarding-steps'], steps)
    },
  })
}
