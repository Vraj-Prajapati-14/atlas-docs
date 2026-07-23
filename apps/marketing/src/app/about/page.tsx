import type { Metadata } from 'next'
import { Target, Cpu, ShieldCheck, Layers, Cloud, ArrowRight } from 'lucide-react'
import { PageHeader } from '@/components/marketing/page-header'
import { Reveal } from '@/components/marketing/reveal'

export const metadata: Metadata = {
  title: 'About Us',
  description: "Atlas is India's AI-native restaurant operating system — built to make running a restaurant simpler, faster, and more profitable.",
}

const PRINCIPLES = [
  {
    icon: Target,
    title: 'Business First',
    desc: 'Every feature has to solve a real operational problem — not just look good in a demo.',
  },
  {
    icon: Cpu,
    title: 'AI Native',
    desc: 'AI assists decision-making, forecasting, and daily operations from day one — not bolted on later.',
  },
  {
    icon: Layers,
    title: 'Modular by Design',
    desc: 'Billing, CRM, inventory, and reporting are independent, composable capabilities, not one monolith.',
  },
  {
    icon: Cloud,
    title: 'Cloud Native',
    desc: 'Built for horizontal scale and high availability from the ground up.',
  },
  {
    icon: ShieldCheck,
    title: 'Enterprise Ready',
    desc: 'Security, reliability, and observability are requirements, not afterthoughts — even for a single-outlet café.',
  },
]

export default function AboutPage() {
  return (
    <main>
      <PageHeader
        eyebrow="Our Story"
        title="Building the Operating System for Indian Restaurants."
        description="Atlas started with one observation: restaurant owners in India are paying more, for slower software, with worse support, than they should have to."
      />

      <section className="section bg-white">
        <div className="container grid gap-14 lg:grid-cols-2 lg:gap-10">
          <Reveal>
            <h2 className="text-2xl font-extrabold tracking-tight text-ink sm:text-3xl">
              Our Mission
            </h2>
            <p className="mt-4 text-lg text-ink-500">
              Empower restaurant owners to spend less time managing operations
              and more time growing their business — by reducing operational
              complexity through automation, real-time analytics, and
              intuitive workflows.
            </p>
          </Reveal>
          <Reveal delay={0.08}>
            <h2 className="text-2xl font-extrabold tracking-tight text-ink sm:text-3xl">
              Our Vision
            </h2>
            <p className="mt-4 text-lg text-ink-500">
              Atlas isn&apos;t trying to be another point-of-sale system. It&apos;s
              built to eventually manage every side of running a restaurant —
              billing, kitchen, inventory, staff, customers, and the business
              decisions that tie it all together — starting with single-outlet
              restaurants, cloud kitchens, cafés, and growing chains across India.
            </p>
          </Reveal>
        </div>
      </section>

      <section className="section bg-ink-50/40">
        <div className="container">
          <Reveal className="mx-auto max-w-2xl text-center">
            <h2 className="text-balance text-3xl font-extrabold tracking-tight text-ink sm:text-4xl">
              What Guides <span className="text-primary">Every Decision.</span>
            </h2>
          </Reveal>

          <div className="mt-12 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-5">
            {PRINCIPLES.map((p, i) => (
              <Reveal key={p.title} delay={i * 0.05}>
                <div className="h-full rounded-2xl border border-ink-100 bg-white p-5 shadow-soft">
                  <span className="grid h-10 w-10 place-items-center rounded-lg bg-primary-50 text-primary">
                    <p.icon size={18} />
                  </span>
                  <h3 className="mt-3 text-sm font-bold text-ink">{p.title}</h3>
                  <p className="mt-1.5 text-xs leading-relaxed text-ink-500">{p.desc}</p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      <section className="section bg-white">
        <div className="container">
          <Reveal>
            <div className="flex flex-col items-center gap-6 rounded-3xl bg-ink-800 px-6 py-12 text-center shadow-panel sm:flex-row sm:justify-between sm:px-12 sm:text-left">
              <div>
                <h2 className="text-2xl font-extrabold text-white sm:text-3xl">
                  We&apos;re just getting started.
                </h2>
                <p className="mt-2 text-ink-300">
                  Come see what we&apos;re building for restaurant owners across India.
                </p>
              </div>
              <a
                href="/contact"
                className="flex shrink-0 items-center gap-2 rounded-lg bg-primary px-6 py-3.5 text-sm font-semibold text-white transition-colors hover:bg-primary-600"
              >
                Get in Touch
                <ArrowRight size={16} />
              </a>
            </div>
          </Reveal>
        </div>
      </section>
    </main>
  )
}
