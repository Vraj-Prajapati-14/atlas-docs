'use client'

import { useRequireRole } from '@/hooks/use-require-role'
import { useState } from 'react'
import {
  Bell, Send, Inbox, ChevronLeft, ChevronRight,
  MessageSquare, Mail, Smartphone, CheckCheck,
  Megaphone, Users, User, AlertCircle, Info,
} from 'lucide-react'
import { toast } from 'sonner'
import { useAuthStore } from '@/lib/auth-store'
import { useNotifications, useTriggerNightlySummary, useUnreadBroadcasts, useDismissBroadcast } from '@/hooks/use-notifications'
import {
  useStaffNotifications, useSentNotifications,
  useMarkRead, useMarkAllRead, useSendNotification,
} from '@/hooks/use-staff-notifications'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Spinner } from '@/components/ui/spinner'
import { cn } from '@/lib/utils'
import type {
  NotificationChannel, StaffNotification,
  StaffNotifPriority, StaffNotifTargetType,
} from '@/lib/api-types'

// ─── Helpers ──────────────────────────────────────────────────────────────────

function formatDate(iso: string) {
  return new Date(iso).toLocaleString('en-IN', {
    day: '2-digit', month: 'short', year: 'numeric',
    hour: '2-digit', minute: '2-digit', hour12: true,
  })
}

function timeAgo(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime()
  const mins = Math.floor(diff / 60_000)
  if (mins < 1) return 'just now'
  if (mins < 60) return `${mins}m ago`
  const hrs = Math.floor(mins / 60)
  if (hrs < 24) return `${hrs}h ago`
  return `${Math.floor(hrs / 24)}d ago`
}

const PRIORITY_CONFIG: Record<StaffNotifPriority, { label: string; color: string }> = {
  LOW:    { label: 'Low',    color: 'text-muted-foreground' },
  NORMAL: { label: 'Normal', color: 'text-foreground'       },
  HIGH:   { label: 'High',   color: 'text-warning'          },
  URGENT: { label: 'Urgent', color: 'text-danger'           },
}

const CHANNEL_CONFIG: Record<NotificationChannel, { label: string; Icon: React.ElementType; color: string }> = {
  WHATSAPP: { label: 'WhatsApp', Icon: MessageSquare, color: 'text-success' },
  SMS:      { label: 'SMS',      Icon: Smartphone,    color: 'text-info'    },
  EMAIL:    { label: 'Email',    Icon: Mail,           color: 'text-primary-500' },
  PUSH:     { label: 'Push',     Icon: Bell,           color: 'text-warning' },
}

type Tab = 'inbox' | 'sent' | 'compose' | 'history'

const ROLES = ['MANAGER', 'CASHIER', 'WAITER', 'CHEF', 'INVENTORY_MANAGER'] as const
const PAGE_LIMIT = 20

// ─── Staff notification row ───────────────────────────────────────────────────

function StaffNotifRow({ notif, onRead }: { notif: StaffNotification; onRead: (id: string) => void }) {
  const pCfg = PRIORITY_CONFIG[notif.priority]
  return (
    <div
      className={cn(
        'flex items-start gap-4 px-6 py-4 hover:bg-white/[0.02] transition-colors cursor-pointer',
        !notif.isRead && 'bg-primary-500/[0.03] border-l-2 border-l-primary-500',
      )}
      onClick={() => { if (!notif.isRead) onRead(notif.id) }}
    >
      <div className={cn(
        'flex items-center justify-center w-9 h-9 rounded-lg shrink-0 bg-background-card border border-border',
        pCfg.color,
      )}>
        {notif.senderType === 'SUPER_ADMIN' ? <Megaphone size={16} /> :
         notif.targetType === 'ALL_STAFF'   ? <Users     size={16} /> :
                                              <User      size={16} />}
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              {!notif.isRead && <span className="w-1.5 h-1.5 rounded-full bg-primary-500 shrink-0" />}
              <p className="text-sm font-semibold text-foreground truncate">{notif.title}</p>
            </div>
            <p className="text-xs text-muted-foreground mt-0.5 line-clamp-2">{notif.body}</p>
          </div>
          <div className="flex flex-col items-end gap-1 shrink-0">
            {notif.priority !== 'NORMAL' && (
              <Badge variant={notif.priority === 'URGENT' ? 'danger' : notif.priority === 'HIGH' ? 'warning' : 'muted'}>
                {pCfg.label}
              </Badge>
            )}
          </div>
        </div>
        <div className="flex items-center gap-3 mt-1.5">
          <p className="text-[11px] text-muted-foreground/50">{timeAgo(notif.createdAt)}</p>
          <p className="text-[11px] text-muted-foreground/50">from {notif.senderName}</p>
        </div>
      </div>
    </div>
  )
}

