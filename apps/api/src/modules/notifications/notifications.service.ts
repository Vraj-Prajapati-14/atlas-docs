import { prisma } from '@atlas/db'
import { NotificationChannel } from '@atlas/types'
import { sendWhatsAppMessage } from '../../shared/whatsapp.js'
import { computeDailySummary } from '../reports/reports.service.js'

// ─── Helper ───────────────────────────────────────────────────────────────────

async function dispatchWhatsApp(
  tenantId: string,
  phone: string,
  type: string,
  title: string,
  body: string,
  userId?: string,
) {
  const notification = await prisma.notification.create({
    data: { tenantId, userId: userId ?? null, channel: NotificationChannel.WHATSAPP, type, title, body },
  })

  const result = await sendWhatsAppMessage(phone, body)

  await prisma.notification.update({
    where: { id: notification.id },
    data: result.success
      ? { sentAt: new Date() }
      : { failedAt: new Date(), error: result.error ?? 'Unknown error' },
  })

  return { notificationId: notification.id, success: result.success }
}

// ─── Bill Receipt ─────────────────────────────────────────────────────────────

export async function sendBillReceipt(tenantId: string, billId: string) {
  const bill = await prisma.bill.findFirst({
    where: { id: billId, tenantId },
    include: {
      order: { select: { orderNumber: true } },
    },
  })
  if (!bill || !bill.customerPhone) return null

  const tenant = await prisma.tenant.findUnique({
    where: { id: tenantId },
    select: { name: true },
  })

  const amount = `₹${Math.round(Number(bill.grandTotalInPaise) / 100)}`
  const greeting = bill.customerName ? `Hi ${bill.customerName},` : 'Hi,'

  const body = [
    greeting,
    `Thank you for dining at ${tenant?.name ?? 'our restaurant'}!`,
    '',
    `Bill: ${bill.billNumber}`,
    `Order: ${bill.order.orderNumber}`,
    `Amount Paid: ${amount}`,
    '',
    'We look forward to serving you again!',
  ].join('\n')

  return dispatchWhatsApp(
    tenantId,
    bill.customerPhone,
    'BILL_RECEIPT',
    `Receipt - ${bill.billNumber}`,
    body,
  )
}

// ─── Nightly Summary ──────────────────────────────────────────────────────────

export async function sendNightlySummary(tenantId: string) {
  const settings = await prisma.tenantSettings.findUnique({
    where: { tenantId },
    select: { nightlySummaryPhone: true },
  })
  if (!settings?.nightlySummaryPhone) {
    return { skipped: true, reason: 'nightlySummaryPhone not configured' }
  }

  const tenant = await prisma.tenant.findUnique({
    where: { id: tenantId },
    select: { name: true },
  })

  // Use yesterday's date so summary is complete
  const yesterday = new Date()
  yesterday.setUTCDate(yesterday.getUTCDate() - 1)
  const dateStr = yesterday.toISOString().slice(0, 10)

  const summary = await computeDailySummary(tenantId, { date: dateStr })

  const revenue = `₹${Math.round(summary.grossRevenueInPaise / 100)}`
  const avgCheck = `₹${Math.round(summary.avgCheckInPaise / 100)}`
  const topItem = summary.topItems[0]?.name ?? 'N/A'

  const body = [
    `📊 Daily Summary — ${dateStr}`,
    `${tenant?.name ?? 'Restaurant'}`,
    '',
    `Orders: ${summary.totalOrders} total, ${summary.paidOrders} paid, ${summary.cancelledOrders} cancelled`,
    `Revenue: ${revenue}`,
    `Avg Check: ${avgCheck}`,
    `Top Seller: ${topItem}`,
    '',
    `Tax: CGST ₹${Math.round(summary.tax.cgstInPaise / 100)} + SGST ₹${Math.round(summary.tax.sgstInPaise / 100)}`,
  ].join('\n')

  return dispatchWhatsApp(
    tenantId,
    settings.nightlySummaryPhone,
    'NIGHTLY_SUMMARY',
    `Daily Summary ${dateStr}`,
    body,
  )
}

// ─── Low Stock Alert ──────────────────────────────────────────────────────────

export async function sendLowStockAlert(tenantId: string, inventoryItemId: string) {
  const item = await prisma.inventoryItem.findFirst({
    where: { id: inventoryItemId, tenantId },
  })
  if (!item) return null

  const currentQty = item.currentStock.toNumber()
  const threshold = item.lowStockThreshold.toNumber()
  if (currentQty > threshold) return null // not actually low stock

  const settings = await prisma.tenantSettings.findUnique({
    where: { tenantId },
    select: { nightlySummaryPhone: true }, // reuse same phone for ops alerts
  })
  if (!settings?.nightlySummaryPhone) return null

  const body = [
    `⚠️ Low Stock Alert`,
    '',
    `Item: ${item.name}`,
    `Current Stock: ${currentQty} ${item.unit}`,
    `Reorder Level: ${threshold} ${item.unit}`,
    '',
    'Please restock soon.',
  ].join('\n')

  return dispatchWhatsApp(
    tenantId,
    settings.nightlySummaryPhone,
    'LOW_STOCK_ALERT',
    `Low Stock: ${item.name}`,
    body,
  )
}

// ─── List Notifications ───────────────────────────────────────────────────────

export async function listNotifications(
  tenantId: string,
  query: { type?: string; channel?: NotificationChannel; page: number; limit: number },
) {
  const { type, channel, page, limit } = query
  const skip = (page - 1) * limit

  const where = {
    tenantId,
    ...(type ? { type } : {}),
    ...(channel ? { channel } : {}),
  }

  const [notifications, total] = await Promise.all([
    prisma.notification.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      skip,
      take: limit,
    }),
    prisma.notification.count({ where }),
  ])

  return { notifications, total, page, limit, totalPages: Math.ceil(total / limit) }
}
