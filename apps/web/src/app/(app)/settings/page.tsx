'use client'

import { useRequireRole } from '@/hooks/use-require-role'
import { useEffect, useState } from 'react'
import { Settings, Building2, Sliders, Save, Star, Lock } from 'lucide-react'
import { useSettings, useUpdateSettings, useUpdateOutlet, useUpdateTenant } from '@/hooks/use-settings'
import { Button } from '@/components/ui/button'
import { Spinner } from '@/components/ui/spinner'
import { cn } from '@/lib/utils'
import { useAuthStore } from '@/lib/auth-store'
import type { TenantSettings, TenantInfo, OutletInfo } from '@/lib/api-types'

// ─── Field helpers ────────────────────────────────────────────────────────────

const fieldCls = 'w-full bg-background border border-border rounded-lg px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-primary-500 placeholder:text-muted-foreground/40 disabled:opacity-50'

function Field({ label, children, hint }: { label: string; children: React.ReactNode; hint?: string }) {
  return (
    <div className="space-y-1.5">
      <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">{label}</label>
      {children}
      {hint && <p className="text-[11px] text-muted-foreground">{hint}</p>}
    </div>
  )
}

function Toggle({ checked, onChange, disabled }: { checked: boolean; onChange: (v: boolean) => void; disabled?: boolean }) {
  return (
    <button type="button" role="switch" aria-checked={checked} disabled={disabled}
      onClick={() => onChange(!checked)}
      className={cn(
        'relative inline-flex h-5 w-9 shrink-0 rounded-full border-2 border-transparent transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 disabled:opacity-50',
        checked ? 'bg-primary-500' : 'bg-background-border',
      )}>
      <span className={cn(
        'pointer-events-none inline-block h-4 w-4 rounded-full bg-white shadow-sm transition-transform',
        checked ? 'translate-x-4' : 'translate-x-0',
      )} />
    </button>
  )
}

// ─── Restaurant Info section ──────────────────────────────────────────────────

