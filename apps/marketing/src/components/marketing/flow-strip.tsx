import { User, Calculator, ChefHat, Package, Receipt, MessageCircle, BarChart3 } from 'lucide-react'
import type { LucideIcon } from 'lucide-react'
import { Reveal } from './reveal'

const STEPS: { label: string; icon: LucideIcon }[] = [
  { label: 'Customer places order', icon: User },
  { label: 'Waiter takes order on POS', icon: Calculator },
  { label: 'KOT sent to kitchen', icon: ChefHat },
  { label: 'Inventory auto deducted', icon: Package },
  { label: 'Bill generated & paid', icon: Receipt },
  { label: 'Customer gets WhatsApp bill', icon: MessageCircle },
  { label: 'AI updates dashboard', icon: BarChart3 },
]

export function FlowStrip() {
  return (
    <section className="section bg-ink-900">
      <div className="container">
        <Reveal className="mx-auto max-w-2xl text-center">
          <h2 className="text-balance text-3xl font-extrabold tracking-tight text-white sm:text-4xl">
            From Order to Insights. <span className="text-primary">In One Flow.</span>
          </h2>
        </Reveal>

        <Reveal delay={0.1}>
          <div className="mt-14 flex snap-x gap-6 overflow-x-auto pb-4 lg:grid lg:grid-cols-7 lg:gap-3 lg:overflow-visible lg:pb-0">
            {STEPS.map((step, i) => (
              <div
                key={step.label}
                className="relative flex w-40 shrink-0 snap-start flex-col items-center gap-3 text-center lg:w-auto"
              >
                {i < STEPS.length - 1 && (
                  <span
                    className="absolute left-1/2 top-6 hidden h-px w-full border-t border-dashed border-white/15 lg:block"
                    style={{ left: '58%' }}
                    aria-hidden="true"
                  />
                )}
                <span className="relative z-10 grid h-12 w-12 shrink-0 place-items-center rounded-full bg-white/10 text-primary ring-1 ring-white/10">
                  <step.icon size={20} strokeWidth={2} />
                </span>
                <p className="text-xs font-medium leading-snug text-white/70">{step.label}</p>
              </div>
            ))}
          </div>
        </Reveal>
      </div>
    </section>
  )
}
