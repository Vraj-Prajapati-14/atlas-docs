'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { CheckCircle2, ChevronRight, Building2, UtensilsCrossed, Table2, Users, Store, ArrowRight } from 'lucide-react'
import { useMutation } from '@tanstack/react-query'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Spinner } from '@/components/ui/spinner'
import { cn } from '@/lib/utils'
import { apiClient } from '@/lib/api-client'
import { useUpdateOnboardingSteps } from '@/hooks/use-onboarding'
import { useAuthStore } from '@/lib/auth-store'

// ─── Step config ──────────────────────────────────────────────────────────────

const STEPS = [
  { id: 1, key: 'restaurantProfileDone', label: 'Restaurant Profile', icon: Store },
  { id: 2, key: 'outletDone', label: 'Outlet Setup', icon: Building2 },
  { id: 3, key: 'menuDone', label: 'Menu', icon: UtensilsCrossed },
  { id: 4, key: 'tablesDone', label: 'Tables', icon: Table2 },
  { id: 5, key: 'staffDone', label: 'Staff', icon: Users },
] as const

// ─── Progress bar ─────────────────────────────────────────────────────────────

function StepBar({ current }: { current: number }) {
  return (
    <div className="flex items-center justify-between mb-8 px-2">
      {STEPS.map((s, i) => {
        const Icon = s.icon
        const done = s.id < current
        const active = s.id === current
        return (
          <div key={s.id} className="flex items-center gap-1">
            <div className={cn(
              'flex flex-col items-center gap-1',
            )}>
              <div className={cn(
                'w-9 h-9 rounded-full flex items-center justify-center transition-all',
                done ? 'bg-primary-500 text-white' :
                active ? 'bg-primary-500 text-white ring-4 ring-primary-500/20' :
                'bg-background-card border border-border text-muted-foreground'
              )}>
                {done ? <CheckCircle2 size={16} /> : <Icon size={16} />}
              </div>
              <span className={cn('text-[10px] font-medium hidden sm:block', active ? 'text-foreground' : 'text-muted-foreground')}>
                {s.label}
              </span>
            </div>
            {i < STEPS.length - 1 && (
              <div className={cn('w-8 sm:w-14 h-px mb-4', s.id < current ? 'bg-primary-500' : 'bg-border')} />
            )}
          </div>
        )
      })}
    </div>
  )
}

// ─── Step 1: Restaurant Profile ───────────────────────────────────────────────

function Step1({ onDone }: { onDone: () => void }) {
  const update = useUpdateOnboardingSteps()
  const [form, setForm] = useState({ gstin: '', fssai: '', addressLine1: '', pincode: '' })
  const set = (k: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm(f => ({ ...f, [k]: e.target.value }))

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    // Update tenant profile (optional fields — can skip)
    if (form.gstin || form.fssai || form.addressLine1) {
      apiClient.patch('/api/v1/settings/tenant', {
        gstin: form.gstin || undefined,
        fssaiLicense: form.fssai || undefined,
        addressLine1: form.addressLine1 || undefined,
        pincode: form.pincode || undefined,
      }).catch(() => {})
    }
    update.mutate({ restaurantProfileDone: true }, { onSuccess: onDone })
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <p className="text-sm text-muted-foreground mb-2">Add your legal details (optional — you can update these later).</p>
      <div className="space-y-1.5">
        <Label htmlFor="gstin">GSTIN</Label>
        <Input id="gstin" placeholder="22AAAAA0000A1Z5" value={form.gstin} onChange={set('gstin')} />
      </div>
      <div className="space-y-1.5">
        <Label htmlFor="fssai">FSSAI License</Label>
        <Input id="fssai" placeholder="10019022001234" value={form.fssai} onChange={set('fssai')} />
      </div>
      <div className="space-y-1.5">
        <Label htmlFor="addr">Full address</Label>
        <Input id="addr" placeholder="Shop 12, MG Road" value={form.addressLine1} onChange={set('addressLine1')} />
      </div>
      <div className="space-y-1.5">
        <Label htmlFor="pin">Pincode</Label>
        <Input id="pin" placeholder="400001" value={form.pincode} onChange={set('pincode')} maxLength={6} />
      </div>
      <div className="flex gap-3 pt-2">
        <button type="button" onClick={() => update.mutate({ restaurantProfileDone: true }, { onSuccess: onDone })} className="text-sm text-muted-foreground underline">
          Skip for now
        </button>
        <Button type="submit" className="flex-1" disabled={update.isPending}>
          {update.isPending ? <Spinner size="sm" /> : <>Save & Continue <ArrowRight size={14} /></>}
        </Button>
      </div>
    </form>
  )
}

