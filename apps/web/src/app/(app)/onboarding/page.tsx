'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import {
  CheckCircle2, ChevronRight, Building2, UtensilsCrossed,
  Table2, Users, Store, ArrowRight, Handshake, Image,
  CreditCard, Printer, Phone, X, AlertCircle,
} from 'lucide-react'
import { useMutation } from '@tanstack/react-query'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Spinner } from '@/components/ui/spinner'
import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'
import { apiClient } from '@/lib/api-client'
import {
  useUpdateOnboardingSteps,
  useSkipOnboardingStep,
  useEnableTeamAssist,
  type WizardStepKey,
} from '@/hooks/use-onboarding'
import { useAuthStore } from '@/lib/auth-store'

// ─── Step config ──────────────────────────────────────────────────────────────

const STEPS: { id: number; key: WizardStepKey; label: string; icon: React.ElementType; required: boolean }[] = [
  { id: 1, key: 'brandingDone',          label: 'Branding',       icon: Image,          required: true  },
  { id: 2, key: 'restaurantProfileDone', label: 'Legal Details',  icon: Store,          required: false },
  { id: 3, key: 'menuDone',              label: 'Menu',            icon: UtensilsCrossed, required: true  },
  { id: 4, key: 'tablesDone',            label: 'Tables',          icon: Table2,         required: true  },
  { id: 5, key: 'staffDone',             label: 'Staff',           icon: Users,          required: false },
  { id: 6, key: 'paymentSetupDone',      label: 'Payments',        icon: CreditCard,     required: false },
  { id: 7, key: 'paymentSetupDone',      label: 'Hardware',        icon: Printer,        required: false },
]

// ─── Reusable field styles ────────────────────────────────────────────────────

const fieldCls = 'w-full bg-background border border-border rounded-lg px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-primary-500 placeholder:text-muted-foreground/40'

// ─── Progress bar ─────────────────────────────────────────────────────────────

function StepBar({ current }: { current: number }) {
  return (
    <div className="flex items-center justify-between mb-6 px-1 overflow-x-auto">
      {STEPS.map((s, i) => {
        const Icon = s.icon
        const done  = s.id < current
        const active = s.id === current
        return (
          <div key={s.id} className="flex items-center gap-0.5 shrink-0">
            <div className="flex flex-col items-center gap-1">
              <div className={cn(
                'w-8 h-8 rounded-full flex items-center justify-center transition-all text-xs font-bold',
                done   ? 'bg-primary-500 text-white' :
                active ? 'bg-primary-500 text-white ring-4 ring-primary-500/20' :
                         'bg-background-card border border-border text-muted-foreground',
              )}>
                {done ? <CheckCircle2 size={14} /> : <Icon size={14} />}
              </div>
              <span className={cn(
                'text-[9px] font-medium hidden sm:block whitespace-nowrap',
                active ? 'text-foreground' : 'text-muted-foreground',
              )}>
                {s.label}
              </span>
            </div>
            {i < STEPS.length - 1 && (
              <div className={cn('w-4 sm:w-8 h-px mb-4 mx-0.5', s.id < current ? 'bg-primary-500' : 'bg-border')} />
            )}
          </div>
        )
      })}
    </div>
  )
}

// ─── Skip / Save footer ───────────────────────────────────────────────────────

function StepFooter({
  stepKey, onSkip, onSave, isPending, saveLabel = 'Save & Continue', disableSave = false,
}: {
  stepKey: WizardStepKey
  onSkip: () => void
  onSave: () => void
  isPending?: boolean
  saveLabel?: string
  disableSave?: boolean
}) {
  const skip = useSkipOnboardingStep()
  const handleSkip = () => {
    skip.mutate(stepKey, { onSuccess: onSkip })
  }
  return (
    <div className="flex items-center gap-3 pt-4">
      <button
        type="button"
        onClick={handleSkip}
        disabled={skip.isPending}
        className="text-sm text-muted-foreground hover:text-foreground underline shrink-0"
      >
        {skip.isPending ? 'Skipping…' : 'Skip for now'}
      </button>
      <Button className="flex-1" disabled={isPending || disableSave} onClick={onSave}>
        {isPending ? <Spinner size="xs" className="mr-2" /> : null}
        {saveLabel} <ArrowRight size={14} className="ml-1.5" />
      </Button>
    </div>
  )
}

