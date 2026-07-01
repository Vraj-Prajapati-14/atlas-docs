'use client'

import { useState, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import {
  MessageCircle,
  Plus,
  Search,
  ChevronLeft,
  ChevronRight,
  X,
  AlertTriangle,
  MessageSquare,
} from 'lucide-react'
import { adminFetch } from '@/lib/admin-api'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Spinner } from '@/components/ui/spinner'
import { cn } from '@/lib/utils'
import { toast } from 'sonner'

// ─── Types ─────────────────────────────────────────────────────────────────────

type TicketStatus   = 'OPEN' | 'IN_PROGRESS' | 'RESOLVED' | 'CLOSED'
type TicketPriority = 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW'
type TicketCategory = 'BILLING' | 'TECHNICAL' | 'ACCOUNT' | 'FEATURE' | 'OTHER'

interface Ticket {
  id: string
  shortId: string
  tenantId: string
  tenantName: string
  category: TicketCategory
  priority: TicketPriority
  status: TicketStatus
  title: string
  body: string
  createdAt: string
  commentCount: number
  assignedTo?: string
}

interface TicketsResponse {
  tickets: Ticket[]
  total: number
  page: number
  limit: number
}

interface StatsResponse {
  open: number
  inProgress: number
  resolved: number
}

// ─── Badge helpers ──────────────────────────────────────────────────────────────

const PRIORITY_BADGE: Record<TicketPriority, {
  variant: 'danger' | 'warning' | 'muted' | 'info'
  label: string
}> = {
  CRITICAL: { variant: 'danger',   label: 'Critical' },
  HIGH:     { variant: 'warning',  label: 'High'     },
  MEDIUM:   { variant: 'muted',    label: 'Medium'   },
  LOW:      { variant: 'info',     label: 'Low'      },
}

const STATUS_BADGE: Record<TicketStatus, {
  variant: 'danger' | 'warning' | 'success' | 'muted'
  label: string
}> = {
  OPEN:        { variant: 'danger',  label: 'Open'        },
  IN_PROGRESS: { variant: 'warning', label: 'In Progress' },
  RESOLVED:    { variant: 'success', label: 'Resolved'    },
  CLOSED:      { variant: 'muted',   label: 'Closed'      },
}

const CATEGORY_BADGE: Record<TicketCategory, string> = {
  BILLING:   'Billing',
  TECHNICAL: 'Technical',
  ACCOUNT:   'Account',
  FEATURE:   'Feature',
  OTHER:     'Other',
}

// ─── Date formatter ─────────────────────────────────────────────────────────────

