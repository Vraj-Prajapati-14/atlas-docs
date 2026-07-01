'use client'

import { useState, useEffect, useCallback } from 'react'
import {
  BarChart3,
  TrendingUp,
  RefreshCw,
  CalendarDays,
  AlertCircle,
} from 'lucide-react'
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  BarChart,
  Bar,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from 'recharts'
import { adminFetch } from '@/lib/admin-api'
import { cn } from '@/lib/utils'

// ─── Color palette ─────────────────────────────────────────────────────────────

const C = {
  orange:  '#f97316',
  blue:    '#3b82f6',
  green:   '#10b981',
  amber:   '#f59e0b',
  red:     '#ef4444',
  purple:  '#8b5cf6',
} as const

const PIE_COLORS = [C.orange, C.blue, C.green, C.amber, C.red, C.purple]

const GRID_STROKE  = '#374151'
const AXIS_FILL    = '#9ca3af'
const TOOLTIP_BG   = '#111827'
const TOOLTIP_BORDER = '#1f2937'

// ─── Types ─────────────────────────────────────────────────────────────────────

type Period = '1' | '3' | '6' | '12'

interface MonthPoint    { month: string;  count: number; cumulative?: number }
interface RevenuePoint  { month: string;  revenue: number }
interface DayPoint      { date: string;   orders: number }
interface BreakdownItem { label: string;  count: number }
interface TopItem       { name: string;   orders?: number; revenue?: number }

interface AnalyticsData {
  signupsByMonth:  MonthPoint[]
  revenueByMonth:  RevenuePoint[]
  ordersByDay:     DayPoint[]
  statusBreakdown: BreakdownItem[]
  typeBreakdown:   BreakdownItem[]
  topByOrders:     TopItem[]
  topByRevenue:    TopItem[]
}

// ─── Helpers ───────────────────────────────────────────────────────────────────

function fmtRupee(v: number) {
  return `₹${v.toLocaleString('en-IN')}`
}

function addCumulative(data: MonthPoint[]): (MonthPoint & { cumulative: number })[] {
  let running = 0
  return data.map((d) => {
    running += d.count
    return { ...d, cumulative: running }
  })
}

// ─── Custom tooltip ────────────────────────────────────────────────────────────

interface CustomTooltipProps {
  active?:  boolean
  payload?: { name: string; value: number; color?: string }[]
  label?:   string
  rupee?:   boolean
}