// ─── Step 1: Branding ────────────────────────────────────────────────────────

const RESTAURANT_TYPES = [
  { value: 'CASUAL_DINING', label: 'Casual Dining' },
  { value: 'QUICK_SERVICE', label: 'Quick Service (QSR)' },
  { value: 'FINE_DINING',   label: 'Fine Dining' },
  { value: 'CAFE',          label: 'Café / Bakery' },
  { value: 'CLOUD_KITCHEN', label: 'Cloud Kitchen' },
  { value: 'BAR_AND_GRILL', label: 'Bar & Grill' },
  { value: 'FOOD_TRUCK',    label: 'Food Truck' },
  { value: 'DHABA',         label: 'Dhaba' },
  { value: 'SWEET_SHOP',    label: 'Sweet Shop / Mithai' },
]

const CUISINE_OPTIONS = [
  'North Indian', 'South Indian', 'Chinese', 'Italian', 'Mexican',
  'Continental', 'Multi-Cuisine', 'Mughlai', 'Punjabi', 'Bengali',
  'Gujarati', 'Rajasthani', 'Fast Food', 'Street Food', 'Seafood',
  'Vegan', 'Desserts', 'Beverages',
]

function Step1({ onDone }: { onDone: () => void }) {
  const update = useUpdateOnboardingSteps()
  const user = useAuthStore((s) => s.user)
  const [form, setForm] = useState({
    name: '',
    restaurantType: 'CASUAL_DINING',
    cuisineType: '',
    logoUrl: '',
    coverImageUrl: '',
  })
  const [selectedCuisines, setSelectedCuisines] = useState<string[]>([])

  const set = (k: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) =>
    setForm(f => ({ ...f, [k]: e.target.value }))

  const toggleCuisine = (c: string) => {
    setSelectedCuisines(prev =>
      prev.includes(c) ? prev.filter(x => x !== c) : [...prev, c],
    )
  }

  const handleSave = () => {
    const cuisineType = selectedCuisines.length > 0 ? selectedCuisines.join(', ') : form.cuisineType || null
    apiClient.patch('/api/v1/settings/tenant', {
      ...(form.name ? { name: form.name } : {}),
      ...(form.logoUrl ? { logoUrl: form.logoUrl } : {}),
      ...(form.coverImageUrl ? { coverImageUrl: form.coverImageUrl } : {}),
      ...(cuisineType ? { cuisineType } : {}),
    }).catch(() => {})
    update.mutate({ brandingDone: true }, { onSuccess: onDone })
  }

  return (
    <div className="space-y-4">
      <p className="text-xs text-muted-foreground">Your restaurant&apos;s identity — shown on bills, KOTs and the customer-facing app.</p>

      <div className="space-y-1.5">
        <Label>Restaurant Name</Label>
        <Input placeholder={user?.name ? `${user.name}'s Restaurant` : 'Demo Kitchen'} value={form.name} onChange={set('name')} />
      </div>

      <div className="space-y-1.5">
        <Label>Restaurant Type</Label>
        <select value={form.restaurantType} onChange={set('restaurantType')} className={fieldCls}>
          {RESTAURANT_TYPES.map(t => (
            <option key={t.value} value={t.value}>{t.label}</option>
          ))}
        </select>
      </div>

      <div className="space-y-2">
        <Label>Cuisine Type <span className="text-muted-foreground font-normal">(pick all that apply)</span></Label>
        <div className="flex flex-wrap gap-1.5">
          {CUISINE_OPTIONS.map(c => (
            <button
              key={c} type="button" onClick={() => toggleCuisine(c)}
              className={cn(
                'px-2.5 py-1 rounded-full text-xs font-medium border transition-colors',
                selectedCuisines.includes(c)
                  ? 'bg-primary-500 border-primary-500 text-white'
                  : 'border-border text-muted-foreground hover:border-primary-500/50',
              )}
            >
              {c}
            </button>
          ))}
        </div>
        {selectedCuisines.length === 0 && (
          <Input placeholder="Or type custom cuisine…" value={form.cuisineType} onChange={set('cuisineType')} className="text-sm" />
        )}
      </div>

      <div className="space-y-1.5">
        <Label>Logo URL <span className="text-muted-foreground font-normal">(optional)</span></Label>
        <Input placeholder="https://cdn.example.com/logo.png" value={form.logoUrl} onChange={set('logoUrl')} />
        {form.logoUrl && (
          <img src={form.logoUrl} alt="logo preview" className="h-12 w-12 rounded-lg object-contain border border-border bg-background-card" onError={e => { (e.target as HTMLImageElement).style.display = 'none' }} />
        )}
        <p className="text-[11px] text-muted-foreground">Appears on bills & KOT tickets. Paste a public image URL.</p>
      </div>

      <div className="space-y-1.5">
        <Label>Cover / Banner Image URL <span className="text-muted-foreground font-normal">(optional)</span></Label>
        <Input placeholder="https://cdn.example.com/banner.jpg" value={form.coverImageUrl} onChange={set('coverImageUrl')} />
        {form.coverImageUrl && (
          <img src={form.coverImageUrl} alt="cover preview" className="w-full h-24 rounded-lg object-cover border border-border" onError={e => { (e.target as HTMLImageElement).style.display = 'none' }} />
        )}
      </div>

      <StepFooter stepKey="brandingDone" onSkip={onDone} onSave={handleSave} isPending={update.isPending} />
    </div>
  )
}

