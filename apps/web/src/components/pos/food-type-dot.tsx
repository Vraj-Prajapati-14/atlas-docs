import { cn } from '@/lib/utils'
import type { FoodType } from '@/lib/api-types'

const STYLE: Record<FoodType, { border: string; dot: string }> = {
  VEG:     { border: 'border-success',   dot: 'bg-success' },
  NON_VEG: { border: 'border-danger',    dot: 'bg-danger' },
  EGG:     { border: 'border-warning',   dot: 'bg-warning' },
  VEGAN:   { border: 'border-success',   dot: 'bg-emerald-400' },
}

export function FoodTypeDot({ type, className }: { type: FoodType; className?: string }) {
  const s = STYLE[type]
  return (
    <span
      className={cn(
        'inline-flex items-center justify-center w-3.5 h-3.5 rounded-sm border shrink-0',
        s.border,
        className,
      )}
      aria-label={type}
    >
      <span className={cn('w-1.5 h-1.5 rounded-full', s.dot)} />
    </span>
  )
}
