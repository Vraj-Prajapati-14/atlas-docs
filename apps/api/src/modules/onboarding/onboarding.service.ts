import { prisma, Prisma } from '@atlas/db'
import { NotFoundError } from '../../shared/errors.js'

export const WIZARD_STEPS = [
  'brandingDone',
  'restaurantProfileDone',
  'menuDone',
  'tablesDone',
  'staffDone',
  'paymentSetupDone',
  'firstOrderDone',
] as const

export type WizardStepKey = typeof WIZARD_STEPS[number]

export async function getOnboardingSteps(tenantId: string) {
  const steps = await prisma.tenantOnboardingStep.findUnique({ where: { tenantId } })
  if (!steps) throw new NotFoundError('Onboarding', tenantId)

  // Auto-mark firstOrder when a real order exists
  if (!steps.firstOrderDone) {
    const firstOrder = await prisma.order.findFirst({ where: { tenantId }, select: { id: true } })
    if (firstOrder) {
      await prisma.tenantOnboardingStep.update({
        where: { tenantId },
        data: { firstOrderDone: true },
      })
      steps.firstOrderDone = true
    }
  }

  return steps
}

export interface UpdateStepsInput {
  brandingDone?: boolean
  restaurantProfileDone?: boolean
  outletDone?: boolean
  menuDone?: boolean
  tablesDone?: boolean
  staffDone?: boolean
  paymentSetupDone?: boolean
  firstOrderDone?: boolean
}

export async function updateOnboardingSteps(tenantId: string, input: UpdateStepsInput) {
  const steps = await prisma.tenantOnboardingStep.update({
    where: { tenantId },
    data: input,
  })

  await maybeMarkComplete(tenantId, steps)
  return steps
}

// Skip records the step as intentionally deferred — does NOT set the boolean to true.
export async function skipOnboardingStep(tenantId: string, stepKey: WizardStepKey) {
  const steps = await prisma.tenantOnboardingStep.findUnique({ where: { tenantId } })
  if (!steps) throw new NotFoundError('Onboarding', tenantId)

  const currentSkipped = (steps.skippedSteps as string[] | null) ?? []
  if (!currentSkipped.includes(stepKey)) {
    currentSkipped.push(stepKey)
  }

  const updated = await prisma.tenantOnboardingStep.update({
    where: { tenantId },
    data: { skippedSteps: currentSkipped },
  })

  await maybeMarkComplete(tenantId, updated)
  return updated
}

// Enable team-assisted mode — Atlas team will do the setup.
// Marks all wizard steps as skipped so the wizard completes immediately.
export async function enableTeamAssistedMode(tenantId: string) {
  const updated = await prisma.tenantOnboardingStep.update({
    where: { tenantId },
    data: {
      teamAssistedMode: true,
      skippedSteps: WIZARD_STEPS as unknown as Prisma.InputJsonValue,
    },
  })

  // Stamp completion so the wizard doesn't re-appear
  await prisma.$transaction([
    prisma.tenantOnboardingStep.update({
      where: { tenantId },
      data: { completedAt: new Date() },
    }),
    prisma.tenant.update({
      where: { id: tenantId },
      data: { onboardingCompletedAt: new Date() },
    }),
  ])

  return updated
}

// Marks onboarding complete when every wizard step is either done or skipped.
async function maybeMarkComplete(
  tenantId: string,
  steps: Awaited<ReturnType<typeof prisma.tenantOnboardingStep.findUnique>> & object,
) {
  if (!steps || steps.completedAt) return

  const skipped = (steps.skippedSteps as string[] | null) ?? []

  const allResolved = WIZARD_STEPS.every(
    (key) => (steps as Record<string, unknown>)[key] === true || skipped.includes(key),
  )

  if (allResolved) {
    await prisma.$transaction([
      prisma.tenantOnboardingStep.update({
        where: { tenantId },
        data: { completedAt: new Date() },
      }),
      prisma.tenant.update({
        where: { id: tenantId },
        data: { onboardingCompletedAt: new Date() },
      }),
    ])
  }
}
