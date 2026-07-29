'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import {
  LayoutDashboard, LayoutGrid, ClipboardList, Receipt, ChefHat,
  UtensilsCrossed, Package, ContactRound, BarChart3, Link as LinkIcon,
  Users, Settings, Bell, UserCircle, LogOut, X, Megaphone,
  Menu, ChevronRight, ChevronDown, Plus, ShoppingBag, Bike, Utensils,
} from 'lucide-react'
import * as DropdownMenu from '@radix-ui/react-dropdown-menu'
import { useAuthStore } from '@/lib/auth-store'
import { useLogout } from '@/hooks/use-auth'
import { useUnreadBroadcasts, useDismissBroadcast } from '@/hooks/use-notifications'
import { useStaffUnreadCount } from '@/hooks/use-staff-notifications'
import { Spinner } from '@/components/ui/spinner'
import { ThemeToggle } from '@/components/ui/theme-toggle'
import { cn } from '@/lib/utils'

// ─── Horizontal nav items ─────────────────────────────────────────────────────

const NAV_ITEMS: {
  label: string
  href:  string
  Icon:  React.ElementType
  roles?: string[]
}[] = [
  { label: 'Dashboard',    href: '/dashboard',     Icon: LayoutDashboard },
  { label: 'Floor',        href: '/floor',         Icon: LayoutGrid },
  { label: 'Orders',       href: '/orders',        Icon: ClipboardList },
  { label: 'Billing',      href: '/billing',       Icon: Receipt,                                         roles: ['OWNER', 'MANAGER', 'CASHIER'] },
  { label: 'KDS',          href: '/kds',           Icon: ChefHat,         roles: ['OWNER', 'MANAGER', 'CHEF'] },
  { label: 'Menu',         href: '/menu',          Icon: UtensilsCrossed, roles: ['OWNER', 'MANAGER'] },
  { label: 'Inventory',    href: '/inventory',     Icon: Package,         roles: ['OWNER', 'MANAGER', 'INVENTORY_MANAGER'] },
  { label: 'Customers',    href: '/customers',     Icon: ContactRound,    roles: ['OWNER', 'MANAGER', 'CASHIER'] },
  { label: 'Reports',      href: '/reports',       Icon: BarChart3,       roles: ['OWNER', 'MANAGER', 'CASHIER', 'INVENTORY_MANAGER'] },
  { label: 'Aggregators',  href: '/aggregators',   Icon: LinkIcon,        roles: ['OWNER', 'MANAGER'] },
  { label: 'Staff',        href: '/staff',         Icon: Users,           roles: ['OWNER', 'MANAGER'] },
  { label: 'Settings',     href: '/settings',      Icon: Settings,        roles: ['OWNER', 'MANAGER'] },
  { label: 'Notifications',href: '/notifications', Icon: Bell,            roles: ['OWNER', 'MANAGER'] },
]

// Page title for mobile breadcrumb
const PAGE_TITLES: Record<string, string> = {
  '/dashboard':    'Dashboard',
  '/floor':        'Floor Plan',
  '/orders':       'Orders',
  '/billing':      'Billing',
  '/kds':          'Kitchen Display',
  '/menu':         'Menu',
  '/inventory':    'Inventory',
  '/customers':    'Customers',
  '/reports':      'Reports',
  '/aggregators':  'Aggregators',
  '/staff':        'Staff',
  '/settings':     'Outlet Settings',
  '/notifications':'Notifications',
  '/profile':      'My Profile',
}

function usePageTitle(pathname: string) {
  const key = Object.keys(PAGE_TITLES).find(
    (k) => pathname === k || pathname.startsWith(`${k}/`),
  )
  return key ? PAGE_TITLES[key]! : 'Atlas POS'
}

function timeAgo(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime()
  const mins = Math.floor(diff / 60_000)
  if (mins < 1) return 'just now'
  if (mins < 60) return `${mins}m ago`
  const hrs = Math.floor(mins / 60)
  if (hrs < 24) return `${hrs}h ago`
  return `${Math.floor(hrs / 24)}d ago`
}

// ─── Single horizontal nav icon ───────────────────────────────────────────────

