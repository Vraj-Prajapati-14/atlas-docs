'use client'

import { cn } from '@/lib/utils'
import type { Table, TableStatus } from '@/lib/api-types'

const STATUS_STYLES: Record<TableStatus, string> = {
  AVAILABLE: 'border-success bg-success/8 hover:border-success hover:bg-success/15',
  OCCUPIED:  'border-primary-500 bg-primary-500/8 hover:bg-primary-500/15',
  RESERVED:  'border-info bg-info/8 hover:bg-info/15',
  CLEANING:  'border-border bg-white/3 hover:bg-white/6',
  BLOCKED:   'border-border bg-white/2 opacity-50 cursor-not-allowed',
}

const STATUS_NUM_COLOR: Record<TableStatus, string> = {
  AVAILABLE: 'text-success',
  OCCUPIED:  'text-primary-500',
  RESERVED:  'text-info',
  CLEANING:  'text-muted-foreground',
  BLOCKED:   'text-muted-foreground',
}

const STATUS_LABEL: Record<TableStatus, string> = {
  AVAILABLE: 'Free',
  OCCUPIED:  'Busy',
  RESERVED:  'Rsvd',
  CLEANING:  'Clean',
  BLOCKED:   'Off',
}

interface TableChipProps {
  table: Table
  onClick?: () => void
}

export function TableChip({ table, onClick }: TableChipProps) {
  const isClickable = table.status !== 'BLOCKED'

  return (
    <button
      type="button"
      onClick={isClickable ? onClick : undefined}
      disabled={!isClickable}
      className={cn(
        'flex flex-col items-center justify-center w-20 h-20 rounded-xl border-2 transition-all duration-150',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background',
        STATUS_STYLES[table.status],
        isClickable && 'cursor-pointer active:scale-95',
      )}
      aria-label={`Table ${table.name} — ${table.status}`}
    >
      <span className={cn('text-lg font-extrabold tabular-nums', STATUS_NUM_COLOR[table.status])}>
        {table.name}
      </span>
      <span className="text-[10px] font-semibold text-muted-foreground mt-0.5">
        {table.status === 'AVAILABLE' ? `${table.capacity}p` : STATUS_LABEL[table.status]}
      </span>
    </button>
  )
}