function RestaurantSection({ tenant, disabled }: { tenant: TenantInfo; disabled: boolean }) {
  const update = useUpdateTenant()
  const [form, setForm] = useState({
    name: tenant.name, phone: tenant.phone, email: tenant.email ?? '',
    website: tenant.website ?? '', gstin: tenant.gstin ?? '',
    fssaiLicense: tenant.fssaiLicense ?? '', panNumber: tenant.panNumber ?? '',
    addressLine1: tenant.addressLine1, addressLine2: tenant.addressLine2 ?? '',
    city: tenant.city, state: tenant.state, pincode: tenant.pincode,
  })

  useEffect(() => {
    setForm({
      name: tenant.name, phone: tenant.phone, email: tenant.email ?? '',
      website: tenant.website ?? '', gstin: tenant.gstin ?? '',
      fssaiLicense: tenant.fssaiLicense ?? '', panNumber: tenant.panNumber ?? '',
      addressLine1: tenant.addressLine1, addressLine2: tenant.addressLine2 ?? '',
      city: tenant.city, state: tenant.state, pincode: tenant.pincode,
    })
  }, [tenant])

  function inp(key: keyof typeof form) {
    return (e: React.ChangeEvent<HTMLInputElement>) => setForm(f => ({ ...f, [key]: e.target.value }))
  }

  function handleSave() {
    update.mutate({
      name: form.name, phone: form.phone,
      email: form.email || null, website: form.website || null,
      gstin: form.gstin || null, fssaiLicense: form.fssaiLicense || null,
      panNumber: form.panNumber || null,
      addressLine1: form.addressLine1, addressLine2: form.addressLine2 || null,
      city: form.city, state: form.state, pincode: form.pincode,
    })
  }

  return (
    <div className="bg-background-card border border-border rounded-xl p-6 space-y-5">
      <div className="flex items-center gap-2 pb-2 border-b border-border">
        <Building2 size={15} className="text-primary-500" />
        <h3 className="text-sm font-bold text-foreground">Restaurant Info</h3>
        <span className="text-[11px] text-muted-foreground ml-auto">OWNER only</span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Field label="Restaurant Name">
          <input value={form.name} onChange={inp('name')} disabled={disabled} placeholder="Demo Kitchen" className={fieldCls} />
        </Field>
        <Field label="Phone">
          <input value={form.phone} onChange={inp('phone')} disabled={disabled} placeholder="9876543210" className={fieldCls} />
        </Field>
        <Field label="Email">
          <input value={form.email} onChange={inp('email')} disabled={disabled} type="email" placeholder="owner@restaurant.com" className={fieldCls} />
        </Field>
        <Field label="Website">
          <input value={form.website} onChange={inp('website')} disabled={disabled} placeholder="https://restaurant.com" className={fieldCls} />
        </Field>
        <Field label="GSTIN" hint="29ABCDE1234F1Z5">
          <input value={form.gstin} onChange={inp('gstin')} disabled={disabled} placeholder="GSTIN number" className={fieldCls} />
        </Field>
        <Field label="FSSAI License">
          <input value={form.fssaiLicense} onChange={inp('fssaiLicense')} disabled={disabled} placeholder="14-digit FSSAI number" className={fieldCls} />
        </Field>
        <Field label="PAN Number">
          <input value={form.panNumber} onChange={inp('panNumber')} disabled={disabled} placeholder="ABCDE1234F" className={cn(fieldCls, 'uppercase')} />
        </Field>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2 border-t border-border">
        <Field label="Address Line 1">
          <input value={form.addressLine1} onChange={inp('addressLine1')} disabled={disabled} className={fieldCls} />
        </Field>
        <Field label="Address Line 2">
          <input value={form.addressLine2} onChange={inp('addressLine2')} disabled={disabled} placeholder="Optional" className={fieldCls} />
        </Field>
        <Field label="City">
          <input value={form.city} onChange={inp('city')} disabled={disabled} className={fieldCls} />
        </Field>
        <Field label="State">
          <input value={form.state} onChange={inp('state')} disabled={disabled} className={fieldCls} />
        </Field>
        <Field label="Pincode">
          <input value={form.pincode} onChange={inp('pincode')} disabled={disabled} maxLength={6} className={fieldCls} />
        </Field>
      </div>

      {!disabled && (
        <div className="flex justify-end pt-2">
          <Button size="sm" className="gap-2" onClick={handleSave} disabled={update.isPending}>
            {update.isPending ? <Spinner size="xs" /> : <Save size={13} />} Save Restaurant Info
          </Button>
        </div>
      )}
    </div>
  )
}

// ─── Outlet section ───────────────────────────────────────────────────────────