function fmtDate(iso: string) {
  return new Date(iso).toLocaleDateString('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  })
}

// ─── Create Ticket Modal ────────────────────────────────────────────────────────

interface CreateModalProps {
  onClose: () => void
  onCreated: () => void
}

function CreateTicketModal({ onClose, onCreated }: CreateModalProps) {
  const [form, setForm] = useState({
    tenantId: '',
    category: 'TECHNICAL' as TicketCategory,
    priority: 'MEDIUM' as TicketPriority,
    title: '',
    body: '',
  })

  const mutation = useMutation({
    mutationFn: () =>
      adminFetch('/api/v1/admin/tickets', {
        method: 'POST',
        body: JSON.stringify(form),
      }),
    onSuccess: () => {
      toast.success('Ticket created')
      onCreated()
      onClose()
    },
    onError: (e: Error) => toast.error(e.message),
  })

  const set = <K extends keyof typeof form>(k: K, v: typeof form[K]) =>
    setForm((f) => ({ ...f, [k]: v }))

  const valid = form.tenantId.trim() && form.title.trim() && form.body.trim()

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="create-modal-title"
    >
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-[2px]"
        onClick={onClose}
        aria-hidden="true"
      />
      <div className="relative z-10 w-full max-w-lg rounded-2xl border border-border bg-[#0A0D16] shadow-2xl shadow-black/60 flex flex-col max-h-[90dvh]">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-border shrink-0">
          <h2 id="create-modal-title" className="text-base font-bold text-foreground">
            Create Ticket
          </h2>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-md text-muted-foreground hover:text-foreground hover:bg-white/5 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500/50"
            aria-label="Close"
          >
            <X size={16} />
          </button>
        </div>

        {/* Body */}
        <div className="overflow-y-auto p-6 space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="ct-tenant">Tenant ID</Label>
            <Input
              id="ct-tenant"
              placeholder="e.g. ten_..."
              value={form.tenantId}
              onChange={(e) => set('tenantId', e.target.value)}
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label htmlFor="ct-category">Category</Label>
              <select
                id="ct-category"
                value={form.category}
                onChange={(e) => set('category', e.target.value as TicketCategory)}
                className={cn(
                  'flex h-10 w-full rounded-md px-3 py-2 text-sm',
                  'bg-background-card border border-border text-foreground',
                  'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500/20 focus-visible:border-primary-500',
                  'transition-colors duration-150',
                )}
              >
                {(Object.keys(CATEGORY_BADGE) as TicketCategory[]).map((c) => (
                  <option key={c} value={c}>{CATEGORY_BADGE[c]}</option>
                ))}
              </select>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="ct-priority">Priority</Label>
              <select
                id="ct-priority"
                value={form.priority}
                onChange={(e) => set('priority', e.target.value as TicketPriority)}
                className={cn(
                  'flex h-10 w-full rounded-md px-3 py-2 text-sm',
                  'bg-background-card border border-border text-foreground',
                  'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500/20 focus-visible:border-primary-500',
                  'transition-colors duration-150',
                )}
              >
                {(Object.keys(PRIORITY_BADGE) as TicketPriority[]).map((p) => (
                  <option key={p} value={p}>{PRIORITY_BADGE[p].label}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="ct-title">Subject</Label>
            <Input
              id="ct-title"
              placeholder="Brief description of the issue"
              value={form.title}
              onChange={(e) => set('title', e.target.value)}
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="ct-body">Details</Label>
            <textarea
              id="ct-body"
              rows={4}
              placeholder="Describe the issue in detail..."
              value={form.body}
              onChange={(e) => set('body', e.target.value)}
              className={cn(
                'flex w-full rounded-md px-3 py-2 text-sm resize-none',
                'bg-background-card border border-border text-foreground',
                'placeholder:text-muted-foreground',
                'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500/20 focus-visible:border-primary-500',
                'transition-colors duration-150',
              )}
            />
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-border shrink-0">
          <Button variant="ghost" onClick={onClose} disabled={mutation.isPending}>
            Cancel
          </Button>
          <Button
            onClick={() => mutation.mutate()}
            disabled={mutation.isPending || !valid}
          >
            {mutation.isPending ? <Spinner size="sm" /> : 'Create Ticket'}
          </Button>
        </div>
      </div>
    </div>
  )
}

// ─── Main page ──────────────────────────────────────────────────────────────────

const PAGE_LIMIT = 20

export default function SupportTicketsPage() {
  const router = useRouter()
  const queryClient = useQueryClient()

  const [status,   setStatus]   = useState<TicketStatus | ''>('')
  const [priority, setPriority] = useState<TicketPriority | ''>('')
  const [category, setCategory] = useState<TicketCategory | ''>('')
  const [search,   setSearch]   = useState('')
  const [page,     setPage]     = useState(1)
  const [showCreate, setShowCreate] = useState(false)

  // Build query params
  const params = new URLSearchParams()
  if (status)   params.set('status',   status)
  if (priority) params.set('priority', priority)
  if (category) params.set('category', category)
  if (search)   params.set('tenantSearch', search)
  params.set('page',  String(page))
  params.set('limit', String(PAGE_LIMIT))

  const { data, isLoading, isError } = useQuery<TicketsResponse>({
    queryKey: ['admin-tickets', status, priority, category, search, page],
    queryFn:  () => adminFetch(`/api/v1/admin/tickets?${params.toString()}`),
  })

  const { data: stats } = useQuery<StatsResponse>({
    queryKey: ['admin-ticket-stats'],
    queryFn:  () => adminFetch('/api/v1/admin/tickets/stats'),
    staleTime: 60_000,
  })

  const tickets   = data?.tickets ?? []
  const total     = data?.total ?? 0
  const totalPages = Math.max(1, Math.ceil(total / PAGE_LIMIT))

  const resetPage = useCallback(() => setPage(1), [])

  const handleFilterChange = <T,>(setter: (v: T) => void) => (v: T) => {
    setter(v)
    resetPage()
  }

  return (
    <div className="flex flex-col h-full">
      {/* ── Page header ── */}
      <div className="flex items-start justify-between gap-4 px-6 pt-6 pb-4 shrink-0">
        <div>
          <h1 className="text-xl font-bold text-foreground" style={{ textWrap: 'balance' }}>
            Support Tickets
          </h1>
          {stats && (
            <div className="flex items-center gap-4 mt-2">
              <StatPill label="Open"        value={stats.open}       colorClass="text-danger"  />
              <StatPill label="In Progress" value={stats.inProgress} colorClass="text-warning" />
              <StatPill label="Resolved"    value={stats.resolved}   colorClass="text-success" />
            </div>
          )}
        </div>
        <Button
          size="sm"
          className="shrink-0"
          onClick={() => setShowCreate(true)}
        >
          <Plus size={14} />
          Create Ticket
        </Button>
      </div>

      {/* ── Filters ── */}
      <div className="flex flex-wrap items-center gap-2 px-6 pb-4 shrink-0">
        {/* Search */}
        <div className="relative w-56">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none" />
          <Input
            placeholder="Search restaurant..."
            value={search}
            onChange={(e) => { setSearch(e.target.value); resetPage() }}
            className="pl-8 h-9 text-sm"
          />
        </div>

        <FilterSelect
          id="filter-status"
          value={status}
          onChange={handleFilterChange(setStatus) as (v: string) => void}
          placeholder="All Statuses"
          options={[
            { value: 'OPEN',        label: 'Open'        },
            { value: 'IN_PROGRESS', label: 'In Progress' },
            { value: 'RESOLVED',    label: 'Resolved'    },
            { value: 'CLOSED',      label: 'Closed'      },
          ]}
        />

        <FilterSelect
          id="filter-priority"
          value={priority}
          onChange={handleFilterChange(setPriority) as (v: string) => void}
          placeholder="All Priorities"
          options={[
            { value: 'CRITICAL', label: 'Critical' },
            { value: 'HIGH',     label: 'High'     },
            { value: 'MEDIUM',   label: 'Medium'   },
            { value: 'LOW',      label: 'Low'      },
          ]}
        />

        <FilterSelect
          id="filter-category"
          value={category}
          onChange={handleFilterChange(setCategory) as (v: string) => void}
          placeholder="All Categories"
          options={[
            { value: 'BILLING',   label: 'Billing'   },
            { value: 'TECHNICAL', label: 'Technical' },
            { value: 'ACCOUNT',   label: 'Account'   },
            { value: 'FEATURE',   label: 'Feature'   },
            { value: 'OTHER',     label: 'Other'     },
          ]}
        />

        {(status || priority || category || search) && (
          <button
            type="button"
            onClick={() => {
              setStatus('')
              setPriority('')
              setCategory('')
              setSearch('')
              setPage(1)
            }}
            className="flex items-center gap-1.5 px-2.5 h-9 rounded-md text-xs text-muted-foreground hover:text-foreground hover:bg-white/5 transition-colors border border-border"
          >
            <X size={12} />
            Clear
          </button>
        )}
      </div>

      {/* ── Table ── */}
      <div className="flex-1 overflow-hidden px-6 pb-4 flex flex-col min-h-0">
        <div className="overflow-auto rounded-xl border border-border flex-1">
          {isLoading ? (
            <div className="flex items-center justify-center h-64">
              <Spinner size="lg" className="text-primary-500" />
            </div>
          ) : isError ? (
            <div className="flex flex-col items-center justify-center h-64 gap-3 text-muted-foreground">
              <AlertTriangle size={32} className="opacity-30" />
              <p className="text-sm">Failed to load tickets</p>
            </div>
          ) : tickets.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-64 gap-3 text-muted-foreground">
              <MessageSquare size={36} className="opacity-20" />
              <p className="text-sm">No tickets match your filters</p>
            </div>
          ) : (
            <table className="w-full text-sm min-w-[820px]">
              <thead>
                <tr className="border-b border-border bg-white/[0.03] text-left">
                  <Th>ID</Th>
                  <Th>Restaurant</Th>
                  <Th>Category</Th>
                  <Th>Priority</Th>
                  <Th>Status</Th>
                  <Th className="min-w-[200px]">Subject</Th>
                  <Th>Created</Th>
                  <Th className="text-right">
                    <MessageCircle size={12} className="inline-block" />
                  </Th>
                </tr>
              </thead>
              <tbody>
                {tickets.map((ticket) => {
                  const pri = PRIORITY_BADGE[ticket.priority]
                  const sta = STATUS_BADGE[ticket.status]
                  return (
                    <tr
                      key={ticket.id}
                      onClick={() => router.push(`/admin/support/${ticket.id}`)}
                      className={cn(
                        'border-b border-border last:border-0',
                        'hover:bg-white/[0.025] cursor-pointer',
                        'transition-colors duration-75',
                        'focus-visible:outline-none focus-visible:bg-white/5',
                      )}
                      tabIndex={0}
                      role="button"
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' || e.key === ' ') {
                          e.preventDefault()
                          router.push(`/admin/support/${ticket.id}`)
                        }
                      }}
                    >
                      <Td>
                        <span className="font-mono text-xs text-muted-foreground tabular-nums">
                          #{ticket.shortId}
                        </span>
                      </Td>
                      <Td>
                        <span className="font-medium text-foreground">{ticket.tenantName}</span>
                      </Td>
                      <Td>
                        <Badge variant="muted">{CATEGORY_BADGE[ticket.category]}</Badge>
                      </Td>
                      <Td>
                        <Badge variant={pri.variant}>{pri.label}</Badge>
                      </Td>
                      <Td>
                        <Badge variant={sta.variant}>{sta.label}</Badge>
                      </Td>
                      <Td>
                        <span className="text-foreground truncate block max-w-[260px]" title={ticket.title}>
                          {ticket.title}
                        </span>
                      </Td>
                      <Td>
                        <span className="text-muted-foreground tabular-nums text-xs whitespace-nowrap">
                          {fmtDate(ticket.createdAt)}
                        </span>
                      </Td>
                      <Td className="text-right">
                        <span className="text-muted-foreground tabular-nums text-xs font-medium">
                          {ticket.commentCount}
                        </span>
                      </Td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          )}
        </div>

        {/* Pagination */}
        {!isLoading && total > PAGE_LIMIT && (
          <div className="flex items-center justify-between pt-3 shrink-0">
            <p className="text-xs text-muted-foreground tabular-nums">
              Showing {((page - 1) * PAGE_LIMIT) + 1}–{Math.min(page * PAGE_LIMIT, total)} of {total}
            </p>
            <div className="flex items-center gap-1">
              <Button
                variant="outline"
                size="icon-sm"
                disabled={page === 1}
                onClick={() => setPage((p) => p - 1)}
                aria-label="Previous page"
              >
                <ChevronLeft size={14} />
              </Button>
              <span className="px-3 text-xs text-muted-foreground tabular-nums">
                {page} / {totalPages}
              </span>
              <Button
                variant="outline"
                size="icon-sm"
                disabled={page >= totalPages}
                onClick={() => setPage((p) => p + 1)}
                aria-label="Next page"
              >
                <ChevronRight size={14} />
              </Button>
            </div>
          </div>
        )}
      </div>

      {/* Create modal */}
      {showCreate && (
        <CreateTicketModal
          onClose={() => setShowCreate(false)}
          onCreated={() => queryClient.invalidateQueries({ queryKey: ['admin-tickets'] })}
        />
      )}
    </div>
  )
}

// ─── Small sub-components ───────────────────────────────────────────────────────

function StatPill({
  label,
  value,
  colorClass,
}: {
  label: string
  value: number
  colorClass: string
}) {
  return (
    <span className="flex items-center gap-1.5 text-xs">
      <span className={cn('font-bold tabular-nums text-sm', colorClass)}>{value}</span>
      <span className="text-muted-foreground">{label}</span>
    </span>
  )
}

function FilterSelect({
  id,
  value,
  onChange,
  placeholder,
  options,
}: {
  id: string
  value: string
  onChange: (v: string) => void
  placeholder: string
  options: { value: string; label: string }[]
}) {
  return (
    <select
      id={id}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className={cn(
        'h-9 rounded-md px-3 text-sm',
        'bg-background-card border border-border text-foreground',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500/20 focus-visible:border-primary-500',
        'transition-colors duration-150 cursor-pointer',
        !value && 'text-muted-foreground',
      )}
    >
      <option value="">{placeholder}</option>
      {options.map((o) => (
        <option key={o.value} value={o.value}>{o.label}</option>
      ))}
    </select>
  )
}

function Th({ children, className }: { children?: React.ReactNode; className?: string }) {
  return (
    <th className={cn('px-4 py-3 text-[10px] font-bold uppercase tracking-wider text-muted-foreground whitespace-nowrap', className)}>
      {children}
    </th>
  )
}

function Td({ children, className }: { children?: React.ReactNode; className?: string }) {
  return (
    <td className={cn('px-4 py-3', className)}>
      {children}
    </td>
  )
}
