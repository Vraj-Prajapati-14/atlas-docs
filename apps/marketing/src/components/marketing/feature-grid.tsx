import {
  Receipt,
  ChefHat,
  Package,
  UsersRound,
  Heart,
  BarChart3,
  Sparkles,
  Check,
} from 'lucide-react'
import type { LucideIcon } from 'lucide-react'
import { Reveal } from './reveal'

type Feature = {
  icon: LucideIcon
  title: string
  points: string[]
}

const FEATURES: Feature[] = [
  {
    icon: Receipt,
    title: 'Billing & POS',
    points: ['Billing under 45 seconds', 'Split / merge bills', 'KOT & printers, any brand', '72-hour offline mode'],
  },
  {
    icon: ChefHat,
    title: 'Kitchen (KDS)',
    points: ['Kitchen display included free', 'Live order queue', 'Station-wise routing', 'Prep-time tracking'],
  },
  {
    icon: Package,
    title: 'Inventory',
    points: ['Recipe-based auto deduction', 'Low-stock WhatsApp alerts', 'Wastage tracking', 'GRN & purchase entry'],
  },
  {
    icon: UsersRound,
    title: 'Staff & Payroll',
    points: ['Attendance tracking', '6 configurable roles', 'Shift scheduling', 'Performance snapshots'],
  },
  {
    icon: Heart,
    title: 'CRM & Loyalty',
    points: ['Customer database', 'Order history & visits', 'Feedback collection', 'Segment-ready profiles'],
  },
  {
    icon: BarChart3,
    title: 'Analytics & Reports',
    points: ['12 core reports, no add-on', 'WhatsApp nightly summary', 'P&L snapshot', 'GSTR-1 export'],
  },
  {
    icon: Sparkles,
    title: 'AI Advisor',
    points: ['Cash & void anomaly alerts', 'Menu price suggestions', 'Upsell prompts on order screen', 'Ask-anything business Q&A'],
  },
]

export function FeatureGrid() {
  return (
    <section id="features" className="section bg-white">
      <div className="container">
        <Reveal className="mx-auto max-w-2xl text-center">
          <h2 className="text-balance text-3xl font-extrabold tracking-tight text-ink sm:text-4xl">
            One Platform. <span className="text-primary">Every Department.</span>
          </h2>
          <p className="mt-4 text-lg text-ink-500">
            Every module Petpooja and Restroworks sell as a paid add-on comes
            included in every Atlas plan.
          </p>
        </Reveal>

        <div className="mt-14 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {FEATURES.map((feature, i) => (
            <Reveal key={feature.title} delay={i * 0.05}>
              <div className="group h-full rounded-2xl border border-ink-100 p-6 transition-colors hover:border-primary-200 hover:bg-primary-50/30">
                <span className="grid h-11 w-11 place-items-center rounded-xl bg-ink-800 text-white transition-colors group-hover:bg-primary">
                  <feature.icon size={20} strokeWidth={2} />
                </span>
                <h3 className="mt-4 text-base font-bold text-ink">{feature.title}</h3>
                <ul className="mt-3 space-y-2">
                  {feature.points.map((point) => (
                    <li key={point} className="flex items-start gap-2 text-sm text-ink-500">
                      <Check size={15} className="mt-0.5 shrink-0 text-primary" />
                      {point}
                    </li>
                  ))}
                </ul>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  )
}
