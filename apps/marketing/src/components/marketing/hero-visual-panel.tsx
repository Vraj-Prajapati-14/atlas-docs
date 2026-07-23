import type { ReactNode } from 'react'

export function HeroVisualPanel({ children }: { children: ReactNode }) {
  return (
    <div className="relative overflow-hidden bg-ink-900 py-14 sm:py-20">
      {/* Warm bokeh blobs standing in for a blurred restaurant-ambiance photo. */}
      <div className="pointer-events-none absolute inset-0" aria-hidden="true">
        <div className="absolute -left-16 -top-24 h-96 w-96 rounded-full bg-primary/30 blur-3xl" />
        <div className="absolute left-1/4 bottom-0 h-72 w-72 rounded-full bg-amber-700/25 blur-3xl" />
        <div className="absolute -right-20 top-1/3 h-96 w-96 rounded-full bg-primary/20 blur-3xl" />
        <div className="absolute right-1/4 -bottom-16 h-72 w-72 rounded-full bg-orange-900/40 blur-3xl" />
        <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-transparent to-black/50" />
        <div className="absolute inset-0 [background:radial-gradient(120%_100%_at_50%_10%,transparent_40%,rgba(0,0,0,0.55)_100%)]" />
      </div>

      <div className="container relative">{children}</div>
    </div>
  )
}
