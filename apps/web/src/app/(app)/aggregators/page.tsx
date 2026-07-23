'use client'

import { useRequireRole } from '@/hooks/use-require-role'
import { useState } from 'react'
import { useAuthStore } from '@/lib/auth-store'
import { Link as LinkIcon, Plus, Pencil, Trash2, CheckCircle, Truck, PackageCheck, XCircle, ChevronLeft, ChevronRight } from 'lucide-react'
import {
  useAggregatorCredentials, useAggregatorOrders,
  useCreateCredential, useUpdateCredential, useDeleteCredential,
  useAcceptAggregatorOrder, useDispatchAggregatorOrder, useCancelAggregatorOrder, useDeliverAggregatorOrder,
} from '@/hooks/use-aggregators'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Spinner } from '@/components/ui/spinner'
import { cn } from '@/lib/utils'
import type { AggregatorCredential, AggregatorOrder, AggregatorPlatform, AggregatorOrderStatus } from '@/lib/api-types'

// ─── Config ───────────────────────────────────────────────────────────────────

const PLATFORM_COLOR: Record<AggregatorPlatform, string> = {
  ZOMATO:   'text-red-500 border-red-500/30 bg-red-500/5',
  SWIGGY:   'text-orange-500 border-orange-500/30 bg-orange-500/5',
  MAGICPIN: 'text-purple-500 border-purple-500/30 bg-purple-500/5',
  EATSURE:  'text-blue-500 border-blue-500/30 bg-blue-500/5',
}

const STATUS_BADGE: Record<AggregatorOrderStatus, { label: string; variant: 'warning' | 'info' | 'success' | 'danger' | 'muted' }> = {
  NEW:        { label: 'New',        variant: 'warning' },
  ACCEPTED:   { label: 'Accepted',   variant: 'info'    },
  DISPATCHED: { label: 'Dispatched', variant: 'success' },
  DELIVERED:  { label: 'Delivered',  variant: 'muted'   },
  CANCELLED:  { label: 'Cancelled',  variant: 'danger'  },
}

const ALL_PLATFORMS: AggregatorPlatform[] = ['ZOMATO', 'SWIGGY', 'MAGICPIN', 'EATSURE']

function fmt(paise: number) {
  return `₹${(paise / 100).toLocaleString('en-IN', { maximumFractionDigits: 0 })}`
}

function timeAgo(iso: string) {
  const diff = Math.floor((Date.now() - new Date(iso).getTime()) / 60000)
  if (diff < 1) return 'just now'
  if (diff < 60) return `${diff}m ago`
  return `${Math.floor(diff / 60)}h ago`
}

// ─── Credential Panel ─────────────────────────────────────────────────────────

