'use client'

import { useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import {
  ArrowLeft,
  Building2,
  Phone,
  Mail,
  MapPin,
  CreditCard,
  BarChart3,
  Users,
  UtensilsCrossed,
  ShoppingBag,
  CheckCircle2,
  Circle,
  AlertCircle,
  Clock,
  Power,
  CalendarDays,
  Hash,
  Globe,
  Receipt,
  TrendingUp,
} from 'lucide-react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { adminFetch } from '@/lib/admin-api'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Spinner } from '@/components/ui/spinner'
import { cn } from '@/lib/utils'
import { toast } from 'sonner'

// ─── Types ────────────────────────────────────────────────────────────────────

type TenantPlanStatus = 'ACTIVE' | 'PENDING_PAYMENT' | 'SUSPENDED'
type PlanType = 'MONTHLY' | 'YEARLY' | 'LIFETIME'
type SubscriptionPlan = 'FREE' | 'STARTER' | 'GROWTH' | 'PRO'
type RestaurantType =
  | 'QSR' | 'CASUAL_DINING' | 'FINE_DINING' | 'CAFE'
  | 'BAR' | 'FOOD_TRUCK' | 'CLOUD_KITCHEN' | 'BAKERY' | 'DHABA' | 'SWEET_SHOP'

interface OnboardingSteps {
  restaurantProfileDone: boolean
  outletDone: boolean
  menuDone: boolean
  tablesDone: boolean
  staffDone: boolean
  firstOrderDone: boolean
  completedAt: string | null
}

interface RecentOrder {
  id: string
  orderNumber: number
  type: string
  status: string
  createdAt: string
  grandTotalInPaise?: number
}

interface TenantDetail {
  id: string
  name: string
  slug: string
  type: RestaurantType
  plan: SubscriptionPlan
  planStatus: TenantPlanStatus
  planType: PlanType
  planExpiresAt: string | null
  phone: string
  email: string | null
  website: string | null
  gstin: string | null
  fssaiLicense: string | null
  panNumber: string | null
  addressLine1: string
  addressLine2: string | null
  city: string
  state: string
  pincode: string
  country: string
  isActive: boolean
  createdAt: string
  updatedAt: string
  ownerName?: string
  ownerPhone?: string
  ownerEmail?: string | null
  _count: {
    orders: number
    users: number
    menuItems: number
  }
  recentOrders: RecentOrder[]
  onboardingSteps: OnboardingSteps | null
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

const STATUS_CONFIG: Record<
  TenantPlanStatus,
  { label: string; variant: 'success' | 'warning' | 'danger'; Icon: React.ElementType; dot: string }
> = {
  ACTIVE:          { label: 'Active',          variant: 'success', Icon: CheckCircle2, dot: 'bg-success'  },
  PENDING_PAYMENT: { label: 'Pending Payment', variant: 'warning', Icon: Clock,        dot: 'bg-warning'  },
  SUSPENDED:       { label: 'Suspended',       variant: 'danger',  Icon: AlertCircle,  dot: 'bg-danger'   },
}

const TYPE_LABELS: Record<RestaurantType, string> = {
  QSR: 'QSR', CASUAL_DINING: 'Casual Dining', FINE_DINING: 'Fine Dining',
  CAFE: 'Cafe', BAR: 'Bar', FOOD_TRUCK: 'Food Truck',
  CLOUD_KITCHEN: 'Cloud Kitchen', BAKERY: 'Bakery', DHABA: 'Dhaba', SWEET_SHOP: 'Sweet Shop',
}

const ORDER_STATUS_COLORS: Record<string, string> = {
  PAID:       'text-success',
  BILLED:     'text-info',
  SERVED:     'text-info',
  IN_PROGRESS:'text-warning',
  CONFIRMED:  'text-warning',
  CANCELLED:  'text-danger',
  VOID:       'text-danger',
  DRAFT:      'text-muted-foreground',
  READY:      'text-primary-400',
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })
}

function formatDateTime(iso: string) {
  return new Date(iso).toLocaleString('en-IN', {
    day: '2-digit', month: 'short', year: 'numeric',
    hour: '2-digit', minute: '2-digit', hour12: true,
  })
}

