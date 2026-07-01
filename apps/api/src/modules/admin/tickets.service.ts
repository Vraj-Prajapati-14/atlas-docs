import { prisma } from '@atlas/db';
import { NotFoundError } from '../../shared/errors.js';

export interface TicketRow {
  id: string;
  tenantId: string;
  tenantName: string;
  raisedByType: string;
  category: string;
  priority: string;
  status: string;
  title: string;
  body: string;
  assignedTo: string | null;
  resolvedAt: Date | null;
  closedAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
  _count: { comments: number };
}

export interface TicketDetail {
  id: string;
  tenantId: string;
  tenantName: string;
  raisedByType: string;
  category: string;
  priority: string;
  status: string;
  title: string;
  body: string;
  assignedTo: string | null;
  resolvedAt: Date | null;
  closedAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
  comments: Array<{
    id: string;
    authorId: string;
    authorType: string;
    authorName: string;
    body: string;
    createdAt: Date;
  }>;
}

export async function listTickets(filter: {
  status?: string;
  priority?: string;
  category?: string;
  tenantId?: string;
  page?: number;
  limit?: number;
}): Promise<{ tickets: TicketRow[]; total: number; page: number; totalPages: number }> {
  const page = filter.page ?? 1;
  const limit = filter.limit ?? 20;
  const skip = (page - 1) * limit;

  const where: Record<string, unknown> = {};
  if (filter.status) where.status = filter.status;
  if (filter.priority) where.priority = filter.priority;
  if (filter.category) where.category = filter.category;
  if (filter.tenantId) where.tenantId = filter.tenantId;

  const [raw, total] = await Promise.all([
    prisma.supportTicket.findMany({
      where,
      skip,
      take: limit,
      orderBy: { createdAt: 'desc' },
      include: {
        tenant: { select: { name: true } },
        _count: { select: { comments: true } },
      },
    }),
    prisma.supportTicket.count({ where }),
  ]);

  const tickets: TicketRow[] = raw.map((t) => ({
    id: t.id,
    tenantId: t.tenantId,
    tenantName: t.tenant?.name ?? '',
    raisedByType: t.raisedByType,
    category: t.category,
    priority: t.priority,
    status: t.status,
    title: t.title,
    body: t.body,
    assignedTo: t.assignedTo ?? null,
    resolvedAt: t.resolvedAt ?? null,
    closedAt: t.closedAt ?? null,
    createdAt: t.createdAt,
    updatedAt: t.updatedAt,
    _count: { comments: t._count.comments },
  }));

  return {
    tickets,
    total,
    page,
    totalPages: Math.ceil(total / limit),
  };
}

export async function getTicketDetail(id: string): Promise<TicketDetail> {
  const ticket = await prisma.supportTicket.findUnique({
    where: { id },
    include: {
      tenant: { select: { name: true } },
      comments: {
        orderBy: { createdAt: 'asc' },
        select: {
          id: true,
          authorId: true,
          authorType: true,
          authorName: true,
          body: true,
          createdAt: true,
        },
      },
    },
  });

  if (!ticket) {
    throw new NotFoundError(`Ticket ${id} not found`);
  }

  return {
    id: ticket.id,
    tenantId: ticket.tenantId,
    tenantName: ticket.tenant?.name ?? '',
    raisedByType: ticket.raisedByType,
    category: ticket.category,
    priority: ticket.priority,
    status: ticket.status,
    title: ticket.title,
    body: ticket.body,
    assignedTo: ticket.assignedTo ?? null,
    resolvedAt: ticket.resolvedAt ?? null,
    closedAt: ticket.closedAt ?? null,
    createdAt: ticket.createdAt,
    updatedAt: ticket.updatedAt,
    comments: ticket.comments,
  };
}

export async function createTicket(data: {
  tenantId: string;
  raisedById: string;
  raisedByType: string;
  category: string;
  priority: string;
  title: string;
  body: string;
}) {
  return prisma.supportTicket.create({
    data: {
      tenantId: data.tenantId,
      raisedById: data.raisedById,
      raisedByType: data.raisedByType,
      category: data.category,
      priority: data.priority,
      title: data.title,
      body: data.body,
    },
    include: {
      tenant: { select: { name: true } },
      _count: { select: { comments: true } },
    },
  });
}

export async function updateTicket(
  id: string,
  data: {
    status?: string;
    priority?: string;
    assignedTo?: string;
    resolvedAt?: Date;
    closedAt?: Date;
  },
) {
  const existing = await prisma.supportTicket.findUnique({ where: { id } });
  if (!existing) {
    throw new NotFoundError(`Ticket ${id} not found`);
  }

  return prisma.supportTicket.update({
    where: { id },
    data: {
      ...(data.status !== undefined && { status: data.status }),
      ...(data.priority !== undefined && { priority: data.priority }),
      ...(data.assignedTo !== undefined && { assignedTo: data.assignedTo }),
      ...(data.resolvedAt !== undefined && { resolvedAt: data.resolvedAt }),
      ...(data.closedAt !== undefined && { closedAt: data.closedAt }),
    },
    include: {
      tenant: { select: { name: true } },
      _count: { select: { comments: true } },
    },
  });
}

export async function addComment(
  ticketId: string,
  data: {
    authorId: string;
    authorType: string;
    authorName: string;
    body: string;
  },
) {
  const ticket = await prisma.supportTicket.findUnique({ where: { id: ticketId } });
  if (!ticket) {
    throw new NotFoundError(`Ticket ${ticketId} not found`);
  }

  return prisma.ticketComment.create({
    data: {
      ticketId,
      authorId: data.authorId,
      authorType: data.authorType,
      authorName: data.authorName,
      body: data.body,
    },
  });
}