// ─── Step 2: Legal ────────────────────────────────────────────────────────────

function Step2({ onDone }: { onDone: () => void }) {
  const update = useUpdateOnboardingSteps()
  const [form, setForm] = useState({ gstin: '', fssai: '', pan: '', addressLine1: '', city: '', state: '', pincode: '' })
  const set = (k: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm(f => ({ ...f, [k]: e.target.value }))

  const handleSave = () => {
    if (form.gstin || form.fssai || form.addressLine1) {
      apiClient.patch('/api/v1/settings/tenant', {
        ...(form.gstin ? { gstin: form.gstin.toUpperCase() } : {}),
        ...(form.fssai ? { fssaiLicense: form.fssai } : {}),
        ...(form.pan ? { panNumber: form.pan.toUpperCase() } : {}),
        ...(form.addressLine1 ? { addressLine1: form.addressLine1 } : {}),
        ...(form.city ? { city: form.city } : {}),
        ...(form.state ? { state: form.state } : {}),
        ...(form.pincode ? { pincode: form.pincode } : {}),
      }).catch(() => {})
    }
    update.mutate({ restaurantProfileDone: true }, { onSuccess: onDone })
  }

  return (
    <div className="space-y-4">
      <p className="text-xs text-muted-foreground">Required for GST filing and FSSAI compliance. You can fill these in Settings later.</p>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div className="space-y-1.5">
          <Label>GSTIN</Label>
          <Input placeholder="29ABCDE1234F1Z5" value={form.gstin} onChange={set('gstin')} className="uppercase" maxLength={15} />
        </div>
        <div className="space-y-1.5">
          <Label>FSSAI License</Label>
          <Input placeholder="10019022001234" value={form.fssai} onChange={set('fssai')} maxLength={14} />
        </div>
        <div className="space-y-1.5">
          <Label>PAN Number</Label>
          <Input placeholder="ABCDE1234F" value={form.pan} onChange={set('pan')} className="uppercase" maxLength={10} />
        </div>
        <div className="space-y-1.5">
          <Label>Pincode</Label>
          <Input placeholder="560001" value={form.pincode} onChange={set('pincode')} maxLength={6} />
        </div>
        <div className="space-y-1.5 sm:col-span-2">
          <Label>Full Address</Label>
          <Input placeholder="42, MG Road, Bengaluru" value={form.addressLine1} onChange={set('addressLine1')} />
        </div>
        <div className="space-y-1.5">
          <Label>City</Label>
          <Input placeholder="Bengaluru" value={form.city} onChange={set('city')} />
        </div>
        <div className="space-y-1.5">
          <Label>State</Label>
          <Input placeholder="Karnataka" value={form.state} onChange={set('state')} />
        </div>
      </div>

      <StepFooter stepKey="restaurantProfileDone" onSkip={onDone} onSave={handleSave} isPending={update.isPending} />
    </div>
  )
}

// ─── Step 3: Menu ─────────────────────────────────────────────────────────────

function Step3({ onDone }: { onDone: () => void }) {
  const update = useUpdateOnboardingSteps()
  const skip = useSkipOnboardingStep()
  const router = useRouter()

  return (
    <div className="space-y-4">
      <p className="text-xs text-muted-foreground">How would you like to set up your menu?</p>

      <div className="space-y-2">
        {[
          {
            icon: UtensilsCrossed,
            label: 'Add items manually',
            desc: 'Start from scratch — add categories and items one by one',
            action: () => update.mutate({ menuDone: true }, { onSuccess: onDone }),
          },
          {
            icon: ArrowRight,
            label: 'Go to Menu page now',
            desc: 'Jump to Menu management and add items, then come back',
            action: () => { update.mutate({ menuDone: true }); router.push('/menu') },
          },
          {
            icon: Handshake,
            label: 'Our team will set it up',
            desc: 'Atlas team will upload your menu within 24 hours',
            action: () => skip.mutate('menuDone', { onSuccess: onDone }),
          },
        ].map((opt) => (
          <button
            key={opt.label} type="button" onClick={opt.action}
            className="w-full flex items-start gap-3 p-4 rounded-xl border border-border hover:border-primary-500 hover:bg-primary-500/5 transition-all text-left"
          >
            <opt.icon size={18} className="text-primary-500 shrink-0 mt-0.5" />
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-foreground">{opt.label}</p>
              <p className="text-xs text-muted-foreground mt-0.5">{opt.desc}</p>
            </div>
            <ChevronRight size={14} className="text-muted-foreground shrink-0 self-center" />
          </button>
        ))}
      </div>
    </div>
  )
}

// ─── Step 4: Tables ───────────────────────────────────────────────────────────

function Step4({ onDone }: { onDone: () => void }) {
  const update = useUpdateOnboardingSteps()
  const skip = useSkipOnboardingStep()
  const [mode, setMode] = useState<'choose' | 'setup' | null>(null)
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
    onSuccess: () => update.mutate({ tablesDone: true }, { onSuccess: onDone }),
    onError: () => {
      toast.error('Could not create tables. Add them manually from Floor Plan.')
      update.mutate({ tablesDone: true }, { onSuccess: onDone })
    },
  })

  if (!mode) {
    return (
      <div className="space-y-4">
        <p className="text-xs text-muted-foreground">Tell us how your restaurant operates.</p>
        <div className="grid grid-cols-1 gap-3">
          {[
            { icon: Table2, label: 'Dine-in with Tables', desc: 'I have a floor plan with tables — set them up now', action: () => setMode('setup') },
            { icon: Phone, label: 'Takeaway / Delivery only', desc: 'No table management needed', action: () => skip.mutate('tablesDone', { onSuccess: onDone }) },
            { icon: Building2, label: 'Both (dine-in + takeaway)', desc: 'Set up tables, also accept takeaway orders', action: () => setMode('setup') },
          ].map((opt) => (
            <button key={opt.label} type="button" onClick={opt.action}
              className="flex items-start gap-3 p-4 rounded-xl border border-border hover:border-primary-500 hover:bg-primary-500/5 transition-all text-left"
            >
              <opt.icon size={18} className="text-primary-500 shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-semibold text-foreground">{opt.label}</p>
                <p className="text-xs text-muted-foreground mt-0.5">{opt.desc}</p>
              </div>
            </button>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <button type="button" onClick={() => setMode(null)} className="text-xs text-muted-foreground flex items-center gap-1 hover:text-foreground">
        <X size={12} /> Back
      </button>
      <p className="text-xs text-muted-foreground">Quick setup — you can customise your floor plan anytime.</p>
      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-1.5">
          <Label>Floor / Section name</Label>
          <Input value={floorName} onChange={e => setFloorName(e.target.value)} placeholder="Ground Floor" />
        </div>
        <div className="space-y-1.5">
          <Label>Number of tables</Label>
          <Input type="number" min="1" max="200" value={tableCount} onChange={e => setTableCount(e.target.value)} />
        </div>
      </div>
      <p className="text-[11px] text-muted-foreground">Tables will be named T1, T2, T3 … You can rename them in Floor Plan.</p>
      <div className="flex gap-3">
        <button type="button" onClick={() => skip.mutate('tablesDone', { onSuccess: onDone })} className="text-sm text-muted-foreground underline">Skip</button>
        <Button className="flex-1" disabled={createTables.isPending} onClick={() => createTables.mutate()}>
          {createTables.isPending ? <Spinner size="xs" className="mr-1" /> : null}
          Create Tables <ArrowRight size={14} className="ml-1" />
        </Button>
      </div>
    </div>
  )
}

// ─── Step 5: Staff ────────────────────────────────────────────────────────────

const STAFF_ROLES = ['MANAGER', 'CASHIER', 'WAITER', 'CHEF', 'INVENTORY_MANAGER']

function Step5({ onDone }: { onDone: () => void }) {
  const update = useUpdateOnboardingSteps()
  const [form, setForm] = useState({ name: '', phone: '', role: 'MANAGER', pin: '' })
  const set = (k: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) =>
    setForm(f => ({ ...f, [k]: e.target.value }))

  const canSubmit = form.name.trim().length >= 2 && form.phone.length === 10 && form.pin.length === 4

  const addStaff = useMutation({
    mutationFn: () => apiClient.post('/api/v1/staff', {
      name: form.name, phone: form.phone, role: form.role, pin: form.pin,
    }),
    onSuccess: () => {
      toast.success('Staff member added!')
      update.mutate({ staffDone: true }, { onSuccess: onDone })
    },
    onError: (e: Error) => toast.error(e.message),
  })

  return (
    <div className="space-y-4">
      <p className="text-xs text-muted-foreground">Add your first team member. You can invite more from the Staff page anytime.</p>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div className="space-y-1.5 sm:col-span-2">
          <Label>Name</Label>
          <Input placeholder="Rahul Verma" value={form.name} onChange={set('name')} />
        </div>
        <div className="space-y-1.5">
          <Label>Mobile Number</Label>
          <Input type="tel" inputMode="numeric" placeholder="9876543210"
            value={form.phone}
            onChange={e => setForm(f => ({ ...f, phone: e.target.value.replace(/\D/g, '').slice(0, 10) }))}
          />
        </div>
        <div className="space-y-1.5">
          <Label>Role</Label>
          <select value={form.role} onChange={set('role')} className={fieldCls}>
            {STAFF_ROLES.map(r => <option key={r} value={r}>{r.replace('_', ' ')}</option>)}
          </select>
        </div>
        <div className="space-y-1.5 sm:col-span-2">
          <Label>POS Login PIN (4 digits)</Label>
          <Input type="password" inputMode="numeric" maxLength={4} placeholder="••••"
            value={form.pin}
            onChange={e => setForm(f => ({ ...f, pin: e.target.value.replace(/\D/g, '').slice(0, 4) }))}
            className="tracking-[0.5em] text-center"
          />
          <p className="text-[11px] text-muted-foreground">Staff use this PIN to log into the POS terminal.</p>
        </div>
      </div>

      <StepFooter
        stepKey="staffDone" onSkip={onDone}
        onSave={() => addStaff.mutate()}
        isPending={addStaff.isPending}
        disableSave={!canSubmit}
        saveLabel="Add Staff Member"
      />
    </div>
  )
}

// ─── Step 6: Payment Methods ──────────────────────────────────────────────────

const PAYMENT_METHODS = [
  { key: 'CASH',          label: 'Cash',          desc: 'Physical cash payments' },
  { key: 'UPI',           label: 'UPI',           desc: 'PhonePe, GPay, Paytm QR' },
  { key: 'CARD',          label: 'Card / Swipe',  desc: 'Debit & Credit card' },
  { key: 'WALLET',        label: 'Wallet',         desc: 'Paytm, Mobikwik, etc.' },
  { key: 'CREDIT',        label: 'Credit / Tab',  desc: 'Customer running tab' },
  { key: 'COMPLIMENTARY', label: 'Complimentary', desc: 'Staff meals, owner comp' },
]

function Step6({ onDone }: { onDone: () => void }) {
  const update = useUpdateOnboardingSteps()
  const [enabled, setEnabled] = useState<Set<string>>(new Set(['CASH', 'UPI']))
  const [upiId, setUpiId] = useState('')

  const toggle = (key: string) => {
    setEnabled(prev => {
      const next = new Set(prev)
      if (next.has(key)) next.delete(key)
      else next.add(key)
      return next
    })
  }

  const handleSave = () => {
    if (upiId) {
      apiClient.patch('/api/v1/settings/tenant', { upiId }).catch(() => {})
    }
    update.mutate({ paymentSetupDone: true }, { onSuccess: onDone })
  }

  return (
    <div className="space-y-4">
      <p className="text-xs text-muted-foreground">Select the payment methods your restaurant accepts. All can be changed later in Settings.</p>

      <div className="space-y-2">
        {PAYMENT_METHODS.map(({ key, label, desc }) => (
          <button
            key={key} type="button" onClick={() => toggle(key)}
            className={cn(
              'w-full flex items-center gap-3 px-4 py-3 rounded-xl border transition-all text-left',
              enabled.has(key)
                ? 'border-primary-500 bg-primary-500/5'
                : 'border-border hover:border-border/60',
            )}
          >
            <div className={cn(
              'w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 transition-colors',
              enabled.has(key) ? 'bg-primary-500 border-primary-500' : 'border-border',
            )}>
              {enabled.has(key) && <CheckCircle2 size={12} className="text-white" />}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-foreground">{label}</p>
              <p className="text-xs text-muted-foreground">{desc}</p>
            </div>
          </button>
        ))}
      </div>

      {enabled.has('UPI') && (
        <div className="space-y-1.5">
          <Label>UPI ID / VPA <span className="text-muted-foreground font-normal">(optional)</span></Label>
          <Input placeholder="restaurant@upi" value={upiId} onChange={e => setUpiId(e.target.value)} />
        </div>
      )}

      <StepFooter stepKey="paymentSetupDone" onSkip={onDone} onSave={handleSave} isPending={update.isPending} />
    </div>
  )
}

// ─── Step 7: Hardware / Printers ─────────────────────────────────────────────

function Step7({ onDone }: { onDone: () => void }) {
  const update = useUpdateOnboardingSteps()
  const [kotIp, setKotIp] = useState('')
  const [billIp, setBillIp] = useState('')

  const handleSave = () => {
    apiClient.patch('/api/v1/settings', {
      ...(kotIp ? { kotPrinterIp: kotIp } : {}),
      ...(billIp ? { billPrinterIp: billIp } : {}),
    }).catch(() => {})
    update.mutate({ paymentSetupDone: true }, { onSuccess: onDone })
  }

  return (
    <div className="space-y-4">
      <p className="text-xs text-muted-foreground">Connect thermal printers on your local network. Skip if you don't use a printer yet.</p>

      <div className="bg-background border border-border rounded-xl p-4 space-y-1 text-xs text-muted-foreground">
        <p className="font-semibold text-foreground">How to find printer IP:</p>
        <p>1. Connect printer to the same Wi-Fi as your POS tablet</p>
        <p>2. Print a self-test page — the IP address is printed on it</p>
        <p>3. Paste it below (e.g. 192.168.1.100)</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div className="space-y-1.5">
          <Label>KOT Printer IP <span className="text-muted-foreground font-normal">(kitchen)</span></Label>
          <Input placeholder="192.168.1.100" value={kotIp} onChange={e => setKotIp(e.target.value)} />
        </div>
        <div className="space-y-1.5">
          <Label>Bill Printer IP <span className="text-muted-foreground font-normal">(counter)</span></Label>
          <Input placeholder="192.168.1.101" value={billIp} onChange={e => setBillIp(e.target.value)} />
        </div>
      </div>

      <StepFooter stepKey="paymentSetupDone" onSkip={onDone} onSave={handleSave} isPending={update.isPending} saveLabel="Save & Finish" />
    </div>
  )
}

// ─── Team-Assist mode ─────────────────────────────────────────────────────────

function TeamAssistScreen({ onConfirm, onBack }: { onConfirm: () => void; onBack: () => void }) {
  const teamAssist = useEnableTeamAssist()
  const router = useRouter()

  return (
    <div className="space-y-5">
      <div className="flex items-start gap-3 bg-primary-500/5 border border-primary-500/20 rounded-xl p-4">
        <Handshake size={20} className="text-primary-500 shrink-0 mt-0.5" />
        <div>
          <p className="text-sm font-bold text-foreground">Atlas team will onboard your restaurant</p>
          <p className="text-xs text-muted-foreground mt-1">
            Our team will reach out within 24 hours to set up your menu, tables, staff, and settings based on your requirements.
          </p>
        </div>
      </div>

      <div className="space-y-2 text-sm">
        {[
          'Full menu uploaded by our team',
          'Floor plan configured to your layout',
          'Staff accounts created & trained',
          'Printer and payment setup assistance',
          'GST and compliance settings configured',
        ].map((item) => (
          <div key={item} className="flex items-center gap-2 text-foreground/80">
            <CheckCircle2 size={14} className="text-success shrink-0" />
            <span className="text-sm">{item}</span>
          </div>
        ))}
      </div>

      <div className="bg-background-card border border-border rounded-xl p-4 text-xs text-muted-foreground space-y-1">
        <p className="font-semibold text-foreground">Our team will contact you on:</p>
        <p>Phone registered during sign-up</p>
        <p>WhatsApp support: +91 98765 43210</p>
        <p>Email: onboarding@atlaspos.in</p>
      </div>

      <div className="flex gap-3">
        <Button variant="ghost" className="flex-1" onClick={onBack}>Go back</Button>
        <Button
          className="flex-1"
          disabled={teamAssist.isPending}
          onClick={() => teamAssist.mutate(undefined, {
            onSuccess: () => router.replace('/dashboard'),
          })}
        >
          {teamAssist.isPending ? <Spinner size="xs" className="mr-1" /> : <Handshake size={14} className="mr-1.5" />}
          Confirm Team Setup
        </Button>
      </div>
    </div>
  )
}

// ─── Completion screen ────────────────────────────────────────────────────────

function DoneScreen({ skippedCount }: { skippedCount: number }) {
  const router = useRouter()
  return (
    <div className="text-center space-y-5 py-2">
      <div className="w-16 h-16 rounded-full bg-success/15 flex items-center justify-center mx-auto">
        <CheckCircle2 size={32} className="text-success" />
      </div>
      <div>
        <h2 className="text-lg font-bold text-foreground">You&apos;re all set!</h2>
        <p className="text-sm text-muted-foreground mt-1">Your restaurant is ready. Time to take your first order.</p>
      </div>

      {skippedCount > 0 && (
        <div className="flex items-start gap-2 bg-warning/10 border border-warning/20 rounded-xl p-3 text-left">
          <AlertCircle size={15} className="text-warning shrink-0 mt-0.5" />
          <p className="text-xs text-warning">
            You skipped {skippedCount} step{skippedCount > 1 ? 's' : ''}. Complete them anytime from <strong>Settings</strong> to get the best experience.
          </p>
        </div>
      )}

      <div className="space-y-2">
        <Button className="w-full" onClick={() => router.replace('/floor')}>
          Go to Floor Plan — Take First Order
        </Button>
        <Button variant="ghost" className="w-full text-sm" onClick={() => router.replace('/dashboard')}>
          Go to Dashboard
        </Button>
      </div>
    </div>
  )
}

// ─── Page ─────────────────────────────────────────────────────────────────────

type Mode = 'choose' | 'self' | 'team'

export default function OnboardingPage() {
  const [step, setStep] = useState(1)
  const [mode, setMode] = useState<Mode>('choose')
  const [skippedCount, setSkippedCount] = useState(0)
  const router = useRouter()
  const { user } = useAuthStore()

  const next = () => {
    if (step < STEPS.length) {
      setStep(s => s + 1)
    }
  }

  const nextWithSkip = () => {
    setSkippedCount(s => s + 1)
    next()
  }

  const stepTitles: Record<number, string> = {
    1: 'Branding & Identity',
    2: 'Legal & Tax Details',
    3: 'Menu Setup',
    4: 'Floor & Table Layout',
    5: 'Staff & Team',
    6: 'Payment Methods',
    7: 'Hardware Setup',
  }

  // Welcome / mode selection screen
  if (mode === 'choose') {
    return (
      <div className="min-h-dvh bg-background flex items-start justify-center pt-10 px-4 pb-10">
        <div className="w-full max-w-[480px]">
          <div className="text-center mb-8">
            <div className="w-14 h-14 rounded-2xl bg-primary-500 flex items-center justify-center mx-auto mb-4">
              <Store size={26} className="text-white" />
            </div>
            <h1 className="text-2xl font-extrabold text-foreground">
              Welcome{user?.name ? `, ${user.name.split(' ')[0]}` : ''}!
            </h1>
            <p className="text-sm text-muted-foreground mt-2">
              Let&apos;s get <span className="font-semibold text-foreground">your restaurant</span> live on Atlas.
            </p>
          </div>

          <div className="space-y-3">
            <button
              type="button"
              onClick={() => setMode('self')}
              className="w-full flex items-start gap-4 p-5 rounded-2xl border-2 border-primary-500 bg-primary-500/5 hover:bg-primary-500/10 transition-all text-left group"
            >
              <div className="w-10 h-10 rounded-xl bg-primary-500 flex items-center justify-center shrink-0">
                <Store size={18} className="text-white" />
              </div>
              <div className="flex-1">
                <p className="font-bold text-foreground text-sm">Set up myself</p>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Quick 7-step wizard — takes about 5 minutes. Skip any step and fill it in later.
                </p>
                <div className="flex gap-2 mt-2 flex-wrap">
                  {['Branding', 'Menu', 'Tables', 'Staff', 'Payments'].map(tag => (
                    <Badge key={tag} variant="muted" className="text-[10px]">{tag}</Badge>
                  ))}
                </div>
              </div>
              <ChevronRight size={16} className="text-primary-500 shrink-0 self-center" />
            </button>

            <button
              type="button"
              onClick={() => setMode('team')}
              className="w-full flex items-start gap-4 p-5 rounded-2xl border border-border hover:border-primary-500/50 transition-all text-left"
            >
              <div className="w-10 h-10 rounded-xl bg-background-card border border-border flex items-center justify-center shrink-0">
                <Handshake size={18} className="text-primary-500" />
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <p className="font-bold text-foreground text-sm">Get help from Atlas team</p>
                  <Badge variant="info" className="text-[10px]">Recommended</Badge>
                </div>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Our team sets up everything for you — menu, tables, staff, printers — within 24 hours.
                </p>
              </div>
              <ChevronRight size={16} className="text-muted-foreground shrink-0 self-center" />
            </button>
          </div>

          <button
            type="button"
            onClick={() => router.replace('/dashboard')}
            className="block w-full text-center text-xs text-muted-foreground mt-6 underline"
          >
            Skip for now — go to dashboard
          </button>
        </div>
      </div>
    )
  }

  if (mode === 'team') {
    return (
      <div className="min-h-dvh bg-background flex items-start justify-center pt-10 px-4 pb-10">
        <div className="w-full max-w-[480px]">
          <div className="text-center mb-6">
            <h1 className="text-lg font-bold text-foreground">Team-Assisted Onboarding</h1>
            <p className="text-sm text-muted-foreground mt-1">We&apos;ll do the heavy lifting.</p>
          </div>
          <div className="rounded-2xl border border-border bg-card p-6 shadow-xl shadow-black/20">
            <TeamAssistScreen
              onConfirm={() => router.replace('/dashboard')}
              onBack={() => setMode('choose')}
            />
          </div>
        </div>
      </div>
    )
  }

  const isDone = step > STEPS.length

  return (
    <div className="min-h-dvh bg-background flex items-start justify-center pt-8 px-4 pb-10">
      <div className="w-full max-w-[540px]">
        <div className="text-center mb-6">
          <h1 className="text-lg font-bold text-foreground">
            Welcome{user?.name ? `, ${user.name.split(' ')[0]}` : ''}! 🎉
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Step {Math.min(step, STEPS.length)} of {STEPS.length} — {stepTitles[step] ?? 'Almost done'}
          </p>
        </div>

        {!isDone && <StepBar current={step} />}

        <div className="rounded-2xl border border-border bg-card p-6 shadow-xl shadow-black/20">
          {!isDone && (
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-base font-bold text-foreground">{stepTitles[step]}</h2>
              {STEPS[step - 1]?.required
                ? <Badge variant="danger" className="text-[10px]">Required</Badge>
                : <Badge variant="muted" className="text-[10px]">Optional</Badge>
              }
            </div>
          )}

          {step === 1 && <Step1 onDone={next} />}
          {step === 2 && <Step2 onDone={next} />}
          {step === 3 && <Step3 onDone={next} />}
          {step === 4 && <Step4 onDone={next} />}
          {step === 5 && <Step5 onDone={next} />}
          {step === 6 && <Step6 onDone={next} />}
          {step === 7 && <Step7 onDone={() => setStep(s => s + 1)} />}
          {isDone  && <DoneScreen skippedCount={skippedCount} />}
        </div>

        {!isDone && (
          <button
            type="button"
            onClick={() => router.replace('/dashboard')}
            className="block w-full text-center text-xs text-muted-foreground mt-4 underline"
          >
            Finish later — go to dashboard
          </button>
        )}
      </div>
    </div>
  )
}
