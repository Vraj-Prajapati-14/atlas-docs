'use client'

import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import {
  ShieldCheck,
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  LogIn,
  ToggleRight,
  ToggleLeft,
  Megaphone,
  SlidersHorizontal,
  Globe,
  Search,
} from 'lucide-react'
import { adminFetch } from '@/lib/admin-api'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { cn } from '@/lib/utils'

// ─── Types ─────────────────────────────────────────────────────────────────────

type AuditAction =
  | 'LOGIN'
  | 'LOGOUT'
  | 'TENANT_ACTIVATE'
  | 'TENANT_SUSPEND'
  | 'TENANT_DELETE'
  | 'BROADCAST_SENT'
  | 'BROADCAST_DELETE'
  | 'SETTINGS_UPDATE'
  | 'ADMIN_CREATED'
  | 'ADMIN_UPDATED'

interface AuditEntry {
  id: string
  timestamp: string
  adminId: string
  adminName: string
  adminEmail: string
  action: AuditAction
  targetType?: string
  targetName?: string
  targetId?: string
  ipAddress?: string
  meta?: Record<string, unknown>
}

interface AuditLogResponse {
  items: AuditEntry[]
  total: number
  page: number
  limit: number
}

// ─── Action config ─────────────────────────────────────────────────────────────

const ACTION_CONFIG: Record<
  AuditAction,
  {
    label: string
    variant: 'info' | 'success' | 'danger' | 'warning' | 'default' | 'muted'
    Icon: React.ElementType
  }
> = {
  LOGIN:            { label: 'Login',             variant: 'info',    Icon: LogIn },
  LOGOUT:           { label: 'Logout',            variant: 'muted',   Icon: LogIn },
  TENANT_ACTIVATE:  { label: 'Tenant Activate',   variant: 'success', Icon: ToggleRight },
  TENANT_SUSPEND:   { label: 'Tenant Suspend',    variant: 'danger',  Icon: ToggleLeft },
  TENANT_DELETE:    { label: 'Tenant Delete',     variant: 'danger',  Icon: ToggleLeft },
  BROADCAST_SENT:   { label: 'Broadcast Sent',    variant: 'default', Icon: Megaphone },
  BROADCAST_DELETE: { label: 'Broadcast Delete',  variant: 'warning', Icon: Megaphone },
  SETTINGS_UPDATE:  { label: 'Settings Update',   variant: 'warning', Icon: SlidersHorizontal },
  ADMIN_CREATED:    { label: 'Admin Created',      variant: 'success', Icon: ShieldCheck },
  ADMIN_UPDATED:    { label: 'Admin Updated',      variant: 'info',    Icon: ShieldCheck },
}

const ALL_ACTIONS = Object.keys(ACTION_CONFIG) as AuditAction[]

const PAGE_LIMIT = 20

// ─── Helpers ───────────────────────────────────────────────────────────────────

function fmtTimestamp(iso: string) {
  const d = new Date(iso)
  const day = String(d.getDate()).padStart(2, '0')
  const month = d.toLocaleString('en-US', { month: 'short' })
  const year = d.getFullYear()
  const time = d.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false })
  return `${day} ${month} ${year} ${time}`
}

// ─── Meta expand modal ─────────────────────────────────────────────────────────

interface MetaModalProps {
  meta: Record<string, unknown>
  onClose: () => void
}

function MetaModal({ meta, onClose }: MetaModalProps) {
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm"
      onClick={(e) => { if (e.target === e.currentTarget) onClose() }}
    >
      <div className="w-full max-w-md rounded-2xl border border-border bg-background-card shadow-2xl shadow-black/40 animate-fade-in">
        <div className="flex items-center justify-between px-5 py-4 border-b border-border">
          <p className="text-sm font-bold text-foreground">Event Metadata</p>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-md text-muted-foreground hover:text-foreground hover:bg-white/5 transition-colors"
            aria-label="Close"
          >
            <ChevronDown size={16} />
          </button>
        </div>
        <div className="p-5">
          <pre className="text-[12px] font-mono text-foreground/80 bg-background rounded-lg p-4 overflow-x-auto border border-border leading-relaxed max-h-64 overflow-y-auto">
            {JSON.stringify(meta, null, 2)}
          </pre>
        </div>
      </div>
    </div>
  )
}

// ─── Row ───────────────────────────────────────────────────────────────────────

interface AuditRowProps {
  entry: AuditEntry
}

