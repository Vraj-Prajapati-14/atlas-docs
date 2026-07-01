'use client'

import { useState, useCallback } from 'react'
import { useQuery } from '@tanstack/react-query'
import {
  Building2,
  Activity,
  IndianRupee,
  MessageCircle,
  TrendingUp,
  ShoppingBag,
  Clock,
  Ban,
  RefreshCw,
} from 'lucide-react'
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  AreaChart,
  Area,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
} from 'recharts'
import { adminFetch } from '@/lib/admin-api'
import { Button } from '@/components/ui/button'
import { Spinner } from '@/components/ui/spinner'
import { cn } from '@/lib/utils'

// ─── Types ─────────────────────────────────────────────────────────────────────

interface AdminStats {
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

interface MonthPoint {
  month: string
  count: number
}

interface RevenuePoint {
  month: string
  amount: number
}

interface DayPoint {
  date: string
  orders: number
}

interface StatusBreakdown {
  label: string
  value: number
}

interface TopRestaurant {
  name: string
  orders: number
}

interface AdminAnalytics {
  signupsByMonth: MonthPoint[]
  revenueByMonth: RevenuePoint[]
  ordersByDay: DayPoint[]
  statusBreakdown: StatusBreakdown[]
  typeBreakdown: StatusBreakdown[]
  topByOrders: TopRestaurant[]
  topByRevenue: { name: string; revenue: number }[]
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function fmtINR(paise: number): string {
  return `₹${(paise / 100).toLocaleString('en-IN', { maximumFractionDigits: 0 })}`
}

function fmtShort(n: number): string {
  if (n >= 10_000_000) return `₹${(n / 10_000_000).toFixed(1)}Cr`
  if (n >= 100_000) return `₹${(n / 100_000).toFixed(1)}L`
  if (n >= 1_000) return `₹${(n / 1_000).toFixed(1)}K`
  return `₹${n}`
}

// ─── Chart theme constants ─────────────────────────────────────────────────────

const CHART_GRID   = '#252D45'
const CHART_TEXT   = '#9ca3af'
const CHART_ORANGE = '#FF6B35'
const TOOLTIP_STYLE = {
  backgroundColor: '#1f2937',
  border: '1px solid #374151',
  borderRadius: '8px',
  color: '#ffffff',
  fontSize: '12px',
}
const PIE_COLORS = ['#FF6B35', '#22C55E', '#F59E0B', '#3B82F6', '#a855f7']

// ─── Skeleton ─────────────────────────────────────────────────────────────────

function Skeleton({ className }: { className?: string }) {
  return (
    <div
      className={cn('rounded bg-white/5 animate-pulse', className)}
      aria-hidden="true"
    />
  )
}

// ─── Stat card ────────────────────────────────────────────────────────────────

interface StatCardProps {
  label: string
  value: string | number
  icon: React.ElementType
  iconColor: string
  accentClass: string
  sub?: string
  loading?: boolean
}

function StatCard({ label, value, icon: Icon, iconColor, accentClass, sub, loading }: StatCardProps) {
  return (
    <div className="rounded-xl border border-border bg-background-card p-5 flex flex-col gap-3 hover:border-white/10 transition-colors">
      <div className="flex items-center justify-between">
        <p className="text-[11px] font-semibold uppercase tracking-widest text-muted-foreground">
          {label}
        </p>
        <div className={cn('w-8 h-8 rounded-lg flex items-center justify-center', accentClass)}>
          <Icon size={15} className={iconColor} />
        </div>
      </div>
      {loading ? (
        <div className="space-y-2">
          <Skeleton className="h-8 w-24" />
          <Skeleton className="h-3 w-32" />
        </div>
      ) : (
        <div>
          <p className="text-2xl font-bold text-foreground tabular-nums leading-none">{value}</p>
          {sub && <p className="text-xs text-muted-foreground mt-1.5">{sub}</p>}
        </div>
      )}
    </div>
  )
}

// ─── Chart card wrapper ───────────────────────────────────────────────────────

function ChartCard({
  title,
  children,
  loading,
  className,
}: {
  title: string
  children: React.ReactNode
  loading?: boolean
  className?: string
}) {
  return (
    <div className={cn('rounded-xl border border-border bg-background-card p-5', className)}>
      <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-4">{title}</p>
      {loading ? (
        <div className="flex items-end gap-2 h-48">
          {Array.from({ length: 12 }).map((_, i) => (
            <div
              key={i}
              className="flex-1 rounded-sm bg-border animate-pulse"
              style={{ height: `${40 + (i * 17 % 60)}%` }}
            />
          ))}
        </div>
      ) : (
        children
      )}
    </div>
  )
}

// ─── Custom tooltip ───────────────────────────────────────────────────────────

function ChartTooltip({
  active,
  payload,
  label,
  formatter,
}: {
  active?: boolean
  payload?: { value: number; name?: string }[]
  label?: string
  formatter?: (v: number) => string
}) {
  if (!active || !payload?.length) return null
  return (
    <div style={TOOLTIP_STYLE} className="px-3 py-2">
      <p className="text-gray-400 text-[11px] mb-1">{label}</p>
      {payload.map((p, i) => (
        <p key={i} className="font-semibold text-white text-sm">
          {formatter ? formatter(p.value) : p.value.toLocaleString('en-IN')}
        </p>
      ))}
    </div>
  )
}

// ─── Top restaurants list ─────────────────────────────────────────────────────

function TopRestaurantsList({ data, loading }: { data?: TopRestaurant[]; loading?: boolean }) {
  if (loading) {
    return (
      <div className="space-y-3">
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="flex items-center gap-3">
            <Skeleton className="h-4 w-4 rounded-sm" />
            <Skeleton className="h-4 flex-1" />
            <Skeleton className="h-4 w-12" />
          </div>
        ))}
      </div>
    )
  }

  if (!data?.length) {
    return <p className="text-xs text-muted-foreground text-center py-8">No data yet.</p>
  }

  const max = Math.max(...data.map((d) => d.orders), 1)

  return (
    <div className="space-y-3">
      {data.slice(0, 5).map((r, i) => {
        const pct = Math.round((r.orders / max) * 100)
        return (
          <div key={r.name} className="flex items-center gap-3">
            <span className="text-[11px] font-bold text-muted-foreground/50 w-4 tabular-nums text-right shrink-0">
              {i + 1}
            </span>
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between mb-1">
                <span className="text-xs font-medium text-foreground truncate pr-2">{r.name}</span>
                <span className="text-xs tabular-nums text-muted-foreground shrink-0">
                  {r.orders.toLocaleString('en-IN')}
                </span>
              </div>
              <div className="h-1 bg-white/5 rounded-full overflow-hidden">
                <div
                  className="h-full bg-primary-500 rounded-full transition-all"
                  style={{ width: `${pct}%` }}
                />
              </div>
            </div>
          </div>
        )
      })}
    </div>
  )
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function AdminDashboardPage() {
  const [refreshKey, setRefreshKey] = useState(0)
  const [lastUpdated] = useState(() => new Date())

  const refresh = useCallback(() => {
    setRefreshKey((k) => k + 1)
  }, [])

  const {
    data: stats,
    isLoading: statsLoading,
    isFetching: statsFetching,
  } = useQuery<AdminStats>({
    queryKey: ['admin-stats', refreshKey],
    queryFn: () => adminFetch<AdminStats>('/api/v1/admin/stats'),
    staleTime: 60_000,
  })

  const {
    data: analytics,
    isLoading: analyticsLoading,
    isFetching: analyticsFetching,
  } = useQuery<AdminAnalytics>({
    queryKey: ['admin-analytics', refreshKey],
    queryFn: () => adminFetch<AdminAnalytics>('/api/v1/admin/analytics'),
    staleTime: 60_000,
  })

  const isFetching = statsFetching || analyticsFetching

  return (
    <div className="p-6 space-y-6 max-w-[1400px]">
      {/* ── Page header ───────────────────────────────────────────────────── */}
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-foreground">Dashboard</h1>
          <p className="text-xs text-muted-foreground mt-0.5">
            Last updated:{' '}
            {lastUpdated.toLocaleTimeString('en-IN', {
              hour: '2-digit',
              minute: '2-digit',
            })}
          </p>
        </div>
        <Button
          variant="secondary"
          size="sm"
          onClick={refresh}
          disabled={isFetching}
          className="gap-2 shrink-0"
        >
          {isFetching ? (
            <Spinner size="xs" />
          ) : (
            <RefreshCw size={13} />
          )}
          Refresh
        </Button>
      </div>

      {/* ── Stats grid ────────────────────────────────────────────────────── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          label="Total Restaurants"
          value={stats?.totalRestaurants ?? '—'}
          icon={Building2}
          iconColor="text-primary-500"
          accentClass="bg-primary-500/10"
          sub={stats ? `${stats.active} currently active` : undefined}
          loading={statsLoading}
        />
        <StatCard
          label="Active Today"
          value={stats?.activeToday ?? '—'}
          icon={Activity}
          iconColor="text-success"
          accentClass="bg-success/10"
          sub={stats ? `of ${stats.active} active accounts` : undefined}
          loading={statsLoading}
        />
        <StatCard
          label="Monthly Revenue"
          value={stats ? fmtINR(stats.mrr) : '—'}
          icon={IndianRupee}
          iconColor="text-primary-500"
          accentClass="bg-primary-500/10"
          sub="MRR across all tenants"
          loading={statsLoading}
        />
        <StatCard
          label="Open Tickets"
          value={stats?.openTickets ?? '—'}
          icon={MessageCircle}
          iconColor={stats && stats.openTickets > 0 ? 'text-warning' : 'text-muted-foreground'}
          accentClass={stats && stats.openTickets > 0 ? 'bg-warning/10' : 'bg-white/5'}
          sub={stats && stats.openTickets > 0 ? 'Needs attention' : 'All clear'}
          loading={statsLoading}
        />
        <StatCard
          label="New This Month"
          value={stats?.newThisMonth ?? '—'}
          icon={TrendingUp}
          iconColor="text-info"
          accentClass="bg-info/10"
          sub="New signups this month"
          loading={statsLoading}
        />
        <StatCard
          label="Orders Today"
          value={stats?.ordersToday ?? '—'}
          icon={ShoppingBag}
          iconColor="text-primary-500"
          accentClass="bg-primary-500/10"
          sub={stats ? `${stats.totalOrders.toLocaleString('en-IN')} all-time` : undefined}
          loading={statsLoading}
        />
        <StatCard
          label="Pending Activation"
          value={stats?.pendingActivation ?? '—'}
          icon={Clock}
          iconColor={stats && stats.pendingActivation > 0 ? 'text-warning' : 'text-muted-foreground'}
          accentClass={stats && stats.pendingActivation > 0 ? 'bg-warning/10' : 'bg-white/5'}
          sub={stats && stats.pendingActivation > 0 ? 'Awaiting review' : 'None pending'}
          loading={statsLoading}
        />
        <StatCard
          label="Suspended"
          value={stats?.suspended ?? '—'}
          icon={Ban}
          iconColor={stats && stats.suspended > 0 ? 'text-danger' : 'text-muted-foreground'}
          accentClass={stats && stats.suspended > 0 ? 'bg-danger/10' : 'bg-white/5'}
          sub={stats && stats.suspended > 0 ? 'Access revoked' : 'None suspended'}
          loading={statsLoading}
        />
      </div>

      {/* ── Charts row ────────────────────────────────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Monthly signups bar chart */}
        <ChartCard title="Monthly Signups" loading={analyticsLoading}>
          <div className="overflow-x-auto">
            <div style={{ minWidth: 280, height: 200 }}>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={analytics?.signupsByMonth ?? []}
                  margin={{ top: 4, right: 8, left: -20, bottom: 0 }}
                >
                  <defs>
                    <linearGradient id="barGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor={CHART_ORANGE} stopOpacity={1} />
                      <stop offset="100%" stopColor={CHART_ORANGE} stopOpacity={0.6} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid vertical={false} stroke={CHART_GRID} strokeDasharray="3 3" />
                  <XAxis
                    dataKey="month"
                    tick={{ fill: CHART_TEXT, fontSize: 10 }}
                    axisLine={false}
                    tickLine={false}
                  />
                  <YAxis
                    tick={{ fill: CHART_TEXT, fontSize: 10 }}
                    axisLine={false}
                    tickLine={false}
                    allowDecimals={false}
                  />
                  <Tooltip
                    content={<ChartTooltip />}
                    cursor={{ fill: 'rgba(255,107,53,0.06)' }}
                  />
                  <Bar dataKey="count" fill="url(#barGrad)" radius={[3, 3, 0, 0]} maxBarSize={32} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </ChartCard>

        {/* Monthly revenue area chart */}
        <ChartCard title="Monthly Revenue" loading={analyticsLoading}>
          <div className="overflow-x-auto">
            <div style={{ minWidth: 280, height: 200 }}>
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart
                  data={analytics?.revenueByMonth ?? []}
                  margin={{ top: 4, right: 8, left: -20, bottom: 0 }}
                >
                  <defs>
                    <linearGradient id="areaGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor={CHART_ORANGE} stopOpacity={0.35} />
                      <stop offset="100%" stopColor={CHART_ORANGE} stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid vertical={false} stroke={CHART_GRID} strokeDasharray="3 3" />
                  <XAxis
                    dataKey="month"
                    tick={{ fill: CHART_TEXT, fontSize: 10 }}
                    axisLine={false}
                    tickLine={false}
                  />
                  <YAxis
                    tick={{ fill: CHART_TEXT, fontSize: 10 }}
                    axisLine={false}
                    tickLine={false}
                    tickFormatter={(v: number) => fmtShort(v)}
                  />
                  <Tooltip
                    content={<ChartTooltip formatter={(v) => fmtINR(v)} />}
                    cursor={{ stroke: CHART_ORANGE, strokeWidth: 1, strokeDasharray: '4 2' }}
                  />
                  <Area
                    type="monotone"
                    dataKey="amount"
                    stroke={CHART_ORANGE}
                    strokeWidth={2}
                    fill="url(#areaGrad)"
                    dot={false}
                    activeDot={{ r: 4, fill: CHART_ORANGE, strokeWidth: 0 }}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>
        </ChartCard>
      </div>

      {/* ── Orders last 30 days ───────────────────────────────────────────── */}
      <ChartCard title="Orders Last 30 Days" loading={analyticsLoading}>
        <div className="overflow-x-auto">
          <div style={{ minWidth: 400, height: 180 }}>
            <ResponsiveContainer width="100%" height="100%">
              <LineChart
                data={analytics?.ordersByDay ?? []}
                margin={{ top: 4, right: 8, left: -20, bottom: 0 }}
              >
                <CartesianGrid vertical={false} stroke={CHART_GRID} strokeDasharray="3 3" />
                <XAxis
                  dataKey="date"
                  tick={{ fill: CHART_TEXT, fontSize: 10 }}
                  axisLine={false}
                  tickLine={false}
                  interval={4}
                />
                <YAxis
                  tick={{ fill: CHART_TEXT, fontSize: 10 }}
                  axisLine={false}
                  tickLine={false}
                  allowDecimals={false}
                />
                <Tooltip
                  content={<ChartTooltip />}
                  cursor={{ stroke: CHART_GRID, strokeWidth: 1 }}
                />
                <Line
                  type="monotone"
                  dataKey="orders"
                  stroke={CHART_ORANGE}
                  strokeWidth={2}
                  dot={false}
                  activeDot={{ r: 4, fill: CHART_ORANGE, strokeWidth: 0 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </ChartCard>

      {/* ── Bottom row ────────────────────────────────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Restaurant status pie */}
        <ChartCard title="Restaurant Status" loading={analyticsLoading}>
          {analytics?.statusBreakdown?.length ? (
            <div className="flex items-center gap-6">
              <div style={{ width: 160, height: 160, flexShrink: 0 }}>
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={analytics.statusBreakdown}
                      dataKey="value"
                      nameKey="label"
                      cx="50%"
                      cy="50%"
                      innerRadius={44}
                      outerRadius={72}
                      paddingAngle={2}
                      strokeWidth={0}
                    >
                      {analytics.statusBreakdown.map((_, index) => (
                        <Cell
                          key={`cell-${index}`}
                          fill={PIE_COLORS[index % PIE_COLORS.length]}
                        />
                      ))}
                    </Pie>
                    <Tooltip
                      content={({ active, payload }) => {
                        if (!active || !payload?.length) return null
                        const p = payload[0]
                        return (
                          <div style={TOOLTIP_STYLE} className="px-3 py-2">
                            <p className="text-gray-400 text-[11px]">{p?.name}</p>
                            <p className="font-semibold text-white text-sm">{p?.value}</p>
                          </div>
                        )
                      }}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div className="space-y-2 min-w-0">
                {analytics.statusBreakdown.map((item, i) => (
                  <div key={item.label} className="flex items-center gap-2.5">
                    <div
                      className="w-2.5 h-2.5 rounded-full shrink-0"
                      style={{ backgroundColor: PIE_COLORS[i % PIE_COLORS.length] }}
                    />
                    <span className="text-xs text-muted-foreground truncate flex-1">{item.label}</span>
                    <span className="text-xs font-semibold text-foreground tabular-nums">{item.value}</span>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <p className="text-xs text-muted-foreground text-center py-12">No data available.</p>
          )}
        </ChartCard>

        {/* Top restaurants by orders */}
        <div className="rounded-xl border border-border bg-background-card p-5">
          <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-4">
            Top Restaurants by Orders
          </p>
          <TopRestaurantsList
            data={analytics?.topByOrders}
            loading={analyticsLoading}
          />
        </div>
      </div>
    </div>
  )
}
