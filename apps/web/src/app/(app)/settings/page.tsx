'use client'

import { useRequireRole } from '@/hooks/use-require-role'
import { useEffect, useState } from 'react'
import { Settings, Building2, Sliders, Save, Star, Lock, Printer, Plus, RefreshCw, PowerOff, Copy, Check, ChevronDown, ChevronUp, Shield } from 'lucide-react'
import { useSettings, useUpdateSettings, useUpdateOutlet, useUpdateTenant } from '@/hooks/use-settings'
import { useDevices, useCreateDevice, useDeactivateDevice, useRotateDeviceToken, useUpdateDeviceSettings } from '@/hooks/use-devices'
import { useAllPermissions, useGrantPermission, useRevokePermission } from '@/hooks/use-permissions'
import { Button } from '@/components/ui/button'
import { Spinner } from '@/components/ui/spinner'
import { cn } from '@/lib/utils'
import { useAuthStore } from '@/lib/auth-store'
import type { TenantSettings, TenantInfo, OutletInfo, Device, DeviceType, DeviceDisplayMode, ConfigurableRole } from '@/lib/api-types'

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

// ─── Devices section ──────────────────────────────────────────────────────────

const DEVICE_TYPE_LABELS: Record<DeviceType, string> = {
  POS:          'POS Terminal',
  KDS:          'Kitchen Display',
  CAPTAIN:      'Captain App',
  MANAGER:      'Manager App',
  PRINT_AGENT:  'Print Agent',
  OWNER_MOBILE: 'Owner Mobile',
}

const DISPLAY_MODE_LABELS: Record<DeviceDisplayMode, string> = {
  STANDARD:    'Standard',
  KIOSK:       'Kiosk',
  KDS_DISPLAY: 'KDS Display',
}

function CopyButton({ value }: { value: string }) {
  const [copied, setCopied] = useState(false)
  function handleCopy() {
    void navigator.clipboard.writeText(value)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }
  return (
    <button onClick={handleCopy} className="p-1 rounded hover:bg-background-hover transition-colors" title="Copy token">
      {copied ? <Check size={12} className="text-success" /> : <Copy size={12} className="text-muted-foreground" />}
    </button>
  )
}