function AuditRow({ entry }: AuditRowProps) {
  const [metaOpen, setMetaOpen] = useState(false)
  const cfg = ACTION_CONFIG[entry.action] ?? {
    label: entry.action,
    variant: 'muted' as const,
    Icon: ShieldCheck,
  }
  const hasMeta = entry.meta && Object.keys(entry.meta).length > 0

  return (
    <>
      <tr className="border-b border-border/50 hover:bg-white/[0.025] transition-colors group">
        {/* Timestamp */}
        <td className="px-4 py-3 whitespace-nowrap">
          <span className="text-xs font-mono text-muted-foreground tabular-nums">
            {fmtTimestamp(entry.timestamp)}
          </span>
        </td>

        {/* Admin */}
        <td className="px-4 py-3">
          <div>
            <p className="text-xs font-semibold text-foreground leading-snug">{entry.adminName}</p>
            <p className="text-[11px] text-muted-foreground leading-snug">{entry.adminEmail}</p>
          </div>
        </td>

        {/* Action */}
        <td className="px-4 py-3 whitespace-nowrap">
          <Badge variant={cfg.variant} className="gap-1">
            <cfg.Icon size={9} />
            {cfg.label}
          </Badge>
        </td>

        {/* Target */}
        <td className="px-4 py-3">
          {entry.targetType || entry.targetName ? (
            <div>
              {entry.targetType && (
                <p className="text-[11px] uppercase tracking-wider text-muted-foreground font-medium leading-snug">
                  {entry.targetType}
                </p>
              )}
              {entry.targetName && (
                <p className="text-xs text-foreground leading-snug">{entry.targetName}</p>
              )}
            </div>
          ) : (
            <span className="text-muted-foreground/40 text-xs">—</span>
          )}
        </td>

        {/* IP */}
        <td className="px-4 py-3 whitespace-nowrap">
          {entry.ipAddress ? (
            <span className="flex items-center gap-1.5 text-xs font-mono text-muted-foreground">
              <Globe size={11} className="shrink-0" />
              {entry.ipAddress}
            </span>
          ) : (
            <span className="text-muted-foreground/40 text-xs">—</span>
          )}
        </td>

        {/* Meta */}
        <td className="px-4 py-3 text-right">
          {hasMeta ? (
            <button
              type="button"
              onClick={() => setMetaOpen(true)}
              className="inline-flex items-center gap-1 text-[11px] font-medium text-primary-500 hover:text-primary-400 transition-colors"
            >
              View
              <ChevronDown size={11} />
            </button>
          ) : (
            <span className="text-muted-foreground/40 text-xs">—</span>
          )}
        </td>
      </tr>

      {metaOpen && entry.meta && (
        <MetaModal meta={entry.meta} onClose={() => setMetaOpen(false)} />
      )}
    </>
  )
}

// ─── Page ──────────────────────────────────────────────────────────────────────

