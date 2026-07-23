'use client'

import { useState } from 'react'
import { ChevronDown } from 'lucide-react'

export type FaqItem = { q: string; a: string }

export function FaqAccordion({
  items,
  defaultOpenIndex = 0,
  className = '',
}: {
  items: FaqItem[]
  defaultOpenIndex?: number | null
  className?: string
}) {
  const [openIndex, setOpenIndex] = useState<number | null>(defaultOpenIndex)

  return (
    <div className={`divide-y divide-ink-100 rounded-2xl border border-ink-100 ${className}`}>
      {items.map((item, i) => {
        const open = openIndex === i
        return (
          <div key={item.q}>
            <button
              type="button"
              onClick={() => setOpenIndex(open ? null : i)}
              className="flex w-full items-center justify-between gap-4 px-6 py-5 text-left"
              aria-expanded={open}
            >
              <span className="text-sm font-semibold text-ink sm:text-base">{item.q}</span>
              <ChevronDown
                size={18}
                className={`shrink-0 text-ink-400 transition-transform ${open ? 'rotate-180' : ''}`}
              />
            </button>
            {open && <p className="px-6 pb-5 text-sm leading-relaxed text-ink-500">{item.a}</p>}
          </div>
        )
      })}
    </div>
  )
}
