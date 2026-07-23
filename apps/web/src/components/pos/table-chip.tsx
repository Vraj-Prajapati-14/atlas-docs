'use client'

import { cn } from '@/lib/utils'
import type { Table, TableStatus } from '@/lib/api-types'

// Status → visual styles (adapted for dark theme)
const STATUS_BG: Record<TableStatus, string> = {
  AVAILABLE: 'bg-success/10   border-success/40   hover:bg-success/18   hover:border-success/70',
  OCCUPIED:  'bg-primary-500/12 border-primary-500/50 hover:bg-primary-500/20 hover:border-primary-500',
  RESERVED:  'bg-info/10      border-info/40      hover:bg-info/18      hover:border-info/70',
  CLEANING:  'bg-warning/10   border-warning/40   hover:bg-warning/18   hover:border-warning/70',
  BLOCKED:   'bg-background-hover/30 border-border/30 opacity-40 cursor-not-allowed',
}

const STATUS_TEXT: Record<TableStatus, string> = {
  AVAILABLE: 'text-success',
  OCCUPIED:  'text-primary-500',
  RESERVED:  'text-info',
  CLEANING:  'text-warning',
  BLOCKED:   'text-muted-foreground',
}

const STATUS_LABEL: Record<TableStatus, string> = {
  AVAILABLE: 'Free',
  OCCUPIED:  'Occupied',
  RESERVED:  'Reserved',
  CLEANING:  'Cleaning',
  BLOCKED:   'Blocked',
}

const STATUS_DOT: Record<TableStatus, string> = {
  AVAILABLE: 'bg-success',
  OCCUPIED:  'bg-primary-500',
  RESERVED:  'bg-info',
  CLEANING:  'bg-warning',
  BLOCKED:   'bg-muted-foreground',
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
        'relative flex flex-col items-center justify-center',
        'w-[100px] h-[90px] rounded-xl border-2 transition-all duration-150',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500/50',
        STATUS_BG[table.status],
        isClickable && 'cursor-pointer active:scale-95',
      )}
      aria-label={`Table ${table.name} — ${STATUS_LABEL[table.status]}`}
    >
      {/* Status dot */}
      <span className={cn('absolute top-2.5 right-2.5 w-2 h-2 rounded-full', STATUS_DOT[table.status])} />

      {/* Table name */}
      <span className={cn('text-[22px] font-extrabold tabular-nums leading-none', STATUS_TEXT[table.status])}>
        {table.name}
      </span>

      {/* Capacity / status */}
      <span className="text-[10px] text-muted-foreground/70 mt-1.5 font-medium">
        {table.status === 'AVAILABLE'
          ? `${table.capacity} seats`
          : STATUS_LABEL[table.status]}
      </span>
    </button>
  )
}
