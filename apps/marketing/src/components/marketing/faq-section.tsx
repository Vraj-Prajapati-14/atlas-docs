import { Reveal } from './reveal'
import { FaqAccordion, type FaqItem } from './faq-accordion'

export const HOME_FAQS: FaqItem[] = [
  {
    q: 'How long does it take to go live?',
    a: 'Most single-outlet restaurants are billing their first order within 30 minutes — enter your restaurant details, add your first menu item and table, and you\'re ready. Full menu import and staff setup can continue afterward without blocking billing.',
  },
  {
    q: 'What happens if my internet goes down?',
    a: 'Atlas keeps billing, KOT printing, and order-taking working for up to 72 hours offline. Everything syncs automatically the moment your connection is back.',
  },
  {
    q: 'Do I need to buy new hardware?',
    a: 'No. Atlas works with the printers, tablets, and Android devices you already own — no proprietary hardware lock-in.',
  },
  {
    q: 'Is the kitchen display (KDS) really included?',
    a: 'Yes — on every plan, not sold as a separate add-on. Any Android tablet can run it.',
  },
  {
    q: 'Can I switch from my current POS?',
    a: 'Yes. Our team will help migrate your menu, tables, and staff data during onboarding.',
  },
]

export function FaqSection() {
  return (
    <section id="faq" className="section bg-white">
      <div className="container">
        <Reveal className="mx-auto max-w-2xl text-center">
          <h2 className="text-balance text-3xl font-extrabold tracking-tight text-ink sm:text-4xl">
            Questions, <span className="text-primary">Answered.</span>
          </h2>
          <p className="mt-4 text-lg text-ink-500">
            More in our <a href="/help-center" className="font-semibold text-primary">Help Center</a>.
          </p>
        </Reveal>

        <Reveal delay={0.1} className="mx-auto mt-12 max-w-2xl">
          <FaqAccordion items={HOME_FAQS} />
        </Reveal>
      </div>
    </section>
  )
}
