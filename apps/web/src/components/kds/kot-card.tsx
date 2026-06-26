'use client'

import { useEffect, useState } from 'react'
import { cn } from '@/lib/utils'
import { useAcceptKOT, useStartKOT, useDoneKOT } from '@/hooks/use-kots'
import { Spinner } from '@/components/ui/spinner'
import type { KOT } from '@/lib/api-types'

// ─── Timer helpers ────────────────────────────────────────────────────────────

function elapsedSeconds(iso: string) {
  return Math.floor((Date.now() - new Date(iso).getTime()) / 1000)
}

function formatElapsed(seconds: number) {
  const m = Math.floor(seconds / 60)
  const s = seconds % 60
  return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`
}

type Age = 'fresh' | 'normal' | 'urgent'

function getAge(seconds: number): Age {
  if (seconds < 5 * 60) return 'fresh'
  if (seconds < 12 * 60) return 'normal'
  return 'urgent'
}

const HEADER_CLASS: Record<Age, string> = {
  fresh:  'bg-success',
  normal: 'bg-warning',
  urgent: 'bg-danger animate-pulse-slow',
}

const BORDER_CLASS: Record<Age, string> = {
  fresh:  'border-success/30',
  normal: 'border-warning/30',
  urgent: 'border-danger/40',
}

// ─── Action button per status ─────────────────────────────────────────────────

type ActionDef = { label: string; fn: (id: string) => void; pending: boolean }

// ─── Component ────────────────────────────────────────────────────────────────

interface KOTCardProps {
  kot: KOT
}

export function KOTCard({ kot }: KOTCardProps) {
  const [elapsed, setElapsed] = useState(() => elapsedSeconds(kot.createdAt))
  const accept = useAcceptKOT()
  const start  = useStartKOT()
  const done   = useDoneKOT()

  useEffect(() => {
    const id = setInterval(() => setElapsed(elapsedSeconds(kot.createdAt)), 1000)
    return () => clearInterval(id)
  }, [kot.createdAt])

  const age = getAge(elapsed)

  const action: ActionDef | null =
    kot.status === 'PENDING'     ? { label: 'Accept',     fn: (id) => accept.mutate(id), pending: accept.isPending } :
    kot.status === 'ACCEPTED'    ? { label: 'Start',      fn: (id) => start.mutate(id),  pending: start.isPending  } :
    kot.status === 'IN_PROGRESS' ? { label: 'Mark Done',  fn: (id) => done.mutate(id),   pending: done.isPending   } :
    null

  return (
    <div
      className={cn(
        'flex flex-col w-48 rounded-xl border overflow-hidden bg-background-card shadow-lg shrink-0',
        BORDER_CLASS[age],
      )}
    >
      {/* Coloured header */}
      <div className={cn('flex items-center justify-between px-3 py-2', HEADER_CLASS[age])}>
        <span className="text-[13px] font-extrabold text-white">
          {kot.order.table ? kot.order.table.name : `#${kot.order.orderNumber}`}
          <span className="ml-1 opacity-75 text-[10px] font-semibold">· {kot.kotNumber}</span>
        </span>
        <span className="font-mono text-[13px] font-bold text-white tabular-nums">
          {formatElapsed(elapsed)}{age === 'urgent' ? ' !' : ''}
        </span>
      </div>

      {/* Items */}
      <ul className="flex-1 px-3 py-2.5 space-y-2">
        {kot.items.map((item) => (
          <li key={item.id} className="flex items-start justify-between gap-2">
            <div className="min-w-0">
              <p className="text-[12px] font-semibold text-foreground/90 leading-tight truncate">{item.menuItemName}</p>
              {item.variantName && (
                <p className="text-[10px] text-muted-foreground">{item.variantName}</p>
              )}
              {item.note && (
                <p className="text-[10px] text-warning/80 italic mt-0.5">{item.note}</p>
              )}
            </div>
            <span className="shrink-0 font-mono text-[14px] font-bold text-primary-500 tabular-nums">
              ×{item.quantity}
            </span>
          </li>
        ))}
        {kot.order.note && (
          <li className="border-t border-border/50 pt-1.5 text-[10px] text-muted-foreground italic">
            {kot.order.note}
          </li>
        )}
      </ul>

      {/* Action */}
      {action && (
        <div className="px-3 pb-3">
          <button
            type="button"
            disabled={action.pending}
            onClick={() => action.fn(kot.id)}
            className={cn(
              'w-full py-2 rounded-lg text-[12px] font-bold transition-all duration-150',
              'disabled:opacity-60 disabled:cursor-not-allowed',
              kot.status === 'IN_PROGRESS'
                ? 'bg-primary-500 text-white hover:bg-primary-400 shadow-[0_2px_8px_rgba(255,107,53,0.3)]'
                : 'bg-background-border text-foreground hover:bg-white/10',
            )}
          >
            {action.pending ? <Spinner size="xs" className="mx-auto" /> : action.label}
          </button>
        </div>
      )}
    </div>
  )
}
