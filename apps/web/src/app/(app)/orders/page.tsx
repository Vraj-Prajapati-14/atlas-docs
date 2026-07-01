'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { ClipboardList, ChevronRight } from 'lucide-react'
import { useOrders } from '@/hooks/use-orders'
import { Badge } from '@/components/ui/badge'
import { Spinner } from '@/components/ui/spinner'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import type { OrderStatus } from '@/lib/api-types'

type FilterTab = 'active' | 'all'

const STATUS_BADGE: Record<OrderStatus, { label: string; variant: 'default' | 'success' | 'warning' | 'info' | 'danger' | 'muted' }> = {
  DRAFT:       { label: 'Draft',       variant: 'muted' },
  CONFIRMED:   { label: 'Confirmed',   variant: 'info' },
  IN_PROGRESS: { label: 'In Progress', variant: 'warning' },
  READY:       { label: 'Ready',       variant: 'success' },
  SERVED:      { label: 'Served',      variant: 'success' },
  BILLED:      { label: 'Billed',      variant: 'default' },
  PAID:        { label: 'Paid',        variant: 'success' },
  CANCELLED:   { label: 'Cancelled',   variant: 'danger' },
  VOID:        { label: 'Void',        variant: 'danger' },
}

const ACTIVE_STATUSES: OrderStatus[] = ['DRAFT', 'CONFIRMED', 'IN_PROGRESS', 'READY', 'SERVED']

function paise(n: number) {
  return `₹ ${(n / 100).toLocaleString('en-IN', { minimumFractionDigits: 0 })}`
}

function relativeTime(iso: string) {
  const diff = Math.floor((Date.now() - new Date(iso).getTime()) / 1000)
  if (diff < 60) return `${diff}s ago`
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`
  return `${Math.floor(diff / 3600)}h ago`
}

export default function OrdersPage() {
  const router = useRouter()
  const [tab, setTab] = useState<FilterTab>('active')

  const { data, isLoading } = useOrders({
    status: undefined,   // fetch all, filter client-side for now
    limit: 50,
  })

  const allOrders = data ?? []
  const orders = tab === 'active'
    ? allOrders.filter((o) => ACTIVE_STATUSES.includes(o.status))
    : allOrders

  return (
    <div className="space-y-5">
      {/* Filter tabs */}
      <div className="flex items-center gap-4 border-b border-border">
        <TabBtn active={tab === 'active'} onClick={() => setTab('active')}>
          Active
          {allOrders.filter((o) => ACTIVE_STATUSES.includes(o.status)).length > 0 && (
            <Badge variant="default" className="ml-1.5 text-[9px] px-1.5 py-0">
              {allOrders.filter((o) => ACTIVE_STATUSES.includes(o.status)).length}
            </Badge>
          )}
        </TabBtn>
        <TabBtn active={tab === 'all'} onClick={() => setTab('all')}>
          All today
        </TabBtn>
      </div>

      {/* List */}
      {isLoading ? (
        <div className="flex justify-center py-16">
          <Spinner size="lg" className="text-primary-500" />
        </div>
      ) : orders.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 gap-3 text-muted-foreground">
          <ClipboardList size={40} className="opacity-20" />
          <p className="text-sm">No orders yet today</p>
        </div>
      ) : (
        <div className="space-y-2">
          {orders.map((order) => {
            const s = STATUS_BADGE[order.status]
            return (
              <button
                key={order.id}
                type="button"
                onClick={() => {
                  if (order.tableId) router.push(`/floor/${order.tableId}`)
                }}
                className={cn(
                  'w-full flex items-center gap-4 px-5 py-4 rounded-xl',
                  'border border-border bg-card text-left',
                  'hover:border-primary-500/40 hover:bg-background-hover',
                  'transition-all duration-100',
                )}
              >
                {/* Order number */}
                <div className="shrink-0 w-10 text-center">
                  <p className="text-lg font-extrabold text-foreground tabular-nums leading-none">
                    #{order.orderNumber}
                  </p>
                  <p className="text-[10px] text-muted-foreground mt-0.5">{order.type === 'DINE_IN' ? 'Dine' : order.type === 'TAKEAWAY' ? 'TkAwy' : 'Deliv'}</p>
                </div>

                {/* Table + items summary */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    {order.table && (
                      <span className="text-sm font-semibold text-foreground">{order.table.name}</span>
                    )}
                    <Badge variant={s.variant}>{s.label}</Badge>
                  </div>
                  <p className="text-xs text-muted-foreground truncate">
                    {order.items.length > 0
                      ? order.items.slice(0, 3).map((i) => `${i.menuItemName}×${i.quantity}`).join(', ')
                      : 'No items'}
                    {order.items.length > 3 && ` +${order.items.length - 3} more`}
                  </p>
                </div>

                {/* Price + time */}
                <div className="shrink-0 text-right">
                  <p className="text-sm font-bold tabular-nums text-foreground">
                    {paise(order.subtotalInPaise)}
                  </p>
                  <p className="text-[10px] text-muted-foreground mt-0.5">{relativeTime(order.createdAt)}</p>
                </div>

                <ChevronRight size={14} className="text-muted-foreground shrink-0" />
              </button>
            )
          })}
        </div>
      )}
    </div>
  )
}

function TabBtn({ active, onClick, children }: { active: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        'flex items-center px-1 py-2.5 text-sm font-semibold border-b-2 -mb-px transition-colors duration-100',
        active
          ? 'border-primary-500 text-primary-500'
          : 'border-transparent text-muted-foreground hover:text-foreground',
      )}
    >
      {children}
    </button>
  )
}