function NavIconItem({
  href, Icon, label, active,
}: {
  href:   string
  Icon:   React.ElementType
  label:  string
  active: boolean
}) {
  return (
    <Link
      href={href}
      className={cn(
        'flex flex-col items-center justify-center gap-[3px]',
        'px-3 h-full min-w-[52px] border-b-2 transition-all duration-100 shrink-0',
        active
          ? 'border-primary-500 text-primary-500 bg-primary-500/[0.06]'
          : 'border-transparent text-muted-foreground hover:text-foreground hover:border-border/60',
      )}
    >
      <Icon size={15} strokeWidth={active ? 2.5 : 1.8} />
      <span className={cn(
        'text-[9px] font-semibold leading-none whitespace-nowrap tracking-wide',
        active ? 'text-primary-500' : 'text-muted-foreground/60',
      )}>
        {label}
      </span>
    </Link>
  )
}

// ─── New Order dropdown ───────────────────────────────────────────────────────

function NewOrderButton() {
  const router = useRouter()

  return (
    <DropdownMenu.Root>
      <DropdownMenu.Trigger asChild>
        <button className={cn(
          'flex items-center gap-1.5 h-8 pl-3 pr-2.5 rounded-lg shrink-0',
          'bg-primary-500 hover:bg-primary-600 text-white',
          'text-[12px] font-bold transition-colors outline-none',
        )}>
          <Plus size={13} strokeWidth={2.5} />
          New Order
          <ChevronDown size={11} className="opacity-70" />
        </button>
      </DropdownMenu.Trigger>

      <DropdownMenu.Portal>
        <DropdownMenu.Content
          align="start"
          sideOffset={8}
          className="z-50 w-44 rounded-xl border border-border bg-background-card shadow-2xl shadow-black/20 p-1 animate-fade-in"
        >
          <DropdownMenu.Item
            onSelect={() => router.push('/floor')}
            className="flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-[13px] cursor-pointer outline-none text-muted-foreground hover:text-foreground hover:bg-background-hover transition-colors"
          >
            <div className="w-6 h-6 rounded-md bg-success/15 flex items-center justify-center shrink-0">
              <Utensils size={12} className="text-success" />
            </div>
            Dine In
          </DropdownMenu.Item>
          <DropdownMenu.Item
            onSelect={() => router.push('/orders?new=takeaway')}
            className="flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-[13px] cursor-pointer outline-none text-muted-foreground hover:text-foreground hover:bg-background-hover transition-colors"
          >
            <div className="w-6 h-6 rounded-md bg-info/15 flex items-center justify-center shrink-0">
              <ShoppingBag size={12} className="text-info" />
            </div>
            Take Away
          </DropdownMenu.Item>
          <DropdownMenu.Item
            onSelect={() => router.push('/orders?new=delivery')}
            className="flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-[13px] cursor-pointer outline-none text-muted-foreground hover:text-foreground hover:bg-background-hover transition-colors"
          >
            <div className="w-6 h-6 rounded-md bg-primary-500/15 flex items-center justify-center shrink-0">
              <Bike size={12} className="text-primary-500" />
            </div>
            Delivery
          </DropdownMenu.Item>
        </DropdownMenu.Content>
      </DropdownMenu.Portal>
    </DropdownMenu.Root>
  )
}

// ─── Notification bell ────────────────────────────────────────────────────────

