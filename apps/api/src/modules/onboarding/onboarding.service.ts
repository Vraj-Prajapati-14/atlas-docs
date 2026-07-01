import { prisma } from '@atlas/db'
import { NotFoundError } from '../../shared/errors.js'

export async function getOnboardingSteps(tenantId: string) {
  const steps = await prisma.tenantOnboardingStep.findUnique({ where: { tenantId } })
  if (!steps) throw new NotFoundError('Onboarding', tenantId)

  const firstOrder = await prisma.order.findFirst({ where: { tenantId }, select: { id: true } })
  if (firstOrder && !steps.firstOrderDone) {
    await prisma.tenantOnboardingStep.update({
      where: { tenantId },
      data: { firstOrderDone: true },
    })
    steps.firstOrderDone = true
  }

  return steps
}

export interface UpdateStepsInput {
  restaurantProfileDone?: boolean
  outletDone?: boolean
  menuDone?: boolean
  tablesDone?: boolean
  staffDone?: boolean
  firstOrderDone?: boolean
}

export async function updateOnboardingSteps(tenantId: string, input: UpdateStepsInput) {
  const steps = await prisma.tenantOnboardingStep.update({
    where: { tenantId },
    data: input,
  })

  // Mark wizard complete when all steps done
  const allDone =
    steps.restaurantProfileDone &&
    steps.outletDone &&
    steps.menuDone &&
    steps.tablesDone &&
    steps.staffDone &&
    steps.firstOrderDone

  if (allDone && !steps.completedAt) {
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
    steps.completedAt = new Date()
  }

  return steps
}
