import { prisma, PlanType } from '@atlas/db';
import { NotFoundError } from '../../shared/errors.js';

export interface SubscriptionPaymentRow {
  id: string;
  tenantId: string;
  tenantName: string;
  amountPaise: bigint;
  planType: PlanType;
  paymentMethod: string;
  paidAt: Date;
  notes: string | null;
  createdAt: Date;
}

export interface PlatformCostRow {
  id: string;
  month: number;
  category: string;
  description: string;
  amountPaise: bigint;
  adminId: string;
  createdAt: Date;
}

// ---------------------------------------------------------------------------
// Payments
// ---------------------------------------------------------------------------

export async function listPayments(filter: {
  tenantId?: string;
  month?: number;
  page?: number;
  limit?: number;
}): Promise<{
  payments: SubscriptionPaymentRow[];
  total: number;
  page: number;
  totalPages: number;
  summary: { totalPaise: bigint; count: number };
}> {
  const page = filter.page ?? 1;
  const limit = filter.limit ?? 20;
  const skip = (page - 1) * limit;

  const where: Record<string, unknown> = {};

  if (filter.tenantId) {
    where['tenantId'] = filter.tenantId;
  }

  if (filter.month) {
    const year = Math.floor(filter.month / 100);
    const month = filter.month % 100;
    const start = new Date(year, month - 1, 1);
    const end = new Date(year, month, 1);
    where['paidAt'] = { gte: start, lt: end };
  }

  const [rows, total] = await Promise.all([
    prisma.subscriptionPayment.findMany({
      where,
      skip,
      take: limit,
      orderBy: { paidAt: 'desc' },
      include: {
        tenant: {
          select: { name: true },
        },
      },
    }),
    prisma.subscriptionPayment.count({ where }),
  ]);

  const aggregate = await prisma.subscriptionPayment.aggregate({
    where,
    _sum: { amountPaise: true },
    _count: { id: true },
  });

  const payments: SubscriptionPaymentRow[] = rows.map((r) => ({
    id: r.id,
    tenantId: r.tenantId,
    tenantName: r.tenant.name,
    amountPaise: r.amountPaise,
    planType: r.planType,
    paymentMethod: r.paymentMethod,
    paidAt: r.paidAt,
    notes: r.notes ?? null,
    createdAt: r.createdAt,
  }));

  return {
    payments,
    total,
    page,
    totalPages: Math.ceil(total / limit),
    summary: {
      totalPaise: aggregate._sum.amountPaise ?? BigInt(0),
      count: aggregate._count.id,
    },
  };
}

export async function recordPayment(data: {
  tenantId: string;
  adminId: string;
  amountPaise: bigint;
  planType: PlanType;
  paymentMethod: string;
  paidAt: Date;
  notes?: string;
}): Promise<SubscriptionPaymentRow> {
  const tenant = await prisma.tenant.findUnique({
    where: { id: data.tenantId },
    select: { id: true, name: true },
  });

  if (!tenant) {
    throw new NotFoundError(`Tenant ${data.tenantId} not found`);
  }

  const [payment] = await prisma.$transaction([
    prisma.subscriptionPayment.create({
      data: {
        tenantId: data.tenantId,
        adminId: data.adminId,
        amountPaise: data.amountPaise,
        planType: data.planType,
        paymentMethod: data.paymentMethod,
        paidAt: data.paidAt,
        notes: data.notes ?? null,
      },
    }),
    prisma.tenant.update({
      where: { id: data.tenantId },
      data: { planStatus: 'ACTIVE' },
    }),
  ]);

  return {
    id: payment.id,
    tenantId: payment.tenantId,
    tenantName: tenant.name,
    amountPaise: payment.amountPaise,
    planType: payment.planType,
    paymentMethod: payment.paymentMethod,
    paidAt: payment.paidAt,
    notes: payment.notes ?? null,
    createdAt: payment.createdAt,
  };
}

export async function deletePayment(id: string): Promise<{ id: string }> {
  const existing = await prisma.subscriptionPayment.findUnique({
    where: { id },
    select: { id: true },
  });

  if (!existing) {
    throw new NotFoundError(`SubscriptionPayment ${id} not found`);
  }

  await prisma.subscriptionPayment.delete({ where: { id } });

  return { id };
}

// ---------------------------------------------------------------------------
// Platform Costs
// ---------------------------------------------------------------------------

export async function listCosts(filter: {
  month?: number;
  category?: string;
  page?: number;
  limit?: number;
}): Promise<{
  costs: PlatformCostRow[];
  total: number;
  page: number;
  totalPages: number;
  summary: { totalPaise: bigint };
}> {
  const page = filter.page ?? 1;
  const limit = filter.limit ?? 20;
  const skip = (page - 1) * limit;

  const where: Record<string, unknown> = {};

  if (filter.month !== undefined) {
    where['month'] = filter.month;
  }

  if (filter.category) {
    where['category'] = filter.category;
  }

  const [rows, total] = await Promise.all([
    prisma.platformCost.findMany({
      where,
      skip,
      take: limit,
      orderBy: { createdAt: 'desc' },
    }),
    prisma.platformCost.count({ where }),
  ]);

  const aggregate = await prisma.platformCost.aggregate({
    where,
    _sum: { amountPaise: true },
  });

  const costs: PlatformCostRow[] = rows.map((r) => ({
    id: r.id,
    month: r.month,
    category: r.category,
    description: r.description,
    amountPaise: r.amountPaise,
    adminId: r.adminId,
    createdAt: r.createdAt,
  }));

  return {
    costs,
    total,
    page,
    totalPages: Math.ceil(total / limit),
    summary: {
      totalPaise: aggregate._sum.amountPaise ?? BigInt(0),
    },
  };
}

export async function recordCost(data: {
  month: number;
  category: string;
  description: string;
  amountPaise: bigint;
  adminId: string;
}): Promise<PlatformCostRow> {
  const cost = await prisma.platformCost.create({
    data: {
      month: data.month,
      category: data.category,
      description: data.description,
      amountPaise: data.amountPaise,
      adminId: data.adminId,
    },
  });

  return {
    id: cost.id,
    month: cost.month,
    category: cost.category,
    description: cost.description,
    amountPaise: cost.amountPaise,
    adminId: cost.adminId,
    createdAt: cost.createdAt,
  };
}

export async function deleteCost(id: string): Promise<{ id: string }> {
  const existing = await prisma.platformCost.findUnique({
    where: { id },
    select: { id: true },
  });

  if (!existing) {
    throw new NotFoundError(`PlatformCost ${id} not found`);
  }

  await prisma.platformCost.delete({ where: { id } });

  return { id };
}
