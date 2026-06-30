'use client'

import { useState } from 'react'
import { useMutation } from '@tanstack/react-query'
import { ArrowLeft, CheckCircle2 } from 'lucide-react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Spinner } from '@/components/ui/spinner'
import { cn } from '@/lib/utils'

const BASE_URL = process.env['NEXT_PUBLIC_API_URL'] ?? ''

const RESTAURANT_TYPES = [
  { value: 'QSR', label: 'QSR / Fast Food' },
  { value: 'CASUAL_DINING', label: 'Casual Dining' },
  { value: 'FINE_DINING', label: 'Fine Dining' },
  { value: 'CAFE', label: 'Cafe / Bakery' },
  { value: 'BAR', label: 'Bar & Grill' },
  { value: 'CLOUD_KITCHEN', label: 'Cloud Kitchen' },
  { value: 'FOOD_TRUCK', label: 'Food Truck' },
  { value: 'DHABA', label: 'Dhaba' },
  { value: 'SWEET_SHOP', label: 'Sweet Shop' },
] as const

interface RegisterPayload {
  restaurantName: string
  restaurantType: string
  city: string
  state: string
  ownerName: string
  ownerPhone: string
  pin: string
}

interface RegisterResult {
  tenantId: string
  slug: string
  name: string
  message: string
}

