'use client'

import { useState } from 'react'
import { BarChart3, TrendingUp, ShoppingBag, Receipt, Package, RefreshCw, Download } from 'lucide-react'
import {
  useDailyReport,
  useItemsReport,
  usePaymentsReport,
  useGSTReport,
  useInventoryValuation,
} from '@/hooks/use-reports'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Spinner } from '@/components/ui/spinner'
import { cn } from '@/lib/utils'

// ─── CSV utility ─────────────────────────────────────────────────────────────

function downloadCSV(filename: string, rows: (string | number | null | undefined)[][], headers: string[]) {
  const escape = (v: string | number | null | undefined) => {
    const s = v == null ? '' : String(v)
    return s.includes(',') || s.includes('"') || s.includes('\n') ? `"${s.replace(/"/g, '""')}"` : s
  }
  const lines = [headers, ...rows].map(r => r.map(escape).join(','))
  const blob = new Blob([lines.join('\n')], { type: 'text/csv;charset=utf-8;' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url; a.download = filename; a.click()
  URL.revokeObjectURL(url)
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

// All date strings use IST (UTC+5:30) so they match the API's IST-based date boundaries.
function toISTDateStr(d: Date): string {
  const ist = new Date(d.getTime() + 5.5 * 60 * 60 * 1000)
  return ist.toISOString().slice(0, 10)
}

function todayStr() {
  return toISTDateStr(new Date())
}

function daysAgoStr(n: number) {
  return toISTDateStr(new Date(Date.now() - n * 24 * 60 * 60 * 1000))
}

function currentMonthStr() {
  return toISTDateStr(new Date()).slice(0, 7)
}

function fmt(paise: number) {
  return `₹${(paise / 100).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
}

// ─── Stat card ────────────────────────────────────────────────────────────────

interface StatCardProps {
  label: string
  value: string
  sub?: string
}

function StatCard({ label, value, sub }: StatCardProps) {
  return (
    <div className="bg-background-card border border-border rounded-xl px-5 py-4 flex flex-col gap-1">
      <p className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">{label}</p>
      <p className="text-2xl font-bold text-foreground tabular-nums">{value}</p>
      {sub && <p className="text-[11px] text-muted-foreground">{sub}</p>}
    </div>
  )
}

// ─── Section loading / empty states ──────────────────────────────────────────

function Loading() {
  return (
    <div className="flex items-center justify-center py-20">
      <Spinner size="xl" className="text-primary-500" />
    </div>
  )
}

function Empty({ message }: { message: string }) {
  return (
    <div className="flex items-center justify-center py-20 text-muted-foreground text-sm">
      {message}
    </div>
  )
}

// ─── Daily Tab ────────────────────────────────────────────────────────────────

function DailyTab() {
  const [date, setDate] = useState(todayStr)
  const { data, isLoading, isFetching, refetch } = useDailyReport(date)

  function handleCSV() {
    if (!data) return
    downloadCSV(`daily-report-${date}.csv`,
      [
        ['Total Orders', data.totalOrders, '', ''],
        ['Paid Orders', data.paidOrders, '', ''],
        ['Cancelled Orders', data.cancelledOrders, '', ''],
        ['Gross Revenue (₹)', (data.grossRevenueInPaise / 100).toFixed(2), '', ''],
        ['Discount (₹)', (data.discountInPaise / 100).toFixed(2), '', ''],
        ['Net Revenue (₹)', (data.netRevenueInPaise / 100).toFixed(2), '', ''],
        ['Avg Check (₹)', (data.avgCheckInPaise / 100).toFixed(2), '', ''],
        ['CGST (₹)', (data.tax.cgstInPaise / 100).toFixed(2), '', ''],
        ['SGST (₹)', (data.tax.sgstInPaise / 100).toFixed(2), '', ''],
        ['Total Tax (₹)', (data.tax.totalInPaise / 100).toFixed(2), '', ''],
        ...data.topItems.map(i => [i.name, `×${i.qty}`, `₹${(i.revenueInPaise / 100).toFixed(2)}`, 'Top Item']),
      ],
      ['Metric', 'Value', 'Sub-value', 'Note'],
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <input
          type="date"
          value={date}
          max={todayStr()}
          onChange={(e) => setDate(e.target.value)}
          className="bg-background-card border border-border rounded-lg px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-primary-500"
        />
        <Button variant="ghost" size="icon-sm" onClick={() => refetch()}>
          <RefreshCw size={13} className={cn(isFetching && 'animate-spin')} />
        </Button>
        {data && (
          <Button variant="ghost" size="sm" className="gap-1.5 text-xs ml-auto" onClick={handleCSV}>
            <Download size={12} /> Export CSV
          </Button>
        )}
      </div>

      {isLoading ? <Loading /> : !data ? <Empty message="No data for this date." /> : (
        <>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <StatCard label="Total Orders" value={String(data.totalOrders)} sub={`${data.paidOrders} paid · ${data.cancelledOrders} cancelled`} />
            <StatCard label="Net Revenue" value={fmt(data.netRevenueInPaise)} sub={data.discountInPaise ? `${fmt(data.discountInPaise)} disc.` : undefined} />
            <StatCard label="Avg Check" value={fmt(data.avgCheckInPaise)} />
            <StatCard label="Total Tax" value={fmt(data.tax.totalInPaise)} sub={`CGST ${fmt(data.tax.cgstInPaise)} · SGST ${fmt(data.tax.sgstInPaise)}`} />
          </div>

          {/* Payment breakdown */}
          {Object.keys(data.paymentBreakdown).length > 0 && (
            <div className="bg-background-card border border-border rounded-xl p-5">
              <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-4">Payment Breakdown</p>
              <div className="space-y-3">
                {Object.entries(data.paymentBreakdown).map(([method, amount]) => {
                  const pct = data.grossRevenueInPaise > 0
                    ? Math.round((amount / data.grossRevenueInPaise) * 100)
                    : 0
                  return (
                    <div key={method}>
                      <div className="flex items-center justify-between text-xs mb-1">
                        <span className="font-medium text-foreground">{method}</span>
                        <span className="text-muted-foreground tabular-nums">{fmt(amount)} <span className="text-muted-foreground/50">({pct}%)</span></span>
                      </div>
                      <div className="h-1.5 bg-background-border rounded-full overflow-hidden">
                        <div className="h-full bg-primary-500 rounded-full" style={{ width: `${pct}%` }} />
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          )}

          {/* Top items */}
          {data.topItems.length > 0 && (
            <div className="bg-background-card border border-border rounded-xl p-5">
              <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-4">Top Items</p>
              <div className="space-y-2">
                {data.topItems.map((item, i) => (
                  <div key={item.name} className="flex items-center gap-3">
                    <span className="w-5 text-right text-xs font-bold text-muted-foreground/50 tabular-nums">{i + 1}</span>
                    <span className="flex-1 text-sm font-medium text-foreground truncate">{item.name}</span>
                    <span className="text-xs text-muted-foreground tabular-nums">×{item.qty}</span>
                    <span className="text-sm font-semibold text-primary-500 tabular-nums">{fmt(item.revenueInPaise)}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </>
      )}
    </div>
  )
}

// ─── Items Tab ────────────────────────────────────────────────────────────────

function ItemsTab() {
  const [from, setFrom] = useState(() => daysAgoStr(7))
  const [to, setTo] = useState(todayStr)
  const { data, isLoading } = useItemsReport(from, to)

  const sorted = data?.items.slice().sort((a, b) => b.revenueInPaise - a.revenueInPaise) ?? []

  function handleCSV() {
    downloadCSV(`items-report-${from}-to-${to}.csv`,
      sorted.map((item, i) => [i + 1, item.name, item.variantName ?? '', item.qty, (item.revenueInPaise / 100).toFixed(2), `${item.gstRate}%`]),
      ['#', 'Item', 'Variant', 'Qty Sold', 'Revenue (₹)', 'GST Rate'],
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3 flex-wrap">
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <span>From</span>
          <input type="date" value={from} max={to} onChange={(e) => setFrom(e.target.value)}
            className="bg-background-card border border-border rounded-lg px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-primary-500" />
        </div>
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <span>To</span>
          <input type="date" value={to} min={from} max={todayStr()} onChange={(e) => setTo(e.target.value)}
            className="bg-background-card border border-border rounded-lg px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-primary-500" />
        </div>
        {data && <Badge variant="muted">{data.totalItems} items sold</Badge>}
        {sorted.length > 0 && (
          <Button variant="ghost" size="sm" className="gap-1.5 text-xs ml-auto" onClick={handleCSV}>
            <Download size={12} /> Export CSV
          </Button>
        )}
      </div>

      {isLoading ? <Loading /> : sorted.length === 0 ? <Empty message="No items sold in this period." /> : (
        <div className="bg-background-card border border-border rounded-xl overflow-x-auto">
          <table className="w-full text-sm min-w-[480px]">
            <thead>
              <tr className="border-b border-border bg-background/40">
                <th className="text-left px-4 py-3 text-[11px] font-bold text-muted-foreground uppercase tracking-wider w-8">#</th>
                <th className="text-left px-4 py-3 text-[11px] font-bold text-muted-foreground uppercase tracking-wider">Item</th>
                <th className="text-right px-4 py-3 text-[11px] font-bold text-muted-foreground uppercase tracking-wider">Qty</th>
                <th className="text-right px-4 py-3 text-[11px] font-bold text-muted-foreground uppercase tracking-wider">Revenue</th>
                <th className="text-right px-4 py-3 text-[11px] font-bold text-muted-foreground uppercase tracking-wider">GST</th>
              </tr>
            </thead>
            <tbody>
              {sorted.map((item, i) => (
                <tr key={`${item.name}-${item.variantName}`} className="border-b border-border/50 last:border-0 hover:bg-white/[0.02]">
                  <td className="px-4 py-3 text-xs text-muted-foreground/50 tabular-nums">{i + 1}</td>
                  <td className="px-4 py-3">
                    <p className="font-medium text-foreground">{item.name}</p>
                    {item.variantName && <p className="text-xs text-muted-foreground">{item.variantName}</p>}
                  </td>
                  <td className="px-4 py-3 text-right font-mono text-sm font-semibold text-foreground tabular-nums">×{item.qty}</td>
                  <td className="px-4 py-3 text-right font-semibold text-primary-500 tabular-nums">{fmt(item.revenueInPaise)}</td>
                  <td className="px-4 py-3 text-right text-muted-foreground tabular-nums">{item.gstRate}%</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}

// ─── Payments Tab ─────────────────────────────────────────────────────────────

const METHOD_COLOR: Record<string, string> = {
  CASH:          'bg-success',
  UPI:           'bg-info',
  CARD:          'bg-primary-500',
  WALLET:        'bg-warning',
  CREDIT:        'bg-danger',
  COMPLIMENTARY: 'bg-muted-foreground',
}

function PaymentsTab() {
  const [from, setFrom] = useState(() => daysAgoStr(7))
  const [to, setTo] = useState(todayStr)
  const { data, isLoading } = usePaymentsReport(from, to)

  function handleCSV() {
    if (!data) return
    downloadCSV(`payments-report-${from}-to-${to}.csv`,
      Object.entries(data.breakdown).map(([method, info]) => [
        method, info.count, (info.totalInPaise / 100).toFixed(2),
        data.grandTotalInPaise > 0 ? `${Math.round((info.totalInPaise / data.grandTotalInPaise) * 100)}%` : '0%',
      ]),
      ['Payment Method', 'Transactions', 'Total (₹)', '% of Total'],
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3 flex-wrap">
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <span>From</span>
          <input type="date" value={from} max={to} onChange={(e) => setFrom(e.target.value)}
            className="bg-background-card border border-border rounded-lg px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-primary-500" />
        </div>
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <span>To</span>
          <input type="date" value={to} min={from} max={todayStr()} onChange={(e) => setTo(e.target.value)}
            className="bg-background-card border border-border rounded-lg px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-primary-500" />
        </div>
        {data && (
          <Button variant="ghost" size="sm" className="gap-1.5 text-xs ml-auto" onClick={handleCSV}>
            <Download size={12} /> Export CSV
          </Button>
        )}
      </div>

      {isLoading ? <Loading /> : !data ? <Empty message="No payment data for this period." /> : (
        <>
          <div className="grid grid-cols-2 gap-4">
            <StatCard label="Grand Total" value={fmt(data.grandTotalInPaise)} />
            <StatCard label="Transactions" value={String(data.transactionCount)} />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {Object.entries(data.breakdown).map(([method, info]) => {
              const pct = data.grandTotalInPaise > 0
                ? Math.round((info.totalInPaise / data.grandTotalInPaise) * 100)
                : 0
              const color = METHOD_COLOR[method] ?? 'bg-muted-foreground'
              return (
                <div key={method} className="bg-background-card border border-border rounded-xl p-4 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-bold text-foreground">{method}</span>
                    <Badge variant="muted">{info.count} txn</Badge>
                  </div>
                  <p className="text-xl font-bold text-foreground tabular-nums">{fmt(info.totalInPaise)}</p>
                  <div className="h-1.5 bg-background-border rounded-full overflow-hidden">
                    <div className={cn('h-full rounded-full', color)} style={{ width: `${pct}%` }} />
                  </div>
                  <p className="text-[11px] text-muted-foreground">{pct}% of total</p>
                </div>
              )
            })}
          </div>
        </>
      )}
    </div>
  )
}

// ─── GST Tab ──────────────────────────────────────────────────────────────────

function GSTTab() {
  const [month, setMonth] = useState(currentMonthStr)
  const { data, isLoading } = useGSTReport(month)

  function handleCSV() {
    if (!data) return
    downloadCSV(`gst-report-${month}.csv`,
      [
        ['Bills', data.billCount, '', ''],
        ['Gross Revenue (₹)', (data.grossRevenueInPaise / 100).toFixed(2), '', ''],
        ['Taxable Value (₹)', (data.taxableValueInPaise / 100).toFixed(2), '', ''],
        ['CGST (₹)', (data.cgstInPaise / 100).toFixed(2), '', ''],
        ['SGST (₹)', (data.sgstInPaise / 100).toFixed(2), '', ''],
        ['IGST (₹)', (data.igstInPaise / 100).toFixed(2), '', ''],
        ['Total GST (₹)', (data.totalGSTInPaise / 100).toFixed(2), '', ''],
      ],
      ['Component', 'Amount', '', ''],
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <input
          type="month"
          value={month}
          max={currentMonthStr()}
          onChange={(e) => setMonth(e.target.value)}
          className="bg-background-card border border-border rounded-lg px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-primary-500"
        />
        {data && (
          <Button variant="ghost" size="sm" className="gap-1.5 text-xs" onClick={handleCSV}>
            <Download size={12} /> Export CSV
          </Button>
        )}
      </div>

      {isLoading ? <Loading /> : !data ? <Empty message="No GST data for this month." /> : (
        <>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <StatCard label="Bills" value={String(data.billCount)} />
            <StatCard label="Gross Revenue" value={fmt(data.grossRevenueInPaise)} />
            <StatCard label="Taxable Value" value={fmt(data.taxableValueInPaise)} />
            <StatCard label="Total GST" value={fmt(data.totalGSTInPaise)} />
          </div>

          <div className="bg-background-card border border-border rounded-xl overflow-hidden">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border bg-background/40">
                  <th className="text-left px-5 py-3 text-[11px] font-bold text-muted-foreground uppercase tracking-wider">Tax Component</th>
                  <th className="text-right px-5 py-3 text-[11px] font-bold text-muted-foreground uppercase tracking-wider">Amount</th>
                </tr>
              </thead>
              <tbody>
                {[
                  { label: 'CGST (Central GST)', value: data.cgstInPaise },
                  { label: 'SGST (State GST)', value: data.sgstInPaise },
                  { label: 'IGST (Integrated GST)', value: data.igstInPaise },
                ].map(({ label, value }) => (
                  <tr key={label} className="border-b border-border/50 last:border-0">
                    <td className="px-5 py-3 text-foreground">{label}</td>
                    <td className="px-5 py-3 text-right font-semibold text-foreground tabular-nums">{fmt(value)}</td>
                  </tr>
                ))}
                <tr className="bg-primary-500/5 border-t border-primary-500/20">
                  <td className="px-5 py-3 font-bold text-primary-500">Total GST</td>
                  <td className="px-5 py-3 text-right font-bold text-primary-500 tabular-nums">{fmt(data.totalGSTInPaise)}</td>
                </tr>
              </tbody>
            </table>
          </div>
        </>
      )}
    </div>
  )
}

// ─── Inventory Valuation Tab ──────────────────────────────────────────────────

function InventoryTab() {
  const { data, isLoading, refetch, isFetching } = useInventoryValuation()

  function handleCSV() {
    if (!data) return
    downloadCSV('inventory-valuation.csv',
      data.items.map(i => [
        i.name, i.category ?? '', i.currentStock, i.unit,
        i.pricePerUnitPaise ? (i.pricePerUnitPaise / 100).toFixed(2) : '',
        i.valueInPaise ? (i.valueInPaise / 100).toFixed(2) : '',
        i.isLowStock ? 'Low Stock' : 'OK',
      ]),
      ['Item', 'Category', 'Stock', 'Unit', 'Cost/Unit (₹)', 'Total Value (₹)', 'Status'],
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          {data && (
            <>
              <Badge variant="muted">{data.totalItems} items</Badge>
              {data.lowStockCount > 0 && (
                <Badge variant="warning">{data.lowStockCount} low stock</Badge>
              )}
              <span className="text-sm text-muted-foreground">
                Total value: <span className="font-semibold text-foreground">{fmt(data.totalValueInPaise)}</span>
              </span>
            </>
          )}
        </div>
        <div className="flex items-center gap-2">
          {data && (
            <Button variant="ghost" size="sm" className="gap-1.5 text-xs" onClick={handleCSV}>
              <Download size={12} /> Export CSV
            </Button>
          )}
          <Button variant="ghost" size="icon-sm" onClick={() => refetch()}>
            <RefreshCw size={13} className={cn(isFetching && 'animate-spin')} />
          </Button>
        </div>
      </div>

      {isLoading ? <Loading /> : !data || data.items.length === 0 ? <Empty message="No inventory data." /> : (
        <div className="bg-background-card border border-border rounded-xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border bg-background/40">
                  <th className="text-left px-4 py-3 text-[11px] font-bold text-muted-foreground uppercase tracking-wider">Item</th>
                  <th className="text-left px-4 py-3 text-[11px] font-bold text-muted-foreground uppercase tracking-wider">Category</th>
                  <th className="text-right px-4 py-3 text-[11px] font-bold text-muted-foreground uppercase tracking-wider">Stock</th>
                  <th className="text-right px-4 py-3 text-[11px] font-bold text-muted-foreground uppercase tracking-wider">Cost / Unit</th>
                  <th className="text-right px-4 py-3 text-[11px] font-bold text-muted-foreground uppercase tracking-wider">Value</th>
                  <th className="text-center px-4 py-3 text-[11px] font-bold text-muted-foreground uppercase tracking-wider">Status</th>
                </tr>
              </thead>
              <tbody>
                {data.items.map((item) => (
                  <tr
                    key={item.id}
                    className={cn(
                      'border-b border-border/50 last:border-0 hover:bg-white/[0.02]',
                      item.isLowStock && 'bg-warning/5',
                    )}
                  >
                    <td className="px-4 py-3 font-medium text-foreground">{item.name}</td>
                    <td className="px-4 py-3 text-muted-foreground">{item.category ?? '—'}</td>
                    <td className="px-4 py-3 text-right tabular-nums text-foreground">
                      {item.currentStock} <span className="text-muted-foreground text-xs">{item.unit}</span>
                    </td>
                    <td className="px-4 py-3 text-right tabular-nums text-muted-foreground">
                      {item.pricePerUnitPaise ? fmt(item.pricePerUnitPaise) : '—'}
                    </td>
                    <td className="px-4 py-3 text-right font-semibold text-foreground tabular-nums">
                      {item.valueInPaise ? fmt(item.valueInPaise) : '—'}
                    </td>
                    <td className="px-4 py-3 text-center">
                      {item.isLowStock
                        ? <Badge variant="warning">Low Stock</Badge>
                        : <Badge variant="muted">OK</Badge>
                      }
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  )
}

// ─── Page ─────────────────────────────────────────────────────────────────────

type Tab = 'daily' | 'items' | 'payments' | 'gst' | 'inventory'

const TABS: { id: Tab; label: string; icon: React.ElementType }[] = [
  { id: 'daily',     label: 'Daily',     icon: TrendingUp },
  { id: 'items',     label: 'Items',     icon: ShoppingBag },
  { id: 'payments',  label: 'Payments',  icon: Receipt },
  { id: 'gst',       label: 'GST',       icon: BarChart3 },
  { id: 'inventory', label: 'Inventory', icon: Package },
]

export default function ReportsPage() {
  const [tab, setTab] = useState<Tab>('daily')

  return (
    <div className="flex flex-col h-full -m-6 bg-background-card">
      {/* Header */}
      <div className="flex items-center justify-between px-6 py-3 border-b border-border bg-background shrink-0">
        <div className="flex items-center gap-3">
          <BarChart3 size={18} className="text-primary-500" />
          <span className="text-sm font-bold">Reports</span>
        </div>
      </div>

      {/* Tab bar */}
      <div className="flex items-center gap-1 px-6 pt-4 pb-0 shrink-0 border-b border-border bg-background overflow-x-auto">
        {TABS.map(({ id, label, icon: Icon }) => (
          <button
            key={id}
            type="button"
            onClick={() => setTab(id)}
            className={cn(
              'flex items-center gap-2 px-4 py-2.5 text-sm font-medium rounded-t-lg border-b-2 transition-colors',
              tab === id
                ? 'border-primary-500 text-primary-500 bg-primary-500/5'
                : 'border-transparent text-muted-foreground hover:text-foreground hover:bg-white/5',
            )}
          >
            <Icon size={14} />
            {label}
          </button>
        ))}
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-6">
        {tab === 'daily'     && <DailyTab />}
        {tab === 'items'     && <ItemsTab />}
        {tab === 'payments'  && <PaymentsTab />}
        {tab === 'gst'       && <GSTTab />}
        {tab === 'inventory' && <InventoryTab />}
      </div>
    </div>
  )
}