// ─── Inbox tab ────────────────────────────────────────────────────────────────

function InboxTab() {
  const [page, setPage] = useState(1)

  // broadcasts: admin → tenant (unread/undismissed only)
  const { data: broadcasts = [], isLoading: bLoading } = useUnreadBroadcasts()
  const dismiss = useDismissBroadcast()

  // staff notifications: owner/manager → staff
  const { data: staffData, isLoading: sLoading } = useStaffNotifications(page, PAGE_LIMIT)
  const markRead = useMarkRead()
  const markAll  = useMarkAllRead()

  const isLoading = bLoading || sLoading
  const staffUnread = staffData?.items.filter((n) => !n.isRead).length ?? 0
  const totalUnread = broadcasts.length + staffUnread

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center justify-between px-6 py-3 border-b border-border shrink-0">
        <div className="flex items-center gap-2">
          {totalUnread > 0 && (
            <Badge variant="info">{totalUnread} unread</Badge>
          )}
        </div>
        {staffUnread > 0 && (
          <Button
            variant="ghost"
            size="sm"
            className="gap-1.5 text-xs"
            disabled={markAll.isPending}
            onClick={() => markAll.mutate(undefined, {
              onSuccess: () => toast.success('All marked as read'),
            })}
          >
            <CheckCheck size={13} />
            Mark all read
          </Button>
        )}
      </div>

      <div className="flex-1 overflow-y-auto">
        {isLoading ? (
          <div className="flex items-center justify-center h-full">
            <Spinner size="xl" className="text-primary-500" />
          </div>
        ) : broadcasts.length === 0 && (!staffData || staffData.items.length === 0) ? (
          <div className="flex flex-col items-center justify-center h-full gap-3 text-muted-foreground">
            <Inbox size={40} className="opacity-15" />
            <p className="text-sm font-medium">Your inbox is empty</p>
            <p className="text-xs opacity-60">Messages from your team and admin will appear here.</p>
          </div>
        ) : (
          <div className="divide-y divide-border">
            {/* Admin broadcasts */}
            {broadcasts.map((b) => (
              <div key={`bc-${b.id}`} className="flex items-start gap-4 px-6 py-4 hover:bg-white/[0.02] bg-primary-500/[0.03] border-l-2 border-l-primary-500 group">
                <div className="flex items-center justify-center w-9 h-9 rounded-lg shrink-0 bg-primary-500/10 border border-primary-500/20">
                  <Megaphone size={16} className="text-primary-500" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="w-1.5 h-1.5 rounded-full bg-primary-500 shrink-0" />
                        <p className="text-sm font-semibold text-foreground truncate">{b.title}</p>
                      </div>
                      <p className="text-xs text-muted-foreground mt-0.5 line-clamp-2">{b.body}</p>
                    </div>
                    <Badge variant="muted">Admin</Badge>
                  </div>
                  <div className="flex items-center justify-between mt-1.5">
                    <p className="text-[11px] text-muted-foreground/50">{timeAgo(b.createdAt)}</p>
                    <button
                      type="button"
                      onClick={() => dismiss.mutate(b.id)}
                      disabled={dismiss.isPending}
                      className="opacity-0 group-hover:opacity-100 text-[11px] text-muted-foreground hover:text-danger transition-all"
                    >
                      Dismiss
                    </button>
                  </div>
                </div>
              </div>
            ))}

            {/* Staff notifications */}
            {staffData?.items.map((n) => (
              <StaffNotifRow
                key={`sn-${n.id}`}
                notif={n}
                onRead={(id) => markRead.mutate(id)}
              />
            ))}
          </div>
        )}
      </div>

      {staffData && staffData.pagination.totalPages > 1 && (
        <div className="shrink-0 flex items-center justify-between px-6 py-3 border-t border-border">
          <p className="text-xs text-muted-foreground">
            Page {staffData.pagination.page} of {staffData.pagination.totalPages}
          </p>
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="icon-sm" disabled={page <= 1} onClick={() => setPage((p) => p - 1)}>
              <ChevronLeft size={14} />
            </Button>
            <Button variant="ghost" size="icon-sm" disabled={page >= staffData.pagination.totalPages} onClick={() => setPage((p) => p + 1)}>
              <ChevronRight size={14} />
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}

// ─── Sent tab ─────────────────────────────────────────────────────────────────

function SentTab() {
  const [page, setPage] = useState(1)
  const { data, isLoading } = useSentNotifications(page, PAGE_LIMIT)

  return (
    <div className="flex flex-col h-full">
      <div className="flex-1 overflow-y-auto">
        {isLoading ? (
          <div className="flex items-center justify-center h-full">
            <Spinner size="xl" className="text-primary-500" />
          </div>
        ) : !data || data.items.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full gap-3 text-muted-foreground">
            <Send size={40} className="opacity-15" />
            <p className="text-sm font-medium">Nothing sent yet</p>
            <p className="text-xs opacity-60">Messages you send will appear here.</p>
          </div>
        ) : (
          <div className="divide-y divide-border">
            {data.items.map((n) => {
              const pCfg = PRIORITY_CONFIG[n.priority]
              return (
                <div key={n.id} className="flex items-start gap-4 px-6 py-4 hover:bg-white/[0.02]">
                  <div className={cn(
                    'flex items-center justify-center w-9 h-9 rounded-lg shrink-0 bg-background-card border border-border',
                    pCfg.color,
                  )}>
                    {n.targetType === 'ALL_STAFF' ? <Users size={16} /> : <User size={16} />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <p className="text-sm font-semibold text-foreground">{n.title}</p>
                        <p className="text-xs text-muted-foreground mt-0.5 line-clamp-2">{n.body}</p>
                      </div>
                      <div className="flex flex-col items-end gap-1 shrink-0">
                        <Badge variant="muted">{n.targetType === 'ALL_STAFF' ? 'All staff' : n.targetType === 'ROLE' ? 'By role' : 'Specific'}</Badge>
                        {n.priority !== 'NORMAL' && (
                          <Badge variant={n.priority === 'URGENT' ? 'danger' : 'warning'}>{pCfg.label}</Badge>
                        )}
                      </div>
                    </div>
                    <p className="text-[11px] text-muted-foreground/50 mt-1.5">{formatDate(n.createdAt)}</p>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>

      {data && data.pagination.totalPages > 1 && (
        <div className="shrink-0 flex items-center justify-between px-6 py-3 border-t border-border">
          <p className="text-xs text-muted-foreground">
            Page {data.pagination.page} of {data.pagination.totalPages}
          </p>
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="icon-sm" disabled={page <= 1} onClick={() => setPage((p) => p - 1)}>
              <ChevronLeft size={14} />
            </Button>
            <Button variant="ghost" size="icon-sm" disabled={page >= data.pagination.totalPages} onClick={() => setPage((p) => p + 1)}>
              <ChevronRight size={14} />
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}

// ─── Compose tab ──────────────────────────────────────────────────────────────

function ComposeTab({ onSent }: { onSent: () => void }) {
  const send = useSendNotification()

  const [title,      setTitle]      = useState('')
  const [body,       setBody]       = useState('')
  const [priority,   setPriority]   = useState<StaffNotifPriority>('NORMAL')
  const [targetType, setTargetType] = useState<StaffNotifTargetType>('ALL_STAFF')
  const [roles,      setRoles]      = useState<string[]>([])

  function toggleRole(r: string) {
    setRoles((prev) => prev.includes(r) ? prev.filter((x) => x !== r) : [...prev, r])
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!title.trim() || !body.trim()) return

    send.mutate(
      {
        title:      title.trim(),
        body:       body.trim(),
        priority,
        targetType,
        targetRoles:   targetType === 'ROLE' ? roles : undefined,
      },
      {
        onSuccess: () => {
          toast.success('Notification sent!')
          setTitle('')
          setBody('')
          setPriority('NORMAL')
          setTargetType('ALL_STAFF')
          setRoles([])
          onSent()
        },
        onError: (err: Error) => toast.error(err.message ?? 'Failed to send'),
      },
    )
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col h-full">
      <div className="flex-1 overflow-y-auto px-6 py-6 space-y-6">
        {/* Target audience */}
        <div className="space-y-3">
          <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
            Send To
          </label>
          <div className="flex flex-wrap gap-2">
            {(['ALL_STAFF', 'ROLE'] as StaffNotifTargetType[]).map((t) => (
              <button
                key={t}
                type="button"
                onClick={() => setTargetType(t)}
                className={cn(
                  'flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-medium border transition-colors',
                  targetType === t
                    ? 'bg-primary-500/10 text-primary-500 border-primary-500/30'
                    : 'text-muted-foreground border-border hover:border-primary-500/30 hover:text-foreground',
                )}
              >
                {t === 'ALL_STAFF' ? <Users size={13} /> : <User size={13} />}
                {t === 'ALL_STAFF' ? 'All Staff' : 'By Role'}
              </button>
            ))}
          </div>

          {targetType === 'ROLE' && (
            <div className="flex flex-wrap gap-2 pt-1">
              {ROLES.map((r) => (
                <button
                  key={r}
                  type="button"
                  onClick={() => toggleRole(r)}
                  className={cn(
                    'px-3 py-1.5 rounded-md text-xs font-medium border transition-colors',
                    roles.includes(r)
                      ? 'bg-primary-500/10 text-primary-500 border-primary-500/30'
                      : 'text-muted-foreground border-border hover:border-primary-500/30',
                  )}
                >
                  {r.replace('_', ' ')}
                </button>
              ))}
              {targetType === 'ROLE' && roles.length === 0 && (
                <p className="text-xs text-warning flex items-center gap-1 mt-1 w-full">
                  <AlertCircle size={12} /> Select at least one role
                </p>
              )}
            </div>
          )}
        </div>

        {/* Priority */}
        <div className="space-y-3">
          <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
            Priority
          </label>
          <div className="flex gap-2">
            {(['LOW', 'NORMAL', 'HIGH', 'URGENT'] as StaffNotifPriority[]).map((p) => {
              const cfg = PRIORITY_CONFIG[p]
              return (
                <button
                  key={p}
                  type="button"
                  onClick={() => setPriority(p)}
                  className={cn(
                    'px-3 py-1.5 rounded-md text-xs font-medium border transition-colors',
                    priority === p
                      ? `bg-primary-500/10 border-primary-500/30 ${cfg.color}`
                      : 'text-muted-foreground border-border hover:border-primary-500/30',
                  )}
                >
                  {cfg.label}
                </button>
              )
            })}
          </div>
        </div>

        {/* Title */}
        <div className="space-y-2">
          <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
            Subject
          </label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            maxLength={120}
            placeholder="e.g. Shift change reminder"
            className={cn(
              'w-full px-3 py-2 rounded-lg border border-border bg-background-card',
              'text-sm text-foreground placeholder:text-muted-foreground',
              'focus:outline-none focus:ring-1 focus:ring-primary-500 focus:border-primary-500',
            )}
            required
          />
        </div>

        {/* Body */}
        <div className="space-y-2">
          <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
            Message
          </label>
          <textarea
            value={body}
            onChange={(e) => setBody(e.target.value)}
            maxLength={2000}
            rows={5}
            placeholder="Write your message here…"
            className={cn(
              'w-full px-3 py-2 rounded-lg border border-border bg-background-card',
              'text-sm text-foreground placeholder:text-muted-foreground',
              'focus:outline-none focus:ring-1 focus:ring-primary-500 focus:border-primary-500',
              'resize-none',
            )}
            required
          />
          <p className="text-[11px] text-muted-foreground/50 text-right">{body.length}/2000</p>
        </div>

        {/* Info */}
        <div className="flex items-start gap-2 p-3 rounded-lg bg-info/5 border border-info/20 text-xs text-muted-foreground">
          <Info size={13} className="text-info shrink-0 mt-0.5" />
          Staff will see this in their notifications inbox the next time they open the app.
        </div>
      </div>

      <div className="shrink-0 px-6 py-4 border-t border-border">
        <Button
          type="submit"
          disabled={send.isPending || !title.trim() || !body.trim() || (targetType === 'ROLE' && roles.length === 0)}
          className="w-full gap-2"
        >
          {send.isPending ? <Spinner size="xs" /> : <Send size={14} />}
          Send Notification
        </Button>
      </div>
    </form>
  )
}

// ─── History tab (system notification log) ────────────────────────────────────

function HistoryTab() {
  const user     = useAuthStore((s) => s.user)
  const canTrigger = user?.role === 'OWNER' || user?.role === 'MANAGER'

  const [channel, setChannel] = useState<NotificationChannel | 'ALL'>('ALL')
  const [page,    setPage]    = useState(1)

  const { data, isLoading } = useNotifications({
    channel: channel === 'ALL' ? undefined : channel,
    page,
    limit: PAGE_LIMIT,
  })

  const trigger = useTriggerNightlySummary()

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center justify-between px-6 py-3 border-b border-border shrink-0 gap-4">
        {/* Channel filter */}
        <div className="flex items-center gap-2 overflow-x-auto">
          {(['ALL', 'WHATSAPP', 'SMS', 'EMAIL', 'PUSH'] as const).map((ch) => {
            const cfg = ch !== 'ALL' ? CHANNEL_CONFIG[ch] : null
            return (
              <button
                key={ch}
                type="button"
                onClick={() => { setChannel(ch); setPage(1) }}
                className={cn(
                  'flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors shrink-0',
                  channel === ch
                    ? 'bg-primary-500/10 text-primary-500'
                    : 'text-muted-foreground hover:bg-white/5 hover:text-foreground',
                )}
              >
                {cfg && <cfg.Icon size={12} />}
                {ch === 'ALL' ? 'All' : cfg?.label}
              </button>
            )
          })}
        </div>
        {canTrigger && (
          <Button
            size="sm"
            variant="outline"
            onClick={() => trigger.mutate(undefined, {
              onSuccess: () => toast.success('Nightly summary triggered'),
              onError: (err: Error) => toast.error(err.message),
            })}
            disabled={trigger.isPending}
            className="gap-1.5 text-xs shrink-0"
          >
            {trigger.isPending ? <Spinner size="xs" /> : <Send size={12} />}
            Nightly Summary
          </Button>
        )}
      </div>

      <div className="flex-1 overflow-y-auto">
        {isLoading ? (
          <div className="flex items-center justify-center h-full">
            <Spinner size="xl" className="text-primary-500" />
          </div>
        ) : !data || data.notifications.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full gap-3 text-muted-foreground">
            <Bell size={40} className="opacity-15" />
            <p className="text-sm font-medium">No system notifications</p>
            <p className="text-xs opacity-60">Sent receipts and summaries will appear here.</p>
          </div>
        ) : (
          <div className="divide-y divide-border">
            {data.notifications.map((notif) => {
              const cfg = CHANNEL_CONFIG[notif.channel as NotificationChannel] ?? CHANNEL_CONFIG.PUSH
              const isSent   = !!notif.sentAt
              const isFailed = !!notif.failedAt && !isSent
              return (
                <div key={notif.id} className="flex items-start gap-4 px-6 py-4 hover:bg-white/[0.02]">
                  <div className={cn(
                    'flex items-center justify-center w-9 h-9 rounded-lg shrink-0 bg-background-card border border-border',
                    cfg.color,
                  )}>
                    <cfg.Icon size={16} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0">
                        <p className="text-sm font-semibold text-foreground truncate">{notif.title}</p>
                        <p className="text-xs text-muted-foreground mt-0.5 line-clamp-2">{notif.body}</p>
                        {isFailed && notif.error && (
                          <p className="text-[11px] text-danger mt-1">Error: {notif.error}</p>
                        )}
                      </div>
                      <div className="flex flex-col items-end gap-1 shrink-0">
                        {isSent   && <Badge variant="success">Sent</Badge>}
                        {isFailed && <Badge variant="danger">Failed</Badge>}
                        {!isSent && !isFailed && <Badge variant="muted">Pending</Badge>}
                        <Badge variant="muted">{cfg.label}</Badge>
                      </div>
                    </div>
                    <p className="text-[11px] text-muted-foreground/50 mt-1.5">
                      {isSent ? formatDate(notif.sentAt!) : isFailed ? `Failed ${formatDate(notif.failedAt!)}` : formatDate(notif.createdAt)}
                    </p>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>

      {data && data.totalPages > 1 && (
        <div className="shrink-0 flex items-center justify-between px-6 py-3 border-t border-border">
          <p className="text-xs text-muted-foreground">Page {data.page} of {data.totalPages} · {data.total} total</p>
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="icon-sm" disabled={page <= 1} onClick={() => setPage((p) => p - 1)}>
              <ChevronLeft size={14} />
            </Button>
            <Button variant="ghost" size="icon-sm" disabled={page >= data.totalPages} onClick={() => setPage((p) => p + 1)}>
              <ChevronRight size={14} />
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}

// ─── Page ─────────────────────────────────────────────────────────────────────

const TABS: { id: Tab; label: string; Icon: React.ElementType }[] = [
  { id: 'inbox',   label: 'Inbox',   Icon: Inbox       },
  { id: 'sent',    label: 'Sent',    Icon: Send        },
  { id: 'compose', label: 'Compose', Icon: MessageSquare },
  { id: 'history', label: 'History', Icon: Bell        },
]

export default function NotificationsPage() {
  const allowed = useRequireRole(['OWNER', 'MANAGER'])
  const user = useAuthStore((s) => s.user)
  const canSend = user?.role === 'OWNER' || user?.role === 'MANAGER'
  if (!allowed) return null
  const [tab, setTab] = useState<Tab>('inbox')

  const visibleTabs = TABS.filter((t) => canSend || (t.id !== 'sent' && t.id !== 'compose'))

  return (
    <div className="flex flex-col h-full -m-6 bg-background-card">
      {/* Tab bar */}
      <div className="flex items-center gap-1 px-6 py-3 border-b border-border bg-background shrink-0">
        {visibleTabs.map(({ id, label, Icon }) => (
          <button
            key={id}
            type="button"
            onClick={() => setTab(id)}
            className={cn(
              'flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-medium transition-colors',
              tab === id
                ? 'bg-primary-500/10 text-primary-500'
                : 'text-muted-foreground hover:bg-white/5 hover:text-foreground',
            )}
          >
            <Icon size={13} />
            {label}
          </button>
        ))}
      </div>

      {/* Content */}
      <div className="flex-1 overflow-hidden">
        {tab === 'inbox'   && <InboxTab />}
        {tab === 'sent'    && canSend && <SentTab />}
        {tab === 'compose' && canSend && <ComposeTab onSent={() => setTab('sent')} />}
        {tab === 'history' && <HistoryTab />}
      </div>
    </div>
  )
}
