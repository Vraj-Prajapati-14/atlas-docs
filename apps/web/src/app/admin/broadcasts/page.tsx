'use client'

import { useState, useCallback } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import {
  Megaphone,
  Plus,
  Trash2,
  X,
  ChevronLeft,
  ChevronRight,
  Info,
  AlertTriangle,
  Wrench,
  Sparkles,
  Users,
  CalendarClock,
  UserCircle,
} from 'lucide-react'
import { toast } from 'sonner'
import { adminFetch } from '@/lib/admin-api'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { cn } from '@/lib/utils'

// ─── Types ─────────────────────────────────────────────────────────────────────

type BroadcastType = 'INFO' | 'WARNING' | 'MAINTENANCE' | 'FEATURE'
type TargetType = 'ALL' | 'ACTIVE' | 'PENDING' | 'SPECIFIC'

interface Broadcast {
  id: string
  type: BroadcastType
  title: string
  body: string
  targetType: TargetType
  targetValue?: string
  expiresAt?: string | null
  sentBy: string
  sentByEmail?: string
  createdAt: string
  dismissCount: number
}

interface BroadcastsResponse {
  items: Broadcast[]
  total: number
  page: number
  limit: number
}

interface NewBroadcastPayload {
  type: BroadcastType
  title: string
  body: string
  targetType: TargetType
  targetValue?: string
  expiresAt?: string
}

// ─── Config ────────────────────────────────────────────────────────────────────

const PAGE_LIMIT = 10

const TYPE_CONFIG: Record<
  BroadcastType,
  { label: string; variant: 'info' | 'warning' | 'danger' | 'success'; Icon: React.ElementType }
> = {
  INFO:        { label: 'Info',        variant: 'info',    Icon: Info },
  WARNING:     { label: 'Warning',     variant: 'warning', Icon: AlertTriangle },
  MAINTENANCE: { label: 'Maintenance', variant: 'danger',  Icon: Wrench },
  FEATURE:     { label: 'Feature',     variant: 'success', Icon: Sparkles },
}

const TARGET_LABELS: Record<TargetType, string> = {
  ALL:      'All tenants',
  ACTIVE:   'Active tenants',
  PENDING:  'Pending tenants',
  SPECIFIC: 'Specific tenants',
}

// ─── Helpers ───────────────────────────────────────────────────────────────────

function fmtDate(iso: string) {
  return new Date(iso).toLocaleDateString('en-IN', {
    day: '2-digit', month: 'short', year: 'numeric',
  })
}

// ─── Modal ─────────────────────────────────────────────────────────────────────

interface NewBroadcastModalProps {
  onClose: () => void
  onCreated: () => void
}