function fmtPaise(paise: number) {
  return `₹${(paise / 100).toLocaleString('en-IN', { maximumFractionDigits: 0 })}`
}

// ─── Info Card ────────────────────────────────────────────────────────────────

interface InfoCardProps {
  title: string
  Icon: React.ElementType
  children: React.ReactNode
  className?: string
}

function InfoCard({ title, Icon, children, className }: InfoCardProps) {
  return (
    <div className={cn('rounded-xl border border-border bg-background-card p-5', className)}>
      <div className="flex items-center gap-2 mb-4">
        <div className="w-6 h-6 rounded-md bg-primary-500/10 flex items-center justify-center">
          <Icon size={13} className="text-primary-500" />
        </div>
        <p className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">{title}</p>
      </div>
      {children}
    </div>
  )
}

// ─── Field Row ────────────────────────────────────────────────────────────────

function FieldRow({ label, value, mono }: { label: string; value?: string | null; mono?: boolean }) {
  if (!value) return null
  return (
    <div className="flex items-start justify-between gap-4 py-2 border-b border-border/40 last:border-0">
      <span className="text-xs text-muted-foreground shrink-0">{label}</span>
      <span className={cn('text-xs text-foreground text-right', mono && 'font-mono')}>{value}</span>
    </div>
  )
}

// ─── Stat Tile ────────────────────────────────────────────────────────────────

interface StatTileProps {
  label: string
  value: string | number
  Icon: React.ElementType
  accent?: string
}

function StatTile({ label, value, Icon, accent = 'text-primary-500' }: StatTileProps) {
  return (
    <div className="rounded-xl border border-border bg-background-card p-4 flex items-center gap-4">
      <div className={cn('w-10 h-10 rounded-lg flex items-center justify-center bg-white/[0.04]', 'shrink-0')}>
        <Icon size={18} className={accent} />
      </div>
      <div>
        <p className="text-2xl font-bold text-foreground tabular-nums leading-none">{value}</p>
        <p className="text-[11px] text-muted-foreground mt-1">{label}</p>
      </div>
    </div>
  )
}

// ─── Onboarding Progress ──────────────────────────────────────────────────────

