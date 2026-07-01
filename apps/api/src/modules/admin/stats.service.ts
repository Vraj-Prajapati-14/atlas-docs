import { prisma } from '@atlas/db'

// ─────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────

export interface DashboardStats {
  totalRestaurants: number
  active: number
  pendingActivation: number
  suspended: number
  activeToday: number
  newThisMonth: number
  totalOrders: number
  ordersToday: number
  mrr: number
  openTickets: number
  totalAdmins: number
}

export interface AnalyticsData {
  signupsByMonth: { month: string; count: number }[]
  revenueByMonth: { month: string; amount: number }[]
  ordersByDay: { date: string; count: number }[]
  statusBreakdown: { status: string; count: number }[]
  typeBreakdown: { type: string; count: number }[]
  topByOrders: { id: string; name: string; city: string; orders: number }[]
  topByRevenue: { id: string; name: string; city: string; revenue: number }[]
}

// ─────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────

const IST_OFFSET_MS = 5.5 * 60 * 60 * 1000

/** Returns the start-of-day in IST as a UTC Date */
function istStartOfDay(date: Date): Date {
  const istMs = date.getTime() + IST_OFFSET_MS
  const istDate = new Date(istMs)
  // zero out time portion in IST
  istDate.setUTCHours(0, 0, 0, 0)
  // convert back to UTC
  return new Date(istDate.getTime() - IST_OFFSET_MS)
}

/** Returns the start-of-month in IST as a UTC Date */
function istStartOfMonth(year: number, month: number): Date {
  // month is 0-indexed
  // midnight of the 1st in IST
  const istMidnight = Date.UTC(year, month, 1, 0, 0, 0, 0) - IST_OFFSET_MS
  return new Date(istMidnight)
}

/** Returns the end-of-month (exclusive start of next month) in IST as a UTC Date */
function istEndOfMonth(year: number, month: number): Date {
  // start of next month in IST
  const nextMonth = month === 11 ? 0 : month + 1
  const nextYear = month === 11 ? year + 1 : year
  return istStartOfMonth(nextYear, nextMonth)
}

/** Formats a JS Date as "YYYY-MM" using IST */
function toISTYearMonth(date: Date): string {
  const ist = new Date(date.getTime() + IST_OFFSET_MS)
  const y = ist.getUTCFullYear()
  const m = String(ist.getUTCMonth() + 1).padStart(2, '0')
  return `${y}-${m}`
}

/** Formats a JS Date as "YYYY-MM-DD" using IST */
function toISTDate(date: Date): string {
  const ist = new Date(date.getTime() + IST_OFFSET_MS)
  const y = ist.getUTCFullYear()
  const m = String(ist.getUTCMonth() + 1).padStart(2, '0')
  const d = String(ist.getUTCDate()).padStart(2, '0')
  return `${y}-${m}-${d}`
}

// ─────────────────────────────────────────────
// getDashboardStats
// ─────────────────────────────────────────────