export default function AuditLogPage() {
  const [page, setPage] = useState(1)
  const [adminFilter, setAdminFilter] = useState('')
  const [actionFilter, setActionFilter] = useState<AuditAction | ''>('')
  const [dateFrom, setDateFrom] = useState('')
  const [dateTo, setDateTo] = useState('')

  const buildQuery = () => {
    const params = new URLSearchParams()
    params.set('page', String(page))
    params.set('limit', String(PAGE_LIMIT))
    if (adminFilter.trim()) params.set('adminId', adminFilter.trim())
    if (actionFilter) params.set('action', actionFilter)
    if (dateFrom) params.set('from', new Date(dateFrom).toISOString())
    if (dateTo) params.set('to', new Date(dateTo).toISOString())
    return params.toString()
  }

  const { data, isLoading, isError } = useQuery({
    queryKey: ['admin-audit', page, adminFilter, actionFilter, dateFrom, dateTo],
    queryFn: () =>
      adminFetch<AuditLogResponse>(`/api/v1/admin/audit-log?${buildQuery()}`),
    placeholderData: (prev) => prev,
  })

  const handleFilterChange = () => setPage(1)

  const items = data?.items ?? []
  const total = data?.total ?? 0
  const totalPages = Math.max(1, Math.ceil(total / PAGE_LIMIT))

  const selectClass =
    'flex h-10 w-full rounded-md px-3 py-2 text-sm bg-background-card border border-border text-foreground ' +
    'focus:outline-none focus:ring-2 focus:ring-primary-500/30 focus:border-primary-500 disabled:opacity-50'

  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* Page header */}
      <div className="mb-6">
        <h1 className="text-xl font-bold text-foreground flex items-center gap-2.5">
          <ShieldCheck size={20} className="text-primary-500 shrink-0" />
          Audit Log
        </h1>
        <p className="text-sm text-muted-foreground mt-0.5">
          All super-admin actions across the platform
        </p>
      </div>

      {/* Filters */}
      <div className="rounded-xl border border-border bg-background-card p-4 mb-5">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {/* Admin search */}
          <div className="space-y-1.5">
            <Label className="text-[11px] uppercase tracking-wider text-muted-foreground font-semibold">
              Admin
            </Label>
            <div className="relative">
              <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none" />
              <Input
                placeholder="Name or ID…"
                value={adminFilter}
                onChange={(e) => { setAdminFilter(e.target.value); handleFilterChange() }}
                className="pl-8"
              />
            </div>
          </div>

          {/* Action filter */}
          <div className="space-y-1.5">
            <Label className="text-[11px] uppercase tracking-wider text-muted-foreground font-semibold">
              Action
            </Label>
            <select
              className={selectClass}
              value={actionFilter}
              onChange={(e) => { setActionFilter(e.target.value as AuditAction | ''); handleFilterChange() }}
            >
              <option value="">All actions</option>
              {ALL_ACTIONS.map((a) => (
                <option key={a} value={a}>{ACTION_CONFIG[a].label}</option>
              ))}
            </select>
          </div>

          {/* Date from */}
          <div className="space-y-1.5">
            <Label className="text-[11px] uppercase tracking-wider text-muted-foreground font-semibold">
              From
            </Label>
            <Input
              type="date"
              value={dateFrom}
              onChange={(e) => { setDateFrom(e.target.value); handleFilterChange() }}
            />
          </div>

          {/* Date to */}
          <div className="space-y-1.5">
            <Label className="text-[11px] uppercase tracking-wider text-muted-foreground font-semibold">
              To
            </Label>
            <Input
              type="date"
              value={dateTo}
              onChange={(e) => { setDateTo(e.target.value); handleFilterChange() }}
            />
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="rounded-xl border border-border bg-background-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[700px] text-sm">
            <thead>
              <tr className="border-b border-border bg-white/[0.02]">
                <th className="text-left px-4 py-3 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground whitespace-nowrap">
                  Timestamp
                </th>
                <th className="text-left px-4 py-3 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                  Admin
                </th>
                <th className="text-left px-4 py-3 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                  Action
                </th>
                <th className="text-left px-4 py-3 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                  Target
                </th>
                <th className="text-left px-4 py-3 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground whitespace-nowrap">
                  IP Address
                </th>
                <th className="text-right px-4 py-3 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                  Meta
                </th>
              </tr>
            </thead>
            <tbody>
              {isLoading &&
                Array.from({ length: 8 }).map((_, i) => (
                  <tr key={i} className="border-b border-border/50">
                    <td className="px-4 py-3"><div className="skeleton h-3 w-32 rounded" /></td>
                    <td className="px-4 py-3"><div className="skeleton h-3 w-24 rounded" /></td>
                    <td className="px-4 py-3"><div className="skeleton h-5 w-28 rounded-full" /></td>
                    <td className="px-4 py-3"><div className="skeleton h-3 w-20 rounded" /></td>
                    <td className="px-4 py-3"><div className="skeleton h-3 w-24 rounded" /></td>
                    <td className="px-4 py-3 text-right"><div className="skeleton h-3 w-8 rounded ml-auto" /></td>
                  </tr>
                ))}

              {isError && (
                <tr>
                  <td colSpan={6} className="px-4 py-10 text-center text-sm text-danger">
                    Failed to load audit log. Please try again.
                  </td>
                </tr>
              )}

              {!isLoading && !isError && items.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-4 py-16 text-center">
                    <p className="text-sm text-muted-foreground">No audit entries match these filters.</p>
                  </td>
                </tr>
              )}

              {!isLoading && !isError && items.map((entry) => (
                <AuditRow key={entry.id} entry={entry} />
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination footer */}
        {!isLoading && !isError && items.length > 0 && (
          <div className="flex items-center justify-between px-4 py-3 border-t border-border bg-white/[0.01]">
            <p className="text-xs text-muted-foreground">
              {total.toLocaleString()} total entries
              {total > 0 && (
                <> · showing {(page - 1) * PAGE_LIMIT + 1}–{Math.min(page * PAGE_LIMIT, total)}</>
              )}
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
      </div>
    </div>
  )
}
