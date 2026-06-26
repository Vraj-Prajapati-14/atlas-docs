'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { RefreshCw } from 'lucide-react'
import { useTables, useFloors } from '@/hooks/use-tables'
import { TableChip } from '@/components/pos/table-chip'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Spinner } from '@/components/ui/spinner'
import { cn } from '@/lib/utils'

const STATUS_COUNT_LABEL: Record<string, { label: string; variant: 'success' | 'default' | 'info' | 'muted' }> = {
  AVAILABLE: { label: 'Free',    variant: 'success' },
  OCCUPIED:  { label: 'Busy',   variant: 'default' },
  RESERVED:  { label: 'Rsvd',   variant: 'info' },
  CLEANING:  { label: 'Clean',  variant: 'muted' },
}

export default function FloorPage() {
  const router = useRouter()
  const { data: floors = [], isLoading: floorsLoading } = useFloors()
  const { data: tables = [], isLoading: tablesLoading, refetch, isFetching } = useTables()

  const [activeFloor, setActiveFloor] = useState<string | null>(null)

  const floorId = activeFloor ?? floors[0]?.id ?? null

  const filtered = floorId
    ? tables.filter((t) => t.floorId === floorId)
    : tables

  // summary counts
  const counts = filtered.reduce<Record<string, number>>((acc, t) => {
    acc[t.status] = (acc[t.status] ?? 0) + 1
    return acc
  }, {})

  const isLoading = floorsLoading || tablesLoading

  return (
    <div className="flex flex-col h-full gap-0">
      {/* Header row */}
      <div className="flex items-center justify-between mb-5">
        <div className="flex items-center gap-3 flex-wrap">
          {Object.entries(STATUS_COUNT_LABEL).map(([status, { label, variant }]) =>
            counts[status] ? (
              <Badge key={status} variant={variant}>
                {counts[status]} {label}
              </Badge>
            ) : null,
          )}
          <span className="text-xs text-muted-foreground">{filtered.length} tables total</span>
        </div>
        <Button
          variant="ghost"
          size="icon-sm"
          onClick={() => refetch()}
          aria-label="Refresh floor plan"
        >
          <RefreshCw size={14} className={cn(isFetching && 'animate-spin')} />
        </Button>
      </div>

      {/* Floor tabs */}
      {floors.length > 1 && (
        <div className="flex gap-1 mb-5 border-b border-border pb-0">
          <button
            type="button"
            onClick={() => setActiveFloor(null)}
            className={cn(
              'px-4 py-2 text-sm font-semibold border-b-2 -mb-px transition-colors duration-100',
              !activeFloor
                ? 'border-primary-500 text-primary-500'
                : 'border-transparent text-muted-foreground hover:text-foreground',
            )}
          >
            All
          </button>
          {floors
            .slice()
            .sort((a, b) => a.sortOrder - b.sortOrder)
            .map((floor) => (
              <button
                key={floor.id}
                type="button"
                onClick={() => setActiveFloor(floor.id)}
                className={cn(
                  'px-4 py-2 text-sm font-semibold border-b-2 -mb-px transition-colors duration-100',
                  activeFloor === floor.id
                    ? 'border-primary-500 text-primary-500'
                    : 'border-transparent text-muted-foreground hover:text-foreground',
                )}
              >
                {floor.name}
              </button>
            ))}
        </div>
      )}

      {/* Table grid */}
      {isLoading ? (
        <div className="flex-1 flex items-center justify-center">
          <Spinner size="lg" className="text-primary-500" />
        </div>
      ) : filtered.length === 0 ? (
        <div className="flex-1 flex flex-col items-center justify-center gap-3 text-muted-foreground">
          <p className="text-sm">No tables found. Add tables in Outlet Settings.</p>
        </div>
      ) : (
        <div className="flex flex-wrap gap-3 content-start">
          {filtered.map((table) => (
            <TableChip
              key={table.id}
              table={table}
              onClick={() => router.push(`/floor/${table.id}`)}
            />
          ))}
        </div>
      )}

      {/* Legend */}
      <div className="flex items-center gap-5 mt-6 pt-5 border-t border-border">
        {[
          { color: 'bg-success', label: 'Available' },
          { color: 'bg-primary-500', label: 'Occupied' },
          { color: 'bg-info', label: 'Reserved' },
          { color: 'bg-muted-foreground', label: 'Cleaning' },
        ].map(({ color, label }) => (
          <div key={label} className="flex items-center gap-1.5">
            <span className={cn('w-2.5 h-2.5 rounded-sm', color)} />
            <span className="text-xs text-muted-foreground">{label}</span>
          </div>
        ))}
      </div>
    </div>
  )
}
