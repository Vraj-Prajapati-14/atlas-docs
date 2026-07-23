'use client'

import { usePathname, useRouter } from 'next/navigation'
import { LogOut, Bell, X, Megaphone, Menu, UserCircle, Settings, ChevronRight } from 'lucide-react'
import * as DropdownMenu from '@radix-ui/react-dropdown-menu'
import { useAuthStore } from '@/lib/auth-store'
import { useLogout } from '@/hooks/use-auth'
import { useUnreadBroadcasts, useDismissBroadcast } from '@/hooks/use-notifications'
import { useStaffUnreadCount } from '@/hooks/use-staff-notifications'
import { Spinner } from '@/components/ui/spinner'
import { ThemeToggle } from '@/components/ui/theme-toggle'
import { cn } from '@/lib/utils'

// ─── Page title map ───────────────────────────────────────────────────────────

const PAGE_META: Record<string, { title: string; emoji: string }> = {
  '/dashboard':    { title: 'Dashboard',       emoji: '📊' },
  '/floor':        { title: 'Floor Plan',       emoji: '🏢' },
  '/orders':       { title: 'Orders',           emoji: '📋' },
  '/billing':      { title: 'Billing',          emoji: '🧾' },
  '/kds':          { title: 'Kitchen Display',  emoji: '👨‍🍳' },
  '/menu':         { title: 'Menu',             emoji: '🍽️' },
  '/inventory':    { title: 'Inventory',        emoji: '📦' },
  '/reports':      { title: 'Reports',          emoji: '📈' },
  '/aggregators':  { title: 'Aggregators',      emoji: '🔗' },
  '/staff':        { title: 'Staff',            emoji: '👥' },
  '/settings':     { title: 'Outlet Settings',  emoji: '⚙️' },
  '/notifications':{ title: 'Notifications',    emoji: '🔔' },
  '/customers':    { title: 'Customers',        emoji: '👤' },
  '/onboarding':   { title: 'Onboarding',       emoji: '🚀' },
  '/profile':      { title: 'My Profile',       emoji: '🪪' },
}

