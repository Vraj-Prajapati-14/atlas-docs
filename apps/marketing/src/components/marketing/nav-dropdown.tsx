'use client'

import { ChevronDown } from 'lucide-react'
import type { LucideIcon } from 'lucide-react'
import { cn } from '@/lib/utils'

export type NavDropdownItem = {
  icon: LucideIcon
  label: string
  href: string
}

export function NavDropdown({
  label,
  items,
  columns = 1,
  open,
  onToggle,
  onClose,
}: {
  label: string
  items: NavDropdownItem[]
  columns?: 1 | 2
  open: boolean
  onToggle: () => void
  onClose: () => void
}) {
  return (
    <div className="relative">
      <button
        type="button"
        onClick={onToggle}
        className="flex items-center gap-1 text-sm font-medium text-ink-600 transition-colors hover:text-ink"
        aria-expanded={open}
      >
        {label}
        <ChevronDown size={14} className={cn('transition-transform', open && 'rotate-180')} />
      </button>

      {open && (
        <div
          className={cn(
            'absolute left-1/2 top-full z-50 mt-3 -translate-x-1/2 rounded-xl border border-ink-100 bg-white p-2 shadow-panel',
            columns === 2 ? 'w-[380px]' : 'w-56'
          )}
        >
          <div className={cn('grid gap-1', columns === 2 && 'grid-cols-2')}>
            {items.map((item) => (
              <a
                key={item.label}
                href={item.href}
                onClick={onClose}
                className="flex items-center gap-3 rounded-lg px-2.5 py-2 text-sm text-ink-600 transition-colors hover:bg-primary-50 hover:text-ink"
              >
                <span className="grid h-8 w-8 shrink-0 place-items-center rounded-lg bg-ink-50 text-primary">
                  <item.icon size={15} />
                </span>
                {item.label}
              </a>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
