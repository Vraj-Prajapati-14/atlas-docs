import { TrendingUp, ChefHat, AlertTriangle, Sparkles } from 'lucide-react'
import { Reveal } from './reveal'

const STATS = [
  {
    label: "Today's Sales",
    value: '₹28,450',
    meta: '+14% vs yesterday',
    metaTone: 'text-success',
    icon: TrendingUp,
    iconTone: 'text-success bg-success/10',
  },
  {
    label: 'Orders',
    value: '87',
    meta: 'Today',
    metaTone: 'text-ink-400',
    icon: TrendingUp,
    iconTone: 'text-info bg-info/10',
  },
  {
    label: 'Kitchen',
    value: '12 Orders',
    meta: 'Preparing now',
    metaTone: 'text-ink-400',
    icon: ChefHat,
    iconTone: 'text-primary bg-primary-50',
  },
  {
    label: 'Low Stock',
    value: 'Tomato',
    meta: '2 kg left',
    metaTone: 'text-danger',
    icon: AlertTriangle,
    iconTone: 'text-danger bg-danger/10',
  },
  {
    label: 'AI Suggestion',
    value: 'Raise Paneer Tikka +₹20',
    meta: '+₹18k/month est.',
    metaTone: 'text-success',
    icon: Sparkles,
    iconTone: 'text-primary bg-primary-50',
  },
]

export function LiveStatsStrip() {
  return (
    <section className="border-y border-ink-100 bg-ink-50/40 py-10">
      <div className="container">
        <Reveal>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-5">
            {STATS.map((stat) => (
              <div
                key={stat.label}
                className="rounded-xl border border-ink-100 bg-white p-4 shadow-soft"
              >
                <div className="mb-3 flex items-center justify-between">
                  <span className={`grid h-8 w-8 place-items-center rounded-lg ${stat.iconTone}`}>
                    <stat.icon size={16} strokeWidth={2.2} />
                  </span>
                  <span className="text-xs font-medium text-ink-400">{stat.label}</span>
                </div>
                <p className="truncate text-lg font-bold text-ink">{stat.value}</p>
                <p className={`text-xs font-semibold ${stat.metaTone}`}>{stat.meta}</p>
              </div>
            ))}
          </div>
        </Reveal>
      </div>
    </section>
  )
}
