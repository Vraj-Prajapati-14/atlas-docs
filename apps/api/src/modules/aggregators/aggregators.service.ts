import { createHmac, timingSafeEqual } from 'crypto'
import { prisma } from '@atlas/db'
import { AggregatorPlatform, AggregatorOrderStatus } from '@atlas/types'
import { BadRequestError, ConflictError, NotFoundError, UnauthorizedError } from '../../shared/errors.js'
import { buildPagination } from '../../shared/response.js'
import type {
  CreateCredentialInput,
  UpdateCredentialInput,
  ListAggregatorOrdersInput,
  CancelOrderInput,
  NormalizedAggregatorOrder,
} from './aggregators.schema.js'

// ─── Credentials ─────────────────────────────────────────────────────────────

export async function listCredentials(tenantId: string) {
  const creds = await prisma.aggregatorCredential.findMany({
    where: { tenantId },
    orderBy: [{ platform: 'asc' }, { createdAt: 'asc' }],
  })
  // Redact sensitive keys from the response
  return creds.map(({ apiKey: _k, secretKey: _s, ...rest }) => ({
    ...rest,
    apiKeyMasked: '***',
  }))
}

export async function createCredential(tenantId: string, data: CreateCredentialInput) {
  const existing = await prisma.aggregatorCredential.findFirst({
    where: { tenantId, platform: data.platform, outletId: data.outletId },
  })
  if (existing) {
    throw new ConflictError(`Credential for ${data.platform} already exists for this outlet`)
  }

  const { apiKey, secretKey, restaurantId, ...rest } = data

  const cred = await prisma.aggregatorCredential.create({
    data: {
      tenantId,
      platform: rest.platform,
      outletId: rest.outletId,
      apiKey,
      secretKey: secretKey ?? null,
      restaurantId,
      isActive: true,
    },
  })

  const { apiKey: _k, secretKey: _s, ...safe } = cred
  return { ...safe, apiKeyMasked: '***' }
}

export async function updateCredential(tenantId: string, id: string, data: UpdateCredentialInput) {
  const existing = await prisma.aggregatorCredential.findFirst({ where: { id, tenantId } })
  if (!existing) throw new NotFoundError('AggregatorCredential', id)

  const updated = await prisma.aggregatorCredential.update({
    where: { id },
    data,
  })

  const { apiKey: _k, secretKey: _s, ...safe } = updated
  return { ...safe, apiKeyMasked: '***' }
}

export async function deleteCredential(tenantId: string, id: string) {
  const existing = await prisma.aggregatorCredential.findFirst({ where: { id, tenantId } })
  if (!existing) throw new NotFoundError('AggregatorCredential', id)

  await prisma.aggregatorCredential.delete({ where: { id } })
  return { deleted: true }
}

// ─── Webhook payload parsers ──────────────────────────────────────────────────

function rupeeToP(amount: number): number {
  return Math.round(amount * 100)
}

function parseZomatoPayload(raw: unknown): NormalizedAggregatorOrder {
  const p = raw as {
    order_id?: string
    id?: string
    customer?: { name?: string; phone?: string; mobile?: string }
    delivery_address?: { address?: string; full_address?: string }
    items?: Array<{ name?: string; title?: string; quantity?: number; price?: number; unit_price?: number }>
    order_total?: number
    total_amount?: number
    delivery_charges?: number
    platform_charges?: number
    packaging_charges?: number
  }

  const platformOrderId = String(p.order_id ?? p.id ?? '')
  const rawItems = p.items ?? []
  const items = rawItems.map((i) => ({
    name: String(i.name ?? i.title ?? 'Item'),
    quantity: Number(i.quantity ?? 1),
    unitPriceInPaise: rupeeToP(Number(i.unit_price ?? i.price ?? 0)),
  }))
  const itemsTotal = items.reduce((s, i) => s + i.unitPriceInPaise * i.quantity, 0)
  const grandTotal = rupeeToP(Number(p.order_total ?? p.total_amount ?? 0)) || itemsTotal

  return {
    platformOrderId,
    customerName: p.customer?.name,
    customerPhone: p.customer?.phone ?? p.customer?.mobile,
    deliveryAddress: p.delivery_address?.full_address ?? p.delivery_address?.address,
    items,
    itemsTotalInPaise: itemsTotal,
    deliveryFeeInPaise: rupeeToP(Number(p.delivery_charges ?? 0)),
    platformFeeInPaise: rupeeToP(Number(p.platform_charges ?? 0)) + rupeeToP(Number(p.packaging_charges ?? 0)),
    grandTotalInPaise: grandTotal,
  }
}

