'use client'

import { useState, useEffect } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import {
  Settings,
  IndianRupee,
  Layers,
  ToggleRight,
  Phone,
  Users,
  ShieldCheck,
  Save,
  Check,
  X,
} from 'lucide-react'
import { toast } from 'sonner'
import { adminFetch } from '@/lib/admin-api'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { cn } from '@/lib/utils'

// ─── Types ─────────────────────────────────────────────────────────────────────

interface PlatformSettings {
  // Pricing (stored in paise, displayed as ₹)
  monthlyPricePaise: number
  yearlyPricePaise: number
  lifetimePricePaise: number
  gstPercent: number
  trialDays: number
  // Feature limits
  maxOutletsPerTenant: number
  maxStaffPerTenant: number
  // Feature flags
  kdsEnabled: boolean
  inventoryEnabled: boolean
  // Contact
  supportEmail: string
  supportPhone: string
}

interface AdminUser {
  id: string
  name: string
  email: string
  role: string
  isActive: boolean
  lastLoginAt?: string | null
}

// ─── Helpers ───────────────────────────────────────────────────────────────────

/** Convert paise (integer) to rupees string for an input field */
function paiseToRs(paise: number): string {
  return String(Math.round(paise / 100))
}

/** Convert rupees string from input to paise integer */
function rsToPaise(rs: string): number {
  const n = parseFloat(rs)
  return isNaN(n) ? 0 : Math.round(n * 100)
}

function fmtDate(iso: string) {
  return new Date(iso).toLocaleDateString('en-IN', {
    day: '2-digit', month: 'short', year: 'numeric',
  })
}

// ─── Section wrapper ───────────────────────────────────────────────────────────

interface SectionProps {
  icon: React.ElementType
  title: string
  children: React.ReactNode
}

function Section({ icon: Icon, title, children }: SectionProps) {
  return (
    <div className="rounded-xl border border-border bg-background-card overflow-hidden">
      <div className="flex items-center gap-2.5 px-5 py-3.5 border-b border-border bg-white/[0.02]">
        <Icon size={15} className="text-primary-500 shrink-0" />
        <h2 className="text-sm font-bold text-foreground">{title}</h2>
      </div>
      <div className="p-5">{children}</div>
    </div>
  )
}

// ─── Toggle row ────────────────────────────────────────────────────────────────

interface ToggleRowProps {
  label: string
  description: string
  checked: boolean
  onChange: (v: boolean) => void
  disabled?: boolean
}

function ToggleRow({ label, description, checked, onChange, disabled }: ToggleRowProps) {
  return (
    <div className="flex items-center justify-between gap-4 py-3 border-b border-border/50 last:border-0">
      <div className="min-w-0">
        <p className="text-sm font-medium text-foreground">{label}</p>
        <p className="text-xs text-muted-foreground mt-0.5">{description}</p>
      </div>
      <button
        type="button"
        role="switch"
        aria-checked={checked}
        onClick={() => !disabled && onChange(!checked)}
        disabled={disabled}
        className={cn(
          'relative inline-flex h-6 w-11 shrink-0 items-center rounded-full transition-colors duration-200',
          'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500/50',
          'disabled:opacity-50 disabled:cursor-not-allowed',
          checked ? 'bg-primary-500' : 'bg-white/10',
        )}
      >
        <span
          className={cn(
            'pointer-events-none inline-block h-4 w-4 rounded-full bg-white shadow-sm',
            'transform transition-transform duration-200',
            checked ? 'translate-x-6' : 'translate-x-1',
          )}
        />
      </button>
    </div>
  )
}

// ─── Admin user row ────────────────────────────────────────────────────────────

interface AdminUserRowProps {
  admin: AdminUser
  onToggle: (id: string, isActive: boolean) => void
  toggling: boolean
}