function CustomTooltip({ active, payload, label, rupee }: CustomTooltipProps) {
  if (!active || !payload?.length) return null
  return (
    <div
      style={{
        background: TOOLTIP_BG,
        border: `1px solid ${TOOLTIP_BORDER}`,
        borderRadius: 8,
        padding: '8px 12px',
        fontSize: 12,
        color: '#f9fafb',
        boxShadow: '0 4px 16px rgba(0,0,0,0.5)',
      }}
    >
      {label && (
        <p style={{ color: AXIS_FILL, marginBottom: 4, fontSize: 11, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.04em' }}>
          {label}
        </p>
      )}
      {payload.map((p) => (
        <p key={p.name} style={{ color: p.color ?? '#f9fafb', fontVariantNumeric: 'tabular-nums', fontWeight: 600 }}>
          {p.name}:{' '}
          <span style={{ color: '#f9fafb' }}>
            {rupee ? fmtRupee(p.value) : p.value.toLocaleString('en-IN')}
          </span>
        </p>
      ))}
    </div>
  )
}

// ─── Chart card wrapper ────────────────────────────────────────────────────────

interface ChartCardProps {
  title:    string
  subtitle?: string
  children: React.ReactNode
  className?: string
  height?:   number
}

function ChartCard({ title, subtitle, children, className, height = 240 }: ChartCardProps) {
  return (
    <div
      className={cn(
        'bg-[#0d1117] border border-[#1f2937] rounded-xl p-5 flex flex-col gap-4',
        className,
      )}
    >
      <div>
        <p className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider mb-0.5">
          {title}
        </p>
        {subtitle && (
          <p className="text-[11px] text-muted-foreground/60">{subtitle}</p>
        )}
      </div>
      <div style={{ height }} className="w-full">
        {children}
      </div>
    </div>
  )
}

// ─── Period selector ───────────────────────────────────────────────────────────

const PERIOD_OPTIONS: { value: Period; label: string }[] = [
  { value: '1',  label: 'Last 30 days' },
  { value: '3',  label: 'Last 3 months' },
  { value: '6',  label: 'Last 6 months' },
  { value: '12', label: 'Last 12 months' },
]

// ─── Skeleton loaders ──────────────────────────────────────────────────────────

function ChartSkeleton({ height = 240 }: { height?: number }) {
  return (
    <div
      className="animate-pulse rounded-lg bg-[#1f2937]/40"
      style={{ height }}
    />
  )
}

// ─── Empty state ───────────────────────────────────────────────────────────────

function EmptyChart({ message = 'No data available' }: { message?: string }) {
  return (
    <div className="flex flex-col items-center justify-center h-full gap-2 text-muted-foreground/50">
      <BarChart3 size={24} />
      <p className="text-xs">{message}</p>
    </div>
  )
}

// ─── Individual chart components ───────────────────────────────────────────────

function RestaurantGrowthChart({ data }: { data: MonthPoint[] }) {
  const enriched = addCumulative(data)
  if (!enriched.length) return <EmptyChart />

  return (
    <ResponsiveContainer width="100%" height="100%">
      <AreaChart data={enriched} margin={{ top: 4, right: 4, bottom: 0, left: 0 }}>
        <defs>
          <linearGradient id="grad-cumulative" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%"   stopColor={C.orange} stopOpacity={0.35} />
            <stop offset="100%" stopColor={C.orange} stopOpacity={0.02} />
          </linearGradient>
        </defs>
        <CartesianGrid stroke={GRID_STROKE} strokeDasharray="3 3" vertical={false} />
        <XAxis dataKey="month" tick={{ fill: AXIS_FILL, fontSize: 10 }} axisLine={false} tickLine={false} />
        <YAxis tick={{ fill: AXIS_FILL, fontSize: 10 }} axisLine={false} tickLine={false} width={36} />
        <Tooltip content={<CustomTooltip />} />
        <Area
          type="monotone"
          dataKey="cumulative"
          name="Total Restaurants"
          stroke={C.orange}
          strokeWidth={2}
          fill="url(#grad-cumulative)"
          dot={false}
          activeDot={{ r: 4, fill: C.orange }}
        />
      </AreaChart>
    </ResponsiveContainer>
  )
}

function SignupsBarChart({ data }: { data: MonthPoint[] }) {
  if (!data.length) return <EmptyChart />

  return (
    <ResponsiveContainer width="100%" height="100%">
      <BarChart data={data} margin={{ top: 4, right: 4, bottom: 0, left: 0 }}>
        <CartesianGrid stroke={GRID_STROKE} strokeDasharray="3 3" vertical={false} />
        <XAxis dataKey="month" tick={{ fill: AXIS_FILL, fontSize: 10 }} axisLine={false} tickLine={false} />
        <YAxis tick={{ fill: AXIS_FILL, fontSize: 10 }} axisLine={false} tickLine={false} width={36} allowDecimals={false} />
        <Tooltip content={<CustomTooltip />} />
        <Bar dataKey="count" name="New Signups" fill={C.orange} radius={[3, 3, 0, 0]} maxBarSize={36} />
      </BarChart>
    </ResponsiveContainer>
  )
}

function RevenueAreaChart({ data }: { data: RevenuePoint[] }) {
  if (!data.length) return <EmptyChart />

  return (
    <ResponsiveContainer width="100%" height="100%">
      <AreaChart data={data} margin={{ top: 4, right: 4, bottom: 0, left: 0 }}>
        <defs>
          <linearGradient id="grad-revenue" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%"   stopColor={C.blue} stopOpacity={0.35} />
            <stop offset="100%" stopColor={C.blue} stopOpacity={0.02} />
          </linearGradient>
        </defs>
        <CartesianGrid stroke={GRID_STROKE} strokeDasharray="3 3" vertical={false} />
        <XAxis dataKey="month" tick={{ fill: AXIS_FILL, fontSize: 10 }} axisLine={false} tickLine={false} />
        <YAxis
          tick={{ fill: AXIS_FILL, fontSize: 10 }}
          axisLine={false}
          tickLine={false}
          width={54}
          tickFormatter={(v: number) => `₹${(v / 1000).toFixed(0)}k`}
        />
        <Tooltip content={<CustomTooltip rupee />} />
        <Area
          type="monotone"
          dataKey="revenue"
          name="Revenue"
          stroke={C.blue}
          strokeWidth={2}
          fill="url(#grad-revenue)"
          dot={false}
          activeDot={{ r: 4, fill: C.blue }}
        />
      </AreaChart>
    </ResponsiveContainer>
  )
}

function OrdersLineChart({ data }: { data: DayPoint[] }) {
  if (!data.length) return <EmptyChart />

  // Abbreviate date labels to avoid crowding
  const labeled = data.map((d) => ({ ...d, label: d.date.slice(5) }))

  return (
    <ResponsiveContainer width="100%" height="100%">
      <LineChart data={labeled} margin={{ top: 4, right: 4, bottom: 0, left: 0 }}>
        <CartesianGrid stroke={GRID_STROKE} strokeDasharray="3 3" vertical={false} />
        <XAxis
          dataKey="label"
          tick={{ fill: AXIS_FILL, fontSize: 10 }}
          axisLine={false}
          tickLine={false}
          interval="preserveStartEnd"
        />
        <YAxis tick={{ fill: AXIS_FILL, fontSize: 10 }} axisLine={false} tickLine={false} width={36} allowDecimals={false} />
        <Tooltip content={<CustomTooltip />} />
        <Line
          type="monotone"
          dataKey="orders"
          name="Orders"
          stroke={C.green}
          strokeWidth={2}
          dot={false}
          activeDot={{ r: 4, fill: C.green }}
        />
      </LineChart>
    </ResponsiveContainer>
  )
}

function TypePieChart({ data }: { data: BreakdownItem[] }) {
  if (!data.length) return <EmptyChart />

  return (
    <ResponsiveContainer width="100%" height="100%">
      <PieChart>
        <Pie
          data={data}
          dataKey="count"
          nameKey="label"
          cx="50%"
          cy="50%"
          innerRadius="45%"
          outerRadius="70%"
          paddingAngle={2}
        >
          {data.map((_, i) => (
            <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />
          ))}
        </Pie>
        <Tooltip
          content={<CustomTooltip />}
          formatter={(value: number, name: string) => [value.toLocaleString('en-IN'), name]}
        />
        <Legend
          formatter={(value: string) => (
            <span style={{ color: AXIS_FILL, fontSize: 11 }}>{value}</span>
          )}
          iconSize={8}
          iconType="circle"
        />
      </PieChart>
    </ResponsiveContainer>
  )
}

function StatusBarChart({ data }: { data: BreakdownItem[] }) {
  if (!data.length) return <EmptyChart />

  return (
    <ResponsiveContainer width="100%" height="100%">
      <BarChart
        data={data}
        layout="vertical"
        margin={{ top: 4, right: 16, bottom: 0, left: 0 }}
      >
        <CartesianGrid stroke={GRID_STROKE} strokeDasharray="3 3" horizontal={false} />
        <XAxis type="number" tick={{ fill: AXIS_FILL, fontSize: 10 }} axisLine={false} tickLine={false} allowDecimals={false} />
        <YAxis type="category" dataKey="label" tick={{ fill: AXIS_FILL, fontSize: 11 }} axisLine={false} tickLine={false} width={80} />
        <Tooltip content={<CustomTooltip />} />
        <Bar dataKey="count" name="Restaurants" fill={C.amber} radius={[0, 3, 3, 0]} maxBarSize={20} />
      </BarChart>
    </ResponsiveContainer>
  )
}

function TopOrdersChart({ data }: { data: TopItem[] }) {
  if (!data.length) return <EmptyChart />

  const top10 = data.slice(0, 10)

  return (
    <ResponsiveContainer width="100%" height="100%">
      <BarChart
        data={top10}
        layout="vertical"
        margin={{ top: 4, right: 16, bottom: 0, left: 0 }}
      >
        <CartesianGrid stroke={GRID_STROKE} strokeDasharray="3 3" horizontal={false} />
        <XAxis type="number" tick={{ fill: AXIS_FILL, fontSize: 10 }} axisLine={false} tickLine={false} allowDecimals={false} />
        <YAxis type="category" dataKey="name" tick={{ fill: AXIS_FILL, fontSize: 10 }} axisLine={false} tickLine={false} width={100} />
        <Tooltip content={<CustomTooltip />} />
        <Bar dataKey="orders" name="Orders" fill={C.purple} radius={[0, 3, 3, 0]} maxBarSize={16} />
      </BarChart>
    </ResponsiveContainer>
  )
}

function TopRevenueChart({ data }: { data: TopItem[] }) {
  if (!data.length) return <EmptyChart />

  const top10 = data.slice(0, 10)

  return (
    <ResponsiveContainer width="100%" height="100%">
      <BarChart
        data={top10}
        layout="vertical"
        margin={{ top: 4, right: 16, bottom: 0, left: 0 }}
      >
        <CartesianGrid stroke={GRID_STROKE} strokeDasharray="3 3" horizontal={false} />
        <XAxis
          type="number"
          tick={{ fill: AXIS_FILL, fontSize: 10 }}
          axisLine={false}
          tickLine={false}
          tickFormatter={(v: number) => `₹${(v / 1000).toFixed(0)}k`}
        />
        <YAxis type="category" dataKey="name" tick={{ fill: AXIS_FILL, fontSize: 10 }} axisLine={false} tickLine={false} width={100} />
        <Tooltip content={<CustomTooltip rupee />} />
        <Bar dataKey="revenue" name="Revenue" fill={C.green} radius={[0, 3, 3, 0]} maxBarSize={16} />
      </BarChart>
    </ResponsiveContainer>
  )
}

// ─── Page ──────────────────────────────────────────────────────────────────────

export default function AnalyticsPage() {
  const [period, setPeriod]   = useState<Period>('3')
  const [data, setData]       = useState<AnalyticsData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError]     = useState<string | null>(null)
  const [refreshing, setRefreshing] = useState(false)

  const load = useCallback(
    async (showSpinner = true) => {
      if (showSpinner) setLoading(true)
      else setRefreshing(true)
      setError(null)
      try {
        const result = await adminFetch<AnalyticsData>(
          `/api/v1/admin/analytics?period=${period}`,
        )
        setData(result)
      } catch (e) {
        setError(e instanceof Error ? e.message : 'Failed to load analytics')
      } finally {
        setLoading(false)
        setRefreshing(false)
      }
    },
    [period],
  )

  useEffect(() => {
    load(true)
  }, [load])

  const periodLabel = PERIOD_OPTIONS.find((o) => o.value === period)?.label ?? ''

  return (
    <div className="flex flex-col h-full bg-[#080b12]">
      {/* ── Header ──────────────────────────────────────────────────────────── */}
      <div className="flex items-center justify-between px-6 py-3.5 border-b border-[#1f2937] bg-[#080b12] shrink-0">
        <div className="flex items-center gap-3">
          <TrendingUp size={17} className="text-[#f97316]" />
          <span className="text-sm font-bold text-foreground">Analytics</span>
          <span className="flex items-center gap-1.5 text-[11px] text-muted-foreground/60">
            <CalendarDays size={11} />
            {periodLabel}
          </span>
        </div>

        <div className="flex items-center gap-2">
          {/* Period selector */}
          <div className="flex items-center bg-[#0d1117] border border-[#1f2937] rounded-lg overflow-hidden">
            {PERIOD_OPTIONS.map(({ value, label }) => (
              <button
                key={value}
                type="button"
                onClick={() => setPeriod(value)}
                className={cn(
                  'px-3 py-1.5 text-[11px] font-medium transition-colors',
                  'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#f97316]/50',
                  period === value
                    ? 'bg-[#f97316] text-white'
                    : 'text-muted-foreground hover:text-foreground hover:bg-white/5',
                )}
              >
                {label}
              </button>
            ))}
          </div>

          {/* Refresh */}
          <button
            type="button"
            onClick={() => load(false)}
            disabled={loading || refreshing}
            className="p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-white/5 transition-colors disabled:opacity-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#f97316]/50"
            aria-label="Refresh analytics"
          >
            <RefreshCw size={13} className={cn((loading || refreshing) && 'animate-spin')} />
          </button>
        </div>
      </div>

      {/* ── Content ─────────────────────────────────────────────────────────── */}
      <div className="flex-1 overflow-y-auto p-6">

        {/* Error state */}
        {error && (
          <div className="flex items-center gap-3 bg-red-500/10 border border-red-500/20 rounded-xl px-4 py-3 mb-6 text-sm text-red-400">
            <AlertCircle size={15} className="shrink-0" />
            {error}
          </div>
        )}

        {/* ── Row 1: Growth + Signups ─────────────────────────────────────── */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 mb-5">
          <ChartCard
            title="Restaurant Growth"
            subtitle="Cumulative platform signups over time"
          >
            {loading
              ? <ChartSkeleton />
              : <RestaurantGrowthChart data={data?.signupsByMonth ?? []} />
            }
          </ChartCard>

          <ChartCard
            title="New Signups per Month"
            subtitle="New restaurants joining each month"
          >
            {loading
              ? <ChartSkeleton />
              : <SignupsBarChart data={data?.signupsByMonth ?? []} />
            }
          </ChartCard>
        </div>

        {/* ── Row 2: Revenue + Orders ─────────────────────────────────────── */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 mb-5">
          <ChartCard
            title="Platform Revenue"
            subtitle="Monthly subscription revenue (₹)"
          >
            {loading
              ? <ChartSkeleton />
              : <RevenueAreaChart data={data?.revenueByMonth ?? []} />
            }
          </ChartCard>

          <ChartCard
            title="Daily Order Volume"
            subtitle="Orders processed per day (last 30 days)"
          >
            {loading
              ? <ChartSkeleton />
              : <OrdersLineChart data={data?.ordersByDay ?? []} />
            }
          </ChartCard>
        </div>

        {/* ── Row 3: Type pie + Status distribution ───────────────────────── */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 mb-5">
          <ChartCard
            title="Restaurant Types"
            subtitle="Breakdown by cuisine / restaurant type"
          >
            {loading
              ? <ChartSkeleton />
              : <TypePieChart data={data?.typeBreakdown ?? []} />
            }
          </ChartCard>

          <ChartCard
            title="Plan Status Distribution"
            subtitle="Active, trial, churned, and suspended accounts"
          >
            {loading
              ? <ChartSkeleton />
              : <StatusBarChart data={data?.statusBreakdown ?? []} />
            }
          </ChartCard>
        </div>

        {/* ── Row 4: Top 10 charts — wider so names are readable ──────────── */}
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-5">
          <ChartCard
            title="Top 10 by Orders"
            subtitle="Restaurants with the highest order volume"
            height={320}
          >
            {loading
              ? <ChartSkeleton height={320} />
              : <TopOrdersChart data={data?.topByOrders ?? []} />
            }
          </ChartCard>

          <ChartCard
            title="Top 10 by Revenue"
            subtitle="Restaurants generating the most subscription revenue"
            height={320}
          >
            {loading
              ? <ChartSkeleton height={320} />
              : <TopRevenueChart data={data?.topByRevenue ?? []} />
            }
          </ChartCard>
        </div>

      </div>
    </div>
  )
}
