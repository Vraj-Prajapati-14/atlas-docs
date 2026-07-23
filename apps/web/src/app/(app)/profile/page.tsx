'use client'

import { useState, useEffect } from 'react'
import {
  User, Lock, Hash, Shield, Phone, Mail, KeyRound, Monitor,
  Clock, CheckCircle2, XCircle, LogOut, Smartphone, Globe, Bell,
} from 'lucide-react'
import {
  useProfile,
  useUpdateProfile,
  useChangePassword,
  useSetPIN,
  useMySessions,
  useRevokeSession,
  useRevokeAllSessions,
  useLoginHistory,
  useNotifPrefs,
  useUpdateNotifPrefs,
} from '@/hooks/use-profile'
import { useAuthStore } from '@/lib/auth-store'
import { Button } from '@/components/ui/button'
import { Spinner } from '@/components/ui/spinner'
import { Badge } from '@/components/ui/badge'
import type { UserRole, NotifPrefs } from '@/lib/api-types'

// ─── Constants ────────────────────────────────────────────────────────────────

const ROLE_BADGE: Record<UserRole, { label: string; variant: 'success' | 'warning' | 'info' | 'muted' | 'default' | 'danger' }> = {
  OWNER:             { label: 'Owner',          variant: 'danger'  },
  MANAGER:           { label: 'Manager',        variant: 'warning' },
  CASHIER:           { label: 'Cashier',        variant: 'info'    },
  WAITER:            { label: 'Waiter',         variant: 'default' },
  CHEF:              { label: 'Chef',           variant: 'success' },
  INVENTORY_MANAGER: { label: 'Inventory Mgr', variant: 'muted'   },
}

type PermissionKey =
  | 'Billing & POS' | 'View Orders' | 'KDS' | 'Menu Management'
  | 'Inventory' | 'Staff Management' | 'Reports' | 'Settings'
  | 'Void Bill' | 'Approve Discounts'

const ROLE_PERMISSIONS: Record<UserRole, PermissionKey[]> = {
  OWNER:             ['Billing & POS', 'View Orders', 'KDS', 'Menu Management', 'Inventory', 'Staff Management', 'Reports', 'Settings', 'Void Bill', 'Approve Discounts'],
  MANAGER:           ['Billing & POS', 'View Orders', 'KDS', 'Menu Management', 'Inventory', 'Staff Management', 'Reports', 'Void Bill', 'Approve Discounts'],
  CASHIER:           ['Billing & POS', 'View Orders'],
  WAITER:            ['View Orders'],
  CHEF:              ['View Orders', 'KDS'],
  INVENTORY_MANAGER: ['Inventory', 'Reports'],
}

const ALL_PERMISSIONS: PermissionKey[] = [
  'Billing & POS', 'View Orders', 'KDS', 'Menu Management',
  'Inventory', 'Staff Management', 'Reports', 'Settings',
  'Void Bill', 'Approve Discounts',
]

// ─── Shared primitives ────────────────────────────────────────────────────────

function Section({ title, icon: Icon, children, action }: {
  title: string
  icon: React.ElementType
  children: React.ReactNode
  action?: React.ReactNode
}) {
  return (
    <div className="bg-background-card border border-border rounded-xl overflow-hidden">
      <div className="flex items-center justify-between px-5 py-4 border-b border-border">
        <div className="flex items-center gap-3">
          <Icon size={16} className="text-primary-500" />
          <h2 className="text-sm font-bold">{title}</h2>
        </div>
        {action}
      </div>
      <div className="p-5">{children}</div>
    </div>
  )
}

function Field({ label, children, hint }: { label: string; children: React.ReactNode; hint?: string }) {
  return (
    <div className="space-y-1.5">
      <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">{label}</label>
      {children}
      {hint && <p className="text-[11px] text-muted-foreground">{hint}</p>}
    </div>
  )
}

const inputCls = 'w-full bg-background border border-border rounded-lg px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-primary-500 placeholder:text-muted-foreground/40 disabled:opacity-50'

function SkeletonLine({ w = 'w-32' }: { w?: string }) {
  return <div className={`h-3.5 ${w} bg-background-border rounded animate-pulse`} />
}

function relativeTime(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime()
  const m = Math.floor(diff / 60_000)
  if (m < 1) return 'Just now'
  if (m < 60) return `${m}m ago`
  const h = Math.floor(m / 60)
  if (h < 24) return `${h}h ago`
  const d = Math.floor(h / 24)
  return `${d}d ago`
}

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })
}

