import { cn } from '@/lib/utils'

export function Logo({ className, dark = false }: { className?: string; dark?: boolean }) {
  return (
    <span className={cn('inline-flex items-center gap-2', className)}>
      <span className="grid h-8 w-8 place-items-center rounded-lg bg-primary text-white shadow-soft">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
          <path
            d="M4 18V9.5L12 4l8 5.5V18a1 1 0 0 1-1 1h-4v-6H9v6H5a1 1 0 0 1-1-1Z"
            fill="currentColor"
          />
        </svg>
      </span>
      <span
        className={cn(
          'text-lg font-bold tracking-tight',
          dark ? 'text-white' : 'text-ink'
        )}
      >
        Atlas
      </span>
    </span>
  )
}
