import { Check, X } from 'lucide-react'
import { Reveal } from './reveal'

const ROWS = [
  { dim: 'Pricing', old: '₹833–1,350/month + paid add-ons', atlas: '₹499–1,999/month, all-inclusive' },
  { dim: 'Pricing transparency', old: 'Hidden behind a sales call', atlas: 'Listed right on this page' },
  { dim: 'Billing speed', old: 'Slows down during peak hours', atlas: 'Every screen target: under 1.5 seconds' },
  { dim: 'Kitchen display (KDS)', old: 'Sold as a paid add-on', atlas: 'Included in every plan' },
  { dim: 'WhatsApp owner summary', old: 'Manual or paid add-on', atlas: 'Built in, sent automatically every night' },
  { dim: 'Offline billing', old: 'Limited functionality', atlas: 'Full 72-hour offline mode' },
  { dim: 'Cash & void anomaly alerts', old: 'Not offered', atlas: 'Included, sent to WhatsApp in real time' },
  { dim: 'Onboarding', old: '1 day to several weeks, mostly manual', atlas: 'Guided wizard — live in under 30 minutes' },
]

export function TrustSection() {
  return (
    <section id="trust" className="section bg-white">
      <div className="container">
        <Reveal className="mx-auto max-w-2xl text-center">
          <h2 className="text-balance text-3xl font-extrabold tracking-tight text-ink sm:text-4xl">
            Built to Beat <span className="text-primary">the Status Quo.</span>
          </h2>
          <p className="mt-4 text-lg text-ink-500">
            We studied what restaurant owners complain about most in public
            reviews of leading Indian POS platforms — then designed Atlas to
            fix every one of them.
          </p>
        </Reveal>

        <Reveal delay={0.1}>
          <div className="mx-auto mt-12 max-w-4xl overflow-hidden rounded-2xl border border-ink-100 shadow-soft">
            <div className="grid grid-cols-3 bg-ink-800 text-white">
              <div className="px-4 py-3 text-xs font-semibold uppercase tracking-wide sm:text-sm">
                Dimension
              </div>
              <div className="px-4 py-3 text-xs font-semibold uppercase tracking-wide text-ink-300 sm:text-sm">
                Typical POS Today
              </div>
              <div className="px-4 py-3 text-xs font-semibold uppercase tracking-wide text-primary-200 sm:text-sm">
                Atlas
              </div>
            </div>
            {ROWS.map((row, i) => (
              <div
                key={row.dim}
                className={`grid grid-cols-3 text-xs sm:text-sm ${i % 2 ? 'bg-ink-50/40' : 'bg-white'}`}
              >
                <div className="px-4 py-3.5 font-semibold text-ink">{row.dim}</div>
                <div className="flex items-start gap-1.5 px-4 py-3.5 text-ink-500">
                  <X size={14} className="mt-0.5 shrink-0 text-danger/70" />
                  {row.old}
                </div>
                <div className="flex items-start gap-1.5 px-4 py-3.5 font-medium text-ink">
                  <Check size={14} className="mt-0.5 shrink-0 text-success" />
                  {row.atlas}
                </div>
              </div>
            ))}
          </div>
          <p className="mx-auto mt-4 max-w-4xl text-center text-xs text-ink-400">
            Based on publicly available G2 and Capterra reviews for leading Indian
            restaurant POS platforms, and Atlas&apos;s own product specification.
          </p>
        </Reveal>
      </div>
    </section>
  )
}