function OnboardingProgress({ steps }: { steps: OnboardingSteps }) {
  const items = [
    { label: 'Restaurant Profile',  done: steps.restaurantProfileDone },
    { label: 'Outlet Configured',   done: steps.outletDone            },
    { label: 'Menu Added',          done: steps.menuDone              },
    { label: 'Tables Set Up',       done: steps.tablesDone            },
    { label: 'Staff Invited',       done: steps.staffDone             },
    { label: 'First Order Placed',  done: steps.firstOrderDone        },
  ]
  const doneCount = items.filter((i) => i.done).length
  const pct = Math.round((doneCount / items.length) * 100)

  return (
    <div className="rounded-xl border border-border bg-background-card p-5">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded-md bg-primary-500/10 flex items-center justify-center">
            <CheckCircle2 size={13} className="text-primary-500" />
          </div>
          <p className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">
            Onboarding Progress
          </p>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs font-bold text-foreground tabular-nums">{doneCount}/{items.length}</span>
          {steps.completedAt && (
            <Badge variant="success">Complete</Badge>
          )}
        </div>
      </div>

      {/* Progress bar */}
      <div className="w-full bg-white/5 rounded-full h-1.5 mb-4">
        <div
          className={cn(
            'h-1.5 rounded-full transition-all',
            pct === 100 ? 'bg-success' : 'bg-primary-500',
          )}
          style={{ width: `${pct}%` }}
        />
      </div>

      {/* Steps */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-1 gap-x-6">
        {items.map((item) => (
          <div key={item.label} className="flex items-center gap-2.5 py-1">
            {item.done ? (
              <CheckCircle2 size={14} className="text-success shrink-0" />
            ) : (
              <Circle size={14} className="text-muted-foreground/30 shrink-0" />
            )}
            <span
              className={cn(
                'text-xs',
                item.done ? 'text-muted-foreground line-through' : 'text-foreground',
              )}
            >
              {item.label}
            </span>
          </div>
        ))}
      </div>

      {steps.completedAt && (
        <p className="text-[11px] text-muted-foreground mt-3 pt-3 border-t border-border/40">
          Completed {formatDate(steps.completedAt)}
        </p>
      )}
    </div>
  )
}

// ─── Status confirm modal ─────────────────────────────────────────────────────

interface StatusConfirmProps {
  tenantId: string
  tenantName: string
  newStatus: TenantPlanStatus
  onClose: () => void
}

function StatusConfirm({ tenantId, tenantName, newStatus, onClose }: StatusConfirmProps) {
  const queryClient = useQueryClient()
  const isActivating = newStatus === 'ACTIVE'

  const patch = useMutation({
    mutationFn: () =>
      adminFetch(`/api/v1/admin/tenants/${tenantId}/status`, {
        method: 'PATCH',
        body: JSON.stringify({ status: newStatus }),
      }),
    onSuccess: () => {
      toast.success(isActivating ? `${tenantName} activated` : `${tenantName} suspended`)
      queryClient.invalidateQueries({ queryKey: ['admin-tenant', tenantId] })
      queryClient.invalidateQueries({ queryKey: ['admin-tenants'] })
      onClose()
    },
    onError: (e: Error) => toast.error(e.message),
  })

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70">
      <div className="bg-[#0A0D16] border border-border rounded-2xl p-6 w-[360px] shadow-2xl">
        <div
          className={cn(
            'w-10 h-10 rounded-full flex items-center justify-center mb-4',
            isActivating ? 'bg-success/15' : 'bg-danger/15',
          )}
        >
          <Power size={18} className={isActivating ? 'text-success' : 'text-danger'} />
        </div>
        <h3 className="font-bold text-sm text-foreground mb-1">
          {isActivating ? 'Activate' : 'Suspend'} {tenantName}?
        </h3>
        <p className="text-xs text-muted-foreground mb-5">
          {isActivating
            ? 'The restaurant will regain full access to Atlas immediately.'
            : 'The restaurant and all its staff will lose access to Atlas until reactivated.'}
        </p>
        <div className="flex gap-3">
          <Button variant="ghost" className="flex-1" onClick={onClose}>
            Cancel
          </Button>
          <Button
            variant={isActivating ? 'success' : 'danger'}
            className="flex-1"
            disabled={patch.isPending}
            onClick={() => patch.mutate()}
          >
            {patch.isPending ? <Spinner size="sm" /> : isActivating ? 'Activate' : 'Suspend'}
          </Button>
        </div>
      </div>
    </div>
  )
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function AdminTenantDetailPage() {
  const params = useParams()
  const router = useRouter()
  const id = params['id'] as string

  const [statusConfirm, setStatusConfirm] = useState<TenantPlanStatus | null>(null)

  const { data: tenant, isLoading, isError } = useQuery({
    queryKey: ['admin-tenant', id],
    queryFn: () => adminFetch<TenantDetail>(`/api/v1/admin/tenants/${id}`),
    enabled: !!id,
  })

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full min-h-[400px]">
        <Spinner size="xl" className="text-primary-500" />
      </div>
    )
  }

  if (isError || !tenant) {
    return (
      <div className="flex flex-col items-center justify-center h-full min-h-[400px] gap-4">
        <AlertCircle size={40} className="text-danger opacity-50" />
        <p className="text-sm font-semibold text-muted-foreground">Failed to load restaurant data.</p>
        <Button variant="ghost" size="sm" onClick={() => router.back()}>
          <ArrowLeft size={14} className="mr-2" />
          Go back
        </Button>
      </div>
    )
  }

  const statusCfg = STATUS_CONFIG[tenant.planStatus]

  return (
    <div className="max-w-[1200px] mx-auto px-6 py-6 space-y-6">
      {/* ── Back + Header ── */}
      <div>
        <button
          type="button"
          onClick={() => router.push('/admin/tenants')}
          className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors mb-4"
        >
          <ArrowLeft size={13} />
          All Restaurants
        </button>

        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
          <div className="flex items-start gap-4">
            {/* Avatar */}
            <div className="w-14 h-14 rounded-2xl bg-primary-500/12 border border-primary-500/25 flex items-center justify-center shrink-0">
              <span className="text-xl font-black text-primary-400">
                {tenant.name.charAt(0).toUpperCase()}
              </span>
            </div>

            <div>
              <div className="flex items-center gap-3 flex-wrap">
                <h1 className="text-xl font-bold text-foreground">{tenant.name}</h1>
                <Badge variant={statusCfg.variant}>
                  <statusCfg.Icon size={9} />
                  {statusCfg.label}
                </Badge>
                <Badge variant="muted">{TYPE_LABELS[tenant.type]}</Badge>
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                {tenant.city}, {tenant.state} · Added {formatDate(tenant.createdAt)}
              </p>
              <p className="text-[11px] text-muted-foreground/60 mt-0.5 font-mono">
                /{tenant.slug}
              </p>
            </div>
          </div>

          {/* Action buttons */}
          <div className="flex items-center gap-2 shrink-0">
            {tenant.planStatus !== 'ACTIVE' && (
              <Button
                variant="success"
                size="sm"
                className="gap-2 text-xs"
                onClick={() => setStatusConfirm('ACTIVE')}
              >
                <CheckCircle2 size={13} />
                Activate
              </Button>
            )}
            {tenant.planStatus !== 'SUSPENDED' && (
              <Button
                variant="danger"
                size="sm"
                className="gap-2 text-xs"
                onClick={() => setStatusConfirm('SUSPENDED')}
              >
                <AlertCircle size={13} />
                Suspend
              </Button>
            )}
          </div>
        </div>
      </div>

      {/* ── Stats row ── */}
      <div className="grid grid-cols-3 gap-4">
        <StatTile
          label="Total Orders"
          value={tenant._count.orders.toLocaleString('en-IN')}
          Icon={ShoppingBag}
          accent="text-primary-400"
        />
        <StatTile
          label="Staff Members"
          value={tenant._count.users}
          Icon={Users}
          accent="text-info"
        />
        <StatTile
          label="Menu Items"
          value={tenant._count.menuItems}
          Icon={UtensilsCrossed}
          accent="text-success"
        />
      </div>

      {/* ── Info grid ── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-2 gap-4">
        {/* Contact */}
        <InfoCard title="Contact" Icon={Phone}>
          <div className="space-y-0">
            <FieldRow label="Owner" value={tenant.ownerName} />
            <FieldRow label="Phone" value={tenant.phone} />
            <FieldRow label="Owner Phone" value={tenant.ownerPhone} />
            <FieldRow label="Email" value={tenant.email} />
            <FieldRow label="Owner Email" value={tenant.ownerEmail} />
            {tenant.website && (
              <div className="flex items-start justify-between gap-4 py-2 border-b border-border/40 last:border-0">
                <span className="text-xs text-muted-foreground shrink-0">Website</span>
                <a
                  href={tenant.website}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs text-primary-400 hover:underline flex items-center gap-1"
                >
                  <Globe size={11} />
                  {tenant.website.replace(/^https?:\/\//, '')}
                </a>
              </div>
            )}
          </div>
        </InfoCard>

        {/* Address */}
        <InfoCard title="Address" Icon={MapPin}>
          <div className="space-y-0">
            <FieldRow label="Street" value={tenant.addressLine1} />
            {tenant.addressLine2 && <FieldRow label="" value={tenant.addressLine2} />}
            <FieldRow label="City" value={tenant.city} />
            <FieldRow label="State" value={tenant.state} />
            <FieldRow label="Pincode" value={tenant.pincode} />
            <FieldRow label="Country" value={tenant.country} />
          </div>
          {tenant.gstin && (
            <div className="mt-3 pt-3 border-t border-border/40">
              <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider mb-2">Legal</p>
              <FieldRow label="GSTIN" value={tenant.gstin} mono />
              <FieldRow label="FSSAI" value={tenant.fssaiLicense} mono />
              <FieldRow label="PAN" value={tenant.panNumber} mono />
            </div>
          )}
        </InfoCard>

        {/* Plan */}
        <InfoCard title="Subscription Plan" Icon={CreditCard}>
          <div className="space-y-0">
            <div className="flex items-start justify-between gap-4 py-2 border-b border-border/40">
              <span className="text-xs text-muted-foreground shrink-0">Status</span>
              <Badge variant={statusCfg.variant}>{statusCfg.label}</Badge>
            </div>
            <div className="flex items-start justify-between gap-4 py-2 border-b border-border/40">
              <span className="text-xs text-muted-foreground shrink-0">Plan Tier</span>
              <span className="text-xs font-semibold text-foreground">{tenant.plan}</span>
            </div>
            <FieldRow
              label="Billing Cycle"
              value={tenant.planType.charAt(0) + tenant.planType.slice(1).toLowerCase()}
            />
            {tenant.planExpiresAt && (
              <div className="flex items-start justify-between gap-4 py-2 border-b border-border/40 last:border-0">
                <span className="text-xs text-muted-foreground shrink-0">Expires</span>
                <span
                  className={cn(
                    'text-xs',
                    new Date(tenant.planExpiresAt) < new Date()
                      ? 'text-danger font-semibold'
                      : 'text-foreground',
                  )}
                >
                  {formatDate(tenant.planExpiresAt)}
                </span>
              </div>
            )}
            <div className="flex items-start justify-between gap-4 py-2 border-b border-border/40 last:border-0">
              <span className="text-xs text-muted-foreground shrink-0">Account Created</span>
              <div className="flex items-center gap-1 text-xs text-foreground">
                <CalendarDays size={11} className="text-muted-foreground/50" />
                {formatDate(tenant.createdAt)}
              </div>
            </div>
          </div>
        </InfoCard>

        {/* Recent activity */}
        <InfoCard title="Recent Activity" Icon={TrendingUp}>
          {!tenant.recentOrders || tenant.recentOrders.length === 0 ? (
            <div className="py-6 text-center">
              <ShoppingBag size={28} className="text-muted-foreground/20 mx-auto mb-2" />
              <p className="text-xs text-muted-foreground">No orders yet</p>
            </div>
          ) : (
            <div className="space-y-0">
              {tenant.recentOrders.slice(0, 5).map((order) => (
                <div
                  key={order.id}
                  className="flex items-center justify-between py-2 border-b border-border/40 last:border-0 gap-3"
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <div className="w-6 h-6 rounded-md bg-white/[0.04] flex items-center justify-center shrink-0">
                      <Receipt size={11} className="text-muted-foreground/50" />
                    </div>
                    <div className="min-w-0">
                      <p className="text-xs font-semibold text-foreground tabular-nums">
                        #{order.orderNumber}
                      </p>
                      <p className="text-[10px] text-muted-foreground truncate">
                        {order.type.replace('_', ' ')} ·{' '}
                        {new Date(order.createdAt).toLocaleDateString('en-IN', {
                          day: '2-digit', month: 'short',
                        })}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    {order.grandTotalInPaise !== undefined && (
                      <span className="text-xs font-semibold text-foreground tabular-nums">
                        {fmtPaise(order.grandTotalInPaise)}
                      </span>
                    )}
                    <span
                      className={cn(
                        'text-[10px] font-semibold uppercase',
                        ORDER_STATUS_COLORS[order.status] ?? 'text-muted-foreground',
                      )}
                    >
                      {order.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </InfoCard>
      </div>

      {/* ── Onboarding Progress ── */}
      {tenant.onboardingSteps && (
        <OnboardingProgress steps={tenant.onboardingSteps} />
      )}

      {/* ── Status confirm modal ── */}
      {statusConfirm && (
        <StatusConfirm
          tenantId={tenant.id}
          tenantName={tenant.name}
          newStatus={statusConfirm}
          onClose={() => setStatusConfirm(null)}
        />
      )}
    </div>
  )
}
