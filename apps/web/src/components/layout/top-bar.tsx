'use client'

import { usePathname, useRouter } from 'next/navigation'
import { LogOut, ChevronDown, Bell, X, Megaphone, Menu } from 'lucide-react'
import * as DropdownMenu from '@radix-ui/react-dropdown-menu'
import { useAuthStore } from '@/lib/auth-store'
import { useLogout } from '@/hooks/use-auth'
import { useUnreadBroadcasts, useDismissBroadcast } from '@/hooks/use-notifications'
import { useStaffUnreadCount } from '@/hooks/use-staff-notifications'
import { Spinner } from '@/components/ui/spinner'
import { cn } from '@/lib/utils'

const TITLES: Record<string, string> = {
  '/dashboard':    'Dashboard',
  '/floor':        'Floor Plan',
  '/orders':       'Orders',
  '/billing':      'Billing',
  '/kds':          'Kitchen Display',
  '/menu':         'Menu Management',
  '/inventory':    'Inventory',
  '/reports':      'Reports',
  '/aggregators':  'Aggregators',
  '/staff':        'Staff',
  '/settings':     'Outlet Settings',
  '/notifications':'Notifications',
  '/customers':    'Customers',
  '/onboarding':   'Onboarding',
  '/profile':      'My Profile',
}