// ─── Profile Hero Card ────────────────────────────────────────────────────────

function ProfileHeroCard() {
  const { data, isLoading } = useProfile()
  const role = useAuthStore((s) => s.user?.role) as UserRole | undefined
  const rb = role ? ROLE_BADGE[role] : null

  const initials = (data?.name ?? '?')
    .split(' ')
    .map((w) => w[0])
    .slice(0, 2)
    .join('')
    .toUpperCase()

  return (
    <div className="bg-background-card border border-border rounded-xl p-6">
      {isLoading ? (
        <div className="flex items-center gap-5">
          <div className="w-20 h-20 rounded-full bg-background-border animate-pulse shrink-0" />
          <div className="space-y-2.5 flex-1">
            <SkeletonLine w="w-44" />
            <SkeletonLine w="w-24" />
            <SkeletonLine w="w-36" />
          </div>
        </div>
      ) : (
        <div className="flex items-center gap-5 flex-wrap">
          <div className="w-20 h-20 rounded-full bg-primary-500/15 text-primary-500 text-2xl font-bold flex items-center justify-center shrink-0 ring-4 ring-primary-500/10">
            {initials}
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-3 flex-wrap mb-2">
              <h2 className="text-xl font-bold truncate">{data?.name}</h2>
              {rb && <Badge variant={rb.variant}>{rb.label}</Badge>}
            </div>
            <div className="flex items-center gap-5 flex-wrap">
              {data?.phone && (
                <span className="flex items-center gap-1.5 text-sm text-muted-foreground">
                  <Phone size={13} /> {data.phone}
                </span>
              )}
              {data?.email ? (
                <span className="flex items-center gap-1.5 text-sm text-muted-foreground">
                  <Mail size={13} /> {data.email}
                </span>
              ) : (
                <span className="flex items-center gap-1.5 text-sm text-muted-foreground/40 italic">
                  <Mail size={13} /> No email set
                </span>
              )}
            </div>
            {/* Quick stats row */}
            <div className="flex items-center gap-4 mt-3 flex-wrap">
              {data?.lastLoginAt && (
                <span className="text-[11px] text-muted-foreground">
                  Last login: {relativeTime(data.lastLoginAt)}
                </span>
              )}
              {data?.passwordChangedAt && (
                <span className="text-[11px] text-muted-foreground">
                  Password changed: {formatDate(data.passwordChangedAt)}
                </span>
              )}
              <span className={`text-[11px] font-medium ${data?.hasPIN ? 'text-success' : 'text-muted-foreground'}`}>
                PIN: {data?.hasPIN ? 'Set' : 'Not set'}
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

// ─── Profile Info Section ─────────────────────────────────────────────────────

function ProfileSection() {
  const { data, isLoading } = useProfile()
  const update = useUpdateProfile()

  const [name,  setName]  = useState('')
  const [phone, setPhone] = useState('')
  const [email, setEmail] = useState('')

  useEffect(() => {
    if (data) { setName(data.name); setPhone(data.phone); setEmail(data.email ?? '') }
  }, [data])

  if (isLoading) return <div className="flex justify-center py-8"><Spinner size="lg" className="text-primary-500" /></div>

  return (
    <div className="space-y-4">
      <Field label="Full Name">
        <input value={name} onChange={e => setName(e.target.value)} className={inputCls} placeholder="Full name" />
      </Field>
      <Field label="Phone Number">
        <input value={phone} onChange={e => setPhone(e.target.value)} className={inputCls} placeholder="10-digit mobile" pattern="[6-9]\d{9}" />
      </Field>
      <Field label="Email Address" hint="Used for receipts and account recovery.">
        <input value={email} onChange={e => setEmail(e.target.value)} type="email" className={inputCls} placeholder="you@email.com" />
      </Field>
      <div className="flex justify-end pt-1">
        <Button disabled={update.isPending} onClick={() => update.mutate({ name, phone, email: email || null })}>
          {update.isPending && <Spinner size="xs" className="mr-2" />}
          Save Changes
        </Button>
      </div>
    </div>
  )
}

// ─── Permissions Section ──────────────────────────────────────────────────────

function PermissionsSection() {
  const role = useAuthStore((s) => s.user?.role) as UserRole | undefined
  const granted = role ? ROLE_PERMISSIONS[role] : []

  return (
    <div className="grid grid-cols-2 gap-2">
      {ALL_PERMISSIONS.map((perm) => {
        const has = granted.includes(perm)
        return (
          <div
            key={perm}
            className={`flex items-center gap-2 px-3 py-2 rounded-lg border text-xs font-medium ${
              has
                ? 'bg-success/8 border-success/20 text-success'
                : 'bg-background border-border text-muted-foreground/50'
            }`}
          >
            {has
              ? <CheckCircle2 size={12} className="shrink-0" />
              : <XCircle size={12} className="shrink-0 opacity-40" />
            }
            {perm}
          </div>
        )
      })}
    </div>
  )
}

// ─── Change Password Section ──────────────────────────────────────────────────

function PasswordSection() {
  const change = useChangePassword()
  const [current, setCurrent] = useState('')
  const [next,    setNext]    = useState('')
  const [confirm, setConfirm] = useState('')
  const [error,   setError]   = useState('')

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    if (next !== confirm) { setError('New passwords do not match.'); return }
    if (next.length < 8)  { setError('New password must be at least 8 characters.'); return }
    change.mutate(
      { currentPassword: current, newPassword: next },
      { onSuccess: () => { setCurrent(''); setNext(''); setConfirm('') } },
    )
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <Field label="Current Password">
        <input value={current} onChange={e => setCurrent(e.target.value)} type="password" className={inputCls} placeholder="Enter current password" required autoComplete="current-password" />
      </Field>
      <Field label="New Password">
        <input value={next} onChange={e => setNext(e.target.value)} type="password" className={inputCls} placeholder="Min. 8 characters" required minLength={8} autoComplete="new-password" />
      </Field>
      <Field label="Confirm New Password">
        <input value={confirm} onChange={e => setConfirm(e.target.value)} type="password" className={inputCls} placeholder="Repeat new password" required autoComplete="new-password" />
      </Field>
      {error && <p className="text-xs text-danger">{error}</p>}
      <div className="flex justify-end pt-1">
        <Button type="submit" disabled={change.isPending}>
          {change.isPending && <Spinner size="xs" className="mr-2" />}
          Change Password
        </Button>
      </div>
    </form>
  )
}

// ─── PIN Section ──────────────────────────────────────────────────────────────

function PINSection() {
  const setPin = useSetPIN()
  const [pin,     setPin_]    = useState('')
  const [confirm, setConfirm] = useState('')
  const [error,   setError]   = useState('')

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    if (!/^\d{4}$/.test(pin)) { setError('PIN must be exactly 4 digits.'); return }
    if (pin !== confirm)      { setError('PINs do not match.'); return }
    setPin.mutate({ pin }, { onSuccess: () => { setPin_(''); setConfirm('') } })
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <p className="text-xs text-muted-foreground">
        Your 4-digit PIN is used for quick POS login on shared terminals without typing your password.
      </p>
      <Field label="New PIN">
        <input value={pin} onChange={e => setPin_(e.target.value.replace(/\D/g, '').slice(0, 4))} className={inputCls} placeholder="4 digits" maxLength={4} inputMode="numeric" required />
      </Field>
      <Field label="Confirm PIN">
        <input value={confirm} onChange={e => setConfirm(e.target.value.replace(/\D/g, '').slice(0, 4))} className={inputCls} placeholder="Repeat PIN" maxLength={4} inputMode="numeric" required />
      </Field>
      {error && <p className="text-xs text-danger">{error}</p>}
      <div className="flex justify-end pt-1">
        <Button type="submit" disabled={setPin.isPending}>
          {setPin.isPending && <Spinner size="xs" className="mr-2" />}
          Update PIN
        </Button>
      </div>
    </form>
  )
}

// ─── Security Info Section ────────────────────────────────────────────────────

function SecuritySection() {
  return (
    <div className="space-y-3">
      {[
        { icon: KeyRound, title: 'Password hashing', body: 'bcrypt with 12 rounds — industry standard.' },
        { icon: Shield,   title: 'Session tokens',   body: 'Access tokens expire in 15 min. Refresh tokens last 30 days and rotate on use.' },
        { icon: Lock,     title: 'Brute-force protection', body: '5 failed login attempts lock your account for 30 minutes.' },
      ].map(({ icon: I, title, body }) => (
        <div key={title} className="flex items-start gap-3 p-3 rounded-lg bg-background border border-border">
          <I size={14} className="text-primary-500 mt-0.5 shrink-0" />
          <div>
            <p className="text-xs font-semibold text-foreground">{title}</p>
            <p className="text-xs text-muted-foreground mt-0.5">{body}</p>
          </div>
        </div>
      ))}
    </div>
  )
}

// ─── Active Sessions Section ──────────────────────────────────────────────────

function SessionsSection() {
  const { data: sessions, isLoading } = useMySessions()
  const revoke = useRevokeSession()
  const revokeAll = useRevokeAllSessions()

  const others = sessions?.filter((s) => !s.isCurrent) ?? []

  return (
    <div className="space-y-3">
      {isLoading ? (
        <div className="space-y-2">
          {[1, 2].map((i) => (
            <div key={i} className="h-14 bg-background-border rounded-lg animate-pulse" />
          ))}
        </div>
      ) : sessions?.length === 0 ? (
        <p className="text-xs text-muted-foreground text-center py-4">No active sessions found.</p>
      ) : (
        <div className="space-y-2">
          {sessions?.map((s) => (
            <div
              key={s.id}
              className={`flex items-center justify-between gap-3 px-4 py-3 rounded-lg border ${
                s.isCurrent ? 'bg-primary-500/5 border-primary-500/20' : 'bg-background border-border'
              }`}
            >
              <div className="flex items-center gap-3 min-w-0">
                <div className={`shrink-0 p-1.5 rounded-lg ${s.isCurrent ? 'bg-primary-500/10 text-primary-500' : 'bg-background-border text-muted-foreground'}`}>
                  {s.deviceInfo?.toLowerCase().includes('mobile') || s.deviceInfo?.toLowerCase().includes('android') || s.deviceInfo?.toLowerCase().includes('ios')
                    ? <Smartphone size={14} />
                    : <Monitor size={14} />
                  }
                </div>
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="text-xs font-semibold truncate">{s.deviceInfo ?? 'Unknown device'}</p>
                    {s.isCurrent && (
                      <span className="text-[10px] font-bold text-primary-500 bg-primary-500/10 px-1.5 py-0.5 rounded-full shrink-0">
                        Current
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-2 mt-0.5">
                    {s.ipAddress && (
                      <span className="flex items-center gap-1 text-[11px] text-muted-foreground">
                        <Globe size={10} /> {s.ipAddress}
                      </span>
                    )}
                    <span className="text-[11px] text-muted-foreground">
                      {relativeTime(s.createdAt)}
                    </span>
                  </div>
                </div>
              </div>
              {!s.isCurrent && (
                <Button
                  variant="ghost"
                  size="sm"
                  className="shrink-0 text-danger hover:bg-danger/10 h-7 px-2"
                  disabled={revoke.isPending}
                  onClick={() => revoke.mutate(s.id)}
                >
                  <LogOut size={12} className="mr-1" />
                  Sign out
                </Button>
              )}
            </div>
          ))}
        </div>
      )}

      {others.length > 0 && (
        <div className="flex justify-end pt-1">
          <Button
            variant="ghost"
            size="sm"
            className="text-danger hover:bg-danger/10"
            disabled={revokeAll.isPending}
            onClick={() => revokeAll.mutate()}
          >
            {revokeAll.isPending && <Spinner size="xs" className="mr-2" />}
            <LogOut size={13} className="mr-1.5" />
            Sign out of all other devices
          </Button>
        </div>
      )}
    </div>
  )
}

// ─── Login History Section ────────────────────────────────────────────────────

function LoginHistorySection() {
  const { data: history, isLoading } = useLoginHistory()

  return (
    <div className="space-y-2">
      {isLoading ? (
        <div className="space-y-2">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-10 bg-background-border rounded-lg animate-pulse" />
          ))}
        </div>
      ) : history?.length === 0 ? (
        <p className="text-xs text-muted-foreground text-center py-4">No login history available.</p>
      ) : (
        history?.map((entry) => {
          const success = entry.action === 'LOGIN_SUCCESS'
          return (
            <div
              key={entry.id}
              className="flex items-center justify-between gap-3 px-4 py-2.5 rounded-lg bg-background border border-border"
            >
              <div className="flex items-center gap-2.5 min-w-0">
                {success
                  ? <CheckCircle2 size={14} className="shrink-0 text-success" />
                  : <XCircle    size={14} className="shrink-0 text-danger" />
                }
                <div className="min-w-0">
                  <span className={`text-xs font-semibold ${success ? 'text-success' : 'text-danger'}`}>
                    {success ? 'Successful login' : 'Failed attempt'}
                  </span>
                  {entry.method && (
                    <span className="ml-2 text-[11px] text-muted-foreground capitalize">via {entry.method}</span>
                  )}
                </div>
              </div>
              <div className="flex items-center gap-3 shrink-0">
                {entry.ipAddress && (
                  <span className="text-[11px] text-muted-foreground hidden sm:block">{entry.ipAddress}</span>
                )}
                <span className="flex items-center gap-1 text-[11px] text-muted-foreground">
                  <Clock size={10} /> {relativeTime(entry.createdAt)}
                </span>
              </div>
            </div>
          )
        })
      )}
    </div>
  )
}

// ─── Notification Preferences Section ────────────────────────────────────────

const NOTIF_OPTIONS: { key: keyof NotifPrefs; label: string; description: string }[] = [
  { key: 'notifOrderAlerts',  label: 'Order alerts',       description: 'New orders placed and status changes.' },
  { key: 'notifLowStock',     label: 'Low stock alerts',   description: 'When inventory items fall below threshold.' },
  { key: 'notifDailyReport',  label: 'Daily report',       description: 'End-of-day sales summary.' },
  { key: 'notifLoginAlert',   label: 'Login alerts',       description: 'When your account is accessed from a new device.' },
]

function Toggle({ enabled, onChange, disabled }: { enabled: boolean; onChange: () => void; disabled?: boolean }) {
  return (
    <button
      type="button"
      disabled={disabled}
      onClick={onChange}
      role="switch"
      aria-checked={enabled}
      className={`relative shrink-0 w-10 h-6 rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-1 disabled:opacity-50 ${
        enabled ? 'bg-primary-500' : 'bg-background-border'
      }`}
    >
      <span
        className={`absolute top-1 left-1 w-4 h-4 rounded-full bg-white shadow-sm transition-transform ${
          enabled ? 'translate-x-4' : 'translate-x-0'
        }`}
      />
    </button>
  )
}

function NotifPrefsSection() {
  const { data, isLoading } = useNotifPrefs()
  const update = useUpdateNotifPrefs()

  function toggle(key: keyof NotifPrefs) {
    if (!data) return
    update.mutate({ [key]: !data[key] })
  }

  if (isLoading) {
    return (
      <div className="space-y-3">
        {[1, 2, 3, 4].map((i) => <div key={i} className="h-14 bg-background-border rounded-lg animate-pulse" />)}
      </div>
    )
  }

  return (
    <div className="space-y-2">
      {NOTIF_OPTIONS.map(({ key, label, description }) => (
        <div key={key} className="flex items-center justify-between gap-4 px-4 py-3 rounded-lg bg-background border border-border">
          <div className="min-w-0">
            <p className="text-xs font-semibold">{label}</p>
            <p className="text-[11px] text-muted-foreground mt-0.5">{description}</p>
          </div>
          <Toggle
            enabled={data?.[key] ?? false}
            onChange={() => toggle(key)}
            disabled={update.isPending}
          />
        </div>
      ))}
    </div>
  )
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function ProfilePage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-lg font-bold">My Profile</h1>
        <p className="text-sm text-muted-foreground mt-0.5">Manage your personal information and account security.</p>
      </div>

      {/* Hero — avatar, name, role, quick stats */}
      <ProfileHeroCard />

      {/* Row 1: Personal info + role permissions */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Section title="Profile Information" icon={User}>
          <ProfileSection />
        </Section>

        <Section title="My Permissions" icon={Shield}>
          <PermissionsSection />
        </Section>
      </div>

      {/* Row 2: Credentials side by side */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Section title="Change Password" icon={Lock}>
          <PasswordSection />
        </Section>

        <Section title="POS Login PIN" icon={Hash}>
          <PINSection />
        </Section>
      </div>

      {/* Notification preferences */}
      <Section title="Notification Preferences" icon={Bell}>
        <NotifPrefsSection />
      </Section>

      {/* Full-width: live activity monitoring */}
      <Section title="Active Sessions" icon={Monitor}>
        <SessionsSection />
      </Section>

      <Section title="Recent Login Activity" icon={Clock}>
        <LoginHistorySection />
      </Section>

      {/* Security info — static, least urgent, goes last */}
      <Section title="Security" icon={KeyRound}>
        <SecuritySection />
      </Section>
    </div>
  )
}