export async function getDashboardStats(): Promise<DashboardStats> {
  const now = new Date()

  // IST today boundaries
  const todayStart = istStartOfDay(now)
  const tomorrowStart = new Date(todayStart.getTime() + 24 * 60 * 60 * 1000)

  // IST this-month boundaries
  const istNow = new Date(now.getTime() + IST_OFFSET_MS)
  const currentYear = istNow.getUTCFullYear()
  const currentMonth = istNow.getUTCMonth() // 0-indexed
  const monthStart = istStartOfMonth(currentYear, currentMonth)
  const monthEnd = istEndOfMonth(currentYear, currentMonth)

  const [
    totalRestaurants,
    active,
    pendingActivation,
    suspended,
    activeTodayResult,
    newThisMonth,
    totalOrders,
    ordersToday,
    mrrResult,
    openTickets,
    totalAdmins,
  ] = await Promise.all([
    // totalRestaurants — non-deleted tenants
    prisma.tenant.count({
      where: { deletedAt: null },
    }),

    // active — planStatus ACTIVE, non-deleted
    prisma.tenant.count({
      where: { deletedAt: null, planStatus: 'ACTIVE' },
    }),

    // pendingActivation — planStatus PENDING_PAYMENT
    prisma.tenant.count({
      where: { deletedAt: null, planStatus: 'PENDING_PAYMENT' },
    }),

    // suspended
    prisma.tenant.count({
      where: { deletedAt: null, planStatus: 'SUSPENDED' },
    }),

    // activeToday — distinct tenantIds with ≥1 order created today (IST)
    prisma.order.findMany({
      where: {
        createdAt: { gte: todayStart, lt: tomorrowStart },
      },
      select: { tenantId: true },
      distinct: ['tenantId'],
    }),

    // newThisMonth — tenants created this calendar month (IST)
    prisma.tenant.count({
      where: {
        deletedAt: null,
        createdAt: { gte: monthStart, lt: monthEnd },
      },
    }),

    // totalOrders
    prisma.order.count(),

    // ordersToday
    prisma.order.count({
      where: {
        createdAt: { gte: todayStart, lt: tomorrowStart },
      },
    }),

    // mrr — sum of SubscriptionPayment.amountPaise this month
    prisma.subscriptionPayment.aggregate({
      _sum: { amountPaise: true },
      where: {
        paidAt: { gte: monthStart, lt: monthEnd },
      },
    }),

    // openTickets
    prisma.supportTicket.count({
      where: { status: 'OPEN' },
    }),

    // totalAdmins
    prisma.superAdmin.count({
      where: { isActive: true },
    }),
  ])

  const mrrPaise = mrrResult._sum.amountPaise ?? BigInt(0)
  const mrr = Number(mrrPaise) / 100

  return {
    totalRestaurants,
    active,
    pendingActivation,
    suspended,
    activeToday: activeTodayResult.length,
    newThisMonth,
    totalOrders,
    ordersToday,
    mrr,
    openTickets,
    totalAdmins,
  }
}

// ─────────────────────────────────────────────
// getAnalytics
// ─────────────────────────────────────────────