function OutletSection({ outlet, disabled }: { outlet: OutletInfo; disabled: boolean }) {
  const update = useUpdateOutlet()
  const [form, setForm] = useState({
    name: outlet.name, phone: outlet.phone,
    addressLine1: outlet.addressLine1, addressLine2: outlet.addressLine2 ?? '',
    city: outlet.city, state: outlet.state, pincode: outlet.pincode,
  })

  useEffect(() => {
    setForm({
      name: outlet.name, phone: outlet.phone,
      addressLine1: outlet.addressLine1, addressLine2: outlet.addressLine2 ?? '',
      city: outlet.city, state: outlet.state, pincode: outlet.pincode,
    })
  }, [outlet])

  function inp(key: keyof typeof form) {
    return (e: React.ChangeEvent<HTMLInputElement>) => setForm(f => ({ ...f, [key]: e.target.value }))
  }

  return (
    <div className="bg-background-card border border-border rounded-xl p-6 space-y-5">
      <div className="flex items-center gap-2 pb-2 border-b border-border">
        <Building2 size={15} className="text-primary-500" />
        <h3 className="text-sm font-bold text-foreground">Outlet Info</h3>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Field label="Outlet Name">
          <input value={form.name} onChange={inp('name')} disabled={disabled} className={fieldCls} />
        </Field>
        <Field label="Phone">
          <input value={form.phone} onChange={inp('phone')} disabled={disabled} className={fieldCls} />
        </Field>
        <Field label="Address Line 1">
          <input value={form.addressLine1} onChange={inp('addressLine1')} disabled={disabled} className={fieldCls} />
        </Field>
        <Field label="Address Line 2">
          <input value={form.addressLine2} onChange={inp('addressLine2')} disabled={disabled} placeholder="Optional" className={fieldCls} />
        </Field>
        <Field label="City">
          <input value={form.city} onChange={inp('city')} disabled={disabled} className={fieldCls} />
        </Field>
        <Field label="State">
          <input value={form.state} onChange={inp('state')} disabled={disabled} className={fieldCls} />
        </Field>
        <Field label="Pincode">
          <input value={form.pincode} onChange={inp('pincode')} disabled={disabled} maxLength={6} className={fieldCls} />
        </Field>
      </div>
      {!disabled && (
        <div className="flex justify-end pt-2">
          <Button size="sm" className="gap-2" onClick={() => update.mutate({
            name: form.name, phone: form.phone,
            addressLine1: form.addressLine1, addressLine2: form.addressLine2 || null,
            city: form.city, state: form.state, pincode: form.pincode,
          })} disabled={update.isPending}>
            {update.isPending ? <Spinner size="xs" /> : <Save size={13} />} Save Outlet Info
          </Button>
        </div>
      )}
    </div>
  )
}

// ─── POS Settings section ─────────────────────────────────────────────────────

