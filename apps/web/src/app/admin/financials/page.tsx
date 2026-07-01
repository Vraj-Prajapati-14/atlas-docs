'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import {
  IndianRupee,
  Plus,
  Trash2,
  X,
  ChevronLeft,
  ChevronRight,
  TrendingUp,
  Users,
  DollarSign,
  Server,
  Megaphone,
  HeadphonesIcon,
  MoreHorizontal,
  Search,
  AlertCircle,
} from 'lucide-react'
import { adminFetch } from '@/lib/admin-api'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Spinner } from '@/components/ui/spinner'
import { cn } from '@/lib/utils'
import { toast } from 'sonner'

// ─── Types ─────────────────────────────────────────────────────────────────────

interface Payment {
  id: string
  tenantId: string
  tenantName: string
  planType: 'Monthly' | 'Yearly' | 'Lifetime'
  amountPaise: number
  paymentMethod: 'Bank Transfer' | 'UPI' | 'Cash' | 'Card'
  paidAt: string
  notes?: string
}

interface PaymentsResponse {
  payments: Payment[]
  total: number
  totalPages?: number
  summary: { totalPaise: number; count: number }
}

interface Cost {
  id: string
  month: number
  category: 'SERVER' | 'MARKETING' | 'SUPPORT' | 'MISC'
  description: string
  amountPaise: number
  adminName?: string
  createdAt: string
}

interface CostsResponse {
  costs: Cost[]
  total: number
  totalPages?: number
  summary: { totalPaise: number }
}

interface TenantOption {
  id: string
  name: string
  email?: string
}

// ─── Helpers ───────────────────────────────────────────────────────────────────

function paise(amount: number): string {
  return '₹' + (amount / 100).toLocaleString('en-IN', { minimumFractionDigits: 0, maximumFractionDigits: 0 })
}

