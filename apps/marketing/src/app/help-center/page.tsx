import type { Metadata } from 'next'
import { PageHeader } from '@/components/marketing/page-header'
import { FaqAccordion } from '@/components/marketing/faq-accordion'
import { Reveal } from '@/components/marketing/reveal'

export const metadata: Metadata = {
  title: 'Help Center',
  description: 'Answers to common questions about setup, billing, offline mode, integrations, and support.',
}

const GROUPS = [
  {
    title: 'Getting Started',
    items: [
      {
        q: 'How long does it take to go live?',
        a: 'Most single-outlet restaurants are billing their first order within 30 minutes — enter your restaurant details, add your first menu item and table, and you\'re ready. Full menu import and staff setup can continue afterward without blocking billing.',
      },
      {
        q: 'Can I import my existing menu?',
        a: 'Yes — import via Excel/CSV, or add items manually one at a time. Our onboarding team can help with the initial import.',
      },
      {
        q: 'Do I need to buy new hardware?',
        a: 'No. Atlas works with the thermal, Bluetooth, and LAN printers, tablets, and Android devices you already own — no proprietary hardware lock-in.',
      },
      {
        q: 'Can I switch from my current POS?',
        a: 'Yes. Our team will help migrate your menu, tables, and staff data during onboarding.',
      },
    ],
  },
  {
    title: 'Billing & Pricing',
    items: [
      {
        q: 'Is the kitchen display (KDS) really included?',
        a: 'Yes — on every paid plan, not sold as a separate add-on. Any Android tablet can run it.',
      },
      {
        q: 'What payment methods does Atlas support?',
        a: 'UPI, cards, and cash out of the box, reconciled automatically into your daily sales reports.',
      },
      {
        q: 'Are there hidden fees or paid add-ons?',
        a: 'No. The price on our pricing page is the full price — KDS, WhatsApp reports, and offline billing are included, not upsells.',
      },
      {
        q: 'Is there a free plan?',
        a: 'Yes — the Free plan supports up to 50 bills/day with no credit card required, so you can try Atlas before committing.',
      },
    ],
  },
  {
    title: 'Reliability & Offline Mode',
    items: [
      {
        q: 'What happens if my internet goes down?',
        a: 'Atlas keeps billing, KOT printing, and order-taking working for up to 72 hours offline. Everything syncs automatically the moment your connection is back.',
      },
      {
        q: 'What if my printer isn\'t connected?',
        a: 'You can still take orders and generate digital bills — printing resumes automatically once the printer reconnects.',
      },
    ],
  },
  {
    title: 'Integrations',
    items: [
      {
        q: 'Does Atlas connect to Zomato and Swiggy?',
        a: 'Yes — Zomato and Swiggy orders sync directly into your unified order queue alongside dine-in and takeaway orders.',
      },
      {
        q: 'Can I export reports to Tally?',
        a: 'Yes, sales and GST reports can be exported in a Tally-compatible format.',
      },
    ],
  },
  {
    title: 'Support',
    items: [
      {
        q: 'How do I reach support?',
        a: 'WhatsApp first — message us anytime. You can also call, email, or use the Contact page for a callback.',
      },
    ],
  },
]

export default function HelpCenterPage() {
  return (
    <main>
      <PageHeader
        eyebrow="Help Center"
        title="How Can We Help?"
        description="Answers to the questions restaurant owners ask us most."
      />

      <section className="section bg-white">
        <div className="container max-w-3xl space-y-14">
          {GROUPS.map((group, gi) => (
            <Reveal key={group.title} delay={gi * 0.05}>
              <h2 className="mb-4 text-xl font-bold text-ink">{group.title}</h2>
              <FaqAccordion items={group.items} defaultOpenIndex={null} />
            </Reveal>
          ))}

          <Reveal delay={0.3} className="rounded-2xl border border-ink-100 bg-ink-50/40 p-6 text-center">
            <p className="font-semibold text-ink">Still stuck?</p>
            <p className="mt-1 text-sm text-ink-500">
              Reach us on WhatsApp or request a callback from our{' '}
              <a href="/contact" className="font-semibold text-primary">
                Contact page
              </a>
              .
            </p>
          </Reveal>
        </div>
      </section>
    </main>
  )
}
