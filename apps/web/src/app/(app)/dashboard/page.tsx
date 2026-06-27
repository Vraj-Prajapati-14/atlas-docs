import type { Metadata } from 'next'
import { LayoutDashboard } from 'lucide-react'

export const metadata: Metadata = { title: 'Dashboard' }

export default function DashboardPage() {
  return (
    <div className="space-y-6">
      {/* Page header */}
      <div>
        <h2 className="text-xl font-bold text-foreground">Good morning 👋</h2>
        <p className="text-sm text-muted-foreground mt-1">{"Here's what's happening at your restaurant today."}</p>
      </div>

      {/* Metric placeholders */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: "Today's Revenue",  value: '—',  color: 'border-primary-500' },
          { label: 'Orders Served',    value: '—',  color: 'border-success' },
          { label: 'Active Tables',    value: '—',  color: 'border-info' },
          { label: 'Avg Ticket',       value: '—',  color: 'border-purple-500' },
        ].map((m) => (
          <div
            key={m.label}
            className={`rounded-xl border bg-card p-5 border-t-2 ${m.color} border-l-0 border-r-0 border-b-0 border-solid`}
            style={{ borderTopWidth: 3 }}
          >
            <p className="text-[11px] font-semibold uppercase tracking-widest text-muted-foreground mb-2">
              {m.label}
            </p>
            <p className="text-2xl font-bold text-foreground font-mono">{m.value}</p>
            <div className="skeleton h-3 w-24 mt-2" />
          </div>
        ))}
      </div>

      {/* Coming soon panel */}
      <div className="rounded-xl border border-border bg-card flex flex-col items-center justify-center py-20 gap-4 text-center">
        <div className="flex items-center justify-center w-14 h-14 rounded-xl bg-primary-500/10">
          <LayoutDashboard size={24} className="text-primary-500" />
        </div>
        <div>
          <p className="text-sm font-semibold text-foreground">Dashboard coming in Phase 5</p>
          <p className="text-xs text-muted-foreground mt-1 max-w-xs">
            Revenue charts, table occupancy heatmap, low-stock alerts, and top items will live here.
          </p>
        </div>
      </div>
    </div>
  )
}