function currentMonth(): string {
  const d = new Date()
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`
}

function monthToNumber(m: string): number {
  const [y = '0', mo = '0'] = m.split('-')
  return parseInt(y, 10) * 100 + parseInt(mo, 10)
}

function numberToMonth(n: number): string {
  const y = Math.floor(n / 100)
  const mo = n % 100
  return `${y}-${String(mo).padStart(2, '0')}`
}

function formatMonthDisplay(yyyymm: string): string {
  const [y = '0', mo = '0'] = yyyymm.split('-')
  const d = new Date(parseInt(y), parseInt(mo) - 1, 1)
  return d.toLocaleDateString('en-IN', { month: 'long', year: 'numeric' })
}

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })
}

const PLAN_BADGE: Record<string, 'default' | 'success' | 'info' | 'warning' | 'muted'> = {
  Monthly: 'info',
  Yearly: 'success',
  Lifetime: 'default',
}

const METHOD_BADGE: Record<string, 'muted' | 'info' | 'success' | 'warning'> = {
  'Bank Transfer': 'info',
  UPI: 'success',
  Cash: 'warning',
  Card: 'muted',
}

const COST_CAT_BADGE: Record<string, 'default' | 'info' | 'warning' | 'success' | 'danger' | 'muted'> = {
  SERVER: 'info',
  MARKETING: 'default',
  SUPPORT: 'warning',
  MISC: 'muted',
}

const COST_CAT_ICON: Record<string, React.ReactNode> = {
  SERVER: <Server size={10} />,
  MARKETING: <Megaphone size={10} />,
  SUPPORT: <HeadphonesIcon size={10} />,
  MISC: <MoreHorizontal size={10} />,
}

// ─── Summary Card ──────────────────────────────────────────────────────────────

interface SummaryCardProps {
  icon: React.ReactNode
  label: string
  value: string
  sub?: string
  accent?: 'orange' | 'green' | 'blue'
  loading?: boolean
}

function SummaryCard({ icon, label, value, sub, accent = 'orange', loading }: SummaryCardProps) {
  const accentClasses = {
    orange: 'text-primary-500 bg-primary-500/10',
    green: 'text-success bg-success/10',
    blue: 'text-info bg-info/10',
  }
  return (
    <div className="rounded-xl border border-border bg-background-card p-4 flex items-start gap-3.5">
      <div className={cn('mt-0.5 rounded-lg p-2 shrink-0', accentClasses[accent])}>
        {icon}
      </div>
      <div className="min-w-0">
        <p className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground mb-1">{label}</p>
        {loading ? (
          <div className="h-6 w-28 skeleton rounded" />
        ) : (
          <p className="text-xl font-bold text-foreground tabular-nums leading-none">{value}</p>
        )}
        {sub && !loading && (
          <p className="text-xs text-muted-foreground mt-1">{sub}</p>
        )}
      </div>
    </div>
  )
}

// ─── Modal Shell ───────────────────────────────────────────────────────────────

interface ModalProps {
  title: string
  onClose: () => void
  children: React.ReactNode
}

function Modal({ title, onClose, children }: ModalProps) {
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose() }
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [onClose])

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm"
      onClick={(e) => { if (e.target === e.currentTarget) onClose() }}
    >
      <div className="w-full max-w-[480px] rounded-2xl border border-border bg-background-card shadow-2xl shadow-black/40 flex flex-col max-h-[90dvh] animate-fade-in">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-border shrink-0">
          <h2 className="text-sm font-bold text-foreground">{title}</h2>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-white/5 transition-colors"
          >
            <X size={15} />
          </button>
        </div>
        {/* Body */}
        <div className="overflow-y-auto flex-1 px-5 py-5">
          {children}
        </div>
      </div>
    </div>
  )
}

// ─── Field Row ─────────────────────────────────────────────────────────────────

function FieldRow({ children }: { children: React.ReactNode }) {
  return <div className="space-y-1.5">{children}</div>
}

// ─── Tenant Search Combobox ────────────────────────────────────────────────────

interface TenantSearchProps {
  value: string
  onSelect: (id: string, name: string) => void
  selectedName: string
}

function TenantSearch({ value, onSelect, selectedName }: TenantSearchProps) {
  const [query, setQuery] = useState(selectedName)
  const [results, setResults] = useState<TenantOption[]>([])
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const debounce = useRef<ReturnType<typeof setTimeout> | null>(null)
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    setQuery(selectedName)
  }, [selectedName])

  const search = useCallback(async (q: string) => {
    if (!q.trim()) { setResults([]); return }
    setLoading(true)
    try {
      const data = await adminFetch<{ tenants: TenantOption[] }>(
        `/api/v1/admin/tenants?search=${encodeURIComponent(q)}&limit=8`
      )
      setResults(data.tenants ?? [])
      setOpen(true)
    } catch {
      // ignore
    } finally {
      setLoading(false)
    }
  }, [])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const q = e.target.value
    setQuery(q)
    if (!q) { onSelect('', ''); setResults([]); setOpen(false); return }
    if (debounce.current) clearTimeout(debounce.current)
    debounce.current = setTimeout(() => search(q), 300)
  }

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false)
      }
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  return (
    <div ref={containerRef} className="relative">
      <div className="relative">
        <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none" />
        <Input
          placeholder="Search tenant…"
          value={query}
          onChange={handleChange}
          className="pl-8"
        />
        {loading && (
          <div className="absolute right-3 top-1/2 -translate-y-1/2">
            <Spinner size="xs" />
          </div>
        )}
      </div>
      {open && results.length > 0 && (
        <div className="absolute z-10 top-full mt-1 w-full rounded-xl border border-border bg-background-card shadow-xl shadow-black/30 overflow-hidden">
          {results.map((t) => (
            <button
              key={t.id}
              type="button"
              className="w-full flex flex-col items-start px-3 py-2.5 hover:bg-white/5 transition-colors text-left"
              onClick={() => {
                onSelect(t.id, t.name)
                setQuery(t.name)
                setOpen(false)
              }}
            >
              <span className="text-sm font-medium text-foreground">{t.name}</span>
              {t.email && <span className="text-xs text-muted-foreground">{t.email}</span>}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}

// ─── Record Payment Modal ──────────────────────────────────────────────────────

interface RecordPaymentModalProps {
  onClose: () => void
  onSuccess: () => void
}

function RecordPaymentModal({ onClose, onSuccess }: RecordPaymentModalProps) {
  const [tenantId, setTenantId] = useState('')
  const [tenantName, setTenantName] = useState('')
  const [amountRupees, setAmountRupees] = useState('')
  const [planType, setPlanType] = useState<'Monthly' | 'Yearly' | 'Lifetime'>('Monthly')
  const [paymentMethod, setPaymentMethod] = useState<'Bank Transfer' | 'UPI' | 'Cash' | 'Card'>('UPI')
  const [paidAt, setPaidAt] = useState(new Date().toISOString().split('T')[0] ?? '')
  const [notes, setNotes] = useState('')
  const [saving, setSaving] = useState(false)

  const canSubmit = tenantId && amountRupees && parseFloat(amountRupees) > 0

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!canSubmit) return
    setSaving(true)
    try {
      await adminFetch('/api/v1/admin/payments', {
        method: 'POST',
        body: JSON.stringify({
          tenantId,
          amountPaise: Math.round(parseFloat(amountRupees) * 100),
          planType: planType.toUpperCase(),
          paymentMethod,
          paidAt: paidAt ? new Date(paidAt).toISOString() : new Date().toISOString(),
          notes: notes || undefined,
        }),
      })
      toast.success('Payment recorded.')
      onSuccess()
      onClose()
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : 'Failed to record payment.')
    } finally {
      setSaving(false)
    }
  }

  return (
    <Modal title="Record Payment" onClose={onClose}>
      <form onSubmit={handleSubmit} className="space-y-4">
        <FieldRow>
          <Label>Tenant</Label>
          <TenantSearch
            value={tenantId}
            selectedName={tenantName}
            onSelect={(id, name) => { setTenantId(id); setTenantName(name) }}
          />
        </FieldRow>

        <FieldRow>
          <Label htmlFor="pay-amount">Amount (₹)</Label>
          <div className="relative">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground text-sm select-none">₹</span>
            <Input
              id="pay-amount"
              type="number"
              min="1"
              step="1"
              placeholder="0"
              value={amountRupees}
              onChange={(e) => setAmountRupees(e.target.value)}
              className="pl-7"
            />
          </div>
        </FieldRow>

        <div className="grid grid-cols-2 gap-3">
          <FieldRow>
            <Label htmlFor="pay-plan">Plan type</Label>
            <select
              id="pay-plan"
              value={planType}
              onChange={(e) => setPlanType(e.target.value as typeof planType)}
              className={cn(
                'flex h-10 w-full rounded-md px-3 py-2 text-sm',
                'bg-background-card border border-border',
                'text-foreground',
                'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500/30 focus-visible:border-primary-500',
                'transition-colors duration-150',
              )}
            >
              <option value="Monthly">Monthly</option>
              <option value="Yearly">Yearly</option>
              <option value="Lifetime">Lifetime</option>
            </select>
          </FieldRow>

          <FieldRow>
            <Label htmlFor="pay-method">Payment method</Label>
            <select
              id="pay-method"
              value={paymentMethod}
              onChange={(e) => setPaymentMethod(e.target.value as typeof paymentMethod)}
              className={cn(
                'flex h-10 w-full rounded-md px-3 py-2 text-sm',
                'bg-background-card border border-border',
                'text-foreground',
                'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500/30 focus-visible:border-primary-500',
                'transition-colors duration-150',
              )}
            >
              <option value="UPI">UPI</option>
              <option value="Bank Transfer">Bank Transfer</option>
              <option value="Card">Card</option>
              <option value="Cash">Cash</option>
            </select>
          </FieldRow>
        </div>

        <FieldRow>
          <Label htmlFor="pay-date">Payment date</Label>
          <Input
            id="pay-date"
            type="date"
            value={paidAt}
            onChange={(e) => setPaidAt(e.target.value)}
          />
        </FieldRow>

        <FieldRow>
          <Label htmlFor="pay-notes">Notes <span className="text-muted-foreground/50">(optional)</span></Label>
          <textarea
            id="pay-notes"
            rows={2}
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Any remarks…"
            className={cn(
              'w-full rounded-md px-3 py-2 text-sm resize-none',
              'bg-background-card border border-border',
              'text-foreground placeholder:text-muted-foreground',
              'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500/30 focus-visible:border-primary-500',
              'transition-colors duration-150',
            )}
          />
        </FieldRow>

        <div className="flex items-center gap-3 pt-1">
          <Button type="button" variant="outline" className="flex-1" onClick={onClose} disabled={saving}>
            Cancel
          </Button>
          <Button type="submit" className="flex-1" disabled={!canSubmit || saving}>
            {saving ? <Spinner size="sm" /> : 'Record Payment'}
          </Button>
        </div>
      </form>
    </Modal>
  )
}

// ─── Add Cost Modal ────────────────────────────────────────────────────────────

interface AddCostModalProps {
  onClose: () => void
  onSuccess: () => void
}

function AddCostModal({ onClose, onSuccess }: AddCostModalProps) {
  const [monthStr, setMonthStr] = useState(currentMonth())
  const [category, setCategory] = useState<'SERVER' | 'MARKETING' | 'SUPPORT' | 'MISC'>('SERVER')
  const [description, setDescription] = useState('')
  const [amountRupees, setAmountRupees] = useState('')
  const [saving, setSaving] = useState(false)

  const canSubmit = description.trim() && amountRupees && parseFloat(amountRupees) > 0

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!canSubmit) return
    setSaving(true)
    try {
      await adminFetch('/api/v1/admin/costs', {
        method: 'POST',
        body: JSON.stringify({
          month: monthToNumber(monthStr),
          category,
          description: description.trim(),
          amountPaise: Math.round(parseFloat(amountRupees) * 100),
        }),
      })
      toast.success('Cost entry added.')
      onSuccess()
      onClose()
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : 'Failed to add cost.')
    } finally {
      setSaving(false)
    }
  }

  return (
    <Modal title="Add Platform Cost" onClose={onClose}>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-2 gap-3">
          <FieldRow>
            <Label htmlFor="cost-month">Month</Label>
            <Input
              id="cost-month"
              type="month"
              value={monthStr}
              onChange={(e) => setMonthStr(e.target.value)}
            />
          </FieldRow>

          <FieldRow>
            <Label htmlFor="cost-cat">Category</Label>
            <select
              id="cost-cat"
              value={category}
              onChange={(e) => setCategory(e.target.value as typeof category)}
              className={cn(
                'flex h-10 w-full rounded-md px-3 py-2 text-sm',
                'bg-background-card border border-border',
                'text-foreground',
                'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500/30 focus-visible:border-primary-500',
                'transition-colors duration-150',
              )}
            >
              <option value="SERVER">Server</option>
              <option value="MARKETING">Marketing</option>
              <option value="SUPPORT">Support</option>
              <option value="MISC">Misc</option>
            </select>
          </FieldRow>
        </div>

        <FieldRow>
          <Label htmlFor="cost-desc">Description</Label>
          <Input
            id="cost-desc"
            type="text"
            placeholder="e.g. AWS EC2 — June"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />
        </FieldRow>

        <FieldRow>
          <Label htmlFor="cost-amount">Amount (₹)</Label>
          <div className="relative">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground text-sm select-none">₹</span>
            <Input
              id="cost-amount"
              type="number"
              min="1"
              step="1"
              placeholder="0"
              value={amountRupees}
              onChange={(e) => setAmountRupees(e.target.value)}
              className="pl-7"
            />
          </div>
        </FieldRow>

        <div className="flex items-center gap-3 pt-1">
          <Button type="button" variant="outline" className="flex-1" onClick={onClose} disabled={saving}>
            Cancel
          </Button>
          <Button type="submit" className="flex-1" disabled={!canSubmit || saving}>
            {saving ? <Spinner size="sm" /> : 'Add Cost'}
          </Button>
        </div>
      </form>
    </Modal>
  )
}

// ─── Confirm Delete ────────────────────────────────────────────────────────────

interface ConfirmDeleteProps {
  label: string
  onClose: () => void
  onConfirm: () => Promise<void>
}

function ConfirmDeleteModal({ label, onClose, onConfirm }: ConfirmDeleteProps) {
  const [deleting, setDeleting] = useState(false)

  const handleConfirm = async () => {
    setDeleting(true)
    try {
      await onConfirm()
      onClose()
    } finally {
      setDeleting(false)
    }
  }

  return (
    <Modal title="Confirm deletion" onClose={onClose}>
      <div className="space-y-4">
        <div className="flex items-start gap-3 rounded-lg border border-danger/20 bg-danger/5 p-3.5">
          <AlertCircle size={16} className="text-danger shrink-0 mt-0.5" />
          <p className="text-sm text-foreground leading-relaxed">
            Delete <span className="font-semibold">{label}</span>? This cannot be undone.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Button type="button" variant="outline" className="flex-1" onClick={onClose} disabled={deleting}>
            Cancel
          </Button>
          <Button type="button" variant="danger" className="flex-1" onClick={handleConfirm} disabled={deleting}>
            {deleting ? <Spinner size="sm" /> : 'Delete'}
          </Button>
        </div>
      </div>
    </Modal>
  )
}

// ─── Pagination ────────────────────────────────────────────────────────────────

interface PaginationProps {
  page: number
  total: number
  limit: number
  onPage: (p: number) => void
}

function Pagination({ page, total, limit, onPage }: PaginationProps) {
  const pages = Math.ceil(total / limit)
  if (pages <= 1) return null
  const from = (page - 1) * limit + 1
  const to = Math.min(page * limit, total)

  return (
    <div className="flex items-center justify-between px-5 py-3 border-t border-border">
      <p className="text-xs text-muted-foreground tabular-nums">
        {from}–{to} of {total}
      </p>
      <div className="flex items-center gap-1">
        <Button
          variant="ghost"
          size="icon-sm"
          onClick={() => onPage(page - 1)}
          disabled={page <= 1}
          aria-label="Previous page"
        >
          <ChevronLeft size={14} />
        </Button>
        {Array.from({ length: Math.min(pages, 5) }, (_, i) => {
          const p = i + 1
          return (
            <Button
              key={p}
              variant={p === page ? 'default' : 'ghost'}
              size="icon-sm"
              onClick={() => onPage(p)}
              className={cn('text-xs', p === page && 'pointer-events-none')}
            >
              {p}
            </Button>
          )
        })}
        <Button
          variant="ghost"
          size="icon-sm"
          onClick={() => onPage(page + 1)}
          disabled={page >= pages}
          aria-label="Next page"
        >
          <ChevronRight size={14} />
        </Button>
      </div>
    </div>
  )
}

// ─── Subscriptions Tab ─────────────────────────────────────────────────────────

function SubscriptionsTab() {
  const [month, setMonth] = useState(currentMonth())
  const [tenantSearch, setTenantSearch] = useState('')
  const [page, setPage] = useState(1)
  const limit = 20

  const [data, setData] = useState<PaymentsResponse | null>(null)
  const [loading, setLoading] = useState(false)
  const [showModal, setShowModal] = useState(false)
  const [deleteTarget, setDeleteTarget] = useState<Payment | null>(null)

  const fetchPayments = useCallback(async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams({
        month: String(monthToNumber(month)),
        page: String(page),
        limit: String(limit),
      })
      if (tenantSearch.trim()) params.set('tenantId', tenantSearch.trim())
      const result = await adminFetch<PaymentsResponse>(`/api/v1/admin/payments?${params}`)
      setData(result)
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : 'Failed to load payments.')
    } finally {
      setLoading(false)
    }
  }, [month, tenantSearch, page])

  useEffect(() => {
    fetchPayments()
  }, [fetchPayments])

  const handleDelete = async (id: string) => {
    await adminFetch(`/api/v1/admin/payments/${id}`, { method: 'DELETE' })
    toast.success('Payment deleted.')
    fetchPayments()
  }

  const rawSummary = data?.summary
  const summary = rawSummary ? {
    totalMRR: rawSummary.totalPaise,
    totalRevenue: rawSummary.totalPaise,
    avgPerTenant: rawSummary.count > 0 ? Math.round(rawSummary.totalPaise / rawSummary.count) : 0,
  } : null
  const payments = data?.payments ?? []

  return (
    <div className="space-y-5">
      {/* Summary cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <SummaryCard
          icon={<TrendingUp size={16} />}
          label="Total MRR"
          value={summary ? paise(summary.totalMRR) : '—'}
          sub="Monthly recurring revenue"
          accent="orange"
          loading={loading && !data}
        />
        <SummaryCard
          icon={<IndianRupee size={16} />}
          label="Total Revenue"
          value={summary ? paise(summary.totalRevenue) : '—'}
          sub={`For ${formatMonthDisplay(month)}`}
          accent="green"
          loading={loading && !data}
        />
        <SummaryCard
          icon={<Users size={16} />}
          label="Avg per Tenant"
          value={summary ? paise(summary.avgPerTenant) : '—'}
          sub="Average subscription value"
          accent="blue"
          loading={loading && !data}
        />
      </div>

      {/* Toolbar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5">
        <div className="flex items-center gap-2 flex-1">
          <Input
            type="month"
            value={month}
            onChange={(e) => { setMonth(e.target.value); setPage(1) }}
            className="w-40 shrink-0"
          />
          <div className="relative flex-1 max-w-xs">
            <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none" />
            <Input
              type="text"
              placeholder="Filter by tenant ID…"
              value={tenantSearch}
              onChange={(e) => { setTenantSearch(e.target.value); setPage(1) }}
              className="pl-8"
            />
          </div>
        </div>
        <Button onClick={() => setShowModal(true)} className="gap-2 shrink-0">
          <Plus size={14} />
          Record Payment
        </Button>
      </div>

      {/* Table */}
      <div className="rounded-xl border border-border bg-background-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border">
                <th className="text-left px-4 py-3 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground whitespace-nowrap">Tenant</th>
                <th className="text-left px-4 py-3 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground whitespace-nowrap">Plan</th>
                <th className="text-right px-4 py-3 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground whitespace-nowrap">Amount</th>
                <th className="text-left px-4 py-3 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground whitespace-nowrap">Method</th>
                <th className="text-left px-4 py-3 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground whitespace-nowrap">Date</th>
                <th className="text-left px-4 py-3 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground whitespace-nowrap">Notes</th>
                <th className="px-4 py-3 w-10" />
              </tr>
            </thead>
            <tbody>
              {loading && !data ? (
                Array.from({ length: 6 }).map((_, i) => (
                  <tr key={i} className="border-b border-border/50 last:border-0">
                    {[1,2,3,4,5,6,7].map((j) => (
                      <td key={j} className="px-4 py-3.5">
                        <div className="h-3.5 skeleton rounded" style={{ width: `${50 + (j * 17) % 40}%` }} />
                      </td>
                    ))}
                  </tr>
                ))
              ) : payments.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-4 py-12 text-center text-muted-foreground text-sm">
                    No payments found for this period.
                  </td>
                </tr>
              ) : (
                payments.map((p) => (
                  <tr
                    key={p.id}
                    className="border-b border-border/50 last:border-0 hover:bg-white/[0.02] transition-colors"
                  >
                    <td className="px-4 py-3.5">
                      <span className="font-medium text-foreground">{p.tenantName}</span>
                    </td>
                    <td className="px-4 py-3.5">
                      <Badge variant={PLAN_BADGE[p.planType] ?? 'muted'}>{p.planType}</Badge>
                    </td>
                    <td className="px-4 py-3.5 text-right">
                      <span className="font-semibold text-foreground tabular-nums">{paise(p.amountPaise)}</span>
                    </td>
                    <td className="px-4 py-3.5">
                      <Badge variant={METHOD_BADGE[p.paymentMethod] ?? 'muted'}>{p.paymentMethod}</Badge>
                    </td>
                    <td className="px-4 py-3.5 text-muted-foreground whitespace-nowrap tabular-nums">
                      {formatDate(p.paidAt)}
                    </td>
                    <td className="px-4 py-3.5 text-muted-foreground max-w-[180px] truncate">
                      {p.notes ?? <span className="opacity-30">—</span>}
                    </td>
                    <td className="px-4 py-3.5">
                      <button
                        type="button"
                        onClick={() => setDeleteTarget(p)}
                        className="p-1.5 rounded-lg text-muted-foreground hover:text-danger hover:bg-danger/10 transition-colors"
                        aria-label="Delete payment"
                      >
                        <Trash2 size={13} />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
        {data && (
          <Pagination
            page={page}
            total={data.total}
            limit={limit}
            onPage={(p) => setPage(p)}
          />
        )}
      </div>

      {showModal && (
        <RecordPaymentModal
          onClose={() => setShowModal(false)}
          onSuccess={fetchPayments}
        />
      )}

      {deleteTarget && (
        <ConfirmDeleteModal
          label={`payment of ${paise(deleteTarget.amountPaise)} from ${deleteTarget.tenantName}`}
          onClose={() => setDeleteTarget(null)}
          onConfirm={() => handleDelete(deleteTarget.id)}
        />
      )}
    </div>
  )
}

// ─── Platform Costs Tab ────────────────────────────────────────────────────────

function PlatformCostsTab() {
  const [month, setMonth] = useState(currentMonth())
  const [category, setCategory] = useState<'' | 'SERVER' | 'MARKETING' | 'SUPPORT' | 'MISC'>('')
  const [page, setPage] = useState(1)
  const limit = 20

  const [data, setData] = useState<CostsResponse | null>(null)
  const [loading, setLoading] = useState(false)
  const [showModal, setShowModal] = useState(false)
  const [deleteTarget, setDeleteTarget] = useState<Cost | null>(null)

  const fetchCosts = useCallback(async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams({
        month: String(monthToNumber(month)),
        page: String(page),
        limit: String(limit),
      })
      if (category) params.set('category', category)
      const result = await adminFetch<CostsResponse>(`/api/v1/admin/costs?${params}`)
      setData(result)
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : 'Failed to load costs.')
    } finally {
      setLoading(false)
    }
  }, [month, category, page])

  useEffect(() => {
    fetchCosts()
  }, [fetchCosts])

  const handleDelete = async (id: string) => {
    await adminFetch(`/api/v1/admin/costs/${id}`, { method: 'DELETE' })
    toast.success('Cost entry deleted.')
    fetchCosts()
  }

  const summary = data?.summary
  const costs = data?.costs ?? []

  return (
    <div className="space-y-5">
      {/* Summary cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <SummaryCard
          icon={<DollarSign size={16} />}
          label={`Costs — ${formatMonthDisplay(month)}`}
          value={summary ? paise(summary.totalPaise) : '—'}
          sub="Total platform spend this month"
          accent="orange"
          loading={loading && !data}
        />
        <SummaryCard
          icon={<Server size={16} />}
          label="Costs — This Year"
          value={summary ? paise(summary.totalPaise) : '—'}
          sub="Cumulative year-to-date spend"
          accent="blue"
          loading={loading && !data}
        />
      </div>

      {/* Toolbar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5">
        <div className="flex items-center gap-2 flex-1">
          <Input
            type="month"
            value={month}
            onChange={(e) => { setMonth(e.target.value); setPage(1) }}
            className="w-40 shrink-0"
          />
          <select
            value={category}
            onChange={(e) => { setCategory(e.target.value as typeof category); setPage(1) }}
            className={cn(
              'h-10 rounded-md px-3 text-sm shrink-0',
              'bg-background-card border border-border',
              'text-foreground',
              'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500/30',
              'transition-colors duration-150',
            )}
          >
            <option value="">All categories</option>
            <option value="SERVER">Server</option>
            <option value="MARKETING">Marketing</option>
            <option value="SUPPORT">Support</option>
            <option value="MISC">Misc</option>
          </select>
        </div>
        <Button onClick={() => setShowModal(true)} className="gap-2 shrink-0">
          <Plus size={14} />
          Add Cost
        </Button>
      </div>

      {/* Table */}
      <div className="rounded-xl border border-border bg-background-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border">
                <th className="text-left px-4 py-3 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground whitespace-nowrap">Month</th>
                <th className="text-left px-4 py-3 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground whitespace-nowrap">Category</th>
                <th className="text-left px-4 py-3 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">Description</th>
                <th className="text-right px-4 py-3 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground whitespace-nowrap">Amount</th>
                <th className="text-left px-4 py-3 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground whitespace-nowrap">Admin</th>
                <th className="text-left px-4 py-3 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground whitespace-nowrap">Added</th>
                <th className="px-4 py-3 w-10" />
              </tr>
            </thead>
            <tbody>
              {loading && !data ? (
                Array.from({ length: 6 }).map((_, i) => (
                  <tr key={i} className="border-b border-border/50 last:border-0">
                    {[1,2,3,4,5,6,7].map((j) => (
                      <td key={j} className="px-4 py-3.5">
                        <div className="h-3.5 skeleton rounded" style={{ width: `${50 + (j * 13) % 40}%` }} />
                      </td>
                    ))}
                  </tr>
                ))
              ) : costs.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-4 py-12 text-center text-muted-foreground text-sm">
                    No cost entries found for this period.
                  </td>
                </tr>
              ) : (
                costs.map((c) => (
                  <tr
                    key={c.id}
                    className="border-b border-border/50 last:border-0 hover:bg-white/[0.02] transition-colors"
                  >
                    <td className="px-4 py-3.5 text-muted-foreground tabular-nums whitespace-nowrap">
                      {formatMonthDisplay(numberToMonth(c.month))}
                    </td>
                    <td className="px-4 py-3.5">
                      <Badge variant={COST_CAT_BADGE[c.category] ?? 'muted'} className="gap-1">
                        {COST_CAT_ICON[c.category]}
                        {c.category}
                      </Badge>
                    </td>
                    <td className="px-4 py-3.5 text-foreground max-w-[200px] truncate">
                      {c.description}
                    </td>
                    <td className="px-4 py-3.5 text-right">
                      <span className="font-semibold text-foreground tabular-nums">{paise(c.amountPaise)}</span>
                    </td>
                    <td className="px-4 py-3.5 text-muted-foreground">
                      {c.adminName ?? <span className="opacity-30">—</span>}
                    </td>
                    <td className="px-4 py-3.5 text-muted-foreground whitespace-nowrap tabular-nums">
                      {formatDate(c.createdAt)}
                    </td>
                    <td className="px-4 py-3.5">
                      <button
                        type="button"
                        onClick={() => setDeleteTarget(c)}
                        className="p-1.5 rounded-lg text-muted-foreground hover:text-danger hover:bg-danger/10 transition-colors"
                        aria-label="Delete cost entry"
                      >
                        <Trash2 size={13} />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
        {data && (
          <Pagination
            page={page}
            total={data.total}
            limit={limit}
            onPage={(p) => setPage(p)}
          />
        )}
      </div>

      {showModal && (
        <AddCostModal
          onClose={() => setShowModal(false)}
          onSuccess={fetchCosts}
        />
      )}

      {deleteTarget && (
        <ConfirmDeleteModal
          label={`${deleteTarget.description} (${paise(deleteTarget.amountPaise)})`}
          onClose={() => setDeleteTarget(null)}
          onConfirm={() => handleDelete(deleteTarget.id)}
        />
      )}
    </div>
  )
}

// ─── Page ──────────────────────────────────────────────────────────────────────

type Tab = 'subscriptions' | 'costs'

export default function FinancialsPage() {
  const [tab, setTab] = useState<Tab>('subscriptions')

  return (
    <div className="p-5 sm:p-6 max-w-[1200px] mx-auto space-y-5">
      {/* Page header */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground mb-1">
            Admin
          </p>
          <h1 className="text-2xl font-bold text-foreground leading-tight text-balance">
            Financials
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Subscription payments and platform operating costs.
          </p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-1 border-b border-border">
        {(
          [
            { id: 'subscriptions', label: 'Subscriptions' },
            { id: 'costs', label: 'Platform Costs' },
          ] as const
        ).map(({ id, label }) => (
          <button
            key={id}
            type="button"
            onClick={() => setTab(id)}
            className={cn(
              'px-4 py-2.5 text-sm font-medium transition-colors -mb-px border-b-2',
              'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500/40 rounded-t',
              tab === id
                ? 'border-primary-500 text-foreground'
                : 'border-transparent text-muted-foreground hover:text-foreground hover:border-border',
            )}
          >
            {label}
          </button>
        ))}
      </div>

      {/* Tab content */}
      <div className="animate-fade-in">
        {tab === 'subscriptions' ? <SubscriptionsTab /> : <PlatformCostsTab />}
      </div>
    </div>
  )
}
