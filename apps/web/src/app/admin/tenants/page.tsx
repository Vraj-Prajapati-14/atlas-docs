'use client'

import { useState, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import {
  Building2,
  Search,
  Plus,
  ChevronLeft,
  ChevronRight,
  MoreHorizontal,
  CheckCircle2,
  AlertCircle,
  Clock,
  ShoppingBag,
  CalendarDays,
  X,
  SlidersHorizontal,
  Power,
  Eye,
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

interface AdminTenant {
  id: string
  name: string
  slug: string
  type: RestaurantType
  plan: SubscriptionPlan
  planStatus: TenantPlanStatus
  planType: PlanType
  phone: string
  email: string | null
  city: string
  state: string
  createdAt: string
  isActive: boolean
  _count?: {
    orders: number
    users: number
  }
  ownerName?: string
}

interface TenantsResponse {
  tenants: AdminTenant[]
  total: number
  page: number
  totalPages: number
}

// ─── Add Tenant Modal ─────────────────────────────────────────────────────────

interface AddTenantModalProps {
  onClose: () => void
  onCreated: () => void
}

function AddTenantModal({ onClose, onCreated }: AddTenantModalProps) {
  const [form, setForm] = useState({
    name: '',
    phone: '',
    email: '',
    type: 'CASUAL_DINING' as RestaurantType,
    addressLine1: '',
    city: '',
    state: '',
    pincode: '',
    ownerName: '',
    ownerPhone: '',
    ownerPin: '',
    planType: 'MONTHLY' as PlanType,
  })

  const create = useMutation({
    mutationFn: () =>
      adminFetch<AdminTenant>('/api/v1/admin/tenants', {
        method: 'POST',
        body: JSON.stringify(form),
      }),
    onSuccess: () => {
      toast.success('Restaurant added successfully')
      onCreated()
      onClose()
    },
    onError: (e: Error) => toast.error(e.message),
  })

  const fieldCls =
    'w-full bg-background border border-border rounded-lg px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-primary-500 placeholder:text-muted-foreground/40'
  const labelCls = 'text-xs font-semibold text-muted-foreground uppercase tracking-wide'

  const RESTAURANT_TYPES: RestaurantType[] = [
    'QSR', 'CASUAL_DINING', 'FINE_DINING', 'CAFE',
    'BAR', 'FOOD_TRUCK', 'CLOUD_KITCHEN', 'BAKERY', 'DHABA', 'SWEET_SHOP',
  ]
  const TYPE_LABELS: Record<RestaurantType, string> = {
    QSR: 'QSR', CASUAL_DINING: 'Casual Dining', FINE_DINING: 'Fine Dining',
    CAFE: 'Cafe', BAR: 'Bar', FOOD_TRUCK: 'Food Truck',
    CLOUD_KITCHEN: 'Cloud Kitchen', BAKERY: 'Bakery', DHABA: 'Dhaba', SWEET_SHOP: 'Sweet Shop',
  }

  return (
    <div className="fixed inset-0 z-50 flex">
      <button type="button" className="flex-1 bg-black/60" onClick={onClose} aria-label="Close modal" />
      <aside className="w-full max-w-[480px] h-full bg-[#0A0D16] border-l border-border flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-border shrink-0">
          <div>
            <h3 className="font-bold text-sm text-foreground">Add Restaurant Manually</h3>
            <p className="text-[11px] text-muted-foreground mt-0.5">Creates tenant + owner account</p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-md text-muted-foreground hover:text-foreground hover:bg-white/5 transition-colors"
          >
            <X size={16} />
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-5">
          {/* Restaurant info */}
          <div>
            <p className="text-[10px] font-bold text-primary-500 uppercase tracking-widest mb-3">Restaurant</p>
            <div className="space-y-3">
              <div className="space-y-1.5">
                <label className={labelCls}>Restaurant Name *</label>
                <input
                  value={form.name}
                  onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                  placeholder="Priya Kitchen"
                  className={fieldCls}
                  required
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <label className={labelCls}>Phone *</label>
                  <input
                    value={form.phone}
                    onChange={(e) => setForm((f) => ({ ...f, phone: e.target.value }))}
                    placeholder="9876543210"
                    className={fieldCls}
                    required
                  />
                </div>
                <div className="space-y-1.5">
                  <label className={labelCls}>Email</label>
                  <input
                    value={form.email}
                    onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
                    placeholder="info@restaurant.com"
                    type="email"
                    className={fieldCls}
                  />
                </div>
              </div>
              <div className="space-y-1.5">
                <label className={labelCls}>Type</label>
                <select
                  value={form.type}
                  onChange={(e) => setForm((f) => ({ ...f, type: e.target.value as RestaurantType }))}
                  className={fieldCls}
                >
                  {RESTAURANT_TYPES.map((t) => (
                    <option key={t} value={t}>{TYPE_LABELS[t]}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Address */}
          <div>
            <p className="text-[10px] font-bold text-primary-500 uppercase tracking-widest mb-3">Address</p>
            <div className="space-y-3">
              <div className="space-y-1.5">
                <label className={labelCls}>Street Address *</label>
                <input
                  value={form.addressLine1}
                  onChange={(e) => setForm((f) => ({ ...f, addressLine1: e.target.value }))}
                  placeholder="123, Main Street"
                  className={fieldCls}
                  required
                />
              </div>
              <div className="grid grid-cols-3 gap-3">
                <div className="space-y-1.5">
                  <label className={labelCls}>City *</label>
                  <input
                    value={form.city}
                    onChange={(e) => setForm((f) => ({ ...f, city: e.target.value }))}
                    placeholder="Mumbai"
                    className={fieldCls}
                    required
                  />
                </div>
                <div className="space-y-1.5">
                  <label className={labelCls}>State *</label>
                  <input
                    value={form.state}
                    onChange={(e) => setForm((f) => ({ ...f, state: e.target.value }))}
                    placeholder="Maharashtra"
                    className={fieldCls}
                    required
                  />
                </div>
                <div className="space-y-1.5">
                  <label className={labelCls}>Pincode *</label>
                  <input
                    value={form.pincode}
                    onChange={(e) => setForm((f) => ({ ...f, pincode: e.target.value }))}
                    placeholder="400001"
                    className={fieldCls}
                    required
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Owner */}
          <div>
            <p className="text-[10px] font-bold text-primary-500 uppercase tracking-widest mb-3">Owner Account</p>
            <div className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <label className={labelCls}>Owner Name *</label>
                  <input
                    value={form.ownerName}
                    onChange={(e) => setForm((f) => ({ ...f, ownerName: e.target.value }))}
                    placeholder="Priya Sharma"
                    className={fieldCls}
                    required
                  />
                </div>
                <div className="space-y-1.5">
                  <label className={labelCls}>Owner Phone *</label>
                  <input
                    value={form.ownerPhone}
                    onChange={(e) => setForm((f) => ({ ...f, ownerPhone: e.target.value }))}
                    placeholder="9876543210"
                    className={fieldCls}
                    required
                  />
                </div>
              </div>
              <div className="space-y-1.5">
                <label className={labelCls}>Owner PIN *</label>
                <input
                  value={form.ownerPin}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, ownerPin: e.target.value.replace(/\D/g, '').slice(0, 4) }))
                  }
                  placeholder="4-digit PIN"
                  maxLength={4}
                  className={fieldCls}
                  required
                />
              </div>
            </div>
          </div>

          {/* Plan */}
          <div>
            <p className="text-[10px] font-bold text-primary-500 uppercase tracking-widest mb-3">Plan</p>
            <div className="flex gap-2">
              {(['MONTHLY', 'YEARLY', 'LIFETIME'] as PlanType[]).map((pt) => (
                <button
                  key={pt}
                  type="button"
                  onClick={() => setForm((f) => ({ ...f, planType: pt }))}
                  className={cn(
                    'flex-1 py-2 rounded-lg text-xs font-semibold border transition-colors',
                    form.planType === pt
                      ? 'bg-primary-500 border-primary-500 text-white'
                      : 'border-border text-muted-foreground hover:border-primary-500/40',
                  )}
                >
                  {pt.charAt(0) + pt.slice(1).toLowerCase()}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-border flex gap-3 shrink-0">
          <Button variant="ghost" className="flex-1" onClick={onClose}>
            Cancel
          </Button>
          <Button
            className="flex-1"
            disabled={
              create.isPending ||
              !form.name ||
              !form.phone ||
              !form.addressLine1 ||
              !form.city ||
              !form.state ||
              !form.pincode ||
              !form.ownerName ||
              !form.ownerPhone ||
              form.ownerPin.length < 4
            }
            onClick={() => create.mutate()}
          >
            {create.isPending ? <Spinner size="sm" /> : 'Add Restaurant'}
          </Button>
        </div>
      </aside>
    </div>
  )
}

// ─── Status change confirm ─────────────────────────────────────────────────────

interface StatusConfirmProps {
  tenant: AdminTenant
  newStatus: TenantPlanStatus
  onClose: () => void
}

function StatusConfirm({ tenant, newStatus, onClose }: StatusConfirmProps) {
  const queryClient = useQueryClient()

  const patch = useMutation({
    mutationFn: () =>
      adminFetch(`/api/v1/admin/tenants/${tenant.id}/status`, {
        method: 'PATCH',
        body: JSON.stringify({ status: newStatus }),
      }),
    onSuccess: () => {
      toast.success(
        newStatus === 'ACTIVE'
          ? `${tenant.name} activated`
          : `${tenant.name} suspended`,
      )
      queryClient.invalidateQueries({ queryKey: ['admin-tenants'] })
      onClose()
    },
    onError: (e: Error) => toast.error(e.message),
  })

  const isActivating = newStatus === 'ACTIVE'

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
          {isActivating ? 'Activate' : 'Suspend'} {tenant.name}?
        </h3>
        <p className="text-xs text-muted-foreground mb-5">
          {isActivating
            ? 'The restaurant will regain access to Atlas immediately.'
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

// ─── Helpers ──────────────────────────────────────────────────────────────────

const STATUS_CONFIG: Record<
  TenantPlanStatus,
  { label: string; variant: 'success' | 'warning' | 'danger'; Icon: React.ElementType }
> = {
  ACTIVE:          { label: 'Active',          variant: 'success', Icon: CheckCircle2 },
  PENDING_PAYMENT: { label: 'Pending Payment', variant: 'warning', Icon: Clock },
  SUSPENDED:       { label: 'Suspended',       variant: 'danger',  Icon: AlertCircle },
}

const TYPE_LABELS: Record<RestaurantType, string> = {
  QSR: 'QSR', CASUAL_DINING: 'Casual Dining', FINE_DINING: 'Fine Dining',
  CAFE: 'Cafe', BAR: 'Bar', FOOD_TRUCK: 'Food Truck',
  CLOUD_KITCHEN: 'Cloud Kitchen', BAKERY: 'Bakery', DHABA: 'Dhaba', SWEET_SHOP: 'Sweet Shop',
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })
}

// ─── Tenant Row ───────────────────────────────────────────────────────────────

interface TenantRowProps {
  tenant: AdminTenant
  onStatusChange: (tenant: AdminTenant, status: TenantPlanStatus) => void
}

function TenantRow({ tenant, onStatusChange }: TenantRowProps) {
  const router = useRouter()
  const statusCfg = STATUS_CONFIG[tenant.planStatus]
  const [menuOpen, setMenuOpen] = useState(false)

  return (
    <tr className="border-b border-border/50 last:border-0 hover:bg-white/[0.02] group transition-colors">
      {/* Name */}
      <td className="px-6 py-4">
        <button
          type="button"
          onClick={() => router.push(`/admin/tenants/${tenant.id}`)}
          className="text-left group/name"
        >
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-primary-500/12 border border-primary-500/20 flex items-center justify-center shrink-0">
              <span className="text-[13px] font-bold text-primary-400">
                {tenant.name.charAt(0).toUpperCase()}
              </span>
            </div>
            <div>
              <p className="font-semibold text-sm text-foreground group-hover/name:text-primary-400 transition-colors leading-none">
                {tenant.name}
              </p>
              <p className="text-[11px] text-muted-foreground mt-0.5">
                {tenant.city}, {tenant.state}
              </p>
            </div>
          </div>
        </button>
      </td>

      {/* Type */}
      <td className="px-4 py-4 hidden sm:table-cell">
        <Badge variant="muted">{TYPE_LABELS[tenant.type]}</Badge>
      </td>

      {/* Status */}
      <td className="px-4 py-4">
        <Badge variant={statusCfg.variant}>
          <statusCfg.Icon size={9} />
          {statusCfg.label}
        </Badge>
      </td>

      {/* Plan */}
      <td className="px-4 py-4 hidden md:table-cell">
        <span className="text-xs text-muted-foreground tabular-nums">
          {tenant.plan}{tenant.planType ? ` / ${tenant.planType.charAt(0)}${tenant.planType.slice(1).toLowerCase()}` : ''}
        </span>
      </td>

      {/* Orders */}
      <td className="px-4 py-4 hidden lg:table-cell">
        <div className="flex items-center gap-1.5 text-sm text-muted-foreground tabular-nums">
          <ShoppingBag size={12} className="text-muted-foreground/50 shrink-0" />
          {tenant._count?.orders ?? '—'}
        </div>
      </td>

      {/* Date */}
      <td className="px-4 py-4 hidden lg:table-cell">
        <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
          <CalendarDays size={11} className="text-muted-foreground/50 shrink-0" />
          {formatDate(tenant.createdAt)}
        </div>
      </td>

      {/* Actions */}
      <td className="px-4 py-4">
        <div className="flex items-center gap-1 justify-end">
          <button
            type="button"
            title="View details"
            onClick={() => router.push(`/admin/tenants/${tenant.id}`)}
            className="p-1.5 rounded-md text-muted-foreground hover:text-foreground hover:bg-white/5 transition-colors"
          >
            <Eye size={13} />
          </button>

          <div className="relative">
            <button
              type="button"
              onClick={() => setMenuOpen((o) => !o)}
              className="p-1.5 rounded-md text-muted-foreground hover:text-foreground hover:bg-white/5 transition-colors"
            >
              <MoreHorizontal size={13} />
            </button>

            {menuOpen && (
              <>
                <div
                  className="fixed inset-0 z-30"
                  onClick={() => setMenuOpen(false)}
                  aria-hidden="true"
                />
                <div className="absolute right-0 top-7 z-40 w-40 bg-[#0D1017] border border-border rounded-lg shadow-xl py-1 overflow-hidden">
                  {tenant.planStatus !== 'ACTIVE' && (
                    <button
                      type="button"
                      className="w-full flex items-center gap-2.5 px-3 py-2 text-xs text-success hover:bg-success/8 transition-colors"
                      onClick={() => { setMenuOpen(false); onStatusChange(tenant, 'ACTIVE') }}
                    >
                      <CheckCircle2 size={13} />
                      Activate
                    </button>
                  )}
                  {tenant.planStatus !== 'SUSPENDED' && (
                    <button
                      type="button"
                      className="w-full flex items-center gap-2.5 px-3 py-2 text-xs text-danger hover:bg-danger/8 transition-colors"
                      onClick={() => { setMenuOpen(false); onStatusChange(tenant, 'SUSPENDED') }}
                    >
                      <AlertCircle size={13} />
                      Suspend
                    </button>
                  )}
                  <button
                    type="button"
                    className="w-full flex items-center gap-2.5 px-3 py-2 text-xs text-muted-foreground hover:text-foreground hover:bg-white/5 transition-colors"
                    onClick={() => { setMenuOpen(false); }}
                  >
                    <Eye size={13} />
                    View Detail
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      </td>
    </tr>
  )
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function AdminTenantsPage() {
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState<TenantPlanStatus | ''>('')
  const [typeFilter, setTypeFilter] = useState<RestaurantType | ''>('')
  const [sort, setSort] = useState<'createdAt_desc' | 'createdAt_asc' | 'name_asc' | 'orders_desc'>('createdAt_desc')
  const [page, setPage] = useState(1)
  const [showAdd, setShowAdd] = useState(false)
  const [statusConfirm, setStatusConfirm] = useState<{ tenant: AdminTenant; status: TenantPlanStatus } | null>(null)

  const queryClient = useQueryClient()

  const params = new URLSearchParams()
  if (search) params.set('search', search)
  if (statusFilter) params.set('planStatus', statusFilter)
  if (typeFilter) params.set('type', typeFilter)
  params.set('sort', sort)
  params.set('page', String(page))
  params.set('limit', '15')

  const { data, isLoading, isFetching } = useQuery({
    queryKey: ['admin-tenants', search, statusFilter, typeFilter, sort, page],
    queryFn: () =>
      adminFetch<TenantsResponse>(`/api/v1/admin/tenants?${params.toString()}`),
    placeholderData: (prev) => prev,
  })

  const handleStatusChange = useCallback((tenant: AdminTenant, status: TenantPlanStatus) => {
    setStatusConfirm({ tenant, status })
  }, [])

  const tenants = data?.tenants ?? []
  const totalPages = data?.totalPages ?? 1

  const RESTAURANT_TYPES: RestaurantType[] = [
    'QSR', 'CASUAL_DINING', 'FINE_DINING', 'CAFE',
    'BAR', 'FOOD_TRUCK', 'CLOUD_KITCHEN', 'BAKERY', 'DHABA', 'SWEET_SHOP',
  ]
  const TYPE_LABELS_MAP: Record<RestaurantType, string> = {
    QSR: 'QSR', CASUAL_DINING: 'Casual Dining', FINE_DINING: 'Fine Dining',
    CAFE: 'Cafe', BAR: 'Bar', FOOD_TRUCK: 'Food Truck',
    CLOUD_KITCHEN: 'Cloud Kitchen', BAKERY: 'Bakery', DHABA: 'Dhaba', SWEET_SHOP: 'Sweet Shop',
  }

  const selectCls =
    'bg-background border border-border rounded-lg px-3 py-2 text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-primary-500 appearance-none cursor-pointer hover:border-border/80 transition-colors'

  return (
    <div className="flex flex-col h-full -m-6 bg-background">
      {/* ── Header ── */}
      <div className="px-6 py-4 border-b border-border bg-background shrink-0">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-primary-500/10 border border-primary-500/20 flex items-center justify-center">
              <Building2 size={15} className="text-primary-500" />
            </div>
            <div>
              <h1 className="text-sm font-bold text-foreground leading-none">Restaurants</h1>
              {data && (
                <p className="text-[11px] text-muted-foreground mt-0.5">
                  {data.total} total
                </p>
              )}
            </div>
          </div>
          <Button size="sm" className="gap-2 text-xs" onClick={() => setShowAdd(true)}>
            <Plus size={13} />
            Add manually
          </Button>
        </div>

        {/* ── Filters ── */}
        <div className="flex flex-wrap items-center gap-2 mt-4">
          {/* Search */}
          <div className="relative flex-1 min-w-[200px] max-w-xs">
            <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none" />
            <input
              value={search}
              onChange={(e) => { setSearch(e.target.value); setPage(1) }}
              placeholder="Search restaurants…"
              className="w-full bg-background border border-border rounded-lg pl-8 pr-3 py-2 text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-primary-500 placeholder:text-muted-foreground/40"
            />
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            <SlidersHorizontal size={13} className="text-muted-foreground/50 shrink-0" />

            {/* Status filter */}
            <select
              value={statusFilter}
              onChange={(e) => { setStatusFilter(e.target.value as TenantPlanStatus | ''); setPage(1) }}
              className={selectCls}
            >
              <option value="">All statuses</option>
              <option value="ACTIVE">Active</option>
              <option value="PENDING_PAYMENT">Pending Payment</option>
              <option value="SUSPENDED">Suspended</option>
            </select>

            {/* Type filter */}
            <select
              value={typeFilter}
              onChange={(e) => { setTypeFilter(e.target.value as RestaurantType | ''); setPage(1) }}
              className={selectCls}
            >
              <option value="">All types</option>
              {RESTAURANT_TYPES.map((t) => (
                <option key={t} value={t}>{TYPE_LABELS_MAP[t]}</option>
              ))}
            </select>

            {/* Sort */}
            <select
              value={sort}
              onChange={(e) => { setSort(e.target.value as typeof sort); setPage(1) }}
              className={selectCls}
            >
              <option value="createdAt_desc">Newest first</option>
              <option value="createdAt_asc">Oldest first</option>
              <option value="name_asc">Name A–Z</option>
              <option value="orders_desc">Most orders</option>
            </select>

            {/* Clear filters */}
            {(search || statusFilter || typeFilter) && (
              <button
                type="button"
                onClick={() => { setSearch(''); setStatusFilter(''); setTypeFilter(''); setPage(1) }}
                className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors"
              >
                <X size={12} />
                Clear
              </button>
            )}
          </div>
        </div>
      </div>

      {/* ── Table ── */}
      <div className="flex-1 overflow-auto">
        {isLoading ? (
          <div className="flex items-center justify-center h-full">
            <Spinner size="xl" className="text-primary-500" />
          </div>
        ) : tenants.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full gap-4 py-24 text-muted-foreground">
            <Building2 size={48} className="opacity-10" />
            <div className="text-center">
              <p className="text-sm font-semibold">
                {search || statusFilter || typeFilter
                  ? 'No restaurants match your filters.'
                  : 'No restaurants yet.'}
              </p>
              {!search && !statusFilter && !typeFilter && (
                <p className="text-xs mt-1 text-muted-foreground/60">
                  Add your first restaurant manually to get started.
                </p>
              )}
            </div>
          </div>
        ) : (
          <div className="relative">
            {isFetching && !isLoading && (
              <div className="absolute top-0 left-0 right-0 h-0.5 bg-primary-500/30 overflow-hidden">
                <div className="h-full bg-primary-500 animate-pulse w-1/2" />
              </div>
            )}
            <div className="overflow-x-auto">
              <table className="w-full text-sm min-w-[640px]">
                <thead>
                  <tr className="border-b border-border bg-background/60 sticky top-0 z-10 backdrop-blur-sm">
                    <th className="text-left px-6 py-3 text-[11px] font-bold text-muted-foreground uppercase tracking-wider">
                      Restaurant
                    </th>
                    <th className="text-left px-4 py-3 text-[11px] font-bold text-muted-foreground uppercase tracking-wider hidden sm:table-cell">
                      Type
                    </th>
                    <th className="text-left px-4 py-3 text-[11px] font-bold text-muted-foreground uppercase tracking-wider">
                      Status
                    </th>
                    <th className="text-left px-4 py-3 text-[11px] font-bold text-muted-foreground uppercase tracking-wider hidden md:table-cell">
                      Plan
                    </th>
                    <th className="text-left px-4 py-3 text-[11px] font-bold text-muted-foreground uppercase tracking-wider hidden lg:table-cell">
                      Orders
                    </th>
                    <th className="text-left px-4 py-3 text-[11px] font-bold text-muted-foreground uppercase tracking-wider hidden lg:table-cell">
                      Registered
                    </th>
                    <th className="px-4 py-3" />
                  </tr>
                </thead>
                <tbody>
                  {tenants.map((t) => (
                    <TenantRow
                      key={t.id}
                      tenant={t}
                      onStatusChange={handleStatusChange}
                    />
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>

      {/* ── Pagination ── */}
      {totalPages > 1 && (
        <div className="border-t border-border px-6 py-3 flex items-center justify-between shrink-0 bg-background">
          <p className="text-xs text-muted-foreground tabular-nums">
            Page {page} of {totalPages}
            {data && (
              <span className="ml-2 text-muted-foreground/50">· {data.total} total</span>
            )}
          </p>
          <div className="flex items-center gap-1.5">
            <button
              type="button"
              disabled={page <= 1}
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              className="p-1.5 rounded-md text-muted-foreground hover:text-foreground hover:bg-white/5 disabled:opacity-30 disabled:pointer-events-none transition-colors"
            >
              <ChevronLeft size={14} />
            </button>
            {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
              const pg = Math.max(1, Math.min(page - 2, totalPages - 4)) + i
              return (
                <button
                  key={pg}
                  type="button"
                  onClick={() => setPage(pg)}
                  className={cn(
                    'w-7 h-7 rounded-md text-xs font-medium transition-colors',
                    pg === page
                      ? 'bg-primary-500 text-white'
                      : 'text-muted-foreground hover:text-foreground hover:bg-white/5',
                  )}
                >
                  {pg}
                </button>
              )
            })}
            <button
              type="button"
              disabled={page >= totalPages}
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              className="p-1.5 rounded-md text-muted-foreground hover:text-foreground hover:bg-white/5 disabled:opacity-30 disabled:pointer-events-none transition-colors"
            >
              <ChevronRight size={14} />
            </button>
          </div>
        </div>
      )}

      {/* ── Modals ── */}
      {showAdd && (
        <AddTenantModal
          onClose={() => setShowAdd(false)}
          onCreated={() => queryClient.invalidateQueries({ queryKey: ['admin-tenants'] })}
        />
      )}
      {statusConfirm && (
        <StatusConfirm
          tenant={statusConfirm.tenant}
          newStatus={statusConfirm.status}
          onClose={() => setStatusConfirm(null)}
        />
      )}
    </div>
  )
}