function usePageTitle(pathname: string): string {
  const match = Object.keys(TITLES).find(
    (key) => pathname === key || pathname.startsWith(`${key}/`),
  )
  return (match && TITLES[match]) ? TITLES[match]! : 'Atlas POS'
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

// ─── Broadcast bell dropdown ──────────────────────────────────────────────────

function BroadcastBell() {
  const router = useRouter()
  const { data: broadcasts = [], isLoading } = useUnreadBroadcasts()
  const { data: staffCount } = useStaffUnreadCount()
  const dismiss = useDismissBroadcast()
  const broadcastCount = broadcasts.length
  const count = broadcastCount + (staffCount?.unread ?? 0)

  return (
    <DropdownMenu.Root>
      <DropdownMenu.Trigger asChild>
        <button
          className={cn(
            'relative flex items-center justify-center w-8 h-8 rounded-md',
            'text-muted-foreground hover:text-foreground hover:bg-white/5',
            'transition-colors duration-100 outline-none',
          )}
          aria-label={count > 0 ? `${count} unread notifications` : 'Notifications'}
        >
          <Bell size={16} />
          {count > 0 && (
            <span className="absolute -top-0.5 -right-0.5 flex items-center justify-center min-w-[16px] h-4 px-1 rounded-full bg-primary-500 text-white text-[10px] font-bold leading-none">
              {count > 9 ? '9+' : count}
            </span>
          )}
        </button>
      </DropdownMenu.Trigger>

      <DropdownMenu.Portal>
        <DropdownMenu.Content
          align="end"
          sideOffset={8}
          className={cn(
            'z-50 w-80 rounded-xl border border-border bg-card shadow-xl shadow-black/30',
            'animate-fade-in',
          )}
        >
          {/* Header */}
          <div className="flex items-center justify-between px-4 py-3 border-b border-border">
            <div className="flex items-center gap-2">
              <Bell size={14} className="text-primary-500" />
              <span className="text-xs font-bold text-foreground">Notifications</span>
              {count > 0 && (
                <span className="flex items-center justify-center min-w-[18px] h-4 px-1 rounded-full bg-primary-500/15 text-primary-500 text-[10px] font-bold">
                  {count}
                </span>
              )}
            </div>
            <DropdownMenu.Item
              onSelect={() => router.push('/notifications')}
              className="text-[11px] text-primary-500 hover:underline font-medium cursor-pointer outline-none"
            >
              View all
            </DropdownMenu.Item>
          </div>

          {/* List */}
          <div className="max-h-80 overflow-y-auto">
            {isLoading ? (
              <div className="flex items-center justify-center py-8">
                <Spinner size="sm" className="text-primary-500" />
              </div>
            ) : broadcasts.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-8 gap-2 text-muted-foreground">
                <Bell size={28} className="opacity-20" />
                <p className="text-xs">No new announcements</p>
              </div>
            ) : (
              <div className="divide-y divide-border">
                {broadcasts.map((b) => (
                  <div key={b.id} className="flex items-start gap-3 px-4 py-3 hover:bg-white/[0.02] group">
                    <div className="flex items-center justify-center w-7 h-7 rounded-lg bg-primary-500/10 shrink-0 mt-0.5">
                      <Megaphone size={13} className="text-primary-500" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-semibold text-foreground leading-snug">{b.title}</p>
                      <p className="text-[11px] text-muted-foreground mt-0.5 line-clamp-2 leading-relaxed">{b.body}</p>
                      <p className="text-[10px] text-muted-foreground/50 mt-1">{timeAgo(b.createdAt)}</p>
                    </div>
                    <button
                      type="button"
                      onClick={(e) => { e.preventDefault(); dismiss.mutate(b.id) }}
                      disabled={dismiss.isPending}
                      className="opacity-0 group-hover:opacity-100 text-muted-foreground hover:text-foreground transition-all mt-0.5 shrink-0"
                      aria-label="Dismiss"
                    >
                      <X size={13} />
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

// ─── TopBar ───────────────────────────────────────────────────────────────────

interface TopBarProps {
  onMenuClick: () => void
}

export function TopBar({ onMenuClick }: TopBarProps) {
  const pathname = usePathname()
  const title = usePageTitle(pathname)
  const user = useAuthStore((s) => s.user)
  const logout = useLogout()

  return (
    <header className="flex items-center h-14 px-4 md:px-6 shrink-0 border-b border-border bg-background/80 backdrop-blur-sm gap-3">
      {/* Hamburger — mobile only */}
      <button
        type="button"
        onClick={onMenuClick}
        aria-label="Open navigation"
        className={cn(
          'flex items-center justify-center w-8 h-8 rounded-md shrink-0',
          'text-muted-foreground hover:text-foreground hover:bg-white/5',
          'transition-colors lg:hidden',
        )}
      >
        <Menu size={18} />
      </button>

      <h1 className="text-sm font-bold text-foreground flex-1 truncate">{title}</h1>

      <div className="flex items-center gap-2 shrink-0">
        {/* Broadcast bell */}
        <BroadcastBell />

        {/* User menu */}
        {user && (
          <DropdownMenu.Root>
            <DropdownMenu.Trigger asChild>
              <button
                className={cn(
                  'flex items-center gap-2 px-3 py-1.5 rounded-md',
                  'text-sm text-muted-foreground hover:text-foreground hover:bg-white/5',
                  'transition-colors duration-100 outline-none',
                )}
              >
                <div className="flex items-center justify-center w-6 h-6 rounded-full bg-primary-500/15 text-primary-500 text-[11px] font-bold">
                  {user.name.charAt(0).toUpperCase()}
                </div>
                <span className="hidden sm:block text-xs font-medium">{user.name.split(' ')[0]}</span>
                <ChevronDown size={13} className="opacity-50" />
              </button>
            </DropdownMenu.Trigger>

            <DropdownMenu.Portal>
              <DropdownMenu.Content
                align="end"
                sideOffset={8}
                className={cn(
                  'z-50 min-w-[180px] rounded-lg border border-border bg-card p-1',
                  'shadow-lg shadow-black/30',
                  'animate-fade-in',
                )}
              >
                <div className="px-3 py-2 mb-1 border-b border-border">
                  <p className="text-xs font-semibold text-foreground truncate">{user.name}</p>
                  <p className="text-[10px] text-muted-foreground mt-0.5 truncate">{user.email ?? user.phone}</p>
                </div>

                <DropdownMenu.Item
                  onSelect={() => logout.mutate()}
                  disabled={logout.isPending}
                  className={cn(
                    'flex items-center gap-2.5 px-3 py-2 rounded-md text-sm cursor-pointer outline-none',
                    'text-danger hover:bg-danger/10 transition-colors duration-100',
                    'disabled:opacity-50 disabled:cursor-not-allowed',
                  )}
                >
                  {logout.isPending ? <Spinner size="xs" /> : <LogOut size={13} />}
                  Sign out
                </DropdownMenu.Item>
              </DropdownMenu.Content>
            </DropdownMenu.Portal>
          </DropdownMenu.Root>
        )}
      </div>
    </header>
  )
}
