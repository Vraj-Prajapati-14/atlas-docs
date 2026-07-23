import {
  Package,
  Calculator,
  Wallet,
  Users,
  BarChart3,
  Sparkles,
  UsersRound,
  ChefHat,
  MessageCircle,
} from 'lucide-react'
import type { LucideIcon } from 'lucide-react'
import { cn } from '@/lib/utils'
import { TabletMockup } from './tablet-mockup'

type Node = {
  label: string
  icon: LucideIcon
  x: number
  y: number
  entryX: number
  entryY: number
  /** Icon tint — varied per module so the panel doesn't read as monotone orange. */
  iconClass: string
  /** WhatsApp gets its own recognizable solid-green badge instead of the dark box. */
  brandBadge?: string
}

// Card occupies x:[34,66] y:[29,71] — node entry points land exactly on its edges.
const NODES: Node[] = [
  {
    label: 'WhatsApp Reports',
    icon: MessageCircle,
    x: 50,
    y: 6,
    entryX: 50,
    entryY: 29,
    iconClass: 'text-white',
    brandBadge: 'bg-[#25D366]',
  },
  { label: 'Inventory & Recipes', icon: Package, x: 8, y: 26, entryX: 34, entryY: 26, iconClass: 'text-primary-400' },
  { label: 'Kitchen & KOT', icon: ChefHat, x: 92, y: 26, entryX: 66, entryY: 26, iconClass: 'text-sky-400' },
  { label: 'POS & Billing', icon: Calculator, x: 8, y: 50, entryX: 34, entryY: 50, iconClass: 'text-primary-400' },
  { label: 'Staff & Payroll', icon: UsersRound, x: 92, y: 50, entryX: 66, entryY: 50, iconClass: 'text-sky-400' },
  { label: 'Payments', icon: Wallet, x: 8, y: 74, entryX: 34, entryY: 74, iconClass: 'text-violet-400' },
  { label: 'AI Business Advisor', icon: Sparkles, x: 92, y: 74, entryX: 66, entryY: 74, iconClass: 'text-violet-400' },
  { label: 'Customers & Loyalty', icon: Users, x: 34, y: 94, entryX: 34, entryY: 71, iconClass: 'text-sky-400' },
  { label: 'Analytics & Reports', icon: BarChart3, x: 66, y: 94, entryX: 66, entryY: 71, iconClass: 'text-sky-400' },
]

function Lines() {
  return (
    <>
      {NODES.map((node) => (
        <line
          key={node.label}
          x1={node.x}
          y1={node.y}
          x2={node.entryX}
          y2={node.entryY}
          strokeLinecap="round"
          vectorEffect="non-scaling-stroke"
        />
      ))}
    </>
  )
}

export function HeroOrbit() {
  return (
    <div className="relative mx-auto hidden aspect-[16/11] w-full max-w-4xl lg:block">
      {/* Glow pass — blurred in real screen-pixel space (CSS blur), so it stays
          correct regardless of the SVG's non-uniform viewBox-to-container scale. */}
      <svg
        className="absolute inset-0 h-full w-full overflow-visible blur-lg"
        viewBox="0 0 100 100"
        preserveAspectRatio="none"
        aria-hidden="true"
      >
        <g stroke="#FF6B35" strokeOpacity="1" strokeWidth="4.5">
          <Lines />
        </g>
      </svg>

      {/* Crisp pass — every connector is purely horizontal or vertical in this
          normalized coordinate space, so it renders as a straight aligned line. */}
      <svg
        className="absolute inset-0 h-full w-full overflow-visible"
        viewBox="0 0 100 100"
        preserveAspectRatio="none"
        aria-hidden="true"
      >
        <g stroke="#FFB088" strokeOpacity="0.9" strokeWidth="1.5">
          <Lines />
        </g>
      </svg>

      {NODES.map((node) => (
        <div
          key={node.label}
          className="absolute flex -translate-x-1/2 -translate-y-1/2 flex-col items-center gap-2"
          style={{ left: `${node.x}%`, top: `${node.y}%` }}
        >
          <div
            className={cn(
              'grid h-12 w-12 place-items-center rounded-xl border shadow-[0_0_18px_-2px_rgba(255,107,53,0.45)]',
              node.brandBadge
                ? cn(node.brandBadge, 'border-white/20')
                : 'border-primary/40 bg-ink-800'
            )}
          >
            <node.icon size={19} className={node.iconClass} strokeWidth={2} />
          </div>
          <span className="whitespace-nowrap text-[11px] font-semibold text-white/80">
            {node.label}
          </span>
        </div>
      ))}

      <TabletMockup
        className="absolute -translate-x-1/2 -translate-y-1/2"
        style={{ left: '50%', top: '50%', width: '32%' }}
      />
    </div>
  )
}
