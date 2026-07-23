import { Star, ShieldCheck, Clock } from 'lucide-react'
import { HeroOrbit } from './hero-orbit'
import { TabletMockup } from './tablet-mockup'
import { HeroVisualPanel } from './hero-visual-panel'

export function Hero() {
  return (
    <section id="top" className="relative overflow-hidden bg-white pb-20 pt-14 sm:pb-24 sm:pt-16">
      <div
        className="pointer-events-none absolute inset-0 bg-radial-fade"
        aria-hidden="true"
      />
      <div
        className="pointer-events-none absolute inset-x-0 top-0 h-[560px] bg-grid-pattern bg-grid opacity-60 [mask-image:linear-gradient(to_bottom,black,transparent)]"
        aria-hidden="true"
      />

      <div className="container relative">
        <div className="mx-auto max-w-3xl text-center">
          <span className="inline-flex items-center gap-2 rounded-full border border-primary-200 bg-primary-50 px-4 py-1.5 text-xs font-semibold text-primary-700">
            🔥 India&apos;s AI-Native Restaurant Operating System
          </span>

          <h1 className="mt-6 text-balance text-4xl font-extrabold leading-[1.1] tracking-tight text-ink sm:text-5xl lg:text-6xl">
            Run Your Entire Restaurant.
            <br />
            <span className="text-primary">From One Intelligent Platform.</span>
          </h1>

          <p className="mx-auto mt-6 max-w-xl text-balance text-lg text-ink-500">
            Billing, kitchen, inventory, staff, customers, and AI — everything
            connected, everything under ₹1,999/month. No hidden add-ons.
          </p>

          <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <a
              href="/#pricing"
              className="w-full rounded-lg bg-primary px-7 py-3.5 text-center text-base font-semibold text-white shadow-card transition-transform hover:-translate-y-0.5 hover:bg-primary-600 sm:w-auto"
            >
              Start Free Trial
            </a>
            <a
              href="/contact"
              className="w-full rounded-lg border border-ink-200 px-7 py-3.5 text-center text-base font-semibold text-ink transition-colors hover:border-ink-300 hover:bg-ink-50 sm:w-auto"
            >
              Book Live Demo
            </a>
          </div>

          <div className="mt-6 flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-sm text-ink-400">
            <span className="flex items-center gap-1.5">
              <Star size={15} className="fill-warning text-warning" />
              Transparent pricing, listed right here
            </span>
            <span className="flex items-center gap-1.5">
              <ShieldCheck size={15} className="text-success" />
              No credit card required
            </span>
            <span className="flex items-center gap-1.5">
              <Clock size={15} className="text-primary" />
              Guided setup in under 30 minutes
            </span>
          </div>
        </div>
      </div>

      {/* Full-bleed — breaks out of `container` so the bokeh background runs edge-to-edge. */}
      <div className="relative left-1/2 mt-14 w-screen -translate-x-1/2 sm:mt-16">
        <HeroVisualPanel>
          <HeroOrbit />
          {/* Compact mobile/tablet fallback — full orbit diagram is desktop-only */}
          <TabletMockup className="mx-auto w-full max-w-xs lg:hidden" />
        </HeroVisualPanel>
      </div>
    </section>
  )
}
