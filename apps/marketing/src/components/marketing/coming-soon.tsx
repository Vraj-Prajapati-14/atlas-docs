import type { LucideIcon } from 'lucide-react'
import { ArrowRight } from 'lucide-react'
import { Reveal } from './reveal'

export function ComingSoon({
  icon: Icon,
  title,
  description,
}: {
  icon: LucideIcon
  title: string
  description: string
}) {
  return (
    <section className="section bg-white">
      <div className="container">
        <Reveal className="mx-auto flex max-w-xl flex-col items-center text-center">
          <span className="grid h-16 w-16 place-items-center rounded-2xl bg-primary-50 text-primary">
            <Icon size={28} />
          </span>
          <h2 className="mt-6 text-2xl font-extrabold tracking-tight text-ink sm:text-3xl">
            {title}
          </h2>
          <p className="mt-3 text-lg text-ink-500">{description}</p>
          <a
            href="/contact"
            className="mt-8 flex items-center gap-2 rounded-lg bg-primary px-6 py-3 text-sm font-semibold text-white transition-colors hover:bg-primary-600"
          >
            Get Notified — Talk to Us
            <ArrowRight size={16} />
          </a>
        </Reveal>
      </div>
    </section>
  )
}