function CredentialPanel({ cred, onClose }: { cred?: AggregatorCredential | null; onClose: () => void }) {
  const isEdit = !!cred
  const create = useCreateCredential()
  const update = useUpdateCredential()
  const tenantId = useAuthStore((s) => s.user?.tenantId ?? '')

  const [platform, setPlatform]   = useState<AggregatorPlatform>(cred?.platform ?? 'ZOMATO')
  const [outletId, setOutletId]   = useState(cred?.outletId ?? tenantId)
  const [apiKey, setApiKey]       = useState('')
  const [secretKey, setSecretKey] = useState('')
  const [restId, setRestId]       = useState(cred?.restaurantId ?? '')

  const isPending = create.isPending || update.isPending

  const fieldCls = 'w-full bg-background border border-border rounded-lg px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-primary-500 placeholder:text-muted-foreground/40'

  function handleSave() {
    if (isEdit) {
      update.mutate({ id: cred.id, apiKey: apiKey || undefined, secretKey: secretKey || undefined, restaurantId: restId || undefined }, { onSuccess: onClose })
    } else {
      create.mutate({ platform, outletId, apiKey, secretKey: secretKey || undefined, restaurantId: restId }, { onSuccess: onClose })
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex">
      <button type="button" className="flex-1 bg-black/50" onClick={onClose} />
      <aside className="w-[380px] h-full bg-background border-l border-border flex flex-col">
        <div className="flex items-center justify-between px-5 py-4 border-b border-border">
          <h3 className="font-bold text-sm">{isEdit ? 'Edit Integration' : 'Add Integration'}</h3>
          <button type="button" onClick={onClose} className="text-muted-foreground hover:text-foreground text-lg leading-none">×</button>
        </div>

        <div className="flex-1 overflow-y-auto p-5 space-y-4">
          {!isEdit && (
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Platform</label>
              <div className="grid grid-cols-2 gap-2">
                {ALL_PLATFORMS.map((p) => (
                  <button key={p} type="button" onClick={() => setPlatform(p)}
                    className={cn(
                      'py-2 px-3 rounded-lg text-sm font-bold border transition-colors',
                      platform === p ? PLATFORM_COLOR[p] : 'border-border text-muted-foreground hover:border-border/80',
                    )}>
                    {p}
                  </button>
                ))}
              </div>
            </div>
          )}

          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
              Restaurant ID <span className="font-normal opacity-50">(platform&apos;s ID)</span>
            </label>
            <input value={restId} onChange={e => setRestId(e.target.value)}
              placeholder="Platform restaurant ID" className={fieldCls} />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
              API Key {isEdit && <span className="font-normal opacity-50">(leave blank to keep)</span>}
            </label>
            <input value={apiKey} onChange={e => setApiKey(e.target.value)}
              placeholder={isEdit ? '••••••••' : 'Webhook API key'} className={fieldCls} />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
              Secret Key <span className="font-normal opacity-50">(optional)</span>
            </label>
            <input value={secretKey} onChange={e => setSecretKey(e.target.value)}
              placeholder={isEdit ? '••••••••' : 'HMAC signing secret'} className={fieldCls} />
          </div>

          <p className="text-[11px] text-muted-foreground bg-background-card border border-border rounded-lg p-3">
            Webhook URL: <span className="font-mono text-foreground">/api/v1/aggregators/webhooks/{platform.toLowerCase()}</span>
            <br />Point this in your platform dashboard to receive live orders.
          </p>
        </div>

        <div className="px-5 py-4 border-t border-border flex gap-3">
          <Button variant="ghost" className="flex-1" onClick={onClose}>Cancel</Button>
          <Button className="flex-1" disabled={isPending} onClick={handleSave}>
            {isPending ? <Spinner size="xs" className="mr-2" /> : null}
            {isEdit ? 'Save' : 'Add Integration'}
          </Button>
        </div>
      </aside>
    </div>
  )
}

// ─── Order card ───────────────────────────────────────────────────────────────

function OrderCard({ order }: { order: AggregatorOrder }) {
  const accept   = useAcceptAggregatorOrder()
  const dispatch = useDispatchAggregatorOrder()
  const deliver  = useDeliverAggregatorOrder()
  const cancel   = useCancelAggregatorOrder()

  const [cancelMode, setCancelMode] = useState(false)
  const [reason, setReason]         = useState('')

  const sb = STATUS_BADGE[order.status]

  return (
    <div className="bg-background-card border border-border rounded-xl overflow-hidden">
      {/* Header */}
      <div className={cn('flex items-center justify-between px-4 py-2.5', PLATFORM_COLOR[order.platform])}>
        <div className="flex items-center gap-2">
          <span className="text-sm font-bold">{order.platform}</span>
          <span className="text-xs opacity-70">#{order.platformOrderId.slice(-8)}</span>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant={sb.variant}>{sb.label}</Badge>
          <span className="text-[11px] opacity-70">{timeAgo(order.createdAt)}</span>
        </div>
      </div>

      {/* Body */}
      <div className="p-4 space-y-3">
        {order.customerName && (
          <div className="text-sm">
            <span className="font-semibold text-foreground">{order.customerName}</span>
            {order.customerPhone && <span className="text-muted-foreground ml-2 text-xs">{order.customerPhone}</span>}
          </div>
        )}

        <ul className="space-y-1">
          {order.items.map((item, i) => (
            <li key={i} className="flex items-center justify-between text-xs">
              <span className="text-foreground/80">×{item.quantity} {item.name}</span>
              <span className="text-muted-foreground tabular-nums">{fmt(item.unitPriceInPaise * item.quantity)}</span>
            </li>
          ))}
        </ul>

        <div className="flex items-center justify-between pt-2 border-t border-border/50">
          <div className="text-[11px] text-muted-foreground space-y-0.5">
            {order.deliveryFeeInPaise > 0 && <p>Delivery: {fmt(order.deliveryFeeInPaise)}</p>}
            {order.platformFeeInPaise > 0 && <p>Platform fee: {fmt(order.platformFeeInPaise)}</p>}
          </div>
          <span className="font-bold text-foreground tabular-nums">{fmt(order.grandTotalInPaise)}</span>
        </div>

        {order.deliveryAddress && (
          <p className="text-[11px] text-muted-foreground truncate">{order.deliveryAddress}</p>
        )}

        {/* Actions */}
        {!cancelMode && (
          <div className="flex gap-2 pt-1">
            {order.status === 'NEW' && (
              <Button size="sm" className="flex-1 text-xs gap-1.5" disabled={accept.isPending}
                onClick={() => accept.mutate(order.id)}>
                {accept.isPending ? <Spinner size="xs" /> : <CheckCircle size={12} />} Accept
              </Button>
            )}
            {order.status === 'ACCEPTED' && (
              <Button size="sm" className="flex-1 text-xs gap-1.5" disabled={dispatch.isPending}
                onClick={() => dispatch.mutate(order.id)}>
                {dispatch.isPending ? <Spinner size="xs" /> : <Truck size={12} />} Dispatch
              </Button>
            )}
            {(order.status === 'NEW' || order.status === 'ACCEPTED') && (
              <Button size="sm" variant="outline" className="text-xs text-danger border-danger/30 hover:bg-danger/10"
                onClick={() => setCancelMode(true)}>
                <XCircle size={12} />
              </Button>
            )}
            {order.status === 'DISPATCHED' && (
              <Button size="sm" variant="outline" className="flex-1 text-xs gap-1.5" disabled={deliver.isPending}
                onClick={() => deliver.mutate(order.id)}>
                {deliver.isPending ? <Spinner size="xs" /> : <PackageCheck size={12} />} Delivered
              </Button>
            )}
          </div>
        )}

        {cancelMode && (
          <div className="space-y-2">
            <input value={reason} onChange={e => setReason(e.target.value)}
              placeholder="Cancellation reason (min 3 chars)"
              className="w-full bg-background border border-border rounded-lg px-3 py-2 text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-danger placeholder:text-muted-foreground/40" />
            <div className="flex gap-2">
              <Button size="sm" variant="ghost" className="flex-1 text-xs" onClick={() => setCancelMode(false)}>Back</Button>
              <Button size="sm" variant="danger" className="flex-1 text-xs" disabled={reason.length < 3 || cancel.isPending}
                onClick={() => cancel.mutate({ id: order.id, reason }, { onSuccess: () => setCancelMode(false) })}>
                {cancel.isPending ? <Spinner size="xs" /> : 'Cancel Order'}
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

// ─── Page ─────────────────────────────────────────────────────────────────────

const STATUS_FILTERS: (AggregatorOrderStatus | 'ALL')[] = ['ALL', 'NEW', 'ACCEPTED', 'DISPATCHED', 'DELIVERED', 'CANCELLED']

export default function AggregatorsPage() {
  const allowed = useRequireRole(['OWNER', 'MANAGER'])
  const [credPanel, setCredPanel] = useState<AggregatorCredential | 'add' | null>(null)
  const [statusFilter, setStatusFilter] = useState<AggregatorOrderStatus | 'ALL'>('ALL')
  const [platformFilter, setPlatformFilter] = useState<AggregatorPlatform | 'ALL'>('ALL')
  const [page, setPage] = useState(1)

  const { data: credentials, isLoading: credsLoading } = useAggregatorCredentials()
  const { data: ordersData, isLoading: ordersLoading } = useAggregatorOrders({
    status:   statusFilter   !== 'ALL' ? statusFilter   : undefined,
    platform: platformFilter !== 'ALL' ? platformFilter : undefined,
    page,
  })
  const deleteCredential = useDeleteCredential()

  if (!allowed) return null

  const orders     = ordersData?.data ?? []
  const pagination = ordersData?.meta?.pagination

  return (
    <div className="flex flex-col h-full -m-6 bg-background-card">
      {/* Header */}
      <div className="flex items-center justify-between px-6 py-3 border-b border-border bg-background shrink-0">
        <div className="flex items-center gap-3">
          <LinkIcon size={18} className="text-primary-500" />
          <span className="text-sm font-bold">Aggregators</span>
        </div>
        <Button size="sm" className="gap-2 text-xs" onClick={() => setCredPanel('add')}>
          <Plus size={13} /> Add Integration
        </Button>
      </div>

      <div className="flex-1 overflow-y-auto p-6 space-y-6">
        {/* Credentials */}
        <div>
          <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-3">Active Integrations</p>
          {credsLoading ? (
            <div className="flex items-center gap-3"><Spinner size="sm" className="text-primary-500" /><span className="text-sm text-muted-foreground">Loading…</span></div>
          ) : !credentials || credentials.length === 0 ? (
            <div className="bg-background-card border border-dashed border-border rounded-xl p-8 text-center">
              <p className="text-sm text-muted-foreground">No integrations yet. Add Zomato, Swiggy, or others.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
              {credentials.map((cred) => (
                <div key={cred.id} className={cn('border rounded-xl p-4 space-y-3', PLATFORM_COLOR[cred.platform])}>
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-sm">{cred.platform}</span>
                    <Badge variant={cred.isActive ? 'success' : 'muted'}>{cred.isActive ? 'Active' : 'Paused'}</Badge>
                  </div>
                  <p className="text-[11px] text-muted-foreground">ID: {cred.restaurantId}</p>
                  <div className="flex gap-1">
                    <button type="button" onClick={() => setCredPanel(cred)}
                      className="p-1.5 rounded-md text-muted-foreground hover:text-foreground hover:bg-white/5">
                      <Pencil size={12} />
                    </button>
                    <button type="button" onClick={() => deleteCredential.mutate(cred.id)}
                      className="p-1.5 rounded-md text-muted-foreground hover:text-danger hover:bg-danger/10">
                      <Trash2 size={12} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Orders */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Incoming Orders</p>
            {pagination && <span className="text-xs text-muted-foreground">{pagination.total} total</span>}
          </div>

          {/* Filters */}
          <div className="flex flex-wrap gap-2 mb-4">
            <div className="flex items-center gap-1 flex-wrap">
              {(['ALL', ...ALL_PLATFORMS] as const).map((p) => (
                <button key={p} type="button" onClick={() => { setPlatformFilter(p); setPage(1) }}
                  className={cn(
                    'px-2.5 py-1 rounded-md text-xs font-medium transition-colors',
                    platformFilter === p
                      ? 'bg-primary-500/10 text-primary-500'
                      : 'text-muted-foreground hover:bg-white/5 hover:text-foreground',
                  )}>
                  {p === 'ALL' ? 'All Platforms' : p}
                </button>
              ))}
            </div>
            <div className="h-4 w-px bg-border self-center hidden sm:block" />
            <div className="flex items-center gap-1 flex-wrap">
              {STATUS_FILTERS.map((s) => (
                <button key={s} type="button" onClick={() => { setStatusFilter(s); setPage(1) }}
                  className={cn(
                    'px-2.5 py-1 rounded-md text-xs font-medium transition-colors',
                    statusFilter === s
                      ? 'bg-primary-500/10 text-primary-500'
                      : 'text-muted-foreground hover:bg-white/5 hover:text-foreground',
                  )}>
                  {s === 'ALL' ? 'All Status' : STATUS_BADGE[s].label}
                </button>
              ))}
            </div>
          </div>

          {ordersLoading ? (
            <div className="flex items-center justify-center py-16"><Spinner size="xl" className="text-primary-500" /></div>
          ) : orders.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 gap-3 text-muted-foreground">
              <LinkIcon size={40} className="opacity-15" />
              <p className="text-sm font-semibold">No orders found</p>
              <p className="text-xs opacity-60">Orders from Zomato/Swiggy will appear here.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {orders.map((order) => <OrderCard key={order.id} order={order} />)}
            </div>
          )}

          {/* Pagination */}
          {pagination && pagination.totalPages > 1 && (
            <div className="flex items-center justify-between mt-4">
              <p className="text-xs text-muted-foreground">Page {pagination.page} of {pagination.totalPages}</p>
              <div className="flex gap-2">
                <Button variant="ghost" size="icon-sm" disabled={page <= 1} onClick={() => setPage(p => p - 1)}>
                  <ChevronLeft size={14} />
                </Button>
                <Button variant="ghost" size="icon-sm" disabled={page >= pagination.totalPages} onClick={() => setPage(p => p + 1)}>
                  <ChevronRight size={14} />
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>

      {credPanel !== null && (
        <CredentialPanel
          cred={credPanel === 'add' ? null : credPanel}
          onClose={() => setCredPanel(null)}
        />
      )}
    </div>
  )
}
