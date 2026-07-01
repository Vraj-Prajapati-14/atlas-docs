'use client'

import { AlertTriangle, TrendingUp, Users, BarChart3, ShoppingBag, CheckCircle2, Circle, ChevronRight } from 'lucide-react'
import Link from 'next/link'
import { useDailyReport } from '@/hooks/use-reports'
import { useInventoryValuation } from '@/hooks/use-reports'
import { useTables } from '@/hooks/use-tables'
import { useAuthStore } from '@/lib/auth-store'
import { useOnboardingSteps } from '@/hooks/use-onboarding'
import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'

// ─── Onboarding checklist ─────────────────────────────────────────────────────

function OnboardingChecklist() {
  const { data: steps } = useOnboardingSteps()

  if (!steps || steps.completedAt) return null

  const items = [
    { label: 'Complete restaurant profile', done: steps.restaurantProfileDone, href: '/onboarding' },
    { label: 'Configure your outlet', done: steps.outletDone, href: '/settings' },
    { label: 'Add your menu items', done: steps.menuDone, href: '/menu' },
    { label: 'Set up table layout', done: steps.tablesDone, href: '/floor' },
    { label: 'Invite staff members', done: steps.staffDone, href: '/staff' },
    { label: 'Place your first order', done: steps.firstOrderDone, href: '/floor' },
  ]
  const doneCount = items.filter((i) => i.done).length
  const pct = Math.round((doneCount / items.length) * 100)

  return (
    <div className="rounded-xl border border-primary-500/30 bg-primary-500/5 p-5">
      <div className="flex items-center justify-between mb-3">
        <div>
          <p className="text-sm font-bold text-foreground">Get started — {doneCount}/{items.length} complete</p>
          <p className="text-xs text-muted-foreground mt-0.5">Finish setup to get the most out of Atlas.</p>
        </div>
        <Link href="/onboarding" className="text-xs text-primary-500 font-semibold flex items-center gap-0.5 hover:underline">
          Continue <ChevronRight size={12} />
        </Link>
      </div>
      <div className="w-full bg-border rounded-full h-1.5 mb-4">
        <div className="bg-primary-500 h-1.5 rounded-full transition-all" style={{ width: `${pct}%` }} />
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5">
        {items.map((item) => (
          <Link key={item.label} href={item.href} className="flex items-center gap-2 group">
            {item.done
              ? <CheckCircle2 size={14} className="text-success shrink-0" />
              : <Circle size={14} className="text-muted-foreground/40 shrink-0" />
            }
            <span className={cn(
              'text-xs transition-colors',
              item.done ? 'text-muted-foreground line-through' : 'text-foreground group-hover:text-primary-500',
            )}>
              {item.label}
            </span>
          </Link>
        ))}
      </div>
    </div>
  )
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function todayStr() {
  return new Date().toISOString().split('T')[0] ?? ''
}

function fmt(paise: number) {
  return `₹${(paise / 100).toLocaleString('en-IN', { maximumFractionDigits: 0 })}`
}

function greeting() {
  const h = new Date().getHours()
  if (h < 12) return 'Good morning'
  if (h < 17) return 'Good afternoon'
  return 'Good evening'
}

// ─── Stat card ────────────────────────────────────────────────────────────────

interface StatCardProps {
  label: string
  value: string
  sub?: string
  loading?: boolean
  accent: string
}

function StatCard({ label, value, sub, loading, accent }: StatCardProps) {
  return (
    <div className={cn('rounded-xl border bg-background-card p-5 border-t-[3px] border-l-0 border-r-0 border-b-0', accent)}>
      <p className="text-[11px] font-semibold uppercase tracking-widest text-muted-foreground mb-2">{label}</p>
      {loading ? (
        <div className="space-y-2">
          <div className="h-7 w-20 rounded bg-white/5 animate-pulse" />
          <div className="h-3 w-28 rounded bg-white/5 animate-pulse" />
        </div>
      ) : (
        <>
          <p className="text-2xl font-bold text-foreground tabular-nums">{value}</p>
          {sub && <p className="text-xs text-muted-foreground mt-1">{sub}</p>}
        </>
      )}
    </div>
  )
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function DashboardPage() {
  const user = useAuthStore((s) => s.user)
  const today = todayStr()

  const { data: daily, isLoading: dailyLoading } = useDailyReport(today)
  const { data: tables, isLoading: tablesLoading } = useTables()
  const { data: inv } = useInventoryValuation()

  const occupiedCount = tables?.filter((t) => t.status === 'OCCUPIED').length ?? 0
  const totalTables   = tables?.length ?? 0
  const lowStockItems = inv?.items.filter((i) => i.isLowStock) ?? []

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-xl font-bold text-foreground">{greeting()}, {user?.name.split(' ')[0]}</h2>
        <p className="text-sm text-muted-foreground mt-0.5">{"Here's what's happening at your restaurant today."}</p>
      </div>

      {/* Onboarding checklist — disappears once complete */}
      <OnboardingChecklist />

      {/* Stat cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          label="Today's Revenue"
          value={daily ? fmt(daily.netRevenueInPaise) : '—'}
          sub={daily ? `${fmt(daily.grossRevenueInPaise)} gross` : undefined}
          loading={dailyLoading}
          accent="border-primary-500"
        />
        <StatCard
          label="Orders Served"
          value={daily ? String(daily.paidOrders) : '—'}
          sub={daily ? `${daily.totalOrders} total · ${daily.cancelledOrders} cancelled` : undefined}
          loading={dailyLoading}
          accent="border-success"
        />
        <StatCard
          label="Active Tables"
          value={tablesLoading ? '—' : `${occupiedCount} / ${totalTables}`}
          sub={tablesLoading ? undefined : `${totalTables - occupiedCount} available`}
          loading={tablesLoading}
          accent="border-info"
        />
        <StatCard
          label="Avg Ticket"
          value={daily ? fmt(daily.avgCheckInPaise) : '—'}
          sub={daily ? `Tax: ${fmt(daily.tax.totalInPaise)}` : undefined}
          loading={dailyLoading}
          accent="border-purple-500"
        />
      </div>

      {/* Bottom row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">

        {/* Top items */}
        <div className="lg:col-span-1 bg-background-card border border-border rounded-xl p-5">
          <div className="flex items-center gap-2 mb-4">
            <ShoppingBag size={14} className="text-primary-500" />
            <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Top Items Today</p>
          </div>
          {dailyLoading ? (
            <div className="space-y-3">
              {[1,2,3].map((i) => (
                <div key={i} className="h-4 rounded bg-white/5 animate-pulse" />
              ))}
            </div>
          ) : !daily || daily.topItems.length === 0 ? (
            <p className="text-xs text-muted-foreground py-6 text-center">No orders yet today.</p>
          ) : (
            <div className="space-y-2.5">
              {daily.topItems.slice(0, 6).map((item, i) => (
                <div key={item.name} className="flex items-center gap-3">
                  <span className="text-xs font-bold text-muted-foreground/40 w-4 tabular-nums text-right">{i + 1}</span>
                  <span className="flex-1 text-sm text-foreground truncate">{item.name}</span>
                  <span className="text-xs text-muted-foreground tabular-nums">×{item.qty}</span>
                  <span className="text-sm font-semibold text-primary-500 tabular-nums">{fmt(item.revenueInPaise)}</span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Payment breakdown */}
        <div className="lg:col-span-1 bg-background-card border border-border rounded-xl p-5">
          <div className="flex items-center gap-2 mb-4">
            <BarChart3 size={14} className="text-primary-500" />
            <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Payment Methods</p>
          </div>
          {dailyLoading ? (
            <div className="space-y-3">
              {[1,2,3].map((i) => (
                <div key={i} className="h-6 rounded bg-white/5 animate-pulse" />
              ))}
            </div>
          ) : !daily || Object.keys(daily.paymentBreakdown).length === 0 ? (
            <p className="text-xs text-muted-foreground py-6 text-center">No payments yet today.</p>
          ) : (
            <div className="space-y-3">
              {Object.entries(daily.paymentBreakdown).map(([method, amount]) => {
                const pct = daily.grossRevenueInPaise > 0
                  ? Math.round((amount / daily.grossRevenueInPaise) * 100)
                  : 0
                return (
                  <div key={method}>
                    <div className="flex items-center justify-between text-xs mb-1">
                      <span className="font-medium text-foreground">{method}</span>
                      <span className="text-muted-foreground tabular-nums">{fmt(amount)}</span>
                    </div>
                    <div className="h-1.5 bg-background-border rounded-full overflow-hidden">
                      <div className="h-full bg-primary-500 rounded-full transition-all" style={{ width: `${pct}%` }} />
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>

        {/* Low stock alerts */}
        <div className="lg:col-span-1 bg-background-card border border-border rounded-xl p-5">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <AlertTriangle size={14} className="text-warning" />
              <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Low Stock Alerts</p>
            </div>
            {lowStockItems.length > 0 && (
              <Badge variant="warning">{lowStockItems.length}</Badge>
            )}
          </div>
          {lowStockItems.length === 0 ? (
            <div className="py-6 text-center">
              <p className="text-xs text-success font-medium">All stock levels are OK</p>
              <p className="text-[11px] text-muted-foreground mt-1">No items below threshold.</p>
            </div>
          ) : (
            <div className="space-y-2.5">
              {lowStockItems.slice(0, 6).map((item) => (
                <div key={item.id} className="flex items-center justify-between gap-2">
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-foreground truncate">{item.name}</p>
                    <p className="text-[11px] text-muted-foreground">
                      {item.currentStock} {item.unit} · threshold {item.lowStockThreshold}
                    </p>
                  </div>
                  <Badge variant="warning">Low</Badge>
                </div>
              ))}
              {lowStockItems.length > 6 && (
                <p className="text-[11px] text-muted-foreground text-center pt-1">
                  +{lowStockItems.length - 6} more items
                </p>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