// ─── Step 2: Outlet ───────────────────────────────────────────────────────────

function Step2({ onDone }: { onDone: () => void }) {
  const update = useUpdateOnboardingSteps()
  const [form, setForm] = useState({ name: '', phone: '', addressLine1: '' })
  const set = (k: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm(f => ({ ...f, [k]: e.target.value }))

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (form.name || form.phone) {
      apiClient.patch('/api/v1/settings/outlet', {
        name: form.name || undefined,
        phone: form.phone || undefined,
        addressLine1: form.addressLine1 || undefined,
      }).catch(() => {})
    }
    update.mutate({ outletDone: true }, { onSuccess: onDone })
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <p className="text-sm text-muted-foreground mb-2">Confirm your outlet details.</p>
      <div className="space-y-1.5">
        <Label htmlFor="oname">Outlet name</Label>
        <Input id="oname" placeholder="Main Branch" value={form.name} onChange={set('name')} />
      </div>
      <div className="space-y-1.5">
        <Label htmlFor="ophone">Outlet phone</Label>
        <Input id="ophone" type="tel" placeholder="9876543210" value={form.phone} onChange={set('phone')} />
      </div>
      <div className="space-y-1.5">
        <Label htmlFor="oaddr">Outlet address</Label>
        <Input id="oaddr" placeholder="Shop 12, MG Road" value={form.addressLine1} onChange={set('addressLine1')} />
      </div>
      <div className="flex gap-3 pt-2">
        <button type="button" onClick={() => update.mutate({ outletDone: true }, { onSuccess: onDone })} className="text-sm text-muted-foreground underline">
          Skip
        </button>
        <Button type="submit" className="flex-1" disabled={update.isPending}>
          {update.isPending ? <Spinner size="sm" /> : <>Save & Continue <ArrowRight size={14} /></>}
        </Button>
      </div>
    </form>
  )
}

// ─── Step 3: Menu ─────────────────────────────────────────────────────────────

function Step3({ onDone }: { onDone: () => void }) {
  const update = useUpdateOnboardingSteps()
  return (
    <div className="space-y-4">
      <p className="text-sm text-muted-foreground">How would you like to set up your menu?</p>
      <div className="space-y-2">
        {[
          { label: 'Start from scratch', desc: 'Add items manually from the Menu page', action: () => update.mutate({ menuDone: true }, { onSuccess: onDone }) },
          { label: 'Go to Menu page now', desc: 'Opens menu management so you can add items', action: onDone },
        ].map((opt) => (
          <button
            key={opt.label}
            type="button"
            onClick={opt.action}
            className="w-full flex items-center justify-between p-4 rounded-xl border border-border hover:border-primary-500 hover:bg-primary-500/5 transition-all text-left"
          >
            <div>
              <p className="text-sm font-semibold text-foreground">{opt.label}</p>
              <p className="text-xs text-muted-foreground mt-0.5">{opt.desc}</p>
            </div>
            <ChevronRight size={16} className="text-muted-foreground shrink-0" />
          </button>
        ))}
      </div>
      <button
        type="button"
        onClick={() => update.mutate({ menuDone: true }, { onSuccess: onDone })}
        className="text-sm text-muted-foreground underline w-full text-center"
      >
        Skip menu setup
      </button>
    </div>
  )
}

// ─── Step 4: Tables ───────────────────────────────────────────────────────────

