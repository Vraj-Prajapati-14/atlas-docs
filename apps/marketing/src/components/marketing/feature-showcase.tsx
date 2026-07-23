import { ArrowRight, Receipt, Package, BarChart3, Globe } from 'lucide-react'
import type { LucideIcon } from 'lucide-react'
import type { ReactNode } from 'react'
import { Reveal } from './reveal'
import { BillingMockup, InventoryMockup, ReportsMockup, OrderingMockup } from './mockups'

type Row = {
  icon: LucideIcon
  eyebrow: string
  title: string
  desc: string
  href: string
  visual: ReactNode
}

const ROWS: Row[] = [
  {
    icon: Receipt,
    eyebrow: 'Billing & POS',
    title: 'A restaurant billing screen that keeps up at peak hours',
    desc: 'Punch orders, generate KOTs, and accept split or merged bills in seconds. Apply discounts and coupons without leaving the billing screen — and keep billing even when the internet drops, for up to 72 hours.',
    href: '/features/billing',
    visual: <BillingMockup />,
  },
  {
    icon: Package,
    eyebrow: 'Inventory',
    title: 'Inventory management that deducts itself',
    desc: 'Recipe-based auto deduction updates stock the moment an order is billed. Low-stock alerts go straight to WhatsApp, and day-end inventory reports catch wastage before it eats your margin.',
    href: '/features/inventory',
    visual: <InventoryMockup />,
  },
  {
    icon: BarChart3,
    eyebrow: 'Reports & Analytics',
    title: 'Real-time reports, without the spreadsheet',
    desc: '12 core reports covering sales, GST, staff activity, and item-wise profitability — updated live, exportable for Tally, and summarized to your WhatsApp every night without you asking.',
    href: '/features/reports',
    visual: <ReportsMockup />,
  },
  {
    icon: Globe,
    eyebrow: 'Online Ordering',
    title: 'Every channel, one queue',
    desc: 'Zomato and Swiggy orders land directly in the same queue as dine-in and takeaway — no re-typing, no separate tablet to babysit. Mark food ready once, and every channel updates.',
    href: '/features/online-ordering',
    visual: <OrderingMockup />,
  },
]

export function FeatureShowcase() {
  return (
    <section className="section bg-ink-50/40">
      <div className="container">
        <Reveal className="mx-auto max-w-2xl text-center">
          <span className="text-sm font-bold uppercase tracking-wide text-primary">
            Smart POS Features
          </span>
          <h2 className="mt-3 text-balance text-3xl font-extrabold tracking-tight text-ink sm:text-4xl">
            A Restaurant POS Made for All Your Needs.
          </h2>
        </Reveal>

        <div className="mt-16 space-y-20">
          {ROWS.map((row, i) => {
            const copy = (
              <div key="copy">
                <span className="grid h-11 w-11 place-items-center rounded-xl bg-primary-50 text-primary">
                  <row.icon size={20} />
                </span>
                <p className="mt-4 text-sm font-bold uppercase tracking-wide text-primary">
                  {row.eyebrow}
                </p>
                <h3 className="mt-2 text-2xl font-extrabold tracking-tight text-ink">
                  {row.title}
                </h3>
                <p className="mt-3 text-ink-500">{row.desc}</p>
                <a
                  href={row.href}
                  className="mt-6 inline-flex items-center gap-2 text-sm font-semibold text-primary"
                >
                  Explore {row.eyebrow}
                  <ArrowRight size={15} />
                </a>
              </div>
            )
            const visual = <div key="visual">{row.visual}</div>

            return (
              <Reveal key={row.title}>
                <div className="grid items-center gap-10 lg:grid-cols-2 lg:gap-16">
                  {i % 2 === 1 ? [visual, copy] : [copy, visual]}
                </div>
              </Reveal>
            )
          })}
        </div>
      </div>
    </section>
  )
}