function useRegister() {
  return useMutation({
    mutationFn: async (payload: RegisterPayload): Promise<RegisterResult> => {
      const res = await fetch(`${BASE_URL}/api/v1/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })
      const json = await res.json() as { success: boolean; data?: RegisterResult; error?: { message?: string } }
      if (!res.ok) throw new Error(json.error?.message ?? 'Registration failed')
      return json.data!
    },
  })
}

// ─── Step indicators ──────────────────────────────────────────────────────────

function Steps({ current }: { current: number }) {
  const steps = ['Restaurant', 'Owner', 'PIN']
  return (
    <div className="flex items-center justify-center gap-2 mb-8">
      {steps.map((label, i) => (
        <div key={label} className="flex items-center gap-2">
          <div className={cn(
            'w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold transition-all',
            i + 1 < current ? 'bg-primary-500 text-white' :
            i + 1 === current ? 'bg-primary-500 text-white ring-4 ring-primary-500/20' :
            'bg-background-card border border-border text-muted-foreground'
          )}>
            {i + 1 < current ? '✓' : i + 1}
          </div>
          <span className={cn('text-xs font-medium hidden sm:block', i + 1 === current ? 'text-foreground' : 'text-muted-foreground')}>
            {label}
          </span>
          {i < steps.length - 1 && <div className={cn('w-8 h-px', i + 1 < current ? 'bg-primary-500' : 'bg-border')} />}
        </div>
      ))}
    </div>
  )
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function RegisterPage() {
  const [step, setStep] = useState(1)
  const [form, setForm] = useState({
    restaurantName: '',
    restaurantType: 'CASUAL_DINING',
    city: '',
    state: '',
    ownerName: '',
    ownerPhone: '',
    pin: '',
    pinConfirm: '',
  })
  const [result, setResult] = useState<RegisterResult | null>(null)
  const register = useRegister()

  const set = (key: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) =>
    setForm((f) => ({ ...f, [key]: e.target.value }))

  const handleStep1 = (e: React.FormEvent) => {
    e.preventDefault()
    if (!form.restaurantName || !form.city || !form.state) return
    setStep(2)
  }

  const handleStep2 = (e: React.FormEvent) => {
    e.preventDefault()
    if (!form.ownerName || form.ownerPhone.length !== 10) return
    setStep(3)
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (form.pin.length !== 4 || form.pin !== form.pinConfirm) return
    register.mutate(
      {
        restaurantName: form.restaurantName,
        restaurantType: form.restaurantType,
        city: form.city,
        state: form.state,
        ownerName: form.ownerName,
        ownerPhone: form.ownerPhone,
        pin: form.pin,
      },
      { onSuccess: (data) => setResult(data) },
    )
  }

  if (result) {
    return (
      <div className="w-full max-w-[420px] animate-fade-in text-center">
        <div className="rounded-2xl border border-border bg-card p-8 shadow-xl shadow-black/20">
          <div className="w-16 h-16 rounded-full bg-success/15 flex items-center justify-center mx-auto mb-4">
            <CheckCircle2 size={32} className="text-success" />
          </div>
          <h2 className="text-xl font-bold text-foreground mb-2">Registration Submitted!</h2>
          <p className="text-sm text-muted-foreground mb-4">
            <span className="font-semibold text-foreground">{result.name}</span> is registered.
            Our team will call you within 24 hours to activate your account.
          </p>
          <div className="bg-background rounded-xl p-3 text-left mb-6">
            <p className="text-xs text-muted-foreground mb-1">Your restaurant ID</p>
            <p className="text-xs font-mono font-semibold text-foreground break-all">{result.tenantId}</p>
          </div>
          <Link
            href="/login"
            className="block w-full bg-primary-500 text-white rounded-xl py-2.5 text-sm font-bold text-center"
          >
            Go to Login
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="w-full max-w-[420px] animate-fade-in">
      <div className="flex flex-col items-center mb-6">
        <h1 className="text-xl font-bold text-foreground">
          <span className="text-primary-500">Atlas</span> POS
        </h1>
        <p className="text-sm text-muted-foreground mt-1">Register your restaurant</p>
      </div>

      <Steps current={step} />

      <div className="rounded-2xl border border-border bg-card p-6 shadow-xl shadow-black/20">
        {/* Step 1 — Restaurant details */}
        {step === 1 && (
          <form onSubmit={handleStep1} className="space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="rname">Restaurant name</Label>
              <Input id="rname" placeholder="e.g. Pizza Palace" value={form.restaurantName} onChange={set('restaurantName')} required />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="rtype">Restaurant type</Label>
              <select
                id="rtype"
                value={form.restaurantType}
                onChange={set('restaurantType')}
                className="w-full bg-background border border-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-primary-500 text-foreground"
              >
                {RESTAURANT_TYPES.map((t) => (
                  <option key={t.value} value={t.value}>{t.label}</option>
                ))}
              </select>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label htmlFor="city">City</Label>
                <Input id="city" placeholder="Mumbai" value={form.city} onChange={set('city')} required />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="state">State</Label>
                <Input id="state" placeholder="Maharashtra" value={form.state} onChange={set('state')} required />
              </div>
            </div>
            <Button type="submit" className="w-full mt-2" disabled={!form.restaurantName || !form.city || !form.state}>
              Continue
            </Button>
          </form>
        )}

        {/* Step 2 — Owner details */}
        {step === 2 && (
          <form onSubmit={handleStep2} className="space-y-4">
            <button type="button" onClick={() => setStep(1)} className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors mb-1">
              <ArrowLeft size={13} /> Back
            </button>
            <div className="space-y-1.5">
              <Label htmlFor="oname">Your full name</Label>
              <Input id="oname" placeholder="Ravi Kumar" value={form.ownerName} onChange={set('ownerName')} required />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="ophone">Mobile number</Label>
              <div className="relative">
                <div className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground text-sm font-medium pointer-events-none">+91</div>
                <Input
                  id="ophone"
                  type="tel"
                  inputMode="numeric"
                  placeholder="9876543210"
                  value={form.ownerPhone}
                  onChange={(e) => setForm((f) => ({ ...f, ownerPhone: e.target.value.replace(/\D/g, '').slice(0, 10) }))}
                  className="pl-10"
                  required
                />
              </div>
            </div>
            <Button type="submit" className="w-full mt-2" disabled={!form.ownerName || form.ownerPhone.length !== 10}>
              Continue
            </Button>
          </form>
        )}

        {/* Step 3 — Set PIN */}
        {step === 3 && (
          <form onSubmit={handleSubmit} className="space-y-4">
            <button type="button" onClick={() => setStep(2)} className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors mb-1">
              <ArrowLeft size={13} /> Back
            </button>
            <p className="text-xs text-muted-foreground">Set a 4-digit PIN you'll use to log in every day.</p>
            <div className="space-y-1.5">
              <Label htmlFor="pin">Create PIN</Label>
              <Input
                id="pin"
                type="password"
                inputMode="numeric"
                placeholder="••••"
                maxLength={4}
                value={form.pin}
                onChange={(e) => setForm((f) => ({ ...f, pin: e.target.value.replace(/\D/g, '').slice(0, 4) }))}
                className="tracking-[0.5em] text-center"
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="pinc">Confirm PIN</Label>
              <Input
                id="pinc"
                type="password"
                inputMode="numeric"
                placeholder="••••"
                maxLength={4}
                value={form.pinConfirm}
                onChange={(e) => setForm((f) => ({ ...f, pinConfirm: e.target.value.replace(/\D/g, '').slice(0, 4) }))}
                className="tracking-[0.5em] text-center"
                error={form.pinConfirm.length === 4 && form.pin !== form.pinConfirm}
              />
              {form.pinConfirm.length === 4 && form.pin !== form.pinConfirm && (
                <p className="text-xs text-danger">PINs do not match</p>
              )}
            </div>
            {register.isError && (
              <p className="text-xs text-danger animate-fade-in">{register.error?.message}</p>
            )}
            <Button
              type="submit"
              className="w-full mt-2"
              disabled={register.isPending || form.pin.length !== 4 || form.pin !== form.pinConfirm}
            >
              {register.isPending ? <><Spinner size="sm" /> Registering…</> : 'Register Restaurant'}
            </Button>
          </form>
        )}
      </div>

      <p className="text-center text-xs text-muted-foreground mt-4">
        Already registered?{' '}
        <Link href="/login" className="text-primary-500 underline font-medium">Sign in</Link>
      </p>
    </div>
  )
}
