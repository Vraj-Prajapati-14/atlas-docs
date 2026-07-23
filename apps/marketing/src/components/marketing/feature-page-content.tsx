import { ArrowRight, Check } from 'lucide-react'
import { Reveal } from './reveal'
import { FaqAccordion } from './faq-accordion'
import { FinalCta } from './final-cta'
import type { FeaturePageConfig } from './feature-page-types'
import { FEATURE_PAGES } from './feature-pages-data'

export function FeaturePageContent({ config }: { config: FeaturePageConfig }) {
  const otherPages = FEATURE_PAGES.filter((p) => p.slug !== config.slug)

  return (
    <main>
      <section className="relative overflow-hidden bg-white pb-16 pt-16 sm:pb-20 sm:pt-20">
        <div
          className="pointer-events-none absolute inset-x-0 top-0 h-[420px] bg-grid-pattern bg-grid opacity-50 [mask-image:linear-gradient(to_bottom,black,transparent)]"
          aria-hidden="true"
        />
        <div className="container relative grid items-center gap-12 lg:grid-cols-2 lg:gap-16">
          <Reveal>
            <span className="text-sm font-bold uppercase tracking-wide text-primary">
              {config.eyebrow}
            </span>
            <h1 className="mt-3 text-balance text-4xl font-extrabold tracking-tight text-ink sm:text-5xl">
              {config.headline}
            </h1>
            <p className="mt-5 max-w-lg text-lg text-ink-500">{config.subheadline}</p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <a
                href="/#pricing"
                className="rounded-lg bg-primary px-7 py-3.5 text-center text-base font-semibold text-white shadow-card transition-transform hover:-translate-y-0.5 hover:bg-primary-600"
              >
                Start Free Trial
              </a>
              <a
                href="/contact"
                className="rounded-lg border border-ink-200 px-7 py-3.5 text-center text-base font-semibold text-ink transition-colors hover:border-ink-300 hover:bg-ink-50"
              >
                Take a Free Demo
              </a>
            </div>
          </Reveal>
          <Reveal delay={0.1}>{config.visual}</Reveal>
        </div>
      </section>

      <section id="features" className="section bg-ink-50/40">
        <div className="container">
          <Reveal className="mx-auto max-w-2xl text-center">
            <h2 className="text-balance text-3xl font-extrabold tracking-tight text-ink sm:text-4xl">
              Everything You Need, Built In.
            </h2>
          </Reveal>
          <div className="mt-12 grid grid-cols-1 gap-5 sm:grid-cols-2">
            {config.capabilities.map((cap, i) => (
              <Reveal key={cap.title} delay={i * 0.05}>
                <div className="flex h-full gap-4 rounded-2xl border border-ink-100 bg-white p-6 shadow-soft">
                  <span className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-primary-50 text-primary">
                    <cap.icon size={20} />
                  </span>
                  <div>
                    <h3 className="font-bold text-ink">{cap.title}</h3>
                    <p className="mt-1 text-sm text-ink-500">{cap.desc}</p>
                  </div>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      <section className="section bg-white">
        <div className="container">
          <Reveal className="mx-auto max-w-2xl text-center">
            <span className="text-sm font-bold uppercase tracking-wide text-primary">
              Quick & Simple
            </span>
            <h2 className="mt-3 text-balance text-3xl font-extrabold tracking-tight text-ink sm:text-4xl">
              No Friction, No Fine Print.
            </h2>
          </Reveal>
          <Reveal delay={0.1}>
            <div className="mx-auto mt-10 grid max-w-3xl grid-cols-1 gap-3 sm:grid-cols-2">
              {config.highlights.map((h) => (
                <div
                  key={h}
                  className="flex items-start gap-2.5 rounded-xl border border-ink-100 px-4 py-3.5 text-sm text-ink-600"
                >
                  <Check size={16} className="mt-0.5 shrink-0 text-primary" />
                  {h}
                </div>
              ))}
            </div>
          </Reveal>
        </div>
      </section>

      <section className="bg-ink-900 py-14">
        <div className="container">
          <Reveal className="grid grid-cols-1 gap-8 text-center sm:grid-cols-3">
            {config.stats.map((s) => (
              <div key={s.label}>
                <p className="text-4xl font-extrabold text-primary">{s.value}</p>
                <p className="mt-2 text-sm font-medium text-white/70">{s.label}</p>
              </div>
            ))}
          </Reveal>
        </div>
      </section>

      <section className="section bg-ink-50/40">
        <div className="container">
          <Reveal className="mx-auto max-w-2xl text-center">
            <h2 className="text-balance text-3xl font-extrabold tracking-tight text-ink sm:text-4xl">
              Do a Lot More With Atlas.
            </h2>
          </Reveal>
          <div className="mt-10 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5">
            {otherPages.map((page, i) => (
              <Reveal key={page.slug} delay={i * 0.04}>
                <a
                  href={`/features/${page.slug}`}
                  className="flex h-full flex-col items-center gap-2 rounded-xl border border-ink-100 bg-white p-5 text-center shadow-soft transition-colors hover:border-primary-200 hover:bg-primary-50/30"
                >
                  <p className="text-sm font-bold text-ink">{page.navLabel}</p>
                  <span className="inline-flex items-center gap-1 text-xs font-semibold text-primary">
                    Explore
                    <ArrowRight size={12} />
                  </span>
                </a>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      <section className="section bg-white">
        <div className="container max-w-2xl">
          <Reveal className="text-center">
            <h2 className="text-balance text-3xl font-extrabold tracking-tight text-ink sm:text-4xl">
              Questions, <span className="text-primary">Answered.</span>
            </h2>
          </Reveal>
          <Reveal delay={0.1} className="mt-10">
            <FaqAccordion items={config.faqs} />
          </Reveal>
        </div>
      </section>

      <FinalCta />
    </main>
  )
}
