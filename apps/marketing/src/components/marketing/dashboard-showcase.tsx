import { Activity, Globe, Building2, ArrowRight } from 'lucide-react'
import { Reveal } from './reveal'

const BULLETS = [
  { icon: Activity, title: 'Live Dashboard', desc: 'Track sales, orders, and stock in real time.' },
  { icon: Globe, title: 'Access Anywhere', desc: 'Works on mobile, tablet, and desktop.' },
  { icon: Building2, title: 'Multi-Outlet Management', desc: 'Manage every outlet from one place.' },
]

const BARS = [42, 58, 38, 70, 54, 82, 64]

export function DashboardShowcase() {
  return (
    <section className="section bg-white">
      <div className="container grid items-center gap-14 lg:grid-cols-2 lg:gap-10">
        <Reveal>
          <span className="text-sm font-bold uppercase tracking-wide text-primary">
            All-in-One Dashboard
          </span>
          <h2 className="mt-3 text-balance text-3xl font-extrabold tracking-tight text-ink sm:text-4xl">
            Everything You Need. Right Where You Need It.
          </h2>
          <p className="mt-4 max-w-md text-lg text-ink-500">
            Real-time insights, simplified workflows, and complete control of
            your restaurant — on any device.
          </p>

          <ul className="mt-8 space-y-5">
            {BULLETS.map((bullet) => (
              <li key={bullet.title} className="flex items-start gap-4">
                <span className="grid h-10 w-10 shrink-0 place-items-center rounded-lg bg-primary-50 text-primary">
                  <bullet.icon size={18} />
                </span>
                <div>
                  <p className="font-semibold text-ink">{bullet.title}</p>
                  <p className="text-sm text-ink-500">{bullet.desc}</p>
                </div>
              </li>
            ))}
          </ul>

          <a
            href="/#features"
            className="mt-9 inline-flex items-center gap-2 rounded-lg bg-primary px-6 py-3 text-sm font-semibold text-white shadow-card transition-transform hover:-translate-y-0.5 hover:bg-primary-600"
          >
            Explore All Features
            <ArrowRight size={16} />
          </a>
        </Reveal>

        <Reveal delay={0.1}>
          <div className="overflow-hidden rounded-2xl border border-ink-100 bg-ink-50/50 shadow-panel">
            <div className="flex items-center gap-1.5 border-b border-ink-100 bg-white px-4 py-3">
              <span className="h-2.5 w-2.5 rounded-full bg-danger/60" />
              <span className="h-2.5 w-2.5 rounded-full bg-warning/60" />
              <span className="h-2.5 w-2.5 rounded-full bg-success/60" />
              <span className="ml-3 text-xs font-medium text-ink-400">app.atlas.in/dashboard</span>
            </div>

            <div className="grid grid-cols-[56px_1fr] sm:grid-cols-[72px_1fr]">
              <div className="flex flex-col items-center gap-4 border-r border-ink-100 bg-white py-5">
                {['Dashboard', 'POS', 'Orders', 'Kitchen', 'Inventory', 'Reports'].map((item, i) => (
                  <span
                    key={item}
                    className={`h-2 w-6 rounded-full ${i === 0 ? 'bg-primary' : 'bg-ink-100'}`}
                    aria-hidden="true"
                  />
                ))}
              </div>

              <div className="p-4 sm:p-6">
                <div className="mb-4 grid grid-cols-2 gap-3 sm:grid-cols-4">
                  {[
                    { l: "Today's Sales", v: '₹28,450' },
                    { l: 'Orders', v: '87' },
                    { l: 'Avg Order', v: '₹285' },
                    { l: 'New Customers', v: '23' },
                  ].map((k) => (
                    <div key={k.l} className="rounded-lg border border-ink-100 bg-white p-3">
                      <p className="truncate text-[10px] font-medium text-ink-400">{k.l}</p>
                      <p className="text-sm font-bold text-ink">{k.v}</p>
                    </div>
                  ))}
                </div>

                <div className="rounded-lg border border-ink-100 bg-white p-4">
                  <p className="mb-3 text-xs font-semibold text-ink-500">Sales Overview</p>
                  <div className="flex h-24 items-end gap-2">
                    {BARS.map((h, i) => (
                      <div
                        key={i}
                        className="flex-1 rounded-t bg-primary-100"
                        style={{ height: `${h}%` }}
                      >
                        <div
                          className="h-1/2 w-full rounded-t bg-primary/70"
                          style={{ marginTop: `${100 - h / 2}%` }}
                        />
                      </div>
                    ))}
                  </div>
                </div>

                <div className="mt-3 space-y-2">
                  {[
                    { t: 'Table 4', s: 'Preparing', c: 'text-warning bg-warning/10' },
                    { t: 'Table 7', s: 'Ready', c: 'text-success bg-success/10' },
                  ].map((row) => (
                    <div
                      key={row.t}
                      className="flex items-center justify-between rounded-lg border border-ink-100 bg-white px-3 py-2 text-xs"
                    >
                      <span className="font-medium text-ink">{row.t}</span>
                      <span className={`rounded-full px-2 py-0.5 font-semibold ${row.c}`}>{row.s}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  )
}
