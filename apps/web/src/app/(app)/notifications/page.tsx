'use client'

import { useState } from 'react'
import { Bell, ChevronLeft, ChevronRight, Send, MessageSquare, Mail, Smartphone } from 'lucide-react'
import { useNotifications, useTriggerNightlySummary } from '@/hooks/use-notifications'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Spinner } from '@/components/ui/spinner'
import { cn } from '@/lib/utils'
import { useAuthStore } from '@/lib/auth-store'
import { toast } from 'sonner'
import type { NotificationChannel } from '@/lib/api-types'

// ─── Helpers ──────────────────────────────────────────────────────────────────

function formatDate(iso: string) {
  return new Date(iso).toLocaleString('en-IN', {
    day: '2-digit', month: 'short', year: 'numeric',
    hour: '2-digit', minute: '2-digit', hour12: true,
  })
}

// ─── Channel config ───────────────────────────────────────────────────────────

const CHANNEL_CONFIG: Record<NotificationChannel, { label: string; Icon: React.ElementType; color: string }> = {
  WHATSAPP: { label: 'WhatsApp', Icon: MessageSquare, color: 'text-success' },
  SMS:      { label: 'SMS',      Icon: Smartphone,   color: 'text-info' },
  EMAIL:    { label: 'Email',    Icon: Mail,          color: 'text-primary-500' },
  PUSH:     { label: 'Push',     Icon: Bell,          color: 'text-warning' },
}

const CHANNELS: (NotificationChannel | 'ALL')[] = ['ALL', 'WHATSAPP', 'SMS', 'EMAIL', 'PUSH']

// ─── Page ─────────────────────────────────────────────────────────────────────

const PAGE_LIMIT = 20

export default function NotificationsPage() {
  const user = useAuthStore((s) => s.user)
  const canTrigger = user?.role === 'OWNER' || user?.role === 'MANAGER'

  const [channel, setChannel] = useState<NotificationChannel | 'ALL'>('ALL')
  const [page, setPage] = useState(1)

  const { data, isLoading, refetch } = useNotifications({
    channel: channel === 'ALL' ? undefined : channel,
    page,
    limit: PAGE_LIMIT,
  })

  const trigger = useTriggerNightlySummary()

  function handleTrigger() {
    trigger.mutate(undefined, {
      onSuccess: () => toast.success('Nightly summary triggered successfully.'),
      onError: (err: Error) => toast.error(err.message ?? 'Failed to trigger summary.'),
    })
  }

  return (
    <div className="flex flex-col h-full -m-6 bg-background-card">
      {/* Header */}
      <div className="flex items-center justify-between px-6 py-3 border-b border-border bg-background shrink-0">
        <div className="flex items-center gap-3">
          <Bell size={18} className="text-primary-500" />
          <span className="text-sm font-bold">Notification Center</span>
          {data && <Badge variant="muted">{data.total} total</Badge>}
        </div>
        {canTrigger && (
          <Button
            size="sm"
            variant="outline"
            onClick={handleTrigger}
            disabled={trigger.isPending}
            className="gap-2 text-xs"
          >
            {trigger.isPending ? <Spinner size="xs" /> : <Send size={12} />}
            Trigger Nightly Summary
          </Button>
        )}
      </div>

      {/* Channel filter */}
      <div className="flex items-center gap-2 px-6 py-3 border-b border-border bg-background shrink-0 overflow-x-auto">
        {CHANNELS.map((ch) => {
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
              {ch === 'ALL' ? 'All Channels' : cfg?.label}
            </button>
          )
        })}
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto">
        {isLoading ? (
          <div className="flex items-center justify-center h-full">
            <Spinner size="xl" className="text-primary-500" />
          </div>
        ) : !data || data.notifications.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full gap-4 text-muted-foreground">
            <Bell size={48} className="opacity-15" />
            <div className="text-center">
              <p className="font-semibold text-sm">No notifications yet</p>
              <p className="text-xs mt-1 opacity-60">Sent receipts and summaries will appear here.</p>
            </div>
          </div>
        ) : (
          <div className="divide-y divide-border">
            {data.notifications.map((notif) => {
              const cfg = CHANNEL_CONFIG[notif.channel]
              const isSent   = !!notif.sentAt
              const isFailed = !!notif.failedAt && !isSent

              return (
                <div key={notif.id} className="flex items-start gap-4 px-6 py-4 hover:bg-white/[0.02] transition-colors">
                  {/* Channel icon */}
                  <div className={cn(
                    'flex items-center justify-center w-9 h-9 rounded-lg shrink-0 bg-background-card border border-border',
                    cfg.color,
                  )}>
                    <cfg.Icon size={16} />
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <p className="text-sm font-semibold text-foreground truncate">{notif.title}</p>
                        <p className="text-xs text-muted-foreground mt-0.5 line-clamp-2">{notif.body}</p>
                        {isFailed && notif.error && (
                          <p className="text-[11px] text-danger mt-1 truncate">Error: {notif.error}</p>
                        )}
                      </div>
                      <div className="flex flex-col items-end gap-1.5 shrink-0">
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

      {/* Pagination */}
      {data && data.totalPages > 1 && (
        <div className="shrink-0 flex items-center justify-between px-6 py-3 border-t border-border bg-background">
          <p className="text-xs text-muted-foreground">
            Page {data.page} of {data.totalPages} · {data.total} notifications
          </p>
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
