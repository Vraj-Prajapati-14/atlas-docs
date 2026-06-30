'use client'

import { useState, useEffect, useCallback } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import {
  Building2, Search, CheckCircle2, Ban, Clock, LogOut,
  ChevronLeft, ChevronRight, RefreshCw,
} from 'lucide-react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Spinner } from '@/components/ui/spinner'
import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'

const BASE_URL = process.env['NEXT_PUBLIC_API_URL'] ?? ''
const STORAGE_KEY = 'atlas_admin_token'

// ─── API helpers ──────────────────────────────────────────────────────────────

function getAdminToken() {
  if (typeof window === 'undefined') return null
  return localStorage.getItem(STORAGE_KEY)
}

async function adminFetch<T>(path: string, options: RequestInit = {}): Promise<T> {
  const token = getAdminToken()
  const res = await fetch(`${BASE_URL}${path}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...options.headers,
    },
  })
  const json = await res.json() as { success: boolean; data?: T; error?: { message?: string } }
  if (!res.ok) throw new Error(json.error?.message ?? 'Request failed')
  return json.data as T
}

// ─── Types ────────────────────────────────────────────────────────────────────

interface TenantRow {
  id: string
  name: string
  slug: string
  type: string
  city: string
  state: string
  phone: string
  email: string | null
  plan: string
  planStatus: 'PENDING_PAYMENT' | 'ACTIVE' | 'SUSPENDED'
  isActive: boolean
  createdAt: string
  onboardingCompletedAt: string | null
  _count: { users: number; orders: number }
}

interface TenantsResponse {
  tenants: TenantRow[]
  total: number
  page: number
  limit: number
  totalPages: number
}

// ─── Status badge ─────────────────────────────────────────────────────────────

function StatusBadge({ status }: { status: TenantRow['planStatus'] }) {
  const map = {
    PENDING_PAYMENT: { label: 'Pending', variant: 'warning' as const, Icon: Clock },
    ACTIVE: { label: 'Active', variant: 'success' as const, Icon: CheckCircle2 },
    SUSPENDED: { label: 'Suspended', variant: 'danger' as const, Icon: Ban },
  }
  const { label, variant, Icon } = map[status]
  return (
    <Badge variant={variant} className="gap-1">
      <Icon size={11} />
      {label}
    </Badge>
  )
}

// ─── Login form ───────────────────────────────────────────────────────────────

function LoginForm({ onLogin }: { onLogin: () => void }) {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')

  const login = useMutation({
    mutationFn: () =>
      adminFetch<{ admin: { name: string }; token: string }>('/api/v1/admin/auth/login', {
        method: 'POST',
        body: JSON.stringify({ email, password }),
      }),
    onSuccess(data) {
      localStorage.setItem(STORAGE_KEY, data.token)
      toast.success(`Welcome, ${data.admin.name}!`)
      onLogin()
    },
    onError: (e: Error) => toast.error(e.message),
  })

  return (
    <div className="min-h-dvh flex items-center justify-center p-6">
      <div className="w-full max-w-[360px]">
        <div className="text-center mb-8">
          <div className="w-12 h-12 rounded-xl bg-primary-500 flex items-center justify-center mx-auto mb-4">
            <Building2 size={22} className="text-white" />
          </div>
          <h1 className="text-xl font-bold"><span className="text-primary-500">Atlas</span> Admin</h1>
          <p className="text-sm text-muted-foreground mt-1">Super-admin access only</p>
        </div>
        <div className="rounded-2xl border border-border bg-card p-6 shadow-xl shadow-black/20 space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="ae">Email</Label>
            <Input id="ae" type="email" placeholder="admin@atlas.com" value={email} onChange={e => setEmail(e.target.value)} disabled={login.isPending} />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="ap">Password</Label>
            <Input id="ap" type="password" placeholder="••••••••••••" value={password} onChange={e => setPassword(e.target.value)} disabled={login.isPending} />
          </div>
          <Button className="w-full" disabled={login.isPending || !email || !password} onClick={() => login.mutate()}>
            {login.isPending ? <Spinner size="sm" /> : 'Sign in'}
          </Button>
        </div>
      </div>
    </div>
  )
}

// ─── Dashboard ────────────────────────────────────────────────────────────────

function Dashboard({ onLogout }: { onLogout: () => void }) {
  const qc = useQueryClient()
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('')
  const [page, setPage] = useState(1)

  const { data, isLoading, error } = useQuery<TenantsResponse>({
    queryKey: ['admin-tenants', search, statusFilter, page],
    queryFn: () => {
      const params = new URLSearchParams({ page: String(page), limit: '20' })
      if (search) params.set('search', search)
      if (statusFilter) params.set('planStatus', statusFilter)
      return adminFetch<TenantsResponse>(`/api/v1/admin/tenants?${params}`)
    },
    staleTime: 30_000,
  })

  const setStatus = useMutation({
    mutationFn: ({ id, status }: { id: string; status: string }) =>
      adminFetch(`/api/v1/admin/tenants/${id}/status`, {
        method: 'PATCH',
        body: JSON.stringify({ status }),
      }),
    onSuccess(_, { status }) {
      toast.success(`Account ${status === 'ACTIVE' ? 'activated' : 'suspended'}.`)
      qc.invalidateQueries({ queryKey: ['admin-tenants'] })
    },
    onError: (e: Error) => toast.error(e.message),
  })

  const fmtDate = (d: string) => new Date(d).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: '2-digit' })

  return (
    <div className="min-h-dvh bg-background">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-background border-b border-border px-6 py-4 flex items-center justify-between">
        <div>
          <h1 className="text-base font-bold text-foreground"><span className="text-primary-500">Atlas</span> Admin</h1>
          <p className="text-xs text-muted-foreground">{data?.total ?? '—'} restaurants</p>
        </div>
        <button type="button" onClick={onLogout} className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors">
          <LogOut size={13} /> Logout
        </button>
      </div>

      <div className="p-6 space-y-4 max-w-6xl mx-auto">
        {/* Filters */}
        <div className="flex gap-3 flex-wrap">
          <div className="relative flex-1 min-w-[200px]">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search restaurant, phone, city…"
              value={search}
              onChange={(e) => { setSearch(e.target.value); setPage(1) }}
              className="pl-8"
            />
          </div>
          <select
            value={statusFilter}
            onChange={(e) => { setStatusFilter(e.target.value); setPage(1) }}
            className="bg-background border border-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-primary-500 text-foreground"
          >
            <option value="">All status</option>
            <option value="PENDING_PAYMENT">Pending</option>
            <option value="ACTIVE">Active</option>
            <option value="SUSPENDED">Suspended</option>
          </select>
          <button type="button" onClick={() => qc.invalidateQueries({ queryKey: ['admin-tenants'] })} className="p-2 rounded-lg border border-border hover:bg-background-card transition-colors">
            <RefreshCw size={14} className="text-muted-foreground" />
          </button>
        </div>

        {/* Table */}
        {isLoading && (
          <div className="flex justify-center py-12"><Spinner size="lg" /></div>
        )}
        {error && (
          <p className="text-sm text-danger text-center py-12">{(error as Error).message}</p>
        )}
        {data && (
          <>
            <div className="rounded-xl border border-border overflow-hidden overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-background-card border-b border-border text-xs text-muted-foreground font-semibold">
                    <th className="text-left px-4 py-3">Restaurant</th>
                    <th className="text-left px-4 py-3 hidden md:table-cell">Type</th>
                    <th className="text-left px-4 py-3 hidden lg:table-cell">Phone</th>
                    <th className="text-left px-4 py-3 hidden xl:table-cell">Registered</th>
                    <th className="text-left px-4 py-3">Status</th>
                    <th className="text-left px-4 py-3 hidden md:table-cell">Orders</th>
                    <th className="text-left px-4 py-3">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {data.tenants.map((t) => (
                    <tr key={t.id} className="hover:bg-background-card/50 transition-colors">
                      <td className="px-4 py-3">
                        <p className="font-semibold text-foreground">{t.name}</p>
                        <p className="text-xs text-muted-foreground">{t.city}, {t.state}</p>
                      </td>
                      <td className="px-4 py-3 hidden md:table-cell">
                        <span className="text-xs text-muted-foreground">{t.type.replace('_', ' ')}</span>
                      </td>
                      <td className="px-4 py-3 hidden lg:table-cell text-xs tabular-nums">{t.phone}</td>
                      <td className="px-4 py-3 hidden xl:table-cell text-xs tabular-nums">{fmtDate(t.createdAt)}</td>
                      <td className="px-4 py-3"><StatusBadge status={t.planStatus} /></td>
                      <td className="px-4 py-3 hidden md:table-cell text-xs tabular-nums">{t._count.orders}</td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          {t.planStatus !== 'ACTIVE' && (
                            <button
                              type="button"
                              disabled={setStatus.isPending}
                              onClick={() => setStatus.mutate({ id: t.id, status: 'ACTIVE' })}
                              className={cn(
                                'text-xs font-semibold px-3 py-1 rounded-lg transition-colors',
                                'bg-success/10 text-success hover:bg-success/20',
                              )}
                            >
                              Activate
                            </button>
                          )}
                          {t.planStatus === 'ACTIVE' && (
                            <button
                              type="button"
                              disabled={setStatus.isPending}
                              onClick={() => setStatus.mutate({ id: t.id, status: 'SUSPENDED' })}
                              className="text-xs font-semibold px-3 py-1 rounded-lg bg-danger/10 text-danger hover:bg-danger/20 transition-colors"
                            >
                              Suspend
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                  {data.tenants.length === 0 && (
                    <tr>
                      <td colSpan={7} className="px-4 py-12 text-center text-muted-foreground text-sm">
                        No restaurants found
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            {data.totalPages > 1 && (
              <div className="flex items-center justify-between text-xs text-muted-foreground">
                <span>Page {data.page} of {data.totalPages} · {data.total} total</span>
                <div className="flex gap-2">
                  <button type="button" disabled={page <= 1} onClick={() => setPage(p => p - 1)} className="p-1.5 rounded-lg border border-border disabled:opacity-40 hover:bg-background-card transition-colors">
                    <ChevronLeft size={14} />
                  </button>
                  <button type="button" disabled={page >= data.totalPages} onClick={() => setPage(p => p + 1)} className="p-1.5 rounded-lg border border-border disabled:opacity-40 hover:bg-background-card transition-colors">
                    <ChevronRight size={14} />
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  )
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function AdminPage() {
  const [authed, setAuthed] = useState(false)

  useEffect(() => {
    setAuthed(!!getAdminToken())
  }, [])

  const handleLogout = useCallback(() => {
    localStorage.removeItem(STORAGE_KEY)
    setAuthed(false)
  }, [])

  if (!authed) return <LoginForm onLogin={() => setAuthed(true)} />
  return <Dashboard onLogout={handleLogout} />
}
