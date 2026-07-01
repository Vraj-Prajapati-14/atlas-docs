'use client'

import { useState, useEffect, useCallback } from 'react'
import { usePathname, useRouter } from 'next/navigation'
import {
  LayoutDashboard,
  Building2,
  BarChart3,
  IndianRupee,
  MessageCircle,
  Megaphone,
  ShieldCheck,
  Settings,
  LogOut,
  ChevronLeft,
  ChevronRight,
  Menu,
  X,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Spinner } from '@/components/ui/spinner'
import {
  ACCESS_KEY,
  REFRESH_KEY,
  BASE_URL,
  getAdminToken,
  clearAdminTokens,
  adminFetch,
} from '@/lib/admin-api'
import { useMutation } from '@tanstack/react-query'
import { toast } from 'sonner'

// ─── Types ─────────────────────────────────────────────────────────────────────

interface AdminPayload {
  name?: string
  email?: string
  sub?: string
}

// ─── JWT decoder (base64 payload only — no verification) ──────────────────────

function decodeAdminJwt(token: string): AdminPayload | null {
  try {
    const part = token.split('.')[1]
    if (!part) return null
    // Pad base64url to standard base64
    const padded = part.replace(/-/g, '+').replace(/_/g, '/').padEnd(
      part.length + ((4 - (part.length % 4)) % 4),
      '=',
    )
    return JSON.parse(atob(padded)) as AdminPayload
  } catch {
    return null
  }
}

// ─── Nav definition ────────────────────────────────────────────────────────────

const NAV_ITEMS = [
  { label: 'Overview',     Icon: LayoutDashboard, href: '/admin/dashboard'  },
  { label: 'Restaurants',  Icon: Building2,        href: '/admin/tenants'    },
  { label: 'Analytics',    Icon: BarChart3,        href: '/admin/analytics'  },
  { label: 'Financials',   Icon: IndianRupee,      href: '/admin/financials' },
  { label: 'Support',      Icon: MessageCircle,    href: '/admin/support'    },
  { label: 'Broadcasts',   Icon: Megaphone,        href: '/admin/broadcasts' },
  { label: 'Audit Log',    Icon: ShieldCheck,      href: '/admin/audit'      },
  { label: 'Settings',     Icon: Settings,         href: '/admin/settings'   },
] as const

// ─── Login form ────────────────────────────────────────────────────────────────

interface LoginFormProps {
  onLogin: () => void
}

