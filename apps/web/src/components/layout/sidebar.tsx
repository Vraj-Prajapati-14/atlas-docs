'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import {
  X, LayoutDashboard, LayoutGrid, ClipboardList, Receipt, ChefHat,
  UtensilsCrossed, Package, BarChart3, Link as LinkIcon,
  Users, Settings, Bell, ContactRound, UserCircle, LogOut,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { useAuthStore } from '@/lib/auth-store'
import { useLogout } from '@/hooks/use-auth'
import { NAV_GROUPS } from './nav-items'
import { Spinner } from '@/components/ui/spinner'

// ─── Icon registry ─────────────────────────────────────────────────────────────

const ICONS: Record<string, React.ElementType> = {
  LayoutDashboard, LayoutGrid, ClipboardList, Receipt, ChefHat,
  UtensilsCrossed, Package, BarChart3, Link: LinkIcon,
  Users, Settings, Bell, ContactRound, UserCircle,
}

// ─── Role badge colors ─────────────────────────────────────────────────────────

const ROLE_COLORS: Record<string, string> = {
  OWNER:             'bg-danger/15 text-danger',
  MANAGER:           'bg-warning/15 text-warning',
  CASHIER:           'bg-info/15 text-info',
  WAITER:            'bg-muted-foreground/15 text-muted-foreground',
  CHEF:              'bg-success/15 text-success',
  INVENTORY_MANAGER: 'bg-primary-500/15 text-primary-500',
}

// ─── NavItem ──────────────────────────────────────────────────────────────────

interface NavItemProps {
  href: string
  icon: string
  label: string
  badge?: string
  active: boolean
  onClick: () => void
}

function NavItem({ href, icon, label, badge, active, onClick }: NavItemProps) {
  const Icon = ICONS[icon]

  return (
    <li>
      <Link
        href={href}
        onClick={onClick}
        className={cn(
          'group relative flex items-center gap-3 px-3 py-2 rounded-lg text-[13px] font-medium transition-all duration-100',
          active
            ? 'bg-primary-500/12 text-primary-500'
            : 'text-muted-foreground hover:bg-background-hover/50 hover:text-foreground',
        )}
      >
        {/* Left accent bar */}
        <span
          className={cn(
            'absolute left-0 top-1 bottom-1 w-[3px] rounded-r-full transition-all duration-150',
            active ? 'bg-primary-500 opacity-100' : 'opacity-0',
          )}
        />

        {Icon && (
          <Icon
            size={15}
            className={cn(
              'shrink-0 transition-colors duration-100',
              active ? 'text-primary-500' : 'text-muted-foreground/60 group-hover:text-muted-foreground',
            )}
          />
        )}

        <span className="flex-1 truncate">{label}</span>

        {badge && (
          <span className="shrink-0 text-[9px] font-bold px-1.5 py-0.5 rounded bg-primary-500/15 text-primary-500 border border-primary-500/20 leading-none">
            {badge}
          </span>
        )}
      </Link>
    </li>
  )
}

// ─── NavGroup ──────────────────────────────────────────────────────────────────

interface NavGroupProps {
  label: string
  children: React.ReactNode
}

function NavGroup({ label, children }: NavGroupProps) {
  return (
    <div>
      <p className="px-3 pb-1 pt-0.5 text-[9.5px] font-bold uppercase tracking-[0.12em] text-muted-foreground/40 select-none">
        {label}
      </p>
      <ul className="space-y-0.5">{children}</ul>
    </div>
  )
}

// ─── Sidebar ──────────────────────────────────────────────────────────────────

interface SidebarProps {
  isOpen: boolean
  onClose: () => void
}