function DeviceRow({ device }: { device: Device }) {
  const [expanded, setExpanded] = useState(false)
  const deactivate    = useDeactivateDevice()
  const rotateToken   = useRotateDeviceToken()
  const updateSettings = useUpdateDeviceSettings()

  const s = device.settings

  return (
    <div className="border border-border rounded-lg overflow-hidden">
      {/* Row header */}
      <div className="flex items-center gap-3 px-4 py-3 bg-background">
        <div className={cn(
          'w-2 h-2 rounded-full shrink-0',
          device.isActive ? 'bg-success' : 'bg-muted-foreground',
        )} />
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold text-foreground truncate">{device.name}</p>
          <p className="text-[11px] text-muted-foreground">{DEVICE_TYPE_LABELS[device.type]}</p>
        </div>
        <div className="flex items-center gap-1 text-[11px] font-mono text-muted-foreground bg-background-card border border-border rounded px-2 py-0.5 max-w-[140px] truncate">
          <span className="truncate">{device.token.slice(0, 16)}…</span>
          <CopyButton value={device.token} />
        </div>
        <button
          onClick={() => setExpanded(v => !v)}
          className="p-1 text-muted-foreground hover:text-foreground transition-colors ml-1"
        >
          {expanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
        </button>
      </div>

      {/* Expanded settings */}
      {expanded && (
        <div className="border-t border-border bg-background-card px-4 py-4 space-y-4">
          {/* Token row */}
          <div className="flex items-center gap-2">
            <div className="flex-1 font-mono text-xs text-muted-foreground bg-background border border-border rounded px-2 py-1.5 truncate">
              {device.token}
            </div>
            <CopyButton value={device.token} />
            <button
              onClick={() => rotateToken.mutate(device.id)}
              disabled={rotateToken.isPending}
              className="flex items-center gap-1 text-xs px-2.5 py-1.5 rounded-lg border border-border text-foreground hover:border-primary-500 hover:text-primary-500 transition-colors disabled:opacity-50"
              title="Rotate token"
            >
              {rotateToken.isPending ? <Spinner size="xs" /> : <RefreshCw size={11} />}
              Rotate
            </button>
          </div>

          {/* Device settings toggles */}
          {s && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {([
                { key: 'autoKotPrint',  label: 'Auto KOT Print' },
                { key: 'autoBillPrint', label: 'Auto Bill Print' },
                { key: 'soundAlerts',   label: 'Sound Alerts' },
              ] as const).map(({ key, label }) => (
                <div key={key} className="flex items-center justify-between">
                  <span className="text-sm text-foreground">{label}</span>
                  <Toggle
                    checked={s[key]}
                    onChange={v => updateSettings.mutate({ id: device.id, [key]: v })}
                  />
                </div>
              ))}

              <div className="flex items-center justify-between sm:col-span-2">
                <span className="text-sm text-foreground">Display Mode</span>
                <select
                  value={s.displayMode}
                  onChange={e => updateSettings.mutate({ id: device.id, displayMode: e.target.value as DeviceDisplayMode })}
                  className="text-xs bg-background border border-border rounded px-2 py-1 text-foreground focus:outline-none focus:ring-1 focus:ring-primary-500"
                >
                  {(Object.keys(DISPLAY_MODE_LABELS) as DeviceDisplayMode[]).map(m => (
                    <option key={m} value={m}>{DISPLAY_MODE_LABELS[m]}</option>
                  ))}
                </select>
              </div>
            </div>
          )}

          {/* Last seen */}
          {device.lastSeenAt && (
            <p className="text-[11px] text-muted-foreground">
              Last seen: {new Date(device.lastSeenAt).toLocaleString()}
              {device.lastSeenIp ? ` · ${device.lastSeenIp}` : ''}
            </p>
          )}

          {/* Deactivate */}
          {device.isActive && (
            <div className="pt-2 border-t border-border flex justify-end">
              <button
                onClick={() => deactivate.mutate(device.id)}
                disabled={deactivate.isPending}
                className="flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg border border-danger/40 text-danger hover:bg-danger/10 transition-colors disabled:opacity-50"
              >
                {deactivate.isPending ? <Spinner size="xs" /> : <PowerOff size={11} />}
                Deactivate
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

function RegisterDeviceModal({
  onClose,
}: {
  onClose: () => void
}) {
  const create = useCreateDevice()
  const [form, setForm] = useState({ name: '', type: 'POS' as DeviceType })

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    create.mutate(form, { onSuccess: onClose })
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="bg-background-card border border-border rounded-xl w-full max-w-sm p-6 space-y-5 shadow-xl">
        <div className="flex items-center gap-2">
          <Printer size={16} className="text-primary-500" />
          <h3 className="text-sm font-bold text-foreground">Register Device</h3>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Device Name</label>
            <input
              required
              value={form.name}
              onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
              placeholder="e.g. Counter 1 POS"
              className={fieldCls}
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Device Type</label>
            <select
              value={form.type}
              onChange={e => setForm(f => ({ ...f, type: e.target.value as DeviceType }))}
              className={cn(fieldCls, 'cursor-pointer')}
            >
              {(Object.entries(DEVICE_TYPE_LABELS) as [DeviceType, string][]).map(([v, l]) => (
                <option key={v} value={v}>{l}</option>
              ))}
            </select>
          </div>

          <div className="flex gap-2 justify-end pt-2">
            <button type="button" onClick={onClose}
              className="px-4 py-2 text-sm rounded-lg border border-border text-muted-foreground hover:text-foreground transition-colors">
              Cancel
            </button>
            <Button type="submit" size="sm" className="gap-1.5" disabled={create.isPending}>
              {create.isPending ? <Spinner size="xs" /> : <Plus size={13} />} Register
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}

function DevicesSection({ disabled }: { disabled: boolean }) {
  const { data: devices, isLoading } = useDevices()
  const [showModal, setShowModal] = useState(false)

  const active   = devices?.filter(d => d.isActive)  ?? []
  const inactive = devices?.filter(d => !d.isActive) ?? []

  return (
    <>
      {showModal && <RegisterDeviceModal onClose={() => setShowModal(false)} />}

      <div className="bg-background-card border border-border rounded-xl p-6 space-y-5">
        <div className="flex items-center gap-2 pb-2 border-b border-border">
          <Printer size={15} className="text-primary-500" />
          <h3 className="text-sm font-bold text-foreground">Devices</h3>
          <span className="text-[11px] text-muted-foreground ml-auto">OWNER only</span>
          {!disabled && (
            <Button size="sm" className="gap-1.5 ml-2" onClick={() => setShowModal(true)}>
              <Plus size={13} /> Register Device
            </Button>
          )}
        </div>

        {isLoading ? (
          <div className="flex items-center justify-center py-8">
            <Spinner size="lg" className="text-primary-500" />
          </div>
        ) : active.length === 0 && inactive.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-10 gap-2 text-center">
            <Printer size={28} className="text-muted-foreground/40" />
            <p className="text-sm font-medium text-muted-foreground">No devices registered yet</p>
            {!disabled && (
              <p className="text-xs text-muted-foreground">Click &quot;Register Device&quot; to add your first POS terminal or printer.</p>
            )}
          </div>
        ) : (
          <div className="space-y-4">
            {active.length > 0 && (
              <div className="space-y-2">
                <p className="text-xs font-bold text-muted-foreground uppercase tracking-wide">Active ({active.length})</p>
                {active.map(d => <DeviceRow key={d.id} device={d} />)}
              </div>
            )}
            {inactive.length > 0 && (
              <div className="space-y-2">
                <p className="text-xs font-bold text-muted-foreground uppercase tracking-wide">Inactive ({inactive.length})</p>
                {inactive.map(d => <DeviceRow key={d.id} device={d} />)}
              </div>
            )}
          </div>
        )}
      </div>
    </>
  )
}

// ─── Permissions section ─────────────────────────────────────────────────────

const CONFIGURABLE_ROLES: ConfigurableRole[] = ['MANAGER', 'CASHIER', 'WAITER', 'CHEF', 'INVENTORY_MANAGER']

const ROLE_LABELS: Record<ConfigurableRole, string> = {
  MANAGER:           'Manager',
  CASHIER:           'Cashier',
  WAITER:            'Waiter',
  CHEF:              'Chef',
  INVENTORY_MANAGER: 'Inventory Mgr',
}

// Hardcoded to avoid an extra network request — matches the API's AVAILABLE_PERMISSIONS list exactly
const PERMISSION_GROUPS: { domain: string; items: { key: string; label: string; hint?: string }[] }[] = [
  {
    domain: 'Billing',
    items: [
      { key: 'BILLING:discount', label: 'Apply Discounts',  hint: 'Can discount a bill without manager approval' },
      { key: 'BILLING:void',     label: 'Void Bills',       hint: 'Can void an entire bill or order' },
      { key: 'BILLING:settle',   label: 'Settle Bills',     hint: 'Can mark a bill as paid' },
    ],
  },
  {
    domain: 'Orders',
    items: [
      { key: 'ORDERS:cancel',       label: 'Cancel Orders',   hint: 'Can cancel a placed order' },
      { key: 'ORDERS:kot_override', label: 'Override KOT',    hint: 'Can force-reprint or override a KOT' },
    ],
  },
  {
    domain: 'Menu',
    items: [
      { key: 'MENU:edit',         label: 'Edit Menu',           hint: 'Can edit items, prices, and categories' },
      { key: 'MENU:availability', label: 'Toggle Availability', hint: 'Can mark items in/out of stock' },
    ],
  },
  {
    domain: 'Reports',
    items: [
      { key: 'REPORTS:sales', label: 'Sales Reports', hint: 'Can view daily and period sales' },
      { key: 'REPORTS:staff', label: 'Staff Reports',  hint: 'Can view staff performance data' },
    ],
  },
  {
    domain: 'Inventory',
    items: [
      { key: 'INVENTORY:view',   label: 'View Stock',   hint: 'Can view stock levels' },
      { key: 'INVENTORY:manage', label: 'Manage Stock', hint: 'Can add, adjust, and write-off stock' },
    ],
  },
  {
    domain: 'Staff',
    items: [
      { key: 'STAFF:manage', label: 'Manage Staff', hint: 'Can create and deactivate staff accounts' },
    ],
  },
  {
    domain: 'Customers',
    items: [
      { key: 'CUSTOMERS:view',   label: 'View Customers',   hint: 'Can see customer contact details' },
      { key: 'CUSTOMERS:export', label: 'Export Customers', hint: 'Can export customer data' },
    ],
  },
  {
    domain: 'Settings',
    items: [
      { key: 'SETTINGS:printer', label: 'Printer Settings', hint: 'Can change printer and KOT config' },
    ],
  },
]

function PermissionsSection({ disabled }: { disabled: boolean }) {
  const { data: byRole, isLoading } = useAllPermissions()
  const grant  = useGrantPermission()
  const revoke = useRevokePermission()

  const [activeRole, setActiveRole] = useState<ConfigurableRole>('MANAGER')

  const granted = new Set<string>(byRole?.[activeRole] ?? [])

  function handleToggle(permission: string, currentlyGranted: boolean) {
    if (currentlyGranted) {
      revoke.mutate({ role: activeRole, permission })
    } else {
      grant.mutate({ role: activeRole, permission })
    }
  }

  const isBusy = grant.isPending || revoke.isPending

  return (
    <div className="bg-background-card border border-border rounded-xl p-6 space-y-5">
      {/* Header */}
      <div className="flex items-center gap-2 pb-2 border-b border-border">
        <Shield size={15} className="text-primary-500" />
        <h3 className="text-sm font-bold text-foreground">Roles &amp; Permissions</h3>
        <span className="text-[11px] text-muted-foreground ml-auto">OWNER only</span>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center py-8">
          <Spinner size="lg" className="text-primary-500" />
        </div>
      ) : (
        <>
          {/* Role tabs */}
          <div className="flex gap-1 flex-wrap">
            {CONFIGURABLE_ROLES.map(role => (
              <button
                key={role}
                onClick={() => setActiveRole(role)}
                className={cn(
                  'px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors',
                  activeRole === role
                    ? 'bg-primary-500 text-white'
                    : 'bg-background border border-border text-muted-foreground hover:text-foreground',
                )}
              >
                {ROLE_LABELS[role]}
                {byRole?.[role]?.length ? (
                  <span className={cn(
                    'ml-1.5 text-[10px] font-bold',
                    activeRole === role ? 'text-white/70' : 'text-primary-500',
                  )}>
                    {byRole[role]?.length}
                  </span>
                ) : null}
              </button>
            ))}
          </div>

          {/* Permission groups */}
          <div className="space-y-4">
            {PERMISSION_GROUPS.map(({ domain, items }) => (
              <div key={domain}>
                <p className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider mb-2">
                  {domain}
                </p>
                <div className="space-y-2">
                  {items.map(({ key, label, hint }) => {
                    const isGranted = granted.has(key)
                    return (
                      <div key={key} className="flex items-center justify-between gap-4 py-1">
                        <div>
                          <p className="text-sm font-medium text-foreground">{label}</p>
                          {hint && <p className="text-[11px] text-muted-foreground">{hint}</p>}
                        </div>
                        <Toggle
                          checked={isGranted}
                          onChange={() => handleToggle(key, isGranted)}
                          disabled={disabled || isBusy}
                        />
                      </div>
                    )
                  })}
                </div>
              </div>
            ))}
          </div>

          {disabled && (
            <p className="text-[11px] text-muted-foreground text-center pt-1">
              Only the OWNER can modify role permissions.
            </p>
          )}
        </>
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
            <POSSection         settings={data.settings} disabled={!isOwner} />
            <DevicesSection     disabled={!isOwner} />
            <PermissionsSection disabled={!isOwner} />
          </>
        )}
      </div>
    </div>
  )
}