function LoginForm({ onLogin }: LoginFormProps) {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')

  const login = useMutation({
    mutationFn: () =>
      adminFetch<{ admin: { name: string }; accessToken: string; refreshToken: string }>(
        '/api/v1/admin/auth/login',
        {
          method: 'POST',
          body: JSON.stringify({ email, password }),
        },
      ),
    onSuccess(data) {
      localStorage.setItem(ACCESS_KEY, data.accessToken)
      localStorage.setItem(REFRESH_KEY, data.refreshToken)
      toast.success(`Welcome, ${data.admin.name}!`)
      // Notify layout (and any other listeners) that auth state changed
      window.dispatchEvent(new CustomEvent('admin-auth-changed'))
      onLogin()
    },
    onError: (e: Error) => toast.error(e.message),
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    login.mutate()
  }

  return (
    <div className="min-h-dvh flex items-center justify-center p-6 bg-background">
      <div className="w-full max-w-[360px]">
        {/* Wordmark */}
        <div className="text-center mb-8">
          <div className="w-12 h-12 rounded-xl bg-primary-500 flex items-center justify-center mx-auto mb-4 shadow-[0_4px_24px_rgba(255,107,53,0.35)]">
            <ShieldCheck size={22} className="text-white" />
          </div>
          <h1 className="text-xl font-bold">
            <span className="text-primary-500">Atlas</span>{' '}
            <span className="text-foreground">Admin</span>
          </h1>
          <p className="text-sm text-muted-foreground mt-1">Super-admin access only</p>
        </div>

        {/* Card */}
        <form
          onSubmit={handleSubmit}
          className="rounded-2xl border border-border bg-background-card p-6 shadow-xl shadow-black/20 space-y-4"
        >
          <div className="space-y-1.5">
            <Label htmlFor="admin-email">Email</Label>
            <Input
              id="admin-email"
              type="email"
              placeholder="admin@atlas.com"
              autoComplete="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={login.isPending}
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="admin-password">Password</Label>
            <Input
              id="admin-password"
              type="password"
              placeholder="••••••••••••"
              autoComplete="current-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              disabled={login.isPending}
            />
          </div>
          <Button
            type="submit"
            className="w-full"
            disabled={login.isPending || !email || !password}
          >
            {login.isPending ? <Spinner size="sm" /> : 'Sign in'}
          </Button>
        </form>
      </div>
    </div>
  )
}

// ─── Sidebar ───────────────────────────────────────────────────────────────────

interface SidebarProps {
  collapsed: boolean
  onToggleCollapse: () => void
  onClose?: () => void
  adminInfo: AdminPayload | null
  onLogout: () => void
}

function Sidebar({ collapsed, onToggleCollapse, onClose, adminInfo, onLogout }: SidebarProps) {
  const pathname = usePathname()
  const router = useRouter()

  const handleNav = (href: string) => {
    router.push(href)
    onClose?.()
  }

  return (
    <aside
      className={cn(
        'flex flex-col h-full bg-[#0A0D16] border-r border-border transition-[width] duration-200 overflow-hidden',
        collapsed ? 'w-[60px]' : 'w-[240px]',
      )}
    >
      {/* Top: logo + collapse toggle */}
      <div
        className={cn(
          'flex items-center h-14 px-3 border-b border-border shrink-0',
          collapsed ? 'justify-center' : 'justify-between',
        )}
      >
        {!collapsed && (
          <div className="flex items-center gap-2.5 pl-1 min-w-0">
            <div className="w-7 h-7 rounded-lg bg-primary-500 flex items-center justify-center shrink-0">
              <ShieldCheck size={14} className="text-white" />
            </div>
            <span className="font-bold text-sm leading-none">
              <span className="text-primary-500">Atlas</span>
              <span className="text-foreground"> Admin</span>
            </span>
          </div>
        )}
        {collapsed && (
          <div className="w-7 h-7 rounded-lg bg-primary-500 flex items-center justify-center">
            <ShieldCheck size={14} className="text-white" />
          </div>
        )}
        {/* Collapse toggle — only visible when not collapsed; on mobile we use the X button from the overlay */}
        {!collapsed && (
          <button
            type="button"
            onClick={onClose ?? onToggleCollapse}
            className="p-1.5 rounded-md text-muted-foreground hover:text-foreground hover:bg-white/5 transition-colors shrink-0"
            aria-label={onClose ? 'Close menu' : 'Collapse sidebar'}
          >
            {onClose ? <X size={16} /> : <ChevronLeft size={16} />}
          </button>
        )}
        {collapsed && (
          <button
            type="button"
            onClick={onToggleCollapse}
            className="absolute right-[-12px] top-[22px] w-6 h-6 rounded-full border border-border bg-[#0A0D16] flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors hidden lg:flex"
            aria-label="Expand sidebar"
          >
            <ChevronRight size={12} />
          </button>
        )}
      </div>

      {/* Nav */}
      <nav className="flex-1 overflow-y-auto py-3 px-2 space-y-0.5">
        {NAV_ITEMS.map(({ label, Icon, href }) => {
          const isActive = pathname === href || pathname.startsWith(href + '/')
          return (
            <button
              key={href}
              type="button"
              onClick={() => handleNav(href)}
              title={collapsed ? label : undefined}
              className={cn(
                'w-full flex items-center gap-3 rounded-lg px-2.5 py-2.5 text-sm font-medium transition-colors',
                'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500/50',
                isActive
                  ? 'bg-primary-500 text-white shadow-[0_2px_12px_rgba(255,107,53,0.25)]'
                  : 'text-muted-foreground hover:bg-white/5 hover:text-foreground',
                collapsed && 'justify-center',
              )}
            >
              <Icon size={16} className="shrink-0" />
              {!collapsed && <span className="truncate">{label}</span>}
            </button>
          )
        })}
      </nav>

      {/* Bottom: admin info + logout */}
      <div className="border-t border-border p-2 shrink-0">
        {collapsed ? (
          <button
            type="button"
            onClick={onLogout}
            title="Logout"
            className="w-full flex items-center justify-center p-2 rounded-lg text-muted-foreground hover:bg-danger/10 hover:text-danger transition-colors"
          >
            <LogOut size={15} />
          </button>
        ) : (
          <div className="rounded-xl bg-white/5 border border-white/8 p-2.5">
            <div className="flex items-center gap-2.5 min-w-0 mb-2.5">
              <div className="w-8 h-8 rounded-full bg-primary-500 flex items-center justify-center shrink-0">
                <span className="text-xs font-bold text-white uppercase">
                  {(adminInfo?.name ?? adminInfo?.email ?? 'A').charAt(0)}
                </span>
              </div>
              <div className="min-w-0 flex-1">
                {adminInfo?.name && (
                  <p className="text-xs font-semibold text-foreground truncate leading-tight">
                    {adminInfo.name}
                  </p>
                )}
                <p className="text-[10px] text-muted-foreground truncate leading-tight">
                  Super Admin
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={onLogout}
              className="w-full flex items-center justify-center gap-1.5 rounded-lg px-3 py-1.5 text-[11px] font-medium text-muted-foreground border border-white/8 hover:bg-danger/10 hover:text-danger hover:border-danger/20 transition-colors"
            >
              <LogOut size={12} className="shrink-0" />
              <span>Logout</span>
            </button>
          </div>
        )}
      </div>
    </aside>
  )
}

// ─── Admin shell ───────────────────────────────────────────────────────────────

function AdminShell({ children }: { children: React.ReactNode }) {
  const router = useRouter()
  const [collapsed, setCollapsed] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)

  const token = getAdminToken()
  const adminInfo = token ? decodeAdminJwt(token) : null

  const handleLogout = useCallback(() => {
    clearAdminTokens()
    window.dispatchEvent(new CustomEvent('admin-auth-changed'))
    router.push('/admin')
  }, [router])

  return (
    <div className="flex h-dvh overflow-hidden bg-background">
      {/* Desktop sidebar */}
      <div className={cn('hidden lg:flex relative shrink-0', collapsed ? 'w-[60px]' : 'w-[240px]', 'transition-[width] duration-200')}>
        <Sidebar
          collapsed={collapsed}
          onToggleCollapse={() => setCollapsed((c) => !c)}
          adminInfo={adminInfo}
          onLogout={handleLogout}
        />
        {/* Expand button when collapsed */}
        {collapsed && (
          <button
            type="button"
            onClick={() => setCollapsed(false)}
            className="absolute right-[-12px] top-6 z-10 w-6 h-6 rounded-full border border-border bg-[#0A0D16] flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors"
            aria-label="Expand sidebar"
          >
            <ChevronRight size={12} />
          </button>
        )}
      </div>

      {/* Mobile overlay */}
      {mobileOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/60 lg:hidden"
          onClick={() => setMobileOpen(false)}
          aria-hidden="true"
        />
      )}
      <div
        className={cn(
          'fixed inset-y-0 left-0 z-50 w-[240px] lg:hidden',
          'transition-transform duration-200 ease-out',
          mobileOpen ? 'translate-x-0' : '-translate-x-full',
        )}
      >
        <Sidebar
          collapsed={false}
          onToggleCollapse={() => {}}
          onClose={() => setMobileOpen(false)}
          adminInfo={adminInfo}
          onLogout={handleLogout}
        />
      </div>

      {/* Main content */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Mobile top bar */}
        <div className="lg:hidden flex items-center h-14 px-4 border-b border-border bg-background shrink-0 gap-3">
          <button
            type="button"
            onClick={() => setMobileOpen(true)}
            className="p-1.5 rounded-md text-muted-foreground hover:text-foreground hover:bg-white/5 transition-colors"
            aria-label="Open menu"
          >
            <Menu size={18} />
          </button>
          <span className="font-bold text-sm">
            <span className="text-primary-500">Atlas</span>
            <span className="text-foreground"> Admin</span>
          </span>
        </div>

        <main className="flex-1 overflow-y-auto pt-10">
          {children}
        </main>
      </div>
    </div>
  )
}

// ─── Layout root ───────────────────────────────────────────────────────────────

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  // null = loading (haven't read localStorage yet)
  const [authed, setAuthed] = useState<boolean | null>(null)

  useEffect(() => {
    setAuthed(!!getAdminToken())

    // Re-check whenever login/logout dispatches this event
    const onAuthChange = () => setAuthed(!!getAdminToken())
    window.addEventListener('admin-auth-changed', onAuthChange)
    return () => window.removeEventListener('admin-auth-changed', onAuthChange)
  }, [])

  // Still reading localStorage — render nothing to avoid flash
  if (authed === null) return null

  if (!authed) {
    return <LoginForm onLogin={() => setAuthed(true)} />
  }

  return <AdminShell>{children}</AdminShell>
}