function usePageMeta(pathname: string) {
  const key = Object.keys(PAGE_META).find(
    (k) => pathname === k || pathname.startsWith(`${k}/`),
  )
  return key ? PAGE_META[key]! : { title: 'Atlas POS', emoji: '⬡' }
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
            'relative flex items-center justify-center w-9 h-9 rounded-xl',
            'text-muted-foreground hover:text-foreground',
            'bg-background-hover/50 hover:bg-background-hover border border-border/60 hover:border-border',
            'transition-all duration-100 outline-none',
          )}
        >
          <Bell size={15} />
          {count > 0 && (
            <span className="absolute -top-1 -right-1 flex items-center justify-center min-w-[16px] h-4 px-1 rounded-full bg-primary-500 text-white text-[9px] font-bold leading-none">
              {count > 9 ? '9+' : count}
            </span>
          )}
        </button>
      </DropdownMenu.Trigger>

      <DropdownMenu.Portal>
        <DropdownMenu.Content
          align="end"
          sideOffset={8}
          className="z-50 w-[320px] rounded-xl border border-border bg-background-card shadow-2xl shadow-black/20 animate-fade-in overflow-hidden"
        >
          {/* Header */}
          <div className="flex items-center justify-between px-4 py-3 border-b border-border">
            <div className="flex items-center gap-2">
              <Bell size={13} className="text-primary-500" />
              <span className="text-xs font-bold text-foreground">Notifications</span>
              {count > 0 && (
                <span className="flex items-center justify-center min-w-[18px] h-4 px-1.5 rounded-full bg-primary-500/15 text-primary-500 text-[9px] font-bold leading-none">
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

          {/* Body */}
          <div className="max-h-72 overflow-y-auto">
            {isLoading ? (
              <div className="flex items-center justify-center py-8">
                <Spinner size="sm" className="text-primary-500" />
              </div>
            ) : broadcasts.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-10 gap-2 text-muted-foreground">
                <Bell size={28} className="opacity-15" />
                <p className="text-xs font-medium">All caught up!</p>
                <p className="text-[10px] opacity-60">No new announcements</p>
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
                      <X size={12} />
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
            'flex items-center gap-2 pl-2 pr-3 py-1.5 rounded-xl',
            'bg-background-hover/50 hover:bg-background-hover border border-border/60 hover:border-border',
            'text-muted-foreground hover:text-foreground',
            'transition-all duration-100 outline-none',
          )}
        >
          <div className="flex items-center justify-center w-6 h-6 rounded-full bg-primary-500/20 text-primary-500 text-[11px] font-bold shrink-0">
            {user.name.charAt(0).toUpperCase()}
          </div>
          <div className="hidden sm:block text-left">
            <p className="text-[11px] font-semibold text-foreground leading-none">{user.name.split(' ')[0]}</p>
            <p className="text-[9px] text-muted-foreground/60 uppercase tracking-wide leading-none mt-0.5">{user.role}</p>
          </div>
        </button>
      </DropdownMenu.Trigger>

      <DropdownMenu.Portal>
        <DropdownMenu.Content
          align="end"
          sideOffset={8}
          className="z-50 min-w-[200px] rounded-xl border border-border bg-background-card shadow-2xl shadow-black/20 p-1 animate-fade-in"
        >
          {/* User info */}
          <div className="px-3 py-2.5 mb-0.5">
            <div className="flex items-center gap-2.5">
              <div className="flex items-center justify-center w-9 h-9 rounded-full bg-primary-500/15 text-primary-500 text-sm font-bold shrink-0">
                {user.name.charAt(0).toUpperCase()}
              </div>
              <div className="min-w-0">
                <p className="text-xs font-semibold text-foreground truncate">{user.name}</p>
                <p className="text-[10px] text-muted-foreground truncate">{user.email ?? user.phone}</p>
              </div>
            </div>
          </div>

          <div className="my-1 border-t border-border/60" />

          {/* Profile */}
          <DropdownMenu.Item
            onSelect={() => router.push('/profile')}
            className={cn(
              'flex items-center gap-2.5 px-3 py-2 rounded-lg text-[13px] cursor-pointer outline-none',
              'text-muted-foreground hover:text-foreground hover:bg-background-hover transition-colors',
            )}
          >
            <UserCircle size={14} className="shrink-0" />
            My Profile
          </DropdownMenu.Item>

          {/* Settings — OWNER / MANAGER only */}
          {(user.role === 'OWNER' || user.role === 'MANAGER') && (
            <DropdownMenu.Item
              onSelect={() => router.push('/settings')}
              className={cn(
                'flex items-center gap-2.5 px-3 py-2 rounded-lg text-[13px] cursor-pointer outline-none',
                'text-muted-foreground hover:text-foreground hover:bg-background-hover transition-colors',
              )}
            >
              <Settings size={14} className="shrink-0" />
              Outlet Settings
            </DropdownMenu.Item>
          )}

          <div className="my-1 border-t border-border/60" />

          {/* Sign out */}
          <DropdownMenu.Item
            onSelect={() => logout.mutate()}
            disabled={logout.isPending}
            className={cn(
              'flex items-center gap-2.5 px-3 py-2 rounded-lg text-[13px] cursor-pointer outline-none',
              'text-danger hover:bg-danger/10 transition-colors',
              'disabled:opacity-50 disabled:cursor-not-allowed',
            )}
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
  const { title } = usePageMeta(pathname)

  return (
    <header className="flex items-center h-14 px-4 md:px-5 shrink-0 border-b border-border bg-background gap-3">
      {/* Hamburger — mobile only */}
      <button
        type="button"
        onClick={onMenuClick}
        aria-label="Open navigation"
        className="flex items-center justify-center w-8 h-8 rounded-lg text-muted-foreground hover:text-foreground hover:bg-background-hover transition-colors lg:hidden shrink-0"
      >
        <Menu size={17} />
      </button>

      {/* Page title */}
      <div className="flex-1 min-w-0">
        <h1 className="text-[15px] font-bold text-foreground truncate">{title}</h1>
      </div>

      {/* Right actions */}
      <div className="flex items-center gap-2 shrink-0">
        <ThemeToggle />
        <NotificationBell />
        <UserMenu />
      </div>
    </header>
  )
}