function parseSwiggyPayload(raw: unknown): NormalizedAggregatorOrder {
  const p = raw as {
    order_id?: string
    orderId?: string
    customer_name?: string
    customer_mobile?: string
    delivery_address?: string
    order_items?: Array<{ item_name?: string; name?: string; quantity?: string | number; item_total?: number; price?: number }>
    order_total?: number
    delivery_fee?: number
    commission_percent?: number
  }

  const platformOrderId = String(p.order_id ?? p.orderId ?? '')
  const rawItems = p.order_items ?? []
  const items = rawItems.map((i) => {
    const qty = Number(i.quantity ?? 1)
    const total = rupeeToP(Number(i.item_total ?? i.price ?? 0))
    return {
      name: String(i.item_name ?? i.name ?? 'Item'),
      quantity: qty,
      unitPriceInPaise: qty > 0 ? Math.round(total / qty) : total,
    }
  })
  const itemsTotal = items.reduce((s, i) => s + i.unitPriceInPaise * i.quantity, 0)
  const grandTotal = rupeeToP(Number(p.order_total ?? 0)) || itemsTotal

  return {
    platformOrderId,
    customerName: p.customer_name,
    customerPhone: p.customer_mobile,
    deliveryAddress: p.delivery_address,
    items,
    itemsTotalInPaise: itemsTotal,
    deliveryFeeInPaise: rupeeToP(Number(p.delivery_fee ?? 0)),
    platformFeeInPaise: 0,
    grandTotalInPaise: grandTotal,
  }
}

function parseGenericPayload(raw: unknown): NormalizedAggregatorOrder {
  // Fallback: try common field names
  const p = raw as Record<string, unknown>
  return {
    platformOrderId: String(p['order_id'] ?? p['id'] ?? p['orderId'] ?? Date.now()),
    customerName: (p['customer_name'] as string | undefined) ?? (p['customerName'] as string | undefined),
    customerPhone: (p['customer_phone'] as string | undefined) ?? (p['customerPhone'] as string | undefined),
    deliveryAddress: (p['delivery_address'] as string | undefined),
    items: [],
    itemsTotalInPaise: 0,
    deliveryFeeInPaise: 0,
    platformFeeInPaise: 0,
    grandTotalInPaise: 0,
  }
}

function normalizePayload(platform: AggregatorPlatform | string, raw: unknown): NormalizedAggregatorOrder {
  if (platform === AggregatorPlatform.ZOMATO) return parseZomatoPayload(raw)
  if (platform === AggregatorPlatform.SWIGGY) return parseSwiggyPayload(raw)
  return parseGenericPayload(raw)
}

// ─── Signature verification ───────────────────────────────────────────────────

export function verifyHmacSignature(body: string, signature: string, secret: string): boolean {
  try {
    const expected = createHmac('sha256', secret).update(body, 'utf8').digest('hex')
    const sigBuf = Buffer.from(signature.replace(/^sha256=/, ''), 'hex')
    const expBuf = Buffer.from(expected, 'hex')
    if (sigBuf.length !== expBuf.length) return false
    return timingSafeEqual(sigBuf, expBuf)
  } catch {
    return false
  }
}

// ─── Webhook processing ───────────────────────────────────────────────────────