function NotificationBell() {
  const router = useRouter()
  const { data: broadcasts = [], isLoading } = useUnreadBroadcasts()
  const { data: staffCount } = useStaffUnreadCount()
  const dismiss = useDismissBroadcast()
  const count = broadcasts.length + (staffCount?.unread ?? 0)

  return (
    <DropdownMenu.Root>
      <DropdownMenu.Trigger asChild>
        <button
          aria-label={count > 0 ? `${count} unread notifications` : 'Notifications'}
          className={cn(
            'relative flex items-center justify-center w-8 h-8 rounded-xl shrink-0',
            'text-muted-foreground hover:text-foreground',
            'bg-background-hover/50 hover:bg-background-hover border border-border/60 hover:border-border',
            'transition-all duration-100 outline-none',
          )}
        >
          <Bell size={14} />
          {count > 0 && (
            <span className="absolute -top-1 -right-1 flex items-center justify-center min-w-[15px] h-[15px] px-1 rounded-full bg-primary-500 text-white text-[8px] font-bold leading-none">
              {count > 9 ? '9+' : count}
            </span>
          )}
        </button>
      </DropdownMenu.Trigger>

      <DropdownMenu.Portal>
        <DropdownMenu.Content
          align="end"
          sideOffset={8}
          className="z-50 w-[300px] rounded-xl border border-border bg-background-card shadow-2xl shadow-black/20 animate-fade-in overflow-hidden"
        >
          <div className="flex items-center justify-between px-4 py-3 border-b border-border">
            <div className="flex items-center gap-2">
              <Bell size={13} className="text-primary-500" />
              <span className="text-xs font-bold">Notifications</span>
              {count > 0 && (
                <span className="px-1.5 py-0.5 rounded-full bg-primary-500/15 text-primary-500 text-[9px] font-bold">
                  {count}
                </span>
              )}
            </div>
            <DropdownMenu.Item
              onSelect={() => router.push('/notifications')}
              className="flex items-center gap-1 text-[11px] text-primary-500 hover:underline font-semibold cursor-pointer outline-none"
            >
              View all <ChevronRight size={11} />
            </DropdownMenu.Item>
          </div>
          <div className="max-h-64 overflow-y-auto">
            {isLoading ? (
              <div className="flex items-center justify-center py-8">
                <Spinner size="sm" className="text-primary-500" />
              </div>
            ) : broadcasts.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-8 gap-2 text-muted-foreground">
                <Bell size={24} className="opacity-15" />
                <p className="text-xs font-medium">All caught up!</p>
              </div>
            ) : (
              <div className="divide-y divide-border/60">
                {broadcasts.map((b) => (
                  <div key={b.id} className="flex items-start gap-3 px-4 py-3 hover:bg-background-hover/40 group transition-colors">
                    <div className="flex items-center justify-center w-7 h-7 rounded-lg bg-primary-500/10 border border-primary-500/15 shrink-0 mt-0.5">
                      <Megaphone size={12} className="text-primary-500" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-semibold text-foreground leading-snug">{b.title}</p>
                      <p className="text-[11px] text-muted-foreground mt-0.5 line-clamp-2 leading-relaxed">{b.body}</p>
                      <p className="text-[10px] text-muted-foreground/40 mt-1">{timeAgo(b.createdAt)}</p>
                    </div>
                    <button
                      type="button"
                      onClick={(e) => { e.preventDefault(); dismiss.mutate(b.id) }}
                      disabled={dismiss.isPending}
                      aria-label="Dismiss"
                      className="opacity-0 group-hover:opacity-100 p-1 rounded text-muted-foreground hover:text-foreground hover:bg-background-hover transition-all mt-0.5 shrink-0"
                    >
                      <X size={11} />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </DropdownMenu.Content>
      </DropdownMenu.Portal>
    </DropdownMenu.Root>
  )
}

// ─── User menu ────────────────────────────────────────────────────────────────

function UserMenu() {
  const router = useRouter()
  const user   = useAuthStore((s) => s.user)
  const logout = useLogout()

  if (!user) return null

  return (
    <DropdownMenu.Root>
      <DropdownMenu.Trigger asChild>
        <button
          className={cn(
            'flex items-center gap-1.5 pl-1.5 pr-2.5 py-1 rounded-xl shrink-0',
            'bg-background-hover/50 hover:bg-background-hover border border-border/60 hover:border-border',
            'text-muted-foreground hover:text-foreground',
            'transition-all duration-100 outline-none',
          )}
        >
          <div className="flex items-center justify-center w-6 h-6 rounded-full bg-primary-500/20 text-primary-500 text-[11px] font-bold shrink-0">
            {user.name.charAt(0).toUpperCase()}
          </div>
          <span className="hidden sm:block text-[11px] font-semibold text-foreground">
            {user.name.split(' ')[0]}
          </span>
          <ChevronDown size={10} className="hidden sm:block text-muted-foreground/60" />
        </button>
      </DropdownMenu.Trigger>

      <DropdownMenu.Portal>
        <DropdownMenu.Content
          align="end"
          sideOffset={8}
          className="z-50 min-w-[200px] rounded-xl border border-border bg-background-card shadow-2xl shadow-black/20 p-1 animate-fade-in"
        >
          <div className="px-3 py-2.5 mb-0.5">
            <div className="flex items-center gap-2.5">
              <div className="flex items-center justify-center w-9 h-9 rounded-full bg-primary-500/15 text-primary-500 text-sm font-bold shrink-0">
                {user.name.charAt(0).toUpperCase()}
              </div>
              <div className="min-w-0">
                <p className="text-xs font-semibold text-foreground truncate">{user.name}</p>
                <p className="text-[10px] text-muted-foreground truncate">{user.email ?? user.phone}</p>
                <p className="text-[9px] font-bold uppercase tracking-wide text-primary-500/70 mt-0.5">{user.role}</p>
              </div>
            </div>
          </div>
          <div className="my-1 border-t border-border/60" />
          <DropdownMenu.Item
            onSelect={() => router.push('/profile')}
            className="flex items-center gap-2.5 px-3 py-2 rounded-lg text-[13px] cursor-pointer outline-none text-muted-foreground hover:text-foreground hover:bg-background-hover transition-colors"
          >
            <UserCircle size={14} className="shrink-0" /> My Profile
          </DropdownMenu.Item>
          {(user.role === 'OWNER' || user.role === 'MANAGER') && (
            <DropdownMenu.Item
              onSelect={() => router.push('/settings')}
              className="flex items-center gap-2.5 px-3 py-2 rounded-lg text-[13px] cursor-pointer outline-none text-muted-foreground hover:text-foreground hover:bg-background-hover transition-colors"
            >
              <Settings size={14} className="shrink-0" /> Outlet Settings
            </DropdownMenu.Item>
          )}
          <div className="my-1 border-t border-border/60" />
          <DropdownMenu.Item
            onSelect={() => logout.mutate()}
            disabled={logout.isPending}
            className="flex items-center gap-2.5 px-3 py-2 rounded-lg text-[13px] cursor-pointer outline-none text-danger hover:bg-danger/10 transition-colors disabled:opacity-50"
          >
            {logout.isPending ? <Spinner size="xs" /> : <LogOut size={14} className="shrink-0" />}
            Sign out
          </DropdownMenu.Item>
        </DropdownMenu.Content>
      </DropdownMenu.Portal>
    </DropdownMenu.Root>
  )
}

// ─── TopBar ───────────────────────────────────────────────────────────────────

interface TopBarProps {
  onMenuClick: () => void
}

export function TopBar({ onMenuClick }: TopBarProps) {
  const pathname = usePathname()
  const title    = usePageTitle(pathname)
  const role     = useAuthStore((s) => s.user?.role) ?? ''

  const visibleNav = NAV_ITEMS.filter(
    (item) => !item.roles || item.roles.includes(role),
  )

  return (
    <header className="flex items-center h-[58px] shrink-0 border-b border-border bg-background">

      {/* ── Left: Hamburger + Logo + New Order ─────────────────────────── */}
      <div className="flex items-center gap-2 px-3 shrink-0 border-r border-border h-full">
        {/* Hamburger — always visible (opens sidebar drawer) */}
        <button
          type="button"
          onClick={onMenuClick}
          aria-label="Open navigation"
          className="flex items-center justify-center w-8 h-8 rounded-lg text-muted-foreground hover:text-foreground hover:bg-background-hover transition-colors shrink-0"
        >
          <Menu size={17} />
        </button>

        {/* Logo */}
        <Link href="/dashboard" className="flex items-center gap-2 shrink-0">
          <div className="flex items-center justify-center w-7 h-7 rounded-lg bg-primary-500 shrink-0">
            <svg width="16" height="16" viewBox="0 0 28 28" fill="none" aria-hidden>
              <path d="M7 20V10l7-3 7 3v10l-7 3-7-3z" stroke="white" strokeWidth="1.5" fill="none" />
              <path d="M14 7v16M7 10l7 4 7-4" stroke="white" strokeWidth="1.5" fill="none" />
            </svg>
          </div>
          <span className="hidden sm:block font-extrabold text-[14px] tracking-tight leading-none">
            <span className="text-primary-500">Atlas</span>
            <span className="text-foreground"> POS</span>
          </span>
        </Link>

        {/* New Order CTA */}
        <NewOrderButton />
      </div>

      {/* ── Center: Horizontal nav (desktop) ───────────────────────────── */}
      <nav
        className="hidden md:flex flex-1 items-stretch h-full overflow-x-auto"
        style={{ scrollbarWidth: 'none' }}
      >
        {visibleNav.map((item) => {
          const active = pathname === item.href || pathname.startsWith(`${item.href}/`)
          return (
            <NavIconItem
              key={item.href}
              href={item.href}
              Icon={item.Icon}
              label={item.label}
              active={active}
            />
          )
        })}
      </nav>

      {/* ── Mobile page title (hidden on md+) ──────────────────────────── */}
      <div className="md:hidden flex-1 min-w-0 px-3">
        <p className="text-[13px] font-bold text-foreground truncate">{title}</p>
      </div>

      {/* ── Right: Theme + Bell + User ─────────────────────────────────── */}
      <div className="flex items-center gap-1.5 px-3 shrink-0 border-l border-border h-full">
        <ThemeToggle />
        <NotificationBell />
        <UserMenu />
      </div>
    </header>
  )
}
