'use client'

import { useState } from 'react'
import { Eye, EyeOff, Phone, Mail, KeyRound } from 'lucide-react'
import { useLoginEmail, useLoginPIN } from '@/hooks/use-auth'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Spinner } from '@/components/ui/spinner'
import { cn } from '@/lib/utils'

type Tab = 'email' | 'pin'

export default function LoginPage() {
  const [tab, setTab] = useState<Tab>('email')

  return (
    <div className="w-full max-w-[400px] animate-fade-in">
      {/* Logo */}
      <div className="flex flex-col items-center mb-8">
        <div className="flex items-center justify-center w-12 h-12 rounded-xl bg-primary-500 mb-4 shadow-[0_4px_20px_rgba(255,107,53,0.4)]">
          <svg width="24" height="24" viewBox="0 0 28 28" fill="none" aria-hidden>
            <path d="M7 20V10l7-3 7 3v10l-7 3-7-3z" stroke="white" strokeWidth="1.5" fill="none" />
            <path d="M14 7v16M7 10l7 4 7-4" stroke="white" strokeWidth="1.5" fill="none" />
          </svg>
        </div>
        <h1 className="text-xl font-bold text-foreground">
          <span className="text-primary-500">Atlas</span> POS
        </h1>
        <p className="text-sm text-muted-foreground mt-1">Sign in to your restaurant</p>
      </div>

      {/* Card */}
      <div className="rounded-2xl border border-border bg-card p-6 shadow-xl shadow-black/20">
        {/* Tabs */}
        <div className="flex gap-1 p-1 rounded-lg bg-background mb-6">
          <TabBtn active={tab === 'email'} onClick={() => setTab('email')}>
            <Mail size={13} /> Email
          </TabBtn>
          <TabBtn active={tab === 'pin'} onClick={() => setTab('pin')}>
            <Phone size={13} /> PIN
          </TabBtn>
        </div>

        {tab === 'email' ? <EmailForm /> : <PINForm />}
      </div>

      <p className="text-center text-xs text-muted-foreground mt-6">
        Staff accounts are managed by your restaurant owner.
      </p>
    </div>
  )
}

function TabBtn({
  active,
  onClick,
  children,
}: {
  active: boolean
  onClick: () => void
  children: React.ReactNode
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        'flex-1 flex items-center justify-center gap-1.5 py-2 rounded-md text-xs font-semibold transition-all duration-150',
        active
          ? 'bg-card text-foreground shadow-sm'
          : 'text-muted-foreground hover:text-foreground',
      )}
    >
      {children}
    </button>
  )
}

function EmailForm() {
  const login = useLoginEmail()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!email || !password) return
    login.mutate({ email: email.trim().toLowerCase(), password })
  }

  const hasError = login.isError

  return (
    <form onSubmit={handleSubmit} className="space-y-4" noValidate>
      <div className="space-y-1.5">
        <Label htmlFor="email">Email address</Label>
        <Input
          id="email"
          type="email"
          autoComplete="email"
          placeholder="owner@restaurant.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          error={hasError}
          disabled={login.isPending}
        />
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="password">Password</Label>
        <div className="relative">
          <Input
            id="password"
            type={showPassword ? 'text' : 'password'}
            autoComplete="current-password"
            placeholder="••••••••"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            error={hasError}
            disabled={login.isPending}
            className="pr-10"
          />
          <button
            type="button"
            onClick={() => setShowPassword((v) => !v)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
            tabIndex={-1}
            aria-label={showPassword ? 'Hide password' : 'Show password'}
          >
            {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
          </button>
        </div>
      </div>

      {hasError && (
        <p className="text-xs text-danger animate-fade-in" role="alert">
          {login.error?.message ?? 'Login failed. Please try again.'}
        </p>
      )}

      <Button
        type="submit"
        className="w-full mt-2"
        disabled={login.isPending || !email || !password}
      >
        {login.isPending ? (
          <>
            <Spinner size="sm" /> Signing in…
          </>
        ) : (
          'Sign in'
        )}
      </Button>
    </form>
  )
}

function PINForm() {
  const login = useLoginPIN()
  const [phone, setPhone] = useState('')
  const [pin, setPin] = useState('')

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!phone || pin.length !== 4) return
    login.mutate({ phone: phone.trim(), pin })
  }

  const hasError = login.isError

  return (
    <form onSubmit={handleSubmit} className="space-y-4" noValidate>
      <div className="space-y-1.5">
        <Label htmlFor="phone">Mobile number</Label>
        <div className="relative">
          <div className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground text-sm font-medium pointer-events-none">
            +91
          </div>
          <Input
            id="phone"
            type="tel"
            inputMode="numeric"
            autoComplete="tel"
            placeholder="9876543210"
            value={phone}
            onChange={(e) => setPhone(e.target.value.replace(/\D/g, '').slice(0, 10))}
            error={hasError}
            disabled={login.isPending}
            className="pl-10"
          />
        </div>
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="pin">4-digit PIN</Label>
        <div className="relative">
          <KeyRound size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none" />
          <Input
            id="pin"
            type="password"
            inputMode="numeric"
            autoComplete="current-password"
            placeholder="••••"
            maxLength={4}
            value={pin}
            onChange={(e) => setPin(e.target.value.replace(/\D/g, '').slice(0, 4))}
            error={hasError}
            disabled={login.isPending}
            className="pl-9 tracking-[0.5em] text-center"
          />
        </div>
      </div>

      {hasError && (
        <p className="text-xs text-danger animate-fade-in" role="alert">
          {login.error?.message ?? 'Login failed. Check your PIN.'}
        </p>
      )}

      <Button
        type="submit"
        className="w-full mt-2"
        disabled={login.isPending || !phone || pin.length !== 4}
      >
        {login.isPending ? (
          <>
            <Spinner size="sm" /> Signing in…
          </>
        ) : (
          'Sign in with PIN'
        )}
      </Button>
    </form>
  )
}