export async function processWebhook(
  platform: AggregatorPlatform,
  restaurantId: string,
  rawBody: string,
  signature: string | undefined,
) {
  // Find credential by platform + restaurantId (tenant is derived from credential)
  const credential = await prisma.aggregatorCredential.findFirst({
    where: { platform, restaurantId, isActive: true },
  })
  if (!credential) throw new NotFoundError('AggregatorCredential', `${platform}:${restaurantId}`)

  // Verify HMAC if secret is configured
  if (credential.secretKey && signature) {
    if (!verifyHmacSignature(rawBody, signature, credential.secretKey)) {
      throw new UnauthorizedError('Invalid webhook signature')
    }
  } else if (credential.secretKey && !signature) {
    throw new UnauthorizedError('Missing webhook signature')
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const rawPayload = JSON.parse(rawBody) as any

  // Verify API key if present in payload (some platforms include it)
  const order = normalizePayload(platform, rawPayload)

  // Upsert: use platform + platformOrderId as idempotency key
  const existing = await prisma.aggregatorOrder.findFirst({
    where: { platform, platformOrderId: order.platformOrderId },
  })

  if (existing) {
    // Already processed — idempotent response
    return { received: true, orderId: existing.id, duplicate: true }
  }

  const created = await prisma.$transaction(async (tx) => {
    const agg = await tx.aggregatorOrder.create({
      data: {
        tenantId: credential.tenantId,
        credentialId: credential.id,
        platform,
        platformOrderId: order.platformOrderId,
        status: AggregatorOrderStatus.NEW,
        customerName: order.customerName ?? null,
        customerPhone: order.customerPhone ?? null,
        deliveryAddress: order.deliveryAddress ?? null,
        itemsTotalInPaise: BigInt(order.itemsTotalInPaise),
        deliveryFeeInPaise: BigInt(order.deliveryFeeInPaise),
        platformFeeInPaise: BigInt(order.platformFeeInPaise),
        grandTotalInPaise: BigInt(order.grandTotalInPaise),
        rawPayload,
        items: {
          create: order.items.map((item) => ({
            name: item.name,
            quantity: item.quantity,
            unitPriceInPaise: BigInt(item.unitPriceInPaise),
            totalInPaise: BigInt(item.unitPriceInPaise * item.quantity),
          })),
        },
      },
    })
    return agg
  })

  return { received: true, orderId: created.id, duplicate: false }
}

// ─── Order management ─────────────────────────────────────────────────────────

const AGG_ORDER_INCLUDE = {
  items: true,
  credential: { select: { platform: true, outletId: true } },
} as const

export async function listAggregatorOrders(tenantId: string, query: ListAggregatorOrdersInput) {
  const { platform, status, page, limit } = query
  const skip = (page - 1) * limit

  const where = {
    tenantId,
    ...(platform ? { platform } : {}),
    ...(status ? { status } : {}),
  }

  const [orders, total] = await Promise.all([
    prisma.aggregatorOrder.findMany({
      where,
      include: AGG_ORDER_INCLUDE,
      orderBy: { createdAt: 'desc' },
      skip,
      take: limit,
    }),
    prisma.aggregatorOrder.count({ where }),
  ])

  return { orders, pagination: buildPagination(page, limit, total) }
}

export async function getAggregatorOrder(tenantId: string, id: string) {
  const order = await prisma.aggregatorOrder.findFirst({
    where: { id, tenantId },
    include: AGG_ORDER_INCLUDE,
  })
  if (!order) throw new NotFoundError('AggregatorOrder', id)
  return order
}

export async function acceptOrder(tenantId: string, id: string) {
  const order = await prisma.aggregatorOrder.findFirst({ where: { id, tenantId } })
  if (!order) throw new NotFoundError('AggregatorOrder', id)
  if (order.status !== AggregatorOrderStatus.NEW) {
    throw new BadRequestError(`Cannot accept order — current status is ${order.status}`)
  }

  return prisma.aggregatorOrder.update({
    where: { id },
    data: { status: AggregatorOrderStatus.ACCEPTED, acceptedAt: new Date() },
    include: AGG_ORDER_INCLUDE,
  })
}

export async function dispatchOrder(tenantId: string, id: string) {
  const order = await prisma.aggregatorOrder.findFirst({ where: { id, tenantId } })
  if (!order) throw new NotFoundError('AggregatorOrder', id)
  if (order.status !== AggregatorOrderStatus.ACCEPTED) {
    throw new BadRequestError(`Cannot dispatch order — current status is ${order.status}`)
  }

  return prisma.aggregatorOrder.update({
    where: { id },
    data: { status: AggregatorOrderStatus.DISPATCHED, dispatchedAt: new Date() },
    include: AGG_ORDER_INCLUDE,
  })
}

export async function deliverOrder(tenantId: string, id: string) {
  const order = await prisma.aggregatorOrder.findFirst({ where: { id, tenantId } })
  if (!order) throw new NotFoundError('AggregatorOrder', id)
  if (order.status !== AggregatorOrderStatus.DISPATCHED) {
    throw new BadRequestError(`Cannot mark order delivered — current status is ${order.status}`)
  }

  return prisma.aggregatorOrder.update({
    where: { id },
    data: { status: AggregatorOrderStatus.DELIVERED, deliveredAt: new Date() },
    include: AGG_ORDER_INCLUDE,
  })
}

export async function cancelAggregatorOrder(tenantId: string, id: string, data: CancelOrderInput) {
  const order = await prisma.aggregatorOrder.findFirst({ where: { id, tenantId } })
  if (!order) throw new NotFoundError('AggregatorOrder', id)

  const terminalStatuses: string[] = [
    AggregatorOrderStatus.DELIVERED,
    AggregatorOrderStatus.CANCELLED,
  ]
  if (terminalStatuses.includes(order.status)) {
    throw new BadRequestError(`Order is already ${order.status}`)
  }

  // Log cancel reason to audit trail
  await prisma.auditLog.create({
    data: {
      tenantId,
      action: 'AGGREGATOR_ORDER_CANCEL',
      entityType: 'AggregatorOrder',
      entityId: id,
      newValues: { reason: data.reason, platform: order.platform, platformOrderId: order.platformOrderId },
    },
  })

  return prisma.aggregatorOrder.update({
    where: { id },
    data: { status: AggregatorOrderStatus.CANCELLED, cancelledAt: new Date() },
    include: AGG_ORDER_INCLUDE,
  })
}