export async function getAnalytics(): Promise<AnalyticsData> {
  const now = new Date()
  const istNow = new Date(now.getTime() + IST_OFFSET_MS)
  const currentYear = istNow.getUTCFullYear()
  const currentMonth = istNow.getUTCMonth() // 0-indexed

  // Build the last 12 months list (oldest first)
  const last12Months: Array<{ year: number; month: number; label: string }> = []
  for (let i = 11; i >= 0; i--) {
    let m = currentMonth - i
    let y = currentYear
    if (m < 0) {
      m += 12
      y -= 1
    }
    const label = `${y}-${String(m + 1).padStart(2, '0')}`
    last12Months.push({ year: y, month: m, label })
  }

  // 12-month window boundaries
  const window12Start = istStartOfMonth(last12Months[0]!.year, last12Months[0]!.month)
  const window12End = istEndOfMonth(currentYear, currentMonth)

  // Build last 30 days list (oldest first)
  const todayStart = istStartOfDay(now)
  const last30Days: Array<{ label: string; start: Date; end: Date }> = []
  for (let i = 29; i >= 0; i--) {
    const dayStart = new Date(todayStart.getTime() - i * 24 * 60 * 60 * 1000)
    const dayEnd = new Date(dayStart.getTime() + 24 * 60 * 60 * 1000)
    last30Days.push({ label: toISTDate(dayStart), start: dayStart, end: dayEnd })
  }
  const window30Start = last30Days[0]!.start
  const window30End = last30Days[last30Days.length - 1]!.end

  // Run all aggregation queries in parallel
  const [tenantRows, paymentRows, orderRows, statusRows, typeRows, topOrderRows, topRevenueRows] =
    await Promise.all([
      // Tenants created in last 12 months for signupsByMonth
      prisma.tenant.findMany({
        where: {
          deletedAt: null,
          createdAt: { gte: window12Start, lt: window12End },
        },
        select: { createdAt: true },
      }),

      // SubscriptionPayments in last 12 months for revenueByMonth
      prisma.subscriptionPayment.findMany({
        where: {
          paidAt: { gte: window12Start, lt: window12End },
        },
        select: { paidAt: true, amountPaise: true },
      }),

      // Orders in last 30 days for ordersByDay
      prisma.order.findMany({
        where: {
          createdAt: { gte: window30Start, lt: window30End },
        },
        select: { createdAt: true },
      }),

      // Status breakdown — groupBy on Tenant.planStatus
      prisma.tenant.groupBy({
        by: ['planStatus'],
        where: { deletedAt: null },
        _count: { _all: true },
      }),

      // Type breakdown — groupBy on Tenant.type
      prisma.tenant.groupBy({
        by: ['type'],
        where: { deletedAt: null },
        _count: { _all: true },
      }),

      // Top 10 tenants by order count
      prisma.tenant.findMany({
        where: { deletedAt: null },
        select: {
          id: true,
          name: true,
          city: true,
          _count: { select: { orders: true } },
        },
        orderBy: { orders: { _count: 'desc' } },
        take: 10,
      }),

      // Top 10 tenants by sum of bill grandTotalInPaise
      prisma.$queryRaw<Array<{ id: string; name: string; city: string; revenue: bigint }>>`
        SELECT t.id, t.name, t.city, COALESCE(SUM(b."grandTotalInPaise"), 0) AS revenue
        FROM tenants t
        LEFT JOIN bills b ON b."tenantId" = t.id AND b."voidedAt" IS NULL
        WHERE t."deletedAt" IS NULL
        GROUP BY t.id, t.name, t.city
        ORDER BY revenue DESC
        LIMIT 10
      `,
    ])

  // ── signupsByMonth ──
  const signupMap = new Map<string, number>()
  for (const tenant of tenantRows) {
    const key = toISTYearMonth(tenant.createdAt)
    signupMap.set(key, (signupMap.get(key) ?? 0) + 1)
  }
  const signupsByMonth = last12Months.map(({ label }) => ({
    month: label,
    count: signupMap.get(label) ?? 0,
  }))

  // ── revenueByMonth ──
  const revenueMap = new Map<string, number>()
  for (const payment of paymentRows) {
    const key = toISTYearMonth(payment.paidAt)
    revenueMap.set(key, (revenueMap.get(key) ?? 0) + Number(payment.amountPaise) / 100)
  }
  const revenueByMonth = last12Months.map(({ label }) => ({
    month: label,
    amount: revenueMap.get(label) ?? 0,
  }))

  // ── ordersByDay ──
  const ordersMap = new Map<string, number>()
  for (const order of orderRows) {
    const key = toISTDate(order.createdAt)
    ordersMap.set(key, (ordersMap.get(key) ?? 0) + 1)
  }
  const ordersByDay = last30Days.map(({ label }) => ({
    date: label,
    count: ordersMap.get(label) ?? 0,
  }))

  // ── statusBreakdown ──
  const statusBreakdown = statusRows.map((row) => ({
    status: row.planStatus,
    count: row._count._all,
  }))

  // ── typeBreakdown ──
  const typeBreakdown = typeRows.map((row) => ({
    type: row.type,
    count: row._count._all,
  }))

  // ── topByOrders ──
  const topByOrders = topOrderRows.map((row) => ({
    id: row.id,
    name: row.name,
    city: row.city,
    orders: row._count.orders,
  }))

  // ── topByRevenue ──
  const topByRevenue = topRevenueRows.map((row) => ({
    id: row.id,
    name: row.name,
    city: row.city,
    revenue: Number(row.revenue) / 100,
  }))

  return {
    signupsByMonth,
    revenueByMonth,
    ordersByDay,
    statusBreakdown,
    typeBreakdown,
    topByOrders,
    topByRevenue,
  }
}
