'use client'

import { Suspense, useEffect, useState } from 'react'
import { Eye, EyeOff, Phone, Mail, KeyRound, ArrowLeft, Building2 } from 'lucide-react'
import Link from 'next/link'
import { useSearchParams, useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { useLookupTenant, useLoginEmail, useLoginPIN, type TenantOption } from '@/hooks/use-auth'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Spinner } from '@/components/ui/spinner'
import { cn } from '@/lib/utils'

// Converts raw Error.message into user-friendly text.
// API errors (from ApiError) already carry human-readable messages from the backend.
// This helper handles the cases the API never sees: network failures.
function friendlyMsg(error: Error | null | undefined, fallback: string): string {
  if (!error) return fallback
  const msg = error.message ?? ''
  if (
    msg === 'Failed to fetch' ||
    msg.toLowerCase().includes('networkerror') ||
    msg.toLowerCase().includes('network request failed')
  ) {
    return 'Network error — check your connection and try again.'
  }
  return msg || fallback
}

// Shows toast.info('Logged out') AFTER navigation lands on login — never before.
// Reads ?loggedOut=1 set by useLogout.onSettled and cleans the URL.
function LoggedOutNotice() {
  const params = useSearchParams()
  const router = useRouter()
  useEffect(() => {
    if (!params.get('loggedOut')) return
    // id='auth-logout' deduplicates in case the effect fires more than once.
    toast.info('Logged out successfully.', { id: 'auth-logout' })
    router.replace('/login')
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])
  return null
}

// ─── Logo ─────────────────────────────────────────────────────────────────────

function AtlasLogo() {
  return (
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
    </div>
  )
}

// ─── Step 1: Phone entry + tenant lookup ──────────────────────────────────────

function PhoneStep({
  onFound,
}: {
  onFound: (phone: string, tenants: TenantOption[]) => void
}) {
  const lookup = useLookupTenant()
  const [phone, setPhone] = useState('')

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (phone.length !== 10) return
    lookup.mutate(phone, {
      onSuccess(data) {
        if (data.tenants.length === 0) {
          // No restaurant found — show hint without revealing data
          return
        }
        onFound(phone, data.tenants)
      },
    })
  }

  const noResults = lookup.isSuccess && lookup.data?.tenants.length === 0

  return (
    <form onSubmit={handleSubmit} className="space-y-4" noValidate>
      <p className="text-sm text-muted-foreground text-center mb-2">
        Enter your mobile number to continue
      </p>
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
            onChange={(e) => {
                let d = e.target.value.replace(/\D/g, '')
                if (d.length === 12 && d.startsWith('91')) d = d.slice(2)
                setPhone(d.slice(0, 10))
              }}
            disabled={lookup.isPending}
            className="pl-10"
          />
        </div>
      </div>

      {noResults && (
        <p className="text-xs text-danger animate-fade-in" role="alert">
          No restaurant found for this number. Contact your owner, or{' '}
          <Link href="/register" className="underline text-primary-500">register here</Link>.
        </p>
      )}
      {lookup.isError && (
        <p className="text-xs text-danger animate-fade-in" role="alert">
          {friendlyMsg(lookup.error, 'Something went wrong. Try again.')}
        </p>
      )}

      <Button
        type="submit"
        className="w-full mt-2"
        disabled={lookup.isPending || phone.length !== 10}
      >
        {lookup.isPending ? <><Spinner size="sm" /> Searching…</> : 'Continue'}
      </Button>

      <p className="text-center text-xs text-muted-foreground">
        New restaurant?{' '}
        <Link href="/register" className="text-primary-500 underline font-medium">
          Register here
        </Link>
      </p>
    </form>
  )
}

// ─── Step 1b: Restaurant picker (if phone belongs to multiple tenants) ─────────

function TenantPicker({
  tenants,
  onSelect,
  onBack,
}: {
  tenants: TenantOption[]
  onSelect: (tenant: TenantOption) => void
  onBack: () => void
}) {
  return (
    <div className="space-y-3">
      <button
        type="button"
        onClick={onBack}
        className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors"
      >
        <ArrowLeft size={13} /> Back
      </button>
      <p className="text-sm text-muted-foreground text-center">Select your restaurant</p>
      {tenants.map((t) => (
        <button
          key={t.tenantId}
          type="button"
          onClick={() => onSelect(t)}
          className="w-full flex items-center gap-3 p-3 rounded-xl border border-border hover:border-primary-500 hover:bg-primary-500/5 transition-all text-left"
        >
          <div className="w-9 h-9 rounded-lg bg-primary-500/10 flex items-center justify-center shrink-0">
            <Building2 size={18} className="text-primary-500" />
          </div>
          <div className="min-w-0">
            <p className="text-sm font-semibold text-foreground truncate">{t.name}</p>
            <p className="text-xs text-muted-foreground">{t.city}</p>
          </div>
        </button>
      ))}
    </div>
  )
}

// ─── Step 2: PIN entry ────────────────────────────────────────────────────────