function AdminUserRow({ admin, onToggle, toggling }: AdminUserRowProps) {
  return (
    <div className="flex items-center gap-4 py-3.5 border-b border-border/50 last:border-0">
      {/* Avatar */}
      <div className="w-9 h-9 rounded-full bg-primary-500/15 border border-primary-500/20 flex items-center justify-center shrink-0">
        <span className="text-xs font-bold text-primary-400 uppercase">
          {(admin.name ?? admin.email).charAt(0)}
        </span>
      </div>

      {/* Info */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 flex-wrap">
          <p className="text-sm font-semibold text-foreground leading-none">{admin.name}</p>
          <Badge variant="muted" className="text-[9px] py-0">{admin.role}</Badge>
        </div>
        <p className="text-xs text-muted-foreground mt-0.5">{admin.email}</p>
        {admin.lastLoginAt && (
          <p className="text-[11px] text-muted-foreground/60 mt-0.5">
            Last login {fmtDate(admin.lastLoginAt)}
          </p>
        )}
      </div>

      {/* Status + toggle */}
      <div className="flex items-center gap-2 shrink-0">
        <Badge variant={admin.isActive ? 'success' : 'muted'}>
          {admin.isActive ? 'Active' : 'Inactive'}
        </Badge>
        <button
          type="button"
          onClick={() => onToggle(admin.id, !admin.isActive)}
          disabled={toggling}
          aria-label={admin.isActive ? 'Deactivate admin' : 'Activate admin'}
          className={cn(
            'h-7 px-2.5 rounded-md text-[11px] font-semibold transition-colors',
            'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500/50',
            'disabled:opacity-40 disabled:cursor-not-allowed',
            admin.isActive
              ? 'text-danger border border-danger/30 hover:bg-danger/10'
              : 'text-success border border-success/30 hover:bg-success/10',
          )}
        >
          {admin.isActive ? 'Deactivate' : 'Activate'}
        </button>
      </div>
    </div>
  )
}

// ─── Page ──────────────────────────────────────────────────────────────────────

export default function PlatformSettingsPage() {
  const qc = useQueryClient()

  // ─ Settings form state ─────────────────────────────────────────────────────

  // Pricing (display as ₹, store as paise)
  const [monthlyRs, setMonthlyRs] = useState('')
  const [yearlyRs, setYearlyRs] = useState('')
  const [lifetimeRs, setLifetimeRs] = useState('')
  const [gstPercent, setGstPercent] = useState('')
  const [trialDays, setTrialDays] = useState('')
  // Limits
  const [maxOutlets, setMaxOutlets] = useState('')
  const [maxStaff, setMaxStaff] = useState('')
  // Features
  const [kdsEnabled, setKdsEnabled] = useState(true)
  const [inventoryEnabled, setInventoryEnabled] = useState(true)
  // Contact
  const [supportEmail, setSupportEmail] = useState('')
  const [supportPhone, setSupportPhone] = useState('')

  // ─ Fetch settings ──────────────────────────────────────────────────────────

  const { data: settingsData, isLoading: settingsLoading } = useQuery({
    queryKey: ['admin-platform-settings'],
    queryFn: () => adminFetch<PlatformSettings>('/api/v1/admin/platform-settings'),
  })

  useEffect(() => {
    if (!settingsData) return
    setMonthlyRs(paiseToRs(settingsData.monthlyPricePaise))
    setYearlyRs(paiseToRs(settingsData.yearlyPricePaise))
    setLifetimeRs(paiseToRs(settingsData.lifetimePricePaise))
    setGstPercent(String(settingsData.gstPercent))
    setTrialDays(String(settingsData.trialDays))
    setMaxOutlets(String(settingsData.maxOutletsPerTenant))
    setMaxStaff(String(settingsData.maxStaffPerTenant))
    setKdsEnabled(settingsData.kdsEnabled)
    setInventoryEnabled(settingsData.inventoryEnabled)
    setSupportEmail(settingsData.supportEmail ?? '')
    setSupportPhone(settingsData.supportPhone ?? '')
  }, [settingsData])

  // ─ Save settings ───────────────────────────────────────────────────────────

  const saveMutation = useMutation({
    mutationFn: (payload: Partial<PlatformSettings>) =>
      adminFetch<PlatformSettings>('/api/v1/admin/platform-settings', {
        method: 'PATCH',
        body: JSON.stringify(payload),
      }),
    onSuccess: () => {
      toast.success('Settings saved.')
      qc.invalidateQueries({ queryKey: ['admin-platform-settings'] })
    },
    onError: (e: Error) => toast.error(e.message),
  })

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault()
    saveMutation.mutate({
      monthlyPricePaise:  rsToPaise(monthlyRs),
      yearlyPricePaise:   rsToPaise(yearlyRs),
      lifetimePricePaise: rsToPaise(lifetimeRs),
      gstPercent:         parseFloat(gstPercent) || 0,
      trialDays:          parseInt(trialDays, 10) || 0,
      maxOutletsPerTenant: parseInt(maxOutlets, 10) || 0,
      maxStaffPerTenant:   parseInt(maxStaff, 10) || 0,
      kdsEnabled,
      inventoryEnabled,
      supportEmail: supportEmail.trim(),
      supportPhone: supportPhone.trim(),
    })
  }

  // ─ Fetch admins ────────────────────────────────────────────────────────────

  const { data: adminsData, isLoading: adminsLoading } = useQuery({
    queryKey: ['admin-users'],
    queryFn: () => adminFetch<{ items: AdminUser[] }>('/api/v1/admin/admins'),
  })

  const [togglingId, setTogglingId] = useState<string | null>(null)

  const toggleAdminMutation = useMutation({
    mutationFn: ({ id, isActive }: { id: string; isActive: boolean }) =>
      adminFetch<AdminUser>(`/api/v1/admin/admins/${id}`, {
        method: 'PATCH',
        body: JSON.stringify({ isActive }),
      }),
    onMutate: ({ id }) => setTogglingId(id),
    onSuccess: (_, { isActive }) => {
      toast.success(isActive ? 'Admin activated.' : 'Admin deactivated.')
      qc.invalidateQueries({ queryKey: ['admin-users'] })
    },
    onError: (e: Error) => toast.error(e.message),
    onSettled: () => setTogglingId(null),
  })

  const adminList = adminsData?.items ?? []

  // ─ Render ──────────────────────────────────────────────────────────────────

  const inputCls = 'h-10'

  return (
    <div className="p-6 max-w-3xl mx-auto">
      {/* Page header */}
      <div className="flex items-center justify-between mb-7">
        <div>
          <h1 className="text-xl font-bold text-foreground flex items-center gap-2.5">
            <Settings size={20} className="text-primary-500 shrink-0" />
            Platform Settings
          </h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            Billing configuration, feature flags, and support contacts
          </p>
        </div>
      </div>

      <form onSubmit={handleSave} className="space-y-5">
        {/* ── 1. Pricing ──────────────────────────────────────────────────── */}
        <Section icon={IndianRupee} title="Pricing">
          {settingsLoading ? (
            <div className="space-y-3">
              {Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="skeleton h-10 rounded-md" />
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label>Monthly Price (₹)</Label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground text-sm font-medium">₹</span>
                  <Input
                    type="number"
                    min="0"
                    step="1"
                    placeholder="999"
                    value={monthlyRs}
                    onChange={(e) => setMonthlyRs(e.target.value)}
                    className={cn(inputCls, 'pl-7')}
                    disabled={saveMutation.isPending}
                  />
                </div>
              </div>
              <div className="space-y-1.5">
                <Label>Yearly Price (₹)</Label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground text-sm font-medium">₹</span>
                  <Input
                    type="number"
                    min="0"
                    step="1"
                    placeholder="9999"
                    value={yearlyRs}
                    onChange={(e) => setYearlyRs(e.target.value)}
                    className={cn(inputCls, 'pl-7')}
                    disabled={saveMutation.isPending}
                  />
                </div>
              </div>
              <div className="space-y-1.5">
                <Label>Lifetime Price (₹)</Label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground text-sm font-medium">₹</span>
                  <Input
                    type="number"
                    min="0"
                    step="1"
                    placeholder="24999"
                    value={lifetimeRs}
                    onChange={(e) => setLifetimeRs(e.target.value)}
                    className={cn(inputCls, 'pl-7')}
                    disabled={saveMutation.isPending}
                  />
                </div>
              </div>
              <div className="space-y-1.5">
                <Label>GST %</Label>
                <Input
                  type="number"
                  min="0"
                  max="100"
                  step="0.01"
                  placeholder="18"
                  value={gstPercent}
                  onChange={(e) => setGstPercent(e.target.value)}
                  className={inputCls}
                  disabled={saveMutation.isPending}
                />
              </div>
              <div className="space-y-1.5 sm:col-span-2">
                <Label>Trial Period (days)</Label>
                <Input
                  type="number"
                  min="0"
                  max="365"
                  step="1"
                  placeholder="14"
                  value={trialDays}
                  onChange={(e) => setTrialDays(e.target.value)}
                  className={cn(inputCls, 'max-w-[160px]')}
                  disabled={saveMutation.isPending}
                />
              </div>
            </div>
          )}
        </Section>

        {/* ── 2. Feature Limits ────────────────────────────────────────────── */}
        <Section icon={Layers} title="Feature Limits">
          {settingsLoading ? (
            <div className="space-y-3">
              {Array.from({ length: 2 }).map((_, i) => (
                <div key={i} className="skeleton h-10 rounded-md" />
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label>Max outlets per tenant</Label>
                <Input
                  type="number"
                  min="1"
                  step="1"
                  placeholder="5"
                  value={maxOutlets}
                  onChange={(e) => setMaxOutlets(e.target.value)}
                  className={inputCls}
                  disabled={saveMutation.isPending}
                />
              </div>
              <div className="space-y-1.5">
                <Label>Max staff per tenant</Label>
                <Input
                  type="number"
                  min="1"
                  step="1"
                  placeholder="50"
                  value={maxStaff}
                  onChange={(e) => setMaxStaff(e.target.value)}
                  className={inputCls}
                  disabled={saveMutation.isPending}
                />
              </div>
            </div>
          )}
        </Section>

        {/* ── 3. Features ──────────────────────────────────────────────────── */}
        <Section icon={ToggleRight} title="Features">
          {settingsLoading ? (
            <div className="space-y-4">
              {Array.from({ length: 2 }).map((_, i) => (
                <div key={i} className="flex items-center justify-between">
                  <div className="space-y-1.5">
                    <div className="skeleton h-3 w-24 rounded" />
                    <div className="skeleton h-3 w-40 rounded" />
                  </div>
                  <div className="skeleton h-6 w-11 rounded-full" />
                </div>
              ))}
            </div>
          ) : (
            <div>
              <ToggleRow
                label="KDS Enabled"
                description="Allow tenants to use the Kitchen Display System"
                checked={kdsEnabled}
                onChange={setKdsEnabled}
                disabled={saveMutation.isPending}
              />
              <ToggleRow
                label="Inventory Enabled"
                description="Allow tenants to use stock tracking and inventory management"
                checked={inventoryEnabled}
                onChange={setInventoryEnabled}
                disabled={saveMutation.isPending}
              />
            </div>
          )}
        </Section>

        {/* ── 4. Contact ───────────────────────────────────────────────────── */}
        <Section icon={Phone} title="Contact">
          {settingsLoading ? (
            <div className="space-y-3">
              {Array.from({ length: 2 }).map((_, i) => (
                <div key={i} className="skeleton h-10 rounded-md" />
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label>Support Email</Label>
                <Input
                  type="email"
                  placeholder="support@atlas.app"
                  value={supportEmail}
                  onChange={(e) => setSupportEmail(e.target.value)}
                  className={inputCls}
                  disabled={saveMutation.isPending}
                />
              </div>
              <div className="space-y-1.5">
                <Label>Support Phone</Label>
                <Input
                  type="tel"
                  placeholder="+91 98765 43210"
                  value={supportPhone}
                  onChange={(e) => setSupportPhone(e.target.value)}
                  className={inputCls}
                  disabled={saveMutation.isPending}
                />
              </div>
            </div>
          )}
        </Section>

        {/* Save button */}
        <div className="flex justify-end">
          <Button
            type="submit"
            disabled={saveMutation.isPending || settingsLoading}
            className="min-w-[130px]"
          >
            {saveMutation.isPending ? (
              <span className="flex items-center gap-2">
                <span className="h-3.5 w-3.5 rounded-full border-2 border-white/40 border-t-white animate-spin" />
                Saving…
              </span>
            ) : saveMutation.isSuccess ? (
              <span className="flex items-center gap-2">
                <Check size={14} />
                Saved
              </span>
            ) : (
              <span className="flex items-center gap-2">
                <Save size={14} />
                Save Settings
              </span>
            )}
          </Button>
        </div>
      </form>

      {/* ── Admin Users ─────────────────────────────────────────────────────── */}
      <div className="mt-8">
        <div className="rounded-xl border border-border bg-background-card overflow-hidden">
          <div className="flex items-center gap-2.5 px-5 py-3.5 border-b border-border bg-white/[0.02]">
            <Users size={15} className="text-primary-500 shrink-0" />
            <h2 className="text-sm font-bold text-foreground">Admin Users</h2>
            {!adminsLoading && (
              <span className="ml-auto text-xs text-muted-foreground tabular-nums">
                {adminList.length} admin{adminList.length !== 1 ? 's' : ''}
              </span>
            )}
          </div>

          <div className="px-5">
            {adminsLoading &&
              Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="flex items-center gap-4 py-4 border-b border-border/50 last:border-0">
                  <div className="skeleton w-9 h-9 rounded-full" />
                  <div className="flex-1 space-y-1.5">
                    <div className="skeleton h-3 w-32 rounded" />
                    <div className="skeleton h-3 w-44 rounded" />
                  </div>
                  <div className="skeleton h-6 w-16 rounded-full" />
                </div>
              ))}

            {!adminsLoading && adminList.length === 0 && (
              <div className="py-10 text-center">
                <p className="text-sm text-muted-foreground">No admin users found.</p>
              </div>
            )}

            {!adminsLoading &&
              adminList.map((admin) => (
                <AdminUserRow
                  key={admin.id}
                  admin={admin}
                  onToggle={(id, isActive) => toggleAdminMutation.mutate({ id, isActive })}
                  toggling={togglingId === admin.id}
                />
              ))}
          </div>
        </div>
      </div>
    </div>
  )
}
