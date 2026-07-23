import { Check } from 'lucide-react'
import { Reveal } from './reveal'
import { cn } from '@/lib/utils'

const PLANS = [
  {
    name: 'Free',
    price: '₹0',
    period: '/month',
    desc: 'Try Atlas with a single outlet.',
    features: ['Up to 50 bills/day', 'Billing & KOT printing', 'Basic inventory tracking', 'WhatsApp bill receipts'],
    cta: 'Start Free',
    highlight: false,
  },
  {
    name: 'Starter',
    price: '₹499',
    period: '/month',
    desc: 'Everything a single-outlet restaurant needs.',
    features: [
      'Unlimited billing & KOT',
      'Kitchen display (KDS) included',
      'Full inventory + wastage tracking',
      'Zomato & Swiggy order sync',
      'WhatsApp nightly owner summary',
      '72-hour offline billing',
    ],
    cta: 'Start Free Trial',
    highlight: true,
  },
  {
    name: 'Growth',
    price: '₹1,999',
    period: '/month',
    desc: 'For multi-outlet restaurants and growing chains.',
    features: [
      'Everything in Starter',
      'Multi-outlet management',
      'AI business advisor',
      'Cash & void anomaly alerts',
      'Priority WhatsApp support',
    ],
    cta: 'Talk to Sales',
    highlight: false,
  },
]

export function PricingSection() {
  return (
    <section id="pricing" className="section bg-ink-50/40">
      <div className="container">
        <Reveal className="mx-auto max-w-2xl text-center">
          <h2 className="text-balance text-3xl font-extrabold tracking-tight text-ink sm:text-4xl">
            Simple, Transparent <span className="text-primary">Pricing.</span>
          </h2>
          <p className="mt-4 text-lg text-ink-500">
            No sales call required to see a number. No paid add-ons hiding
            behind the price you saw first.
          </p>
        </Reveal>

        <div className="mt-14 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {PLANS.map((plan, i) => (
            <Reveal key={plan.name} delay={i * 0.08}>
              <div
                className={cn(
                  'flex h-full flex-col rounded-2xl border p-7',
                  plan.highlight
                    ? 'border-primary bg-white shadow-panel ring-1 ring-primary'
                    : 'border-ink-100 bg-white shadow-soft'
                )}
              >
                {plan.highlight && (
                  <span className="mb-3 inline-flex w-fit items-center rounded-full bg-primary-50 px-3 py-1 text-xs font-bold text-primary-700">
                    Most Popular
                  </span>
                )}
                <h3 className="text-lg font-bold text-ink">{plan.name}</h3>
                <p className="mt-1 text-sm text-ink-500">{plan.desc}</p>
                <p className="mt-5 flex items-baseline gap-1">
                  <span className="price text-4xl font-extrabold text-ink">{plan.price}</span>
                  <span className="text-sm font-medium text-ink-400">{plan.period}</span>
                </p>

                <ul className="mt-6 flex-1 space-y-3">
                  {plan.features.map((feature) => (
                    <li key={feature} className="flex items-start gap-2 text-sm text-ink-600">
                      <Check size={15} className="mt-0.5 shrink-0 text-primary" />
                      {feature}
                    </li>
                  ))}
                </ul>

                <a
                  href="/contact"
                  className={cn(
                    'mt-8 rounded-lg px-5 py-3 text-center text-sm font-semibold transition-colors',
                    plan.highlight
                      ? 'bg-primary text-white hover:bg-primary-600'
                      : 'border border-ink-200 text-ink hover:bg-ink-50'
                  )}
                >
                  {plan.cta}
                </a>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  )
}
