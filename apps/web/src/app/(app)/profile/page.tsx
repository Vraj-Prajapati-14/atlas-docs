'use client'

import { useState, useEffect } from 'react'
import { User, Lock, Hash, Shield } from 'lucide-react'
import { useProfile, useUpdateProfile, useChangePassword, useSetPIN } from '@/hooks/use-profile'
import { useAuthStore } from '@/lib/auth-store'
import { Button } from '@/components/ui/button'
import { Spinner } from '@/components/ui/spinner'
import { Badge } from '@/components/ui/badge'
import type { UserRole } from '@/lib/api-types'

const ROLE_BADGE: Record<UserRole, { label: string; variant: 'success' | 'warning' | 'info' | 'muted' | 'default' | 'danger' }> = {
  OWNER:             { label: 'Owner',          variant: 'danger'  },
  MANAGER:           { label: 'Manager',        variant: 'warning' },
  CASHIER:           { label: 'Cashier',        variant: 'info'    },
  WAITER:            { label: 'Waiter',         variant: 'default' },
  CHEF:              { label: 'Chef',           variant: 'success' },
  INVENTORY_MANAGER: { label: 'Inventory Mgr', variant: 'muted'   },
}

function Section({ title, icon: Icon, children }: { title: string; icon: React.ElementType; children: React.ReactNode }) {
  return (
    <div className="bg-background-card border border-border rounded-xl overflow-hidden">
      <div className="flex items-center gap-3 px-5 py-4 border-b border-border">
        <Icon size={16} className="text-primary-500" />
        <h2 className="text-sm font-bold">{title}</h2>
      </div>
      <div className="p-5">{children}</div>
    </div>
  )
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="space-y-1.5">
      <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">{label}</label>
      {children}
    </div>
  )
}

const inputCls = 'w-full bg-background border border-border rounded-lg px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-primary-500 placeholder:text-muted-foreground/40 disabled:opacity-50'

// ─── Profile Info Section ─────────────────────────────────────────────────────

function ProfileSection() {
  const { data, isLoading } = useProfile()
  const update = useUpdateProfile()
  const role = useAuthStore((s) => s.user?.role) as UserRole | undefined

  const [name,  setName]  = useState('')
  const [phone, setPhone] = useState('')
  const [email, setEmail] = useState('')

  useEffect(() => {
    if (data) {
      setName(data.name)
      setPhone(data.phone)
      setEmail(data.email ?? '')
    }
  }, [data])

  if (isLoading) return <div className="flex justify-center py-8"><Spinner size="lg" className="text-primary-500" /></div>

  const rb = role ? ROLE_BADGE[role] : null

  return (
    <div className="space-y-4">
      {/* Avatar + role */}
      <div className="flex items-center gap-4">
        <div className="w-14 h-14 rounded-full bg-primary-500/15 text-primary-500 text-xl font-bold flex items-center justify-center shrink-0">
          {(data?.name ?? '?').charAt(0).toUpperCase()}
        </div>
        <div>
          <p className="font-bold text-base">{data?.name}</p>
          {rb && <Badge variant={rb.variant} className="mt-1">{rb.label}</Badge>}
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <Field label="Full Name">
          <input value={name} onChange={e => setName(e.target.value)} className={inputCls} placeholder="Full name" />
        </Field>
        <Field label="Phone">
          <input value={phone} onChange={e => setPhone(e.target.value)} className={inputCls} placeholder="10-digit mobile" pattern="[6-9]\d{9}" />
        </Field>
        <Field label="Email (optional)">
          <input value={email} onChange={e => setEmail(e.target.value)} type="email" className={inputCls} placeholder="you@email.com" />
        </Field>
      </div>

      <div className="flex justify-end">
        <Button disabled={update.isPending} onClick={() => update.mutate({ name, phone, email: email || null })}>
          {update.isPending && <Spinner size="xs" className="mr-2" />}
          Save Profile
        </Button>
      </div>
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
    change.mutate({ currentPassword: current, newPassword: next }, {
      onSuccess: () => { setCurrent(''); setNext(''); setConfirm('') }
    })
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <Field label="Current Password">
        <input value={current} onChange={e => setCurrent(e.target.value)} type="password" className={inputCls} placeholder="Enter current password" required />
      </Field>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <Field label="New Password">
          <input value={next} onChange={e => setNext(e.target.value)} type="password" className={inputCls} placeholder="Min. 8 characters" required minLength={8} />
        </Field>
        <Field label="Confirm New Password">
          <input value={confirm} onChange={e => setConfirm(e.target.value)} type="password" className={inputCls} placeholder="Repeat new password" required />
        </Field>
      </div>
      {error && <p className="text-xs text-danger">{error}</p>}
      <div className="flex justify-end">
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
  const [pin,    setPin_]    = useState('')
  const [confirm, setConfirm] = useState('')
  const [error,   setError]   = useState('')

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    if (!/^\d{4}$/.test(pin))  { setError('PIN must be exactly 4 digits.'); return }
    if (pin !== confirm)       { setError('PINs do not match.'); return }
    setPin.mutate({ pin }, { onSuccess: () => { setPin_(''); setConfirm('') } })
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <p className="text-xs text-muted-foreground">Your 4-digit PIN is used for quick POS login on shared terminals.</p>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <Field label="New PIN">
          <input value={pin} onChange={e => setPin_(e.target.value.replace(/\D/g, '').slice(0, 4))}
            className={inputCls} placeholder="4 digits" maxLength={4} inputMode="numeric" required />
        </Field>
        <Field label="Confirm PIN">
          <input value={confirm} onChange={e => setConfirm(e.target.value.replace(/\D/g, '').slice(0, 4))}
            className={inputCls} placeholder="Repeat PIN" maxLength={4} inputMode="numeric" required />
        </Field>
      </div>
      {error && <p className="text-xs text-danger">{error}</p>}
      <div className="flex justify-end">
        <Button type="submit" disabled={setPin.isPending}>
          {setPin.isPending && <Spinner size="xs" className="mr-2" />}
          Update PIN
        </Button>
      </div>
    </form>
  )
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function ProfilePage() {
  return (
    <div className="max-w-2xl space-y-5">
      <div>
        <h1 className="text-lg font-bold">My Profile</h1>
        <p className="text-sm text-muted-foreground mt-0.5">Update your personal information and security settings.</p>
      </div>

      <Section title="Profile Information" icon={User}>
        <ProfileSection />
      </Section>

      <Section title="Change Password" icon={Lock}>
        <PasswordSection />
      </Section>

      <Section title="POS Login PIN" icon={Hash}>
        <PINSection />
      </Section>

      <Section title="Security" icon={Shield}>
        <div className="text-xs text-muted-foreground space-y-1">
          <p>• Passwords are hashed with bcrypt (12 rounds).</p>
          <p>• Access tokens expire in 15 minutes; refresh tokens in 30 days.</p>
          <p>• 5 failed login attempts lock your account for 30 minutes.</p>
        </div>
      </Section>
    </div>
  )
}
