'use client'

import { useRequireRole } from '@/hooks/use-require-role'
import { ChefHat, RefreshCw } from 'lucide-react'
import { useActiveKOTs } from '@/hooks/use-kots'
import { KOTCard } from '@/components/kds/kot-card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Spinner } from '@/components/ui/spinner'
import { cn } from '@/lib/utils'
import type { KOTStatus } from '@/lib/api-types'

export default function KDSPage() {
  const allowed = useRequireRole(['OWNER', 'MANAGER', 'CHEF'])
  const { data: kots = [], isLoading, isFetching, refetch } = useActiveKOTs()
  if (!allowed) return null

  const counts: Partial<Record<KOTStatus, number>> = kots.reduce((acc, k) => {
    acc[k.status] = (acc[k.status] ?? 0) + 1
    return acc
  }, {} as Partial<Record<KOTStatus, number>>)

  return (
    <div className="flex flex-col h-full -m-6 bg-background-card">
      {/* KDS Header bar */}
      <div className="flex items-center justify-between px-6 py-3 border-b border-border bg-background shrink-0">
        <div className="flex items-center gap-3">
          <ChefHat size={18} className="text-primary-500" />
          <span className="text-sm font-bold">Kitchen Display</span>
          <div className="flex items-center gap-2 ml-2">
            {counts['PENDING'] ? (
              <Badge variant="muted">{counts['PENDING']} Pending</Badge>
            ) : null}
            {counts['ACCEPTED'] ? (
              <Badge variant="info">{counts['ACCEPTED']} Accepted</Badge>
            ) : null}
            {counts['IN_PROGRESS'] ? (
              <Badge variant="warning">{counts['IN_PROGRESS']} Cooking</Badge>
            ) : null}
          </div>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-[11px] text-muted-foreground">Auto-refresh 10s</span>
          <Button variant="ghost" size="icon-sm" onClick={() => refetch()}>
            <RefreshCw size={13} className={cn(isFetching && 'animate-spin')} />
          </Button>
        </div>
      </div>

      {/* KOT grid */}
      <div className="flex-1 overflow-y-auto p-6">
        {isLoading ? (
          <div className="flex items-center justify-center h-full">
            <Spinner size="xl" className="text-primary-500" />
          </div>
        ) : kots.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full gap-4 text-muted-foreground">
            <ChefHat size={48} className="opacity-15" />
            <div className="text-center">
              <p className="font-semibold text-sm">All clear — kitchen is caught up!</p>
              <p className="text-xs mt-1 opacity-60">New KOTs will appear here automatically.</p>
            </div>
          </div>
        ) : (
          <div className="flex flex-wrap gap-4 content-start">
            {kots.map((kot) => (
              <KOTCard key={kot.id} kot={kot} />
            ))}
          </div>
        )}
      </div>

      {/* Footer legend */}
      <div className="shrink-0 flex items-center gap-5 px-6 py-3 border-t border-border bg-background">
        {[
          { color: 'bg-success',  label: '< 5 min — Fresh' },
          { color: 'bg-warning',  label: '5–12 min — Normal' },
          { color: 'bg-danger',   label: '> 12 min — Urgent' },
        ].map(({ color, label }) => (
          <div key={label} className="flex items-center gap-1.5">
            <span className={cn('w-2.5 h-2.5 rounded-sm', color)} />
            <span className="text-[11px] text-muted-foreground">{label}</span>
          </div>
        ))}
      </div>
    </div>
  )
}
