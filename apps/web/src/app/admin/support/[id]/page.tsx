'use client'

import { useState, useRef, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import {
  ArrowLeft,
  Phone,
  Store,
  Send,
  CheckCircle2,
  Clock,
  XCircle,
  AlertTriangle,
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
type CommentAuthor  = 'TENANT' | 'ADMIN'

interface Comment {
  id: string
  body: string
  authorType: CommentAuthor
  authorName: string
  createdAt: string
}

interface TicketDetail {
  id: string
  shortId: string
  tenantId: string
  tenantName: string
  tenantPhone?: string
  category: TicketCategory
  priority: TicketPriority
  status: TicketStatus
  title: string
  body: string
  assignedTo?: string
  createdAt: string
  updatedAt: string
  comments: Comment[]
}

// ─── Badge helpers ──────────────────────────────────────────────────────────────

const PRIORITY_BADGE: Record<TicketPriority, {
  variant: 'danger' | 'warning' | 'muted' | 'info'
  label: string
}> = {
  CRITICAL: { variant: 'danger',  label: 'Critical' },
  HIGH:     { variant: 'warning', label: 'High'     },
  MEDIUM:   { variant: 'muted',   label: 'Medium'   },
  LOW:      { variant: 'info',    label: 'Low'      },
}

const STATUS_BADGE: Record<TicketStatus, {
  variant: 'danger' | 'warning' | 'success' | 'muted'
  label: string
  Icon: React.ElementType
}> = {
  OPEN:        { variant: 'danger',  label: 'Open',        Icon: AlertTriangle },
  IN_PROGRESS: { variant: 'warning', label: 'In Progress', Icon: Clock         },
  RESOLVED:    { variant: 'success', label: 'Resolved',    Icon: CheckCircle2  },
  CLOSED:      { variant: 'muted',   label: 'Closed',      Icon: XCircle       },
}

const CATEGORY_LABEL: Record<TicketCategory, string> = {
  BILLING:   'Billing',
  TECHNICAL: 'Technical',
  ACCOUNT:   'Account',
  FEATURE:   'Feature Request',
  OTHER:     'Other',
}

// ─── Formatters ─────────────────────────────────────────────────────────────────

function fmtDatetime(iso: string) {
  return new Date(iso).toLocaleString('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    hour12: true,
  })
}

function fmtTime(iso: string) {
  return new Date(iso).toLocaleString('en-IN', {
    day: '2-digit',
    month: 'short',
    hour: '2-digit',
    minute: '2-digit',
    hour12: true,
  })
}

// ─── Comment bubble ─────────────────────────────────────────────────────────────

function CommentBubble({ comment }: { comment: Comment }) {
  const isAdmin = comment.authorType === 'ADMIN'

  return (
    <div className={cn('flex gap-3 max-w-[85%]', isAdmin ? 'ml-auto flex-row-reverse' : 'mr-auto')}>
      {/* Avatar */}
      <div
        className={cn(
          'w-8 h-8 rounded-full flex items-center justify-center text-[11px] font-bold shrink-0 mt-0.5',
          isAdmin
            ? 'bg-primary-500/20 border border-primary-500/30 text-primary-400'
            : 'bg-white/10 border border-white/10 text-muted-foreground',
        )}
        aria-hidden="true"
      >
        {comment.authorName.charAt(0).toUpperCase()}
      </div>

      <div className={cn('flex flex-col gap-1', isAdmin ? 'items-end' : 'items-start')}>
        {/* Author + time */}
        <div className={cn('flex items-center gap-2 text-[11px]', isAdmin ? 'flex-row-reverse' : '')}>
          <span className={cn('font-semibold', isAdmin ? 'text-primary-400' : 'text-muted-foreground')}>
            {comment.authorName}
          </span>
          <span className="text-muted-foreground/60 tabular-nums">{fmtTime(comment.createdAt)}</span>
          {isAdmin && (
            <Badge variant="muted" className="text-[9px] px-1.5 py-0">Admin</Badge>
          )}
        </div>

        {/* Bubble */}
        <div
          className={cn(
            'rounded-2xl px-4 py-2.5 text-sm leading-relaxed',
            isAdmin
              ? 'rounded-tr-sm bg-primary-500/10 border border-primary-500/20 text-foreground'
              : 'rounded-tl-sm bg-white/5 border border-white/8 text-foreground',
          )}
        >
          {comment.body}
        </div>
      </div>
    </div>
  )
}

// ─── Status update panel ────────────────────────────────────────────────────────

interface StatusPanelProps {
  ticket: TicketDetail
  onUpdated: () => void
}

function StatusPanel({ ticket, onUpdated }: StatusPanelProps) {
  const [status,     setStatus]     = useState<TicketStatus>(ticket.status)
  const [priority,   setPriority]   = useState<TicketPriority>(ticket.priority)
  const [assignedTo, setAssignedTo] = useState(ticket.assignedTo ?? '')
  const queryClient = useQueryClient()

  const mutation = useMutation({
    mutationFn: () =>
      adminFetch(`/api/v1/admin/tickets/${ticket.id}`, {
        method: 'PATCH',
        body: JSON.stringify({
          status:     status !== ticket.status     ? status     : undefined,
          priority:   priority !== ticket.priority ? priority   : undefined,
          assignedTo: assignedTo || undefined,
        }),
      }),
    onSuccess: () => {
      toast.success('Ticket updated')
      queryClient.invalidateQueries({ queryKey: ['admin-ticket', ticket.id] })
      queryClient.invalidateQueries({ queryKey: ['admin-tickets'] })
      queryClient.invalidateQueries({ queryKey: ['admin-ticket-stats'] })
      onUpdated()
    },
    onError: (e: Error) => toast.error(e.message),
  })

  const isDirty =
    status !== ticket.status ||
    priority !== ticket.priority ||
    assignedTo !== (ticket.assignedTo ?? '')

  return (
    <div className="rounded-xl border border-border bg-white/[0.025] p-4 space-y-4">
      <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
        Update Ticket
      </h3>

      <div className="space-y-1.5">
        <Label htmlFor="sp-status">Status</Label>
        <select
          id="sp-status"
          value={status}
          onChange={(e) => setStatus(e.target.value as TicketStatus)}
          className={cn(
            'flex h-9 w-full rounded-md px-3 text-sm',
            'bg-background-card border border-border text-foreground',
            'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500/20 focus-visible:border-primary-500',
            'transition-colors duration-150',
          )}
        >
          <option value="OPEN">Open</option>
          <option value="IN_PROGRESS">In Progress</option>
          <option value="RESOLVED">Resolved</option>
          <option value="CLOSED">Closed</option>
        </select>
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="sp-priority">Priority</Label>
        <select
          id="sp-priority"
          value={priority}
          onChange={(e) => setPriority(e.target.value as TicketPriority)}
          className={cn(
            'flex h-9 w-full rounded-md px-3 text-sm',
            'bg-background-card border border-border text-foreground',
            'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500/20 focus-visible:border-primary-500',
            'transition-colors duration-150',
          )}
        >
          <option value="CRITICAL">Critical</option>
          <option value="HIGH">High</option>
          <option value="MEDIUM">Medium</option>
          <option value="LOW">Low</option>
        </select>
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="sp-assigned">Assigned To</Label>
        <Input
          id="sp-assigned"
          placeholder="Admin name or ID"
          value={assignedTo}
          onChange={(e) => setAssignedTo(e.target.value)}
          className="h-9 text-sm"
        />
      </div>

      <Button
        className="w-full"
        size="sm"
        disabled={mutation.isPending || !isDirty}
        onClick={() => mutation.mutate()}
      >
        {mutation.isPending ? <Spinner size="sm" /> : 'Save Changes'}
      </Button>
    </div>
  )
}

// ─── Main page ──────────────────────────────────────────────────────────────────

export default function SupportTicketDetailPage() {
  const params = useParams()
  const router = useRouter()
  const queryClient = useQueryClient()
  const ticketId = params.id as string

  const [commentBody, setCommentBody] = useState('')
  const commentsEndRef = useRef<HTMLDivElement>(null)

  const { data: ticket, isLoading, isError } = useQuery<TicketDetail>({
    queryKey: ['admin-ticket', ticketId],
    queryFn:  () => adminFetch(`/api/v1/admin/tickets/${ticketId}`),
    enabled:  !!ticketId,
  })

  // Scroll to bottom of comments when new ones arrive
  useEffect(() => {
    if (ticket?.comments.length) {
      commentsEndRef.current?.scrollIntoView({ behavior: 'smooth' })
    }
  }, [ticket?.comments.length])

  const addComment = useMutation({
    mutationFn: () =>
      adminFetch(`/api/v1/admin/tickets/${ticketId}/comments`, {
        method: 'POST',
        body: JSON.stringify({ body: commentBody.trim() }),
      }),
    onSuccess: () => {
      setCommentBody('')
      queryClient.invalidateQueries({ queryKey: ['admin-ticket', ticketId] })
      queryClient.invalidateQueries({ queryKey: ['admin-tickets'] })
    },
    onError: (e: Error) => toast.error(e.message),
  })

  const handleCommentSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (commentBody.trim()) addComment.mutate()
  }

  // ── Loading / error states ──────────────────────────────────────────────────

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Spinner size="lg" className="text-primary-500" />
      </div>
    )
  }

  if (isError || !ticket) {
    return (
      <div className="flex flex-col items-center justify-center h-64 gap-3 text-muted-foreground p-6">
        <AlertTriangle size={36} className="opacity-30" />
        <p className="text-sm">Ticket not found or failed to load</p>
        <Button variant="ghost" size="sm" onClick={() => router.back()}>
          <ArrowLeft size={14} />
          Go back
        </Button>
      </div>
    )
  }

  const pri = PRIORITY_BADGE[ticket.priority]
  const sta = STATUS_BADGE[ticket.status]

  return (
    <div className="flex flex-col h-full overflow-y-auto">
      <div className="flex-1 px-6 py-6 max-w-[1100px] w-full mx-auto space-y-6">

        {/* ── Back button ── */}
        <button
          type="button"
          onClick={() => router.push('/admin/support')}
          className={cn(
            'flex items-center gap-1.5 text-sm text-muted-foreground',
            'hover:text-foreground transition-colors duration-100',
            'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500/50 rounded-md px-1',
          )}
        >
          <ArrowLeft size={14} />
          Support Tickets
        </button>

        {/* ── Ticket header ── */}
        <div className="space-y-3">
          <div className="flex flex-wrap items-center gap-2">
            <Badge variant={pri.variant}>{pri.label}</Badge>
            <Badge variant={sta.variant}>
              <sta.Icon size={10} />
              {sta.label}
            </Badge>
            <Badge variant="muted">{CATEGORY_LABEL[ticket.category]}</Badge>
            <span className="text-xs text-muted-foreground font-mono tabular-nums ml-1">
              #{ticket.shortId}
            </span>
          </div>
          <h1
            className="text-xl font-bold text-foreground leading-snug"
            style={{ textWrap: 'balance' }}
          >
            {ticket.title}
          </h1>
          <p className="text-xs text-muted-foreground tabular-nums">
            Opened {fmtDatetime(ticket.createdAt)}
            {ticket.assignedTo && (
              <> &middot; Assigned to <span className="text-foreground font-medium">{ticket.assignedTo}</span></>
            )}
          </p>
        </div>

        {/* ── Main two-column layout ── */}
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_280px] gap-6 items-start">

          {/* Left column */}
          <div className="space-y-6 min-w-0">

            {/* Tenant info card */}
            <div className="rounded-xl border border-border bg-white/[0.025] p-4">
              <h2 className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground mb-3">
                Restaurant
              </h2>
              <div className="flex flex-wrap gap-x-6 gap-y-2">
                <div className="flex items-center gap-2 text-sm">
                  <Store size={14} className="text-muted-foreground shrink-0" />
                  <span className="font-semibold text-foreground">{ticket.tenantName}</span>
                </div>
                {ticket.tenantPhone && (
                  <div className="flex items-center gap-2 text-sm">
                    <Phone size={14} className="text-muted-foreground shrink-0" />
                    <a
                      href={`tel:${ticket.tenantPhone}`}
                      className="text-foreground hover:text-primary-400 transition-colors"
                    >
                      {ticket.tenantPhone}
                    </a>
                  </div>
                )}
              </div>
            </div>

            {/* Ticket body */}
            <div className="rounded-xl border border-border bg-white/[0.025] p-4 space-y-2">
              <h2 className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                Description
              </h2>
              <p className="text-sm text-foreground leading-relaxed whitespace-pre-wrap">
                {ticket.body}
              </p>
            </div>

            {/* Comments thread */}
            <div className="rounded-xl border border-border bg-white/[0.025] flex flex-col">
              <div className="px-4 pt-4 pb-3 border-b border-border shrink-0">
                <h2 className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                  Conversation
                  <span className="ml-2 font-medium normal-case tracking-normal text-muted-foreground/60">
                    {ticket.comments.length} message{ticket.comments.length !== 1 ? 's' : ''}
                  </span>
                </h2>
              </div>

              {/* Thread */}
              <div className="flex flex-col gap-4 px-4 py-4 min-h-[120px]">
                {ticket.comments.length === 0 ? (
                  <p className="text-xs text-muted-foreground text-center py-6">
                    No messages yet. Start the conversation below.
                  </p>
                ) : (
                  ticket.comments.map((c) => (
                    <CommentBubble key={c.id} comment={c} />
                  ))
                )}
                <div ref={commentsEndRef} aria-hidden="true" />
              </div>

              {/* Add comment form */}
              <form
                onSubmit={handleCommentSubmit}
                className="border-t border-border px-4 py-3 flex gap-3 items-end"
              >
                <textarea
                  rows={2}
                  placeholder="Write a reply..."
                  value={commentBody}
                  onChange={(e) => setCommentBody(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) {
                      e.preventDefault()
                      if (commentBody.trim()) addComment.mutate()
                    }
                  }}
                  className={cn(
                    'flex-1 rounded-md px-3 py-2 text-sm resize-none',
                    'bg-background-card border border-border text-foreground',
                    'placeholder:text-muted-foreground',
                    'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500/20 focus-visible:border-primary-500',
                    'transition-colors duration-150',
                  )}
                />
                <Button
                  type="submit"
                  size="icon"
                  disabled={addComment.isPending || !commentBody.trim()}
                  aria-label="Send reply"
                  className="shrink-0"
                >
                  {addComment.isPending ? <Spinner size="sm" /> : <Send size={15} />}
                </Button>
              </form>
            </div>
          </div>

          {/* Right column — status panel */}
          <div className="lg:sticky lg:top-0">
            <StatusPanel ticket={ticket} onUpdated={() => {}} />
          </div>
        </div>
      </div>
    </div>
  )
}
