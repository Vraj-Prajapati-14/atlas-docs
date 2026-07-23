import type { ReactNode } from 'react'
import { Reveal } from './reveal'

export function PageHeader({
  eyebrow,
  title,
  description,
}: {
  eyebrow?: string
  title: ReactNode
  description?: string
}) {
  return (
    <section className="relative overflow-hidden border-b border-ink-100 bg-ink-50/40 pb-14 pt-16 sm:pb-16 sm:pt-20">
      <div
        className="pointer-events-none absolute inset-x-0 top-0 h-full bg-grid-pattern bg-grid opacity-40 [mask-image:linear-gradient(to_bottom,black,transparent)]"
        aria-hidden="true"
      />
      <div className="container relative text-center">
        <Reveal>
          {eyebrow && (
            <span className="text-sm font-bold uppercase tracking-wide text-primary">
              {eyebrow}
            </span>
          )}
          <h1 className="mx-auto mt-3 max-w-2xl text-balance text-4xl font-extrabold tracking-tight text-ink sm:text-5xl">
            {title}
          </h1>
          {description && (
            <p className="mx-auto mt-4 max-w-xl text-balance text-lg text-ink-500">
              {description}
            </p>
          )}
        </Reveal>
      </div>
    </section>
  )
}
