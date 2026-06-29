'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  LayoutDashboard, LayoutGrid, ClipboardList, Receipt, ChefHat,
  UtensilsCrossed, Package, BarChart3, Link as LinkIcon,
  Users, Settings, Bell, ContactRound, UserCircle,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { useAuthStore } from '@/lib/auth-store'
import { NAV_GROUPS } from './nav-items'
import { Badge } from '@/components/ui/badge'

const ICONS: Record<string, React.ElementType> = {
  LayoutDashboard, LayoutGrid, ClipboardList, Receipt, ChefHat,
  UtensilsCrossed, Package, BarChart3, Link: LinkIcon,
  Users, Settings, Bell, ContactRound, UserCircle,
}

export function Sidebar() {
  const pathname = usePathname()
  const user = useAuthStore((s) => s.user)
  const role = user?.role ?? ''

  return (
    <aside className="flex flex-col w-[220px] shrink-0 h-full border-r border-border bg-background">
      {/* Logo */}
      <div className="flex items-center gap-3 px-5 h-14 border-b border-border shrink-0">
        <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-primary-500 shrink-0">
          <svg width="18" height="18" viewBox="0 0 28 28" fill="none" aria-hidden>
            <path d="M7 20V10l7-3 7 3v10l-7 3-7-3z" stroke="white" strokeWidth="1.5" fill="none" />
            <path d="M14 7v16M7 10l7 4 7-4" stroke="white" strokeWidth="1.5" fill="none" />
          </svg>
        </div>
        <span className="font-bold text-[15px] tracking-tight">
          <span className="text-primary-500">Atlas</span>
          <span className="text-foreground"> POS</span>
        </span>
      </div>

      {/* Nav */}
      <nav className="flex-1 overflow-y-auto py-3 px-3 space-y-5">
        {NAV_GROUPS.map((group) => {
          const visible = group.items.filter(
            (item) => !item.roles || item.roles.includes(role),
          )
          if (!visible.length) return null

          return (
            <div key={group.label}>
              <p className="px-3 pb-1.5 text-[10px] font-bold uppercase tracking-widest text-muted-foreground/50">
                {group.label}
              </p>
              <ul className="space-y-0.5">
                {visible.map((item) => {
                  const Icon = ICONS[item.icon]
                  const active = pathname === item.href || pathname.startsWith(`${item.href}/`)
                  return (
                    <li key={item.href}>
                      <Link
                        href={item.href}
                        className={cn(
                          'flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium transition-all duration-100',
                          active
                            ? 'bg-primary-500/10 text-primary-500'
                            : 'text-muted-foreground hover:bg-white/5 hover:text-foreground',
                        )}
                      >
                        {Icon && (
                          <Icon
                            size={16}
                            className={cn(
                              'shrink-0',
                              active ? 'text-primary-500' : 'text-muted-foreground/70',
                            )}
                          />
                        )}
                        <span className="truncate">{item.label}</span>
                        {item.badge && (
                          <Badge variant="default" className="ml-auto text-[9px] px-1.5 py-0">
                            {item.badge}
                          </Badge>
                        )}
                      </Link>
                    </li>
                  )
                })}
              </ul>
            </div>
          )
        })}
      </nav>

      {/* User pill */}
      {user && (
        <div className="shrink-0 px-4 py-3 border-t border-border">
          <div className="flex items-center gap-2.5">
            <div className="flex items-center justify-center w-7 h-7 rounded-full bg-primary-500/15 text-primary-500 text-xs font-bold shrink-0">
              {user.name.charAt(0).toUpperCase()}
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-xs font-semibold text-foreground truncate">{user.name}</p>
              <p className="text-[10px] text-muted-foreground/60 uppercase tracking-wide">{user.role}</p>
            </div>
          </div>
        </div>
      )}
    </aside>
  )
}