function NewBroadcastModal({ onClose, onCreated }: NewBroadcastModalProps) {
  const [type, setType] = useState<BroadcastType>('INFO')
  const [title, setTitle] = useState('')
  const [body, setBody] = useState('')
  const [targetType, setTargetType] = useState<TargetType>('ALL')
  const [targetValue, setTargetValue] = useState('')
  const [expiresAt, setExpiresAt] = useState('')

  const create = useMutation({
    mutationFn: (payload: NewBroadcastPayload) =>
      adminFetch<Broadcast>('/api/v1/admin/broadcasts', {
        method: 'POST',
        body: JSON.stringify(payload),
      }),
    onSuccess: () => {
      toast.success('Broadcast sent.')
      onCreated()
      onClose()
    },
    onError: (e: Error) => toast.error(e.message),
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!title.trim() || !body.trim()) {
      toast.error('Title and body are required.')
      return
    }
    const payload: NewBroadcastPayload = {
      type,
      title: title.trim(),
      body: body.trim(),
      targetType,
      ...(targetType === 'SPECIFIC' && targetValue.trim()
        ? { targetValue: targetValue.trim() }
        : {}),
      ...(expiresAt ? { expiresAt: new Date(expiresAt).toISOString() } : {}),
    }
    create.mutate(payload)
  }

  const selectClass =
    'flex h-10 w-full rounded-md px-3 py-2 text-sm bg-background-card border border-border text-foreground ' +
    'focus:outline-none focus:ring-2 focus:ring-primary-500/30 focus:border-primary-500 disabled:opacity-50 disabled:cursor-not-allowed'

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm"
      onClick={(e) => { if (e.target === e.currentTarget) onClose() }}
    >
      <div className="w-full max-w-lg rounded-2xl border border-border bg-background-card shadow-2xl shadow-black/40 animate-fade-in">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-border">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-primary-500/15 flex items-center justify-center">
              <Megaphone size={15} className="text-primary-500" />
            </div>
            <h2 className="text-sm font-bold text-foreground">New Broadcast</h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-md text-muted-foreground hover:text-foreground hover:bg-white/5 transition-colors"
            aria-label="Close"
          >
            <X size={16} />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {/* Type + Target row */}
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label>Type</Label>
              <select
                className={selectClass}
                value={type}
                onChange={(e) => setType(e.target.value as BroadcastType)}
                disabled={create.isPending}
              >
                <option value="INFO">Info</option>
                <option value="WARNING">Warning</option>
                <option value="MAINTENANCE">Maintenance</option>
                <option value="FEATURE">Feature</option>
              </select>
            </div>
            <div className="space-y-1.5">
              <Label>Target</Label>
              <select
                className={selectClass}
                value={targetType}
                onChange={(e) => setTargetType(e.target.value as TargetType)}
                disabled={create.isPending}
              >
                <option value="ALL">All tenants</option>
                <option value="ACTIVE">Active tenants</option>
                <option value="PENDING">Pending tenants</option>
                <option value="SPECIFIC">Specific tenants</option>
              </select>
            </div>
          </div>

          {/* Specific tenant IDs */}
          {targetType === 'SPECIFIC' && (
            <div className="space-y-1.5">
              <Label>Tenant IDs <span className="text-muted-foreground font-normal">(comma-separated)</span></Label>
              <Input
                placeholder="tid_abc123, tid_def456"
                value={targetValue}
                onChange={(e) => setTargetValue(e.target.value)}
                disabled={create.isPending}
              />
            </div>
          )}

          {/* Title */}
          <div className="space-y-1.5">
            <Label>Title</Label>
            <Input
              placeholder="Brief headline for the broadcast"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              disabled={create.isPending}
              maxLength={120}
            />
          </div>

          {/* Body */}
          <div className="space-y-1.5">
            <Label>Body</Label>
            <textarea
              className={cn(
                selectClass,
                'h-auto min-h-[90px] resize-y py-2.5 leading-relaxed',
              )}
              placeholder="Full message content…"
              value={body}
              onChange={(e) => setBody(e.target.value)}
              disabled={create.isPending}
              maxLength={1000}
              rows={4}
            />
            <p className="text-[11px] text-muted-foreground text-right">{body.length}/1000</p>
          </div>

          {/* Expires at */}
          <div className="space-y-1.5">
            <Label>
              Expires at{' '}
              <span className="text-muted-foreground font-normal">(optional — leave blank for never)</span>
            </Label>
            <Input
              type="datetime-local"
              value={expiresAt}
              onChange={(e) => setExpiresAt(e.target.value)}
              disabled={create.isPending}
            />
          </div>

          {/* Actions */}
          <div className="flex items-center justify-end gap-2 pt-2">
            <Button type="button" variant="secondary" size="sm" onClick={onClose} disabled={create.isPending}>
              Cancel
            </Button>
            <Button type="submit" size="sm" disabled={create.isPending || !title.trim() || !body.trim()}>
              {create.isPending ? 'Sending…' : 'Send Broadcast'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}

// ─── Broadcast card ────────────────────────────────────────────────────────────

interface BroadcastCardProps {
  broadcast: Broadcast
  onDelete: (id: string) => void
  deleting: boolean
}

function BroadcastCard({ broadcast, onDelete, deleting }: BroadcastCardProps) {
  const { label, variant, Icon } = TYPE_CONFIG[broadcast.type]

  return (
    <div className="rounded-xl border border-border bg-background-card p-5 flex flex-col gap-3 hover:border-border/80 transition-colors">
      {/* Top row */}
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-2.5 min-w-0">
          <div
            className={cn(
              'w-8 h-8 rounded-lg flex items-center justify-center shrink-0',
              variant === 'info'    && 'bg-info/10',
              variant === 'warning' && 'bg-warning/10',
              variant === 'danger'  && 'bg-danger/10',
              variant === 'success' && 'bg-success/10',
            )}
          >
            <Icon
              size={15}
              className={cn(
                variant === 'info'    && 'text-info',
                variant === 'warning' && 'text-warning',
                variant === 'danger'  && 'text-danger',
                variant === 'success' && 'text-success',
              )}
            />
          </div>
          <div className="min-w-0">
            <p className="text-sm font-semibold text-foreground leading-snug truncate">
              {broadcast.title}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <Badge variant={variant}>{label}</Badge>
          <button
            type="button"
            onClick={() => onDelete(broadcast.id)}
            disabled={deleting}
            aria-label="Delete broadcast"
            className="p-1.5 rounded-md text-muted-foreground hover:text-danger hover:bg-danger/10 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
          >
            <Trash2 size={14} />
          </button>
        </div>
      </div>

      {/* Body preview */}
      <p className="text-sm text-muted-foreground leading-relaxed line-clamp-2">
        {broadcast.body}
      </p>

      {/* Meta row */}
      <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5 pt-1 border-t border-border/60">
        <span className="flex items-center gap-1.5 text-[11px] text-muted-foreground">
          <Users size={11} className="shrink-0" />
          {TARGET_LABELS[broadcast.targetType]}
          {broadcast.targetType === 'SPECIFIC' && broadcast.targetValue && (
            <span className="text-foreground/60">— {broadcast.targetValue}</span>
          )}
        </span>
        <span className="flex items-center gap-1.5 text-[11px] text-muted-foreground">
          <CalendarClock size={11} className="shrink-0" />
          {broadcast.expiresAt ? fmtDate(broadcast.expiresAt) : 'Never expires'}
        </span>
        <span className="flex items-center gap-1.5 text-[11px] text-muted-foreground">
          <UserCircle size={11} className="shrink-0" />
          {broadcast.sentBy} · {fmtDate(broadcast.createdAt)}
        </span>
        {broadcast.dismissCount > 0 && (
          <span className="ml-auto text-[11px] font-medium text-muted-foreground bg-white/5 rounded-full px-2 py-0.5">
            {broadcast.dismissCount} dismissed
          </span>
        )}
      </div>
    </div>
  )
}

// ─── Empty state ───────────────────────────────────────────────────────────────

function EmptyState({ onNew }: { onNew: () => void }) {
  return (
    <div className="flex flex-col items-center justify-center py-24 text-center">
      <div className="w-14 h-14 rounded-2xl bg-white/5 border border-border flex items-center justify-center mb-4">
        <Megaphone size={22} className="text-muted-foreground" />
      </div>
      <p className="text-sm font-semibold text-foreground mb-1">No broadcasts yet</p>
      <p className="text-xs text-muted-foreground mb-5 max-w-xs">
        Send a platform-wide message to your restaurant tenants — announcements, maintenance windows, new features.
      </p>
      <Button size="sm" onClick={onNew}>
        <Plus size={14} />
        New Broadcast
      </Button>
    </div>
  )
}

// ─── Page ──────────────────────────────────────────────────────────────────────

export default function BroadcastsPage() {
  const qc = useQueryClient()
  const [page, setPage] = useState(1)
  const [showModal, setShowModal] = useState(false)
  const [deletingId, setDeletingId] = useState<string | null>(null)

  const { data, isLoading, isError } = useQuery({
    queryKey: ['admin-broadcasts', page],
    queryFn: () =>
      adminFetch<BroadcastsResponse>(
        `/api/v1/admin/broadcasts?page=${page}&limit=${PAGE_LIMIT}`,
      ),
    placeholderData: (prev) => prev,
  })

  const deleteMutation = useMutation({
    mutationFn: (id: string) =>
      adminFetch(`/api/v1/admin/broadcasts/${id}`, { method: 'DELETE' }),
    onMutate: (id) => setDeletingId(id),
    onSuccess: () => {
      toast.success('Broadcast deleted.')
      qc.invalidateQueries({ queryKey: ['admin-broadcasts'] })
    },
    onError: (e: Error) => toast.error(e.message),
    onSettled: () => setDeletingId(null),
  })

  const handleDelete = useCallback(
    (id: string) => {
      if (!confirm('Delete this broadcast? It will be removed for all tenants.')) return
      deleteMutation.mutate(id)
    },
    [deleteMutation],
  )

  const items = data?.items ?? []
  const total = data?.total ?? 0
  const totalPages = Math.max(1, Math.ceil(total / PAGE_LIMIT))

  return (
    <>
      <div className="p-6 max-w-4xl mx-auto">
        {/* Page header */}
        <div className="flex items-center justify-between mb-7">
          <div>
            <h1 className="text-xl font-bold text-foreground">Broadcasts</h1>
            <p className="text-sm text-muted-foreground mt-0.5">
              Platform-wide messages sent to restaurant tenants
            </p>
          </div>
          <Button size="sm" onClick={() => setShowModal(true)}>
            <Plus size={14} />
            New Broadcast
          </Button>
        </div>

        {/* Loading skeletons */}
        {isLoading && (
          <div className="space-y-4">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="rounded-xl border border-border bg-background-card p-5 space-y-3">
                <div className="flex items-center gap-3">
                  <div className="skeleton w-8 h-8 rounded-lg" />
                  <div className="skeleton h-4 w-48 rounded" />
                </div>
                <div className="skeleton h-3 w-full rounded" />
                <div className="skeleton h-3 w-3/4 rounded" />
              </div>
            ))}
          </div>
        )}

        {/* Error */}
        {isError && (
          <div className="rounded-xl border border-danger/20 bg-danger/5 p-5 text-sm text-danger">
            Failed to load broadcasts. Please try again.
          </div>
        )}

        {/* Empty */}
        {!isLoading && !isError && items.length === 0 && (
          <EmptyState onNew={() => setShowModal(true)} />
        )}

        {/* List */}
        {!isLoading && !isError && items.length > 0 && (
          <>
            <div className="space-y-4 mb-6">
              {items.map((b) => (
                <BroadcastCard
                  key={b.id}
                  broadcast={b}
                  onDelete={handleDelete}
                  deleting={deletingId === b.id}
                />
              ))}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex items-center justify-between">
                <p className="text-xs text-muted-foreground">
                  Showing {(page - 1) * PAGE_LIMIT + 1}–{Math.min(page * PAGE_LIMIT, total)} of {total}
                </p>
                <div className="flex items-center gap-1">
                  <Button
                    variant="outline"
                    size="icon-sm"
                    onClick={() => setPage((p) => Math.max(1, p - 1))}
                    disabled={page === 1}
                    aria-label="Previous page"
                  >
                    <ChevronLeft size={14} />
                  </Button>
                  <span className="text-xs text-muted-foreground px-2 tabular-nums">
                    {page} / {totalPages}
                  </span>
                  <Button
                    variant="outline"
                    size="icon-sm"
                    onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                    disabled={page === totalPages}
                    aria-label="Next page"
                  >
                    <ChevronRight size={14} />
                  </Button>
                </div>
              </div>
            )}
          </>
        )}
      </div>

      {/* Modal */}
      {showModal && (
        <NewBroadcastModal
          onClose={() => setShowModal(false)}
          onCreated={() => qc.invalidateQueries({ queryKey: ['admin-broadcasts'] })}
        />
      )}
    </>
  )
}