function Step4({ onDone }: { onDone: () => void }) {
  const update = useUpdateOnboardingSteps()
  const [needTables, setNeedTables] = useState<boolean | null>(null)
  const [floorName, setFloorName] = useState('Ground Floor')
  const [tableCount, setTableCount] = useState('10')

  const createTables = useMutation({
    mutationFn: async () => {
      const floor = await apiClient.post<{ id: string }>('/api/v1/tables/floors', { name: floorName })
      await apiClient.post('/api/v1/tables/bulk', {
        floorId: floor.id,
        count: parseInt(tableCount, 10),
        prefix: 'T',
      })
    },
    onSuccess: () => {
      update.mutate({ tablesDone: true }, { onSuccess: onDone })
    },
    onError: () => {
      toast.error('Could not create tables. You can add them manually from Floor Plan.')
      update.mutate({ tablesDone: true }, { onSuccess: onDone })
    },
  })

  if (needTables === null) {
    return (
      <div className="space-y-4">
        <p className="text-sm text-muted-foreground">Do you need table management?</p>
        <div className="grid grid-cols-2 gap-3">
          <button type="button" onClick={() => setNeedTables(true)} className="p-4 rounded-xl border border-border hover:border-primary-500 hover:bg-primary-500/5 transition-all text-center">
            <Table2 size={20} className="mx-auto mb-2 text-primary-500" />
            <p className="text-sm font-semibold">Yes — Dine-in</p>
            <p className="text-xs text-muted-foreground mt-0.5">I have tables</p>
          </button>
          <button type="button" onClick={() => update.mutate({ tablesDone: true }, { onSuccess: onDone })} className="p-4 rounded-xl border border-border hover:border-primary-500 hover:bg-primary-500/5 transition-all text-center">
            <Store size={20} className="mx-auto mb-2 text-muted-foreground" />
            <p className="text-sm font-semibold">No — Takeaway / Delivery</p>
            <p className="text-xs text-muted-foreground mt-0.5">Skip tables</p>
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <p className="text-sm text-muted-foreground">Quick table setup — you can customise later.</p>
      <div className="space-y-1.5">
        <Label>Floor name</Label>
        <Input value={floorName} onChange={(e) => setFloorName(e.target.value)} placeholder="Ground Floor" />
      </div>
      <div className="space-y-1.5">
        <Label>Number of tables</Label>
        <Input
          type="number"
          min="1"
          max="100"
          value={tableCount}
          onChange={(e) => setTableCount(e.target.value)}
          placeholder="10"
        />
        <p className="text-xs text-muted-foreground">Tables will be named T1, T2, T3…</p>
      </div>
      <div className="flex gap-3 pt-2">
        <button type="button" onClick={() => update.mutate({ tablesDone: true }, { onSuccess: onDone })} className="text-sm text-muted-foreground underline">
          Skip
        </button>
        <Button className="flex-1" disabled={createTables.isPending} onClick={() => createTables.mutate()}>
          {createTables.isPending ? <Spinner size="sm" /> : <>Create Tables <ArrowRight size={14} /></>}
        </Button>
      </div>
    </div>
  )
}

// ─── Step 5: Staff ────────────────────────────────────────────────────────────

function Step5({ onDone }: { onDone: () => void }) {
  const update = useUpdateOnboardingSteps()
  const [form, setForm] = useState({ name: '', phone: '', role: 'MANAGER', pin: '' })
  const set = (k: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) =>
    setForm(f => ({ ...f, [k]: e.target.value }))

  const addStaff = useMutation({
    mutationFn: () => apiClient.post('/api/v1/staff', form),
    onSuccess: () => {
      toast.success('Staff member added!')
      update.mutate({ staffDone: true }, { onSuccess: onDone })
    },
    onError: (e: Error) => toast.error(e.message),
  })

  return (
    <div className="space-y-4">
      <p className="text-sm text-muted-foreground">Invite your first staff member (optional).</p>
      <div className="space-y-1.5">
        <Label>Name</Label>
        <Input placeholder="Staff name" value={form.name} onChange={set('name')} />
      </div>
      <div className="space-y-1.5">
        <Label>Mobile</Label>
        <Input type="tel" inputMode="numeric" placeholder="9876543210"
          value={form.phone}
          onChange={(e) => setForm(f => ({ ...f, phone: e.target.value.replace(/\D/g, '').slice(0, 10) }))}
        />
      </div>
      <div className="space-y-1.5">
        <Label>Role</Label>
        <select value={form.role} onChange={set('role')} className="w-full bg-background border border-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-primary-500 text-foreground">
          <option value="MANAGER">Manager</option>
          <option value="CASHIER">Cashier</option>
          <option value="WAITER">Waiter</option>
          <option value="CHEF">Chef</option>
        </select>
      </div>
      <div className="space-y-1.5">
        <Label>PIN (4 digits)</Label>
        <Input type="password" inputMode="numeric" maxLength={4} placeholder="••••"
          value={form.pin}
          onChange={(e) => setForm(f => ({ ...f, pin: e.target.value.replace(/\D/g, '').slice(0, 4) }))}
          className="tracking-[0.5em] text-center"
        />
      </div>
      <div className="flex gap-3 pt-2">
        <button type="button" onClick={() => update.mutate({ staffDone: true }, { onSuccess: onDone })} className="text-sm text-muted-foreground underline">
          Skip
        </button>
        <Button
          className="flex-1"
          disabled={addStaff.isPending || !form.name || form.phone.length !== 10 || form.pin.length !== 4}
          onClick={() => addStaff.mutate()}
        >
          {addStaff.isPending ? <Spinner size="sm" /> : <>Add Staff <ArrowRight size={14} /></>}
        </Button>
      </div>
    </div>
  )
}

// ─── Completion screen ────────────────────────────────────────────────────────

function DoneScreen() {
  const router = useRouter()
  return (
    <div className="text-center space-y-4 py-4">
      <div className="w-16 h-16 rounded-full bg-success/15 flex items-center justify-center mx-auto">
        <CheckCircle2 size={32} className="text-success" />
      </div>
      <h2 className="text-lg font-bold text-foreground">You're all set!</h2>
      <p className="text-sm text-muted-foreground">Your restaurant is ready. Time to take your first order.</p>
      <Button className="w-full" onClick={() => router.replace('/dashboard')}>
        Go to Dashboard
      </Button>
    </div>
  )
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function OnboardingPage() {
  const [step, setStep] = useState(1)
  const router = useRouter()
  const { user } = useAuthStore()

  const next = () => {
    if (step < STEPS.length) setStep(s => s + 1)
    else router.replace('/dashboard')
  }

  const stepTitles: Record<number, string> = {
    1: 'Restaurant Profile',
    2: 'Outlet Setup',
    3: 'Menu Setup',
    4: 'Table Layout',
    5: 'Invite Staff',
  }

  return (
    <div className="min-h-dvh bg-background flex items-start justify-center pt-12 px-4">
      <div className="w-full max-w-[480px]">
        <div className="text-center mb-6">
          <h1 className="text-xl font-bold text-foreground">
            Welcome{user?.name ? `, ${user.name.split(' ')[0]}` : ''}!
          </h1>
          <p className="text-sm text-muted-foreground mt-1">Let's get your restaurant set up in 5 minutes.</p>
        </div>

        {step <= STEPS.length && <StepBar current={step} />}

        <div className="rounded-2xl border border-border bg-card p-6 shadow-xl shadow-black/20">
          {step <= STEPS.length && (
            <h2 className="text-base font-bold text-foreground mb-4">{stepTitles[step]}</h2>
          )}

          {step === 1 && <Step1 onDone={next} />}
          {step === 2 && <Step2 onDone={next} />}
          {step === 3 && <Step3 onDone={next} />}
          {step === 4 && <Step4 onDone={next} />}
          {step === 5 && <Step5 onDone={next} />}
          {step > STEPS.length && <DoneScreen />}
        </div>

        {step <= STEPS.length && (
          <button
            type="button"
            onClick={() => router.replace('/dashboard')}
            className="block w-full text-center text-xs text-muted-foreground mt-4 underline"
          >
            Set up later — go to dashboard
          </button>
        )}
      </div>
    </div>
  )
}