function PINStep({
  phone,
  tenant,
  onBack,
}: {
  phone: string
  tenant: TenantOption
  onBack: () => void
}) {
  const loginPIN = useLoginPIN()
  const [pin, setPin] = useState('')

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (pin.length !== 4) return
    loginPIN.mutate({ phone, pin, tenantId: tenant.tenantId })
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4" noValidate>
      <button
        type="button"
        onClick={onBack}
        className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors"
      >
        <ArrowLeft size={13} /> Back
      </button>

      <div className="flex items-center gap-3 p-3 rounded-xl bg-primary-500/5 border border-primary-500/20">
        <div className="w-8 h-8 rounded-lg bg-primary-500/10 flex items-center justify-center shrink-0">
          <Building2 size={15} className="text-primary-500" />
        </div>
        <div>
          <p className="text-sm font-semibold text-foreground">{tenant.name}</p>
          <p className="text-xs text-muted-foreground">{tenant.city}</p>
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
            error={loginPIN.isError}
            disabled={loginPIN.isPending}
            className="pl-9 tracking-[0.5em] text-center"
            autoFocus
          />
        </div>
      </div>

      {loginPIN.isError && (
        <p className="text-xs text-danger animate-fade-in" role="alert">
          {friendlyMsg(loginPIN.error, 'Incorrect PIN. Try again.')}
        </p>
      )}

      <Button
        type="submit"
        className="w-full mt-2"
        disabled={loginPIN.isPending || pin.length !== 4}
      >
        {loginPIN.isPending ? <><Spinner size="sm" /> Signing in…</> : 'Sign in with PIN'}
      </Button>
    </form>
  )
}

// ─── Email form (separate tab) ────────────────────────────────────────────────

function EmailForm() {
  const login = useLoginEmail()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [tenantId, setTenantId] = useState('')
  const [showPassword, setShowPassword] = useState(false)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!email || !password || !tenantId) return
    login.mutate({ email: email.trim().toLowerCase(), password, tenantId: tenantId.trim() })
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4" noValidate>
      <div className="space-y-1.5">
        <Label htmlFor="tenant-id">Restaurant ID</Label>
        <Input
          id="tenant-id"
          placeholder="Your restaurant ID"
          value={tenantId}
          onChange={(e) => setTenantId(e.target.value)}
          error={login.isError}
          disabled={login.isPending}
        />
      </div>
      <div className="space-y-1.5">
        <Label htmlFor="email">Email address</Label>
        <Input
          id="email"
          type="email"
          autoComplete="email"
          placeholder="owner@restaurant.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          error={login.isError}
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
            error={login.isError}
            disabled={login.isPending}
            className="pr-10"
          />
          <button
            type="button"
            onClick={() => setShowPassword((v) => !v)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
            tabIndex={-1}
          >
            {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
          </button>
        </div>
      </div>

      {login.isError && (
        <p className="text-xs text-danger animate-fade-in" role="alert">
          {friendlyMsg(login.error, 'Login failed — check your credentials.')}
        </p>
      )}

      <Button
        type="submit"
        className="w-full mt-2"
        disabled={login.isPending || !email || !password || !tenantId}
      >
        {login.isPending ? <><Spinner size="sm" /> Signing in…</> : 'Sign in'}
      </Button>
    </form>
  )
}

// ─── Tab button ───────────────────────────────────────────────────────────────

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
        active ? 'bg-card text-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground',
      )}
    >
      {children}
    </button>
  )
}

// ─── Page ─────────────────────────────────────────────────────────────────────

type Tab = 'pin' | 'email'
type Step = 'phone' | 'picker' | 'pin'

export default function LoginPage() {
  const [tab, setTab] = useState<Tab>('pin')
  const [step, setStep] = useState<Step>('phone')
  const [phone, setPhone] = useState('')
  const [tenants, setTenants] = useState<TenantOption[]>([])
  const [selectedTenant, setSelectedTenant] = useState<TenantOption | null>(null)

  const handlePhoneFound = (resolvedPhone: string, resolvedTenants: TenantOption[]) => {
    setPhone(resolvedPhone)
    setTenants(resolvedTenants)
    if (resolvedTenants.length === 1) {
      setSelectedTenant(resolvedTenants[0]!)
      setStep('pin')
    } else {
      setStep('picker')
    }
  }

  const handleTenantSelect = (tenant: TenantOption) => {
    setSelectedTenant(tenant)
    setStep('pin')
  }

  const handleBack = () => {
    if (step === 'pin' && tenants.length > 1) {
      setStep('picker')
    } else {
      setStep('phone')
      setSelectedTenant(null)
    }
  }

  return (
    <div className="w-full max-w-[400px] animate-fade-in">
      {/* Shows "Logged out successfully." toast after logout lands here — not before redirect */}
      <Suspense>
        <LoggedOutNotice />
      </Suspense>
      <AtlasLogo />

      <div className="rounded-2xl border border-border bg-card p-6 shadow-xl shadow-black/20">
        <div className="flex gap-1 p-1 rounded-lg bg-background mb-6">
          <TabBtn active={tab === 'pin'} onClick={() => { setTab('pin'); setStep('phone') }}>
            <Phone size={13} /> PIN Login
          </TabBtn>
          <TabBtn active={tab === 'email'} onClick={() => setTab('email')}>
            <Mail size={13} /> Email
          </TabBtn>
        </div>

        {tab === 'pin' && (
          <>
            {step === 'phone' && <PhoneStep onFound={handlePhoneFound} />}
            {step === 'picker' && (
              <TenantPicker
                tenants={tenants}
                onSelect={handleTenantSelect}
                onBack={() => setStep('phone')}
              />
            )}
            {step === 'pin' && selectedTenant && (
              <PINStep phone={phone} tenant={selectedTenant} onBack={handleBack} />
            )}
          </>
        )}

        {tab === 'email' && <EmailForm />}
      </div>

      <p className="text-center text-xs text-muted-foreground mt-6">
        Staff accounts are managed by your restaurant owner.
      </p>
    </div>
  )
}
