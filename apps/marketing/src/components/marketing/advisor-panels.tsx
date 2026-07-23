import { Sparkles, MessageCircle, Send } from 'lucide-react'
import { Reveal } from './reveal'

const INTEGRATIONS = [
  'WhatsApp Business',
  'Zomato',
  'Swiggy',
  'UPI · Cards · Cash',
  'GST e-Invoicing',
  'Tally Export',
  'Thermal & Bluetooth Printers',
  '+ more on the way',
]

export function AdvisorPanels() {
  return (
    <section id="solutions" className="section bg-ink-50/40">
      <div className="container grid grid-cols-1 gap-6 lg:grid-cols-3">
        <Reveal>
          <div className="h-full rounded-2xl border border-ink-100 bg-white p-6 shadow-soft">
            <span className="text-xs font-bold uppercase tracking-wide text-primary">
              AI Restaurant Advisor
            </span>
            <h3 className="mt-2 text-xl font-bold text-ink">
              Ask Anything. Get Instant Answers.
            </h3>
            <div className="mt-5 space-y-3">
              <div className="ml-auto max-w-[85%] rounded-2xl rounded-tr-sm bg-ink-100 px-3.5 py-2.5 text-sm text-ink">
                Why is my profit low this week?
              </div>
              <div className="flex max-w-[90%] items-start gap-2 rounded-2xl rounded-tl-sm bg-primary-50 px-3.5 py-2.5 text-sm text-ink-700">
                <Sparkles size={15} className="mt-0.5 shrink-0 text-primary" />
                <span>
                  Tomato prices rose 18%, Paneer margin dropped. Suggested action:
                  raise Paneer Tikka by ₹20 — est. gain ₹18,300/month.
                </span>
              </div>
            </div>
            <div className="mt-4 flex items-center gap-2 rounded-lg border border-ink-100 px-3 py-2">
              <span className="flex-1 text-xs text-ink-400">Ask anything about your business…</span>
              <span className="grid h-7 w-7 place-items-center rounded-full bg-primary text-white">
                <Send size={13} />
              </span>
            </div>
          </div>
        </Reveal>

        <Reveal delay={0.08}>
          <div className="h-full rounded-2xl border border-ink-100 bg-white p-6 shadow-soft">
            <span className="text-xs font-bold uppercase tracking-wide text-success">
              WhatsApp Reports
            </span>
            <h3 className="mt-2 text-xl font-bold text-ink">
              Your Restaurant. In Your WhatsApp.
            </h3>
            <div className="mt-5 rounded-2xl bg-[#DCF8C6] p-4 text-sm text-ink-800 shadow-sm">
              <p className="mb-1 flex items-center gap-1.5 text-xs font-semibold text-success">
                <MessageCircle size={13} /> Atlas Daily Summary
              </p>
              <p>15 July 2026</p>
              <p className="mt-1">
                Total Sales: <strong>₹28,450</strong>
                <br />
                Orders: 87 · Avg: ₹285
                <br />
                Best Seller: Paneer Biryani (34)
                <br />
                Low Stock: Tomatoes, Cream
              </p>
              <p className="mt-2 text-xs text-ink-500">Reply &quot;stock update bhejo&quot;</p>
            </div>
          </div>
        </Reveal>

        <Reveal delay={0.16}>
          <div className="h-full rounded-2xl border border-ink-100 bg-white p-6 shadow-soft">
            <span className="text-xs font-bold uppercase tracking-wide text-info">
              Integrations
            </span>
            <h3 className="mt-2 text-xl font-bold text-ink">Connect Everything That Matters.</h3>
            <div className="mt-5 flex flex-wrap gap-2">
              {INTEGRATIONS.map((item) => (
                <span
                  key={item}
                  className="rounded-full border border-ink-100 bg-ink-50 px-3 py-1.5 text-xs font-medium text-ink-600"
                >
                  {item}
                </span>
              ))}
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  )
}
