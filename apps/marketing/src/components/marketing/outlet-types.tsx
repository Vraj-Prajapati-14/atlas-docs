import {
  UtensilsCrossed,
  Zap,
  Coffee,
  ChefHat,
  Cookie,
  Store,
  Beer,
  Building2,
} from 'lucide-react'
import type { LucideIcon } from 'lucide-react'
import { Reveal } from './reveal'

const OUTLETS: { icon: LucideIcon; label: string }[] = [
  { icon: UtensilsCrossed, label: 'Fine Dining' },
  { icon: Zap, label: 'QSR' },
  { icon: Coffee, label: 'Café' },
  { icon: ChefHat, label: 'Cloud Kitchen' },
  { icon: Cookie, label: 'Bakery & Sweet Shop' },
  { icon: Store, label: 'Food Court' },
  { icon: Beer, label: 'Bar & Brewery' },
  { icon: Building2, label: 'Franchise & Chains' },
]

export function OutletTypes() {
  return (
    <section id="outlet-types" className="section bg-white">
      <div className="container">
        <Reveal className="mx-auto max-w-2xl text-center">
          <span className="text-sm font-bold uppercase tracking-wide text-primary">
            Outlet Types
          </span>
          <h2 className="mt-3 text-balance text-3xl font-extrabold tracking-tight text-ink sm:text-4xl">
            Built for Every Kind of Food Business.
          </h2>
          <p className="mt-4 text-lg text-ink-500">
            One platform, tuned for the way each format actually runs — from
            a single café counter to a multi-outlet franchise.
          </p>
        </Reveal>

        <div className="mt-12 grid grid-cols-2 gap-4 sm:grid-cols-4">
          {OUTLETS.map((outlet, i) => (
            <Reveal key={outlet.label} delay={i * 0.04}>
              <div className="flex flex-col items-center gap-3 rounded-2xl border border-ink-100 px-4 py-7 text-center shadow-soft transition-colors hover:border-primary-200 hover:bg-primary-50/30">
                <span className="grid h-12 w-12 place-items-center rounded-xl bg-ink-800 text-white">
                  <outlet.icon size={20} />
                </span>
                <p className="text-sm font-semibold text-ink">{outlet.label}</p>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  )
}