export function Sidebar({ isOpen, onClose }: SidebarProps) {
  const pathname = usePathname()
  const router   = useRouter()
  const user     = useAuthStore((s) => s.user)
  const logout   = useLogout()
  const role     = user?.role ?? ''

  function handleLogout() {
    logout.mutate()
  }

  return (
    <aside
      className={cn(
        'flex flex-col h-full border-r border-border bg-background',
        // Always a fixed overlay drawer — topbar handles desktop navigation
        'fixed inset-y-0 left-0 z-50 w-[260px]',
        'transition-transform duration-300 ease-in-out will-change-transform',
        isOpen ? 'translate-x-0 shadow-2xl shadow-black/30' : '-translate-x-full',
      )}
    >
      {/* ── Logo ────────────────────────────────────────────────────────────── */}
      <div className="flex items-center gap-3 px-4 h-14 border-b border-border shrink-0">
        <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-primary-500 shrink-0">
          <svg width="18" height="18" viewBox="0 0 28 28" fill="none" aria-hidden>
            <path d="M7 20V10l7-3 7 3v10l-7 3-7-3z" stroke="white" strokeWidth="1.5" fill="none" />
            <path d="M14 7v16M7 10l7 4 7-4" stroke="white" strokeWidth="1.5" fill="none" />
          </svg>
        </div>
        <div className="flex-1 min-w-0">
          <span className="font-extrabold text-[15px] tracking-tight leading-none">
            <span className="text-primary-500">Atlas</span>
            <span className="text-foreground"> POS</span>
          </span>
        </div>
        <button
          type="button"
          onClick={onClose}
          aria-label="Close navigation"
          className="flex items-center justify-center w-7 h-7 rounded-md text-muted-foreground hover:text-foreground hover:bg-background-hover transition-colors"
        >
          <X size={16} />
        </button>
      </div>

      {/* ── Nav groups ──────────────────────────────────────────────────────── */}
      <nav className="flex-1 overflow-y-auto py-3 px-3 space-y-4 scrollbar-thin">
        {NAV_GROUPS.map((group) => {
          const visible = group.items.filter(
            (item) => !item.roles || item.roles.includes(role),
          )
          if (!visible.length) return null

          return (
            <NavGroup key={group.label} label={group.label}>
              {visible.map((item) => (
                <NavItem
                  key={item.href}
                  href={item.href}
                  icon={item.icon}
                  label={item.label}
                  badge={item.badge}
                  active={pathname === item.href || pathname.startsWith(`${item.href}/`)}
                  onClick={onClose}
                />
              ))}
            </NavGroup>
          )
        })}
      </nav>

      {/* ── User section ────────────────────────────────────────────────────── */}
      {user && (
        <div className="shrink-0 border-t border-border p-3 space-y-2">
          {/* User info row */}
          <div className="flex items-center gap-2.5 px-1 py-1">
            <div className="flex items-center justify-center w-8 h-8 rounded-full bg-primary-500/15 text-primary-500 text-[13px] font-bold shrink-0 ring-2 ring-primary-500/20">
              {user.name.charAt(0).toUpperCase()}
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-[12px] font-semibold text-foreground truncate leading-tight">{user.name}</p>
              <span className={cn(
                'inline-block text-[9px] font-bold uppercase tracking-wide px-1.5 py-px rounded mt-0.5',
                ROLE_COLORS[user.role] ?? 'bg-muted-foreground/15 text-muted-foreground',
              )}>
                {user.role}
              </span>
            </div>
          </div>

          {/* Quick actions */}
          <div className="flex gap-1.5">
            <button
              type="button"
              onClick={() => { onClose(); router.push('/profile') }}
              className="flex-1 flex items-center justify-center gap-1.5 px-2 py-1.5 rounded-lg text-[11px] font-medium text-muted-foreground bg-background-hover/50 hover:bg-background-hover hover:text-foreground transition-colors"
            >
              <UserCircle size={12} />
              Profile
            </button>
            <button
              type="button"
              onClick={handleLogout}
              disabled={logout.isPending}
              className="flex-1 flex items-center justify-center gap-1.5 px-2 py-1.5 rounded-lg text-[11px] font-medium text-danger/80 bg-danger/[0.06] hover:bg-danger/12 hover:text-danger transition-colors disabled:opacity-50"
            >
              {logout.isPending ? <Spinner size="xs" /> : <LogOut size={12} />}
              Sign out
            </button>
          </div>
        </div>
      )}
    </aside>
  )
}
