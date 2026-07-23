import { Reveal } from './reveal'

export function FinalCta() {
  return (
    <section className="pb-20 pt-4 sm:pb-24">
      <div className="container">
        <Reveal>
          <div className="flex flex-col items-center gap-6 rounded-3xl bg-ink-800 px-6 py-12 text-center shadow-panel sm:flex-row sm:justify-between sm:px-12 sm:text-left">
            <div>
              <h2 className="text-2xl font-extrabold text-white sm:text-3xl">
                Ready to Transform Your Restaurant?
              </h2>
              <p className="mt-2 text-ink-300">
                Start free. No credit card. Live in under 30 minutes.
              </p>
            </div>
            <div className="flex w-full flex-col gap-3 sm:w-auto sm:flex-row">
              <a
                href="/#pricing"
                className="rounded-lg bg-primary px-6 py-3.5 text-center text-sm font-semibold text-white transition-colors hover:bg-primary-600"
              >
                Start Free Trial
              </a>
              <a
                href="/contact"
                className="rounded-lg border border-white/20 px-6 py-3.5 text-center text-sm font-semibold text-white transition-colors hover:bg-white/10"
              >
                Book Live Demo
              </a>
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  )
}
