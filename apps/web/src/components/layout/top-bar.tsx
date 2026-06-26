'use client'

import { usePathname } from 'next/navigation'
import { LogOut, ChevronDown } from 'lucide-react'
import * as DropdownMenu from '@radix-ui/react-dropdown-menu'
import { useAuthStore } from '@/lib/auth-store'
import { useLogout } from '@/hooks/use-auth'
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
}

function usePageTitle(pathname: string): string {
  const match = Object.keys(TITLES).find(
    (key) => pathname === key || pathname.startsWith(`${key}/`),
  )
  return (match && TITLES[match]) ? TITLES[match]! : 'Atlas POS'
}

export function TopBar() {
  const pathname = usePathname()
  const title = usePageTitle(pathname)
  const user = useAuthStore((s) => s.user)
  const logout = useLogout()

  return (
    <header className="flex items-center justify-between h-14 px-6 shrink-0 border-b border-border bg-background/80 backdrop-blur-sm">
      <h1 className="text-sm font-bold text-foreground">{title}</h1>

      <div className="flex items-center gap-3">
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
                  {logout.isPending ? (
                    <Spinner size="xs" />
                  ) : (
                    <LogOut size={13} />
                  )}
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
