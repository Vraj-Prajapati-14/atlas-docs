import { TrendingUp } from 'lucide-react'
import { cn } from '@/lib/utils'

const SPARKLINE = '0,24 14,20 28,22 42,11 56,15 70,4 100,9'

export function TabletMockup({
  className,
  style,
}: {
  className?: string
  style?: React.CSSProperties
}) {
  return (
    <div
      className={cn('rounded-[1.75rem] border border-white/10 bg-ink-900 p-2.5 shadow-panel', className)}
      style={style}
    >
      <div className="mx-auto mb-2 h-1 w-10 rounded-full bg-white/10" />
      <div className="rounded-xl bg-ink-800 p-4">
        <div className="mb-3 flex items-center justify-between">
          <span className="flex items-center gap-1.5 text-[11px] font-semibold text-white/70">
            <span className="h-2 w-2 rounded-full bg-success" />
            Atlas — Live
          </span>
          <TrendingUp size={14} className="text-success" />
        </div>

        <p className="text-[11px] font-medium text-white/50">Today&apos;s Sales</p>
        <p className="price text-2xl font-bold text-white">
          ₹28,450 <span className="text-xs font-semibold text-success">+14%</span>
        </p>

        <svg viewBox="0 0 100 30" preserveAspectRatio="none" className="mt-2 h-8 w-full" aria-hidden="true">
          <polyline
            points={SPARKLINE}
            fill="none"
            stroke="#22C55E"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            vectorEffect="non-scaling-stroke"
          />
        </svg>

        <div className="mt-3 grid grid-cols-3 gap-2 border-t border-white/10 pt-3">
          <div>
            <p className="text-[9px] font-medium text-white/40">Orders</p>
            <p className="text-sm font-bold text-white">87</p>
          </div>
          <div>
            <p className="truncate text-[9px] font-medium text-white/40">Avg Order</p>
            <p className="text-sm font-bold text-white">₹285</p>
          </div>
          <div>
            <p className="truncate text-[9px] font-medium text-white/40">New Cust.</p>
            <p className="text-sm font-bold text-white">23</p>
          </div>
        </div>
      </div>
    </div>
  )
}