function POSSection({ settings, disabled }: { settings: TenantSettings | null; disabled: boolean }) {
  const update = useUpdateSettings()
  const [s, setS] = useState({
    serviceChargePercent:       settings?.serviceChargePercent       ?? 0,
    serviceChargeOnTakeaway:    settings?.serviceChargeOnTakeaway    ?? false,
    roundOffBill:               settings?.roundOffBill               ?? true,
    printKOTAutomatically:      settings?.printKOTAutomatically      ?? true,
    whatsappReceipts:           settings?.whatsappReceipts           ?? false,
    isInterState:               settings?.isInterState               ?? false,
    nightlySummaryPhone:        settings?.nightlySummaryPhone        ?? '',
    nightlySummaryTime:         settings?.nightlySummaryTime         ?? '23:30',
    kotPrinterIp:               settings?.kotPrinterIp               ?? '',
    billPrinterIp:              settings?.billPrinterIp              ?? '',
    discountApprovalThreshold:  settings?.discountApprovalThreshold  ?? 0,
    loyaltyEnabled:             settings?.loyaltyEnabled             ?? false,
    loyaltyPointsPerRupee:      settings?.loyaltyPointsPerRupee      ?? 1,
    loyaltyRedemptionRate:      settings?.loyaltyRedemptionRate      ?? 100,
  })

  useEffect(() => {
    if (!settings) return
    setS({
      serviceChargePercent:       settings.serviceChargePercent,
      serviceChargeOnTakeaway:    settings.serviceChargeOnTakeaway,
      roundOffBill:               settings.roundOffBill,
      printKOTAutomatically:      settings.printKOTAutomatically,
      whatsappReceipts:           settings.whatsappReceipts,
      isInterState:               settings.isInterState,
      nightlySummaryPhone:        settings.nightlySummaryPhone ?? '',
      nightlySummaryTime:         settings.nightlySummaryTime,
      kotPrinterIp:               settings.kotPrinterIp ?? '',
      billPrinterIp:              settings.billPrinterIp ?? '',
      discountApprovalThreshold:  settings.discountApprovalThreshold,
      loyaltyEnabled:             settings.loyaltyEnabled,
      loyaltyPointsPerRupee:      settings.loyaltyPointsPerRupee,
      loyaltyRedemptionRate:      settings.loyaltyRedemptionRate,
    })
  }, [settings])

  const rows: { label: string; key: 'serviceChargeOnTakeaway' | 'roundOffBill' | 'printKOTAutomatically' | 'whatsappReceipts' | 'isInterState'; hint?: string }[] = [
    { label: 'Service charge on takeaway', key: 'serviceChargeOnTakeaway' },
    { label: 'Round off bill total',        key: 'roundOffBill', hint: 'Rounds to nearest rupee' },
    { label: 'Auto-print KOT',              key: 'printKOTAutomatically', hint: 'Requires printer IP below' },
    { label: 'WhatsApp receipts',           key: 'whatsappReceipts', hint: 'Sends receipt to customer after payment' },
    { label: 'Inter-state GST (IGST)',      key: 'isInterState', hint: 'Uses IGST instead of CGST + SGST' },
  ]

  function handleSave() {
    update.mutate({
      serviceChargePercent:       s.serviceChargePercent,
      serviceChargeOnTakeaway:    s.serviceChargeOnTakeaway,
      roundOffBill:               s.roundOffBill,
      printKOTAutomatically:      s.printKOTAutomatically,
      whatsappReceipts:           s.whatsappReceipts,
      isInterState:               s.isInterState,
      nightlySummaryPhone:        s.nightlySummaryPhone || null,
      nightlySummaryTime:         s.nightlySummaryTime,
      kotPrinterIp:               s.kotPrinterIp || null,
      billPrinterIp:              s.billPrinterIp || null,
      discountApprovalThreshold:  s.discountApprovalThreshold,
      loyaltyEnabled:             s.loyaltyEnabled,
      loyaltyPointsPerRupee:      s.loyaltyPointsPerRupee,
      loyaltyRedemptionRate:      s.loyaltyRedemptionRate,
    })
  }

  return (
    <div className="bg-background-card border border-border rounded-xl p-6 space-y-5">
      <div className="flex items-center gap-2 pb-2 border-b border-border">
        <Sliders size={15} className="text-primary-500" />
        <h3 className="text-sm font-bold text-foreground">POS Settings</h3>
        <span className="text-[11px] text-muted-foreground ml-auto">OWNER only</span>
      </div>

      <Field label="Service Charge %" hint="0 = disabled">
        <input type="number" min={0} max={100} value={s.serviceChargePercent}
          onChange={e => setS(v => ({ ...v, serviceChargePercent: Number(e.target.value) }))}
          disabled={disabled} className={cn(fieldCls, 'max-w-[120px]')} />
      </Field>

      <div className="space-y-3">
        {rows.map(({ label, key, hint }) => (
          <div key={key} className="flex items-center justify-between gap-4">
            <div>
              <p className="text-sm font-medium text-foreground">{label}</p>
              {hint && <p className="text-[11px] text-muted-foreground">{hint}</p>}
            </div>
            <Toggle checked={s[key]} onChange={v => setS(prev => ({ ...prev, [key]: v }))} disabled={disabled} />
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2 border-t border-border">
        <Field label="Nightly Summary Phone" hint="Gets daily summary SMS/WhatsApp">
          <input value={s.nightlySummaryPhone}
            onChange={e => setS(v => ({ ...v, nightlySummaryPhone: e.target.value }))}
            disabled={disabled} placeholder="10-digit mobile" className={fieldCls} />
        </Field>
        <Field label="Nightly Summary Time">
          <input type="time" value={s.nightlySummaryTime}
            onChange={e => setS(v => ({ ...v, nightlySummaryTime: e.target.value }))}
            disabled={disabled} className={fieldCls} />
        </Field>
        <Field label="KOT Printer IP" hint="Thermal printer on local network">
          <input value={s.kotPrinterIp}
            onChange={e => setS(v => ({ ...v, kotPrinterIp: e.target.value }))}
            disabled={disabled} placeholder="192.168.1.100" className={fieldCls} />
        </Field>
        <Field label="Bill Printer IP">
          <input value={s.billPrinterIp}
            onChange={e => setS(v => ({ ...v, billPrinterIp: e.target.value }))}
            disabled={disabled} placeholder="192.168.1.101" className={fieldCls} />
        </Field>
      </div>

      {/* ─── Discount Approval ─── */}
      <div className="pt-4 border-t border-border space-y-3">
        <div className="flex items-center gap-2">
          <Lock size={13} className="text-muted-foreground" />
          <span className="text-xs font-bold text-muted-foreground uppercase tracking-wide">Discount Approval</span>
        </div>
        <Field label="Discount Approval Threshold %" hint="Discounts above this % require manager PIN. Set 0 to disable.">
          <input type="number" min={0} max={100} value={s.discountApprovalThreshold}
            onChange={e => setS(v => ({ ...v, discountApprovalThreshold: Number(e.target.value) }))}
            disabled={disabled} className={cn(fieldCls, 'max-w-[120px]')} />
        </Field>
      </div>

      {/* ─── Loyalty Program ─── */}
      <div className="pt-4 border-t border-border space-y-3">
        <div className="flex items-center gap-2">
          <Star size={13} className="text-warning fill-warning" />
          <span className="text-xs font-bold text-muted-foreground uppercase tracking-wide">Loyalty Program</span>
        </div>
        <div className="flex items-center justify-between gap-4">
          <div>
            <p className="text-sm font-medium text-foreground">Enable Loyalty Points</p>
            <p className="text-[11px] text-muted-foreground">Customers earn points on every paid bill</p>
          </div>
          <Toggle checked={s.loyaltyEnabled} onChange={v => setS(prev => ({ ...prev, loyaltyEnabled: v }))} disabled={disabled} />
        </div>
        {s.loyaltyEnabled && (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
            <Field label="Points per ₹1 spent" hint="e.g. 1 = earn 1 point per rupee">
              <input type="number" min={1} max={100} value={s.loyaltyPointsPerRupee}
                onChange={e => setS(v => ({ ...v, loyaltyPointsPerRupee: Number(e.target.value) }))}
                disabled={disabled} className={cn(fieldCls, 'max-w-[120px]')} />
            </Field>
            <Field label="Points needed per ₹1 discount" hint="e.g. 100 = 100 pts = ₹1 off">
              <input type="number" min={1} max={10000} value={s.loyaltyRedemptionRate}
                onChange={e => setS(v => ({ ...v, loyaltyRedemptionRate: Number(e.target.value) }))}
                disabled={disabled} className={cn(fieldCls, 'max-w-[120px]')} />
            </Field>
          </div>
        )}
      </div>

      {!disabled && (
        <div className="flex justify-end pt-2">
          <Button size="sm" className="gap-2" onClick={handleSave} disabled={update.isPending}>
            {update.isPending ? <Spinner size="xs" /> : <Save size={13} />} Save POS Settings
          </Button>
        </div>
      )}
    </div>
  )
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function SettingsPage() {
  const allowed  = useRequireRole(['OWNER', 'MANAGER'])
  const user     = useAuthStore((s) => s.user)
  const isOwner  = user?.role === 'OWNER'
  if (!allowed) return null

  const { data, isLoading } = useSettings()

  return (
    <div className="flex flex-col h-full -m-6 bg-background-card">
      {/* Header */}
      <div className="flex items-center gap-3 px-6 py-3 border-b border-border bg-background shrink-0">
        <Settings size={18} className="text-primary-500" />
        <span className="text-sm font-bold">Outlet Settings</span>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-6 space-y-6">
        {isLoading ? (
          <div className="flex items-center justify-center py-20">
            <Spinner size="xl" className="text-primary-500" />
          </div>
        ) : !data ? (
          <p className="text-center text-muted-foreground text-sm py-20">Failed to load settings.</p>
        ) : (
          <>
            {data.tenant  && <RestaurantSection tenant={data.tenant}   disabled={!isOwner} />}
            {data.outlet  && <OutletSection     outlet={data.outlet}   disabled={false} />}
            <POSSection settings={data.settings} disabled={!isOwner} />
          </>
        )}
      </div>
    </div>
  )
}
