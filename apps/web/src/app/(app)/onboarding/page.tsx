'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import {
  Check, ChevronLeft, ChevronRight, ArrowRight, Loader2,
  Store, Sparkles, Image, Shield, LayoutGrid, UtensilsCrossed,
  Users, CreditCard, Printer, Zap, Coffee, GlassWater, Wine,
  Truck, Cloud, Cookie, Flame, Candy, Monitor, Smartphone,
  CalendarCheck, QrCode, Package, Globe,
} from 'lucide-react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Spinner } from '@/components/ui/spinner'
import { cn } from '@/lib/utils'
import { apiClient, refreshAuthToken } from '@/lib/api-client'

// ─── Types ────────────────────────────────────────────────────────────────────

type RestaurantType =
  | 'QSR' | 'CASUAL_DINING' | 'FINE_DINING' | 'CAFE' | 'BAR'
  | 'FOOD_TRUCK' | 'CLOUD_KITCHEN' | 'BAKERY' | 'DHABA' | 'SWEET_SHOP'

interface FeatureFlags {
  enableFloorPlan: boolean
  enableKDS: boolean
  enableCaptainApp: boolean
  enableReservations: boolean
  enableQROrdering: boolean
  enableInventory: boolean
  enableCRM: boolean
  enableOnlineOrdering: boolean
  enableDelivery: boolean
}

interface StepDoneFlags {
  outletTypeDone: boolean
  featuresDone: boolean
  brandingDone: boolean
  restaurantProfileDone: boolean
  tablesDone: boolean
  menuDone: boolean
  staffDone: boolean
  paymentSetupDone: boolean
  devicesDone: boolean
  skippedSteps: string[] | null
  completedAt: string | null
}

interface SettingsApiResponse {
  tenant: {
    name: string
    type: string | null
    logoUrl: string | null
    gstin: string | null
    fssaiLicense: string | null
    panNumber: string | null
    addressLine1: string | null
    city: string | null
    state: string | null
    pincode: string | null
  }
  settings: {
    enableFloorPlan: boolean | null
    enableKDS: boolean | null
    enableCaptainApp: boolean | null
    enableReservations: boolean | null
    enableQROrdering: boolean | null
    enableInventory: boolean | null
    enableCRM: boolean | null
    enableOnlineOrdering: boolean | null
    enableDelivery: boolean | null
  } | null
}

// ─── Outlet type config ───────────────────────────────────────────────────────

const OUTLET_TYPES: {
  value: RestaurantType
  label: string
  description: string
  icon: React.ElementType
}[] = [
  { value: 'QSR',           label: 'Quick Service',   description: 'Fast food, counter service',     icon: Zap            },
  { value: 'CASUAL_DINING', label: 'Casual Dining',   description: 'Relaxed sit-down dining',        icon: UtensilsCrossed },
  { value: 'FINE_DINING',   label: 'Fine Dining',     description: 'Premium dining experience',      icon: Wine           },
  { value: 'CAFE',          label: 'Café',            description: 'Coffee shop, light bites',       icon: Coffee         },
  { value: 'BAR',           label: 'Bar & Lounge',    description: 'Beverages & nightlife',          icon: GlassWater     },
  { value: 'FOOD_TRUCK',    label: 'Food Truck',      description: 'Mobile food service',            icon: Truck          },
  { value: 'CLOUD_KITCHEN', label: 'Cloud Kitchen',   description: 'Delivery-only, no dine-in',      icon: Cloud          },
  { value: 'BAKERY',        label: 'Bakery',          description: 'Breads, pastries, sweets',       icon: Cookie         },
  { value: 'DHABA',         label: 'Dhaba',           description: 'Traditional roadside eatery',    icon: Flame          },
  { value: 'SWEET_SHOP',    label: 'Sweet Shop',      description: 'Sweets, namkeen, mithai',        icon: Candy          },
]

// Smart feature defaults per outlet type — applied when outlet type is selected
const OUTLET_DEFAULTS: Record<RestaurantType, FeatureFlags> = {
  QSR:           { enableFloorPlan: false, enableKDS: true,  enableCaptainApp: false, enableReservations: false, enableQROrdering: true,  enableInventory: true,  enableCRM: false, enableOnlineOrdering: false, enableDelivery: true  },
  CASUAL_DINING: { enableFloorPlan: true,  enableKDS: true,  enableCaptainApp: true,  enableReservations: false, enableQROrdering: false, enableInventory: true,  enableCRM: false, enableOnlineOrdering: false, enableDelivery: false },
  FINE_DINING:   { enableFloorPlan: true,  enableKDS: true,  enableCaptainApp: true,  enableReservations: true,  enableQROrdering: false, enableInventory: true,  enableCRM: true,  enableOnlineOrdering: false, enableDelivery: false },
  CAFE:          { enableFloorPlan: true,  enableKDS: false, enableCaptainApp: false, enableReservations: false, enableQROrdering: true,  enableInventory: true,  enableCRM: false, enableOnlineOrdering: false, enableDelivery: false },
  BAR:           { enableFloorPlan: true,  enableKDS: false, enableCaptainApp: true,  enableReservations: true,  enableQROrdering: false, enableInventory: true,  enableCRM: true,  enableOnlineOrdering: false, enableDelivery: false },
  FOOD_TRUCK:    { enableFloorPlan: false, enableKDS: false, enableCaptainApp: false, enableReservations: false, enableQROrdering: true,  enableInventory: true,  enableCRM: false, enableOnlineOrdering: false, enableDelivery: true  },
  CLOUD_KITCHEN: { enableFloorPlan: false, enableKDS: true,  enableCaptainApp: false, enableReservations: false, enableQROrdering: false, enableInventory: true,  enableCRM: false, enableOnlineOrdering: true,  enableDelivery: true  },
  BAKERY:        { enableFloorPlan: false, enableKDS: false, enableCaptainApp: false, enableReservations: false, enableQROrdering: true,  enableInventory: true,  enableCRM: false, enableOnlineOrdering: true,  enableDelivery: false },
  DHABA:         { enableFloorPlan: true,  enableKDS: true,  enableCaptainApp: false, enableReservations: false, enableQROrdering: false, enableInventory: true,  enableCRM: false, enableOnlineOrdering: false, enableDelivery: false },
  SWEET_SHOP:    { enableFloorPlan: false, enableKDS: false, enableCaptainApp: false, enableReservations: false, enableQROrdering: true,  enableInventory: true,  enableCRM: false, enableOnlineOrdering: true,  enableDelivery: false },
}

// ─── Feature config ───────────────────────────────────────────────────────────

const FEATURES: {
  key: keyof FeatureFlags
  label: string
  description: string
  icon: React.ElementType
}[] = [
  { key: 'enableFloorPlan',     label: 'Floor Plan',      description: 'Table layout, sections, waiter assignment', icon: LayoutGrid    },
  { key: 'enableKDS',           label: 'Kitchen Display', description: 'KDS screens for kitchen order queues',      icon: Monitor       },
  { key: 'enableCaptainApp',    label: 'Captain App',     description: 'Handheld ordering for waiters',             icon: Smartphone    },
  { key: 'enableReservations',  label: 'Reservations',    description: 'Table booking & guest management',          icon: CalendarCheck },
  { key: 'enableQROrdering',    label: 'QR Ordering',     description: 'Guests scan QR to order from their phone',  icon: QrCode        },
  { key: 'enableInventory',     label: 'Inventory',       description: 'Track stock levels, set reorder alerts',    icon: Package       },
  { key: 'enableCRM',           label: 'CRM',             description: 'Customer profiles, loyalty & visit history', icon: Users        },
  { key: 'enableOnlineOrdering', label: 'Online Orders',  description: 'Own website ordering portal',               icon: Globe         },
  { key: 'enableDelivery',      label: 'Delivery',        description: 'Own delivery fleet management',             icon: Truck         },
]

// ─── Wizard step definitions ──────────────────────────────────────────────────

type WizardStepKey =
  | 'outletTypeDone' | 'featuresDone' | 'brandingDone' | 'restaurantProfileDone'
  | 'tablesDone' | 'menuDone' | 'staffDone' | 'paymentSetupDone' | 'devicesDone'

interface WizardStep {
  key: WizardStepKey
  label: string
  icon: React.ElementType
  skippable: boolean
  // If provided: step is excluded when function returns false
  conditional?: (f: FeatureFlags) => boolean
}

const ALL_STEPS: WizardStep[] = [
  { key: 'outletTypeDone',        label: 'Outlet Type',   icon: Store,          skippable: false },
  { key: 'featuresDone',          label: 'Features',      icon: Sparkles,       skippable: false },
  { key: 'brandingDone',          label: 'Branding',      icon: Image,          skippable: false },
  { key: 'restaurantProfileDone', label: 'Legal Details', icon: Shield,         skippable: true  },
  { key: 'tablesDone',            label: 'Floor Plan',    icon: LayoutGrid,     skippable: true,  conditional: (f) => f.enableFloorPlan },
  { key: 'menuDone',              label: 'Menu',          icon: UtensilsCrossed, skippable: true  },
  { key: 'staffDone',             label: 'Staff',         icon: Users,          skippable: true  },
  { key: 'paymentSetupDone',      label: 'Payments',      icon: CreditCard,     skippable: true  },
  { key: 'devicesDone',           label: 'Devices',       icon: Printer,        skippable: true  },
]

function getActiveSteps(flags: FeatureFlags): WizardStep[] {
  return ALL_STEPS.filter((s) => !s.conditional || s.conditional(flags))
}

function getFirstIncompleteIndex(steps: WizardStep[], done: StepDoneFlags): number {
  const skipped = done.skippedSteps ?? []
  for (let i = 0; i < steps.length; i++) {
    const step = steps[i]
    if (!step) continue
    if (!done[step.key] && !skipped.includes(step.key)) return i
  }
  return steps.length - 1
}

// ─── Default state ────────────────────────────────────────────────────────────

const DEFAULT_FEATURES: FeatureFlags = {
  enableFloorPlan: true, enableKDS: true, enableCaptainApp: true,
  enableReservations: false, enableQROrdering: false, enableInventory: true,
  enableCRM: false, enableOnlineOrdering: false, enableDelivery: false,
}

const DEFAULT_BRANDING = { name: '', logoUrl: '' }
const DEFAULT_LEGAL = {
  gstin: '', fssaiLicense: '', panNumber: '',
  addressLine1: '', city: '', state: '', pincode: '',
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function OnboardingPage() {
  const router = useRouter()

  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [currentIndex, setCurrentIndex] = useState(0)
  const [activeSteps, setActiveSteps] = useState<WizardStep[]>(getActiveSteps(DEFAULT_FEATURES))

  // Form state per step
  const [selectedOutletType, setSelectedOutletType] = useState<RestaurantType | null>(null)
  const [features, setFeatures] = useState<FeatureFlags>(DEFAULT_FEATURES)
  const [brandingForm, setBrandingForm] = useState(DEFAULT_BRANDING)
  const [legalForm, setLegalForm] = useState(DEFAULT_LEGAL)

  // ── Load initial state on mount ─────────────────────────────────────────────

  useEffect(() => {
    async function init() {
      try {
        const [stepsData, settingsData] = await Promise.all([
          apiClient.get<StepDoneFlags>('/api/v1/onboarding'),
          apiClient.get<SettingsApiResponse>('/api/v1/settings'),
        ])

        // Restore saved features
        const s = settingsData.settings
        const resolvedFeatures: FeatureFlags = s ? {
          enableFloorPlan:      s.enableFloorPlan      ?? DEFAULT_FEATURES.enableFloorPlan,
          enableKDS:            s.enableKDS            ?? DEFAULT_FEATURES.enableKDS,
          enableCaptainApp:     s.enableCaptainApp     ?? DEFAULT_FEATURES.enableCaptainApp,
          enableReservations:   s.enableReservations   ?? DEFAULT_FEATURES.enableReservations,
          enableQROrdering:     s.enableQROrdering     ?? DEFAULT_FEATURES.enableQROrdering,
          enableInventory:      s.enableInventory      ?? DEFAULT_FEATURES.enableInventory,
          enableCRM:            s.enableCRM            ?? DEFAULT_FEATURES.enableCRM,
          enableOnlineOrdering: s.enableOnlineOrdering ?? DEFAULT_FEATURES.enableOnlineOrdering,
          enableDelivery:       s.enableDelivery       ?? DEFAULT_FEATURES.enableDelivery,
        } : DEFAULT_FEATURES

        setFeatures(resolvedFeatures)

        if (settingsData.tenant.type) {
          setSelectedOutletType(settingsData.tenant.type as RestaurantType)
        }

        setBrandingForm({
          name:    settingsData.tenant.name    ?? '',
          logoUrl: settingsData.tenant.logoUrl ?? '',
        })

        setLegalForm({
          gstin:        settingsData.tenant.gstin        ?? '',
          fssaiLicense: settingsData.tenant.fssaiLicense ?? '',
          panNumber:    settingsData.tenant.panNumber    ?? '',
          addressLine1: settingsData.tenant.addressLine1 ?? '',
          city:         settingsData.tenant.city         ?? '',
          state:        settingsData.tenant.state        ?? '',
          pincode:      settingsData.tenant.pincode      ?? '',
        })

        const steps = getActiveSteps(resolvedFeatures)
        setActiveSteps(steps)
        setCurrentIndex(getFirstIncompleteIndex(steps, stepsData))
      } catch {
        toast.error('Failed to load setup data. Please refresh the page.')
      } finally {
        setIsLoading(false)
      }
    }
    init()
  }, [])

  // ── Helpers ─────────────────────────────────────────────────────────────────

  // currentIndex is always kept in-bounds by goBack/goForward/setCurrentIndex
  // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
  const currentStep = activeSteps[currentIndex]!
  const isLastStep = currentIndex === activeSteps.length - 1
  const progressPct = Math.round(((currentIndex) / activeSteps.length) * 100)

  function goBack() {
    setCurrentIndex((i) => Math.max(i - 1, 0))
  }

  function goForward(steps = activeSteps) {
    setCurrentIndex((i) => Math.min(i + 1, steps.length - 1))
  }

  async function markStepDone(key: WizardStepKey, extra?: Record<string, boolean>) {
    await apiClient.patch('/api/v1/onboarding', { [key]: true, ...extra })
  }

  async function finishWizard() {
    try {
      await refreshAuthToken()
    } catch {
      // Non-fatal — the user is complete, navigate regardless
    }
    router.replace('/dashboard')
  }

  async function handleSkip() {
    if (!currentStep?.skippable) return
    setIsSaving(true)
    try {
      await apiClient.post('/api/v1/onboarding/skip', { step: currentStep.key })
      if (isLastStep) {
        await finishWizard()
      } else {
        goForward()
      }
    } catch {
      toast.error('Failed to skip. Please try again.')
    } finally {
      setIsSaving(false)
    }
  }

  // ── Per-step save handlers ───────────────────────────────────────────────────

  async function handleOutletTypeNext() {
    if (!selectedOutletType) {
      toast.error('Please select your outlet type to continue.')
      return
    }
    setIsSaving(true)
    try {
      await apiClient.patch('/api/v1/settings/tenant', { type: selectedOutletType })
      setFeatures(OUTLET_DEFAULTS[selectedOutletType])
      await markStepDone('outletTypeDone')
      goForward()
    } catch {
      toast.error('Failed to save outlet type. Please try again.')
    } finally {
      setIsSaving(false)
    }
  }

  async function handleFeaturesNext() {
    setIsSaving(true)
    try {
      await apiClient.patch('/api/v1/settings', features)

      const newSteps = getActiveSteps(features)
      setActiveSteps(newSteps)

      // Auto-mark tablesDone when floor plan is disabled so it doesn't block completion
      const extra: Record<string, boolean> | undefined =
        !features.enableFloorPlan ? { tablesDone: true } : undefined
      await markStepDone('featuresDone', extra)

      setCurrentIndex((i) => Math.min(i + 1, newSteps.length - 1))
    } catch {
      toast.error('Failed to save features. Please try again.')
    } finally {
      setIsSaving(false)
    }
  }

  async function handleBrandingNext() {
    if (!brandingForm.name.trim()) {
      toast.error('Restaurant name is required.')
      return
    }
    setIsSaving(true)
    try {
      await apiClient.patch('/api/v1/settings/tenant', {
        name:    brandingForm.name.trim(),
        logoUrl: brandingForm.logoUrl || null,
      })
      await markStepDone('brandingDone')
      goForward()
    } catch {
      toast.error('Failed to save branding. Please try again.')
    } finally {
      setIsSaving(false)
    }
  }

  async function handleLegalNext() {
    setIsSaving(true)
    try {
      const update: Record<string, string | null> = {}
      if (legalForm.gstin.trim())        update.gstin        = legalForm.gstin.trim()
      if (legalForm.fssaiLicense.trim()) update.fssaiLicense = legalForm.fssaiLicense.trim()
      if (legalForm.panNumber.trim())    update.panNumber    = legalForm.panNumber.trim()
      if (legalForm.addressLine1.trim()) update.addressLine1 = legalForm.addressLine1.trim()
      if (legalForm.city.trim())         update.city         = legalForm.city.trim()
      if (legalForm.state.trim())        update.state        = legalForm.state.trim()
      if (legalForm.pincode.trim())      update.pincode      = legalForm.pincode.trim()

      if (Object.keys(update).length > 0) {
        await apiClient.patch('/api/v1/settings/tenant', update)
      }
      await markStepDone('restaurantProfileDone')
      goForward()
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Failed to save legal details.'
      toast.error(msg)
    } finally {
      setIsSaving(false)
    }
  }

  async function handlePlaceholderNext() {
    setIsSaving(true)
    try {
      await markStepDone(currentStep.key)
      if (isLastStep) {
        await finishWizard()
      } else {
        goForward()
      }
    } catch {
      toast.error('Failed to save. Please try again.')
    } finally {
      setIsSaving(false)
    }
  }

  function getNextHandler(): () => void {
    switch (currentStep?.key) {
      case 'outletTypeDone':        return handleOutletTypeNext
      case 'featuresDone':          return handleFeaturesNext
      case 'brandingDone':          return handleBrandingNext
      case 'restaurantProfileDone': return handleLegalNext
      default:                      return handlePlaceholderNext
    }
  }

  // ── Loading screen ──────────────────────────────────────────────────────────

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Spinner size="xl" className="text-primary-500" />
      </div>
    )
  }

  // ── Layout ──────────────────────────────────────────────────────────────────

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Top header */}
      <header className="border-b border-border bg-background-card/60 backdrop-blur-sm px-6 h-14 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-2.5">
          <div className="w-7 h-7 rounded-lg bg-primary-500 flex items-center justify-center">
            <Store className="w-4 h-4 text-white" />
          </div>
          <span className="font-bold text-foreground text-sm">Atlas POS</span>
          <span className="hidden sm:inline text-muted-foreground text-sm">— Setup Wizard</span>
        </div>
        <span className="text-xs text-muted-foreground">
          {currentIndex + 1} / {activeSteps.length}
        </span>
      </header>

      {/* Progress bar */}
      <div className="h-0.5 bg-border">
        <div
          className="h-full bg-primary-500 transition-all duration-500 ease-out"
          style={{ width: `${progressPct + Math.round(100 / activeSteps.length)}%` }}
        />
      </div>

      {/* Body */}
      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar — desktop */}
        <aside className="hidden lg:flex flex-col w-52 border-r border-border px-3 py-6 gap-0.5 shrink-0 overflow-y-auto">
          {activeSteps.map((step, i) => {
            const Icon = step.icon
            const isDone   = i < currentIndex
            const isActive = i === currentIndex
            return (
              <div
                key={step.key}
                className={cn(
                  'flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm select-none',
                  isActive && 'bg-primary-500/10 text-primary-500 font-medium',
                  isDone   && 'text-muted-foreground',
                  !isActive && !isDone && 'text-muted-foreground',
                )}
              >
                <span className={cn(
                  'w-5 h-5 rounded-full flex items-center justify-center shrink-0 text-[10px] font-bold',
                  isDone   && 'bg-success/15 text-success',
                  isActive && 'bg-primary-500 text-white',
                  !isDone && !isActive && 'bg-border text-muted-foreground',
                )}>
                  {isDone ? <Check className="w-2.5 h-2.5" /> : i + 1}
                </span>
                <span className="truncate">{step.label}</span>
              </div>
            )
          })}
        </aside>

        {/* Step content area */}
        <main className="flex-1 overflow-y-auto">
          <div className="max-w-2xl mx-auto px-4 sm:px-6 py-8 pb-24">
            {/* Step content — key change re-triggers animate-fade-in */}
            <div key={currentStep?.key} className="animate-fade-in">
              {currentStep?.key === 'outletTypeDone' && (
                <OutletTypeStep
                  selected={selectedOutletType}
                  onSelect={setSelectedOutletType}
                />
              )}
              {currentStep?.key === 'featuresDone' && (
                <FeaturesStep
                  features={features}
                  onChange={setFeatures}
                  outletType={selectedOutletType}
                />
              )}
              {currentStep?.key === 'brandingDone' && (
                <BrandingStep
                  form={brandingForm}
                  onChange={setBrandingForm}
                />
              )}
              {currentStep?.key === 'restaurantProfileDone' && (
                <LegalStep
                  form={legalForm}
                  onChange={setLegalForm}
                />
              )}
              {currentStep?.key === 'tablesDone'       && <TablesStep />}
              {currentStep?.key === 'menuDone'          && <MenuStep />}
              {currentStep?.key === 'staffDone'         && <StaffStep />}
              {currentStep?.key === 'paymentSetupDone'  && <PaymentsStep />}
              {currentStep?.key === 'devicesDone'       && <DevicesStep />}
            </div>
          </div>

          {/* Sticky navigation bar */}
          <div className="fixed bottom-0 left-0 right-0 lg:left-52 border-t border-border bg-background/95 backdrop-blur-sm px-4 sm:px-6 py-3 flex items-center justify-between">
            <Button
              variant="outline"
              size="sm"
              onClick={goBack}
              disabled={currentIndex === 0 || isSaving}
            >
              <ChevronLeft className="w-4 h-4" />
              Back
            </Button>

            <div className="flex items-center gap-2">
              {currentStep?.skippable && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleSkip}
                  disabled={isSaving}
                >
                  Skip for now
                </Button>
              )}

              <Button
                size="sm"
                onClick={getNextHandler()}
                disabled={isSaving}
              >
                {isSaving ? (
                  <Spinner size="sm" className="text-white" />
                ) : isLastStep ? (
                  <>Complete Setup <ArrowRight className="w-3.5 h-3.5" /></>
                ) : (
                  <>Continue <ChevronRight className="w-3.5 h-3.5" /></>
                )}
              </Button>
            </div>
          </div>
        </main>
      </div>
    </div>
  )
}

// ─── Step header ──────────────────────────────────────────────────────────────

function StepHeader({ title, subtitle }: { title: string; subtitle: string }) {
  return (
    <div className="mb-7">
      <h1 className="text-xl font-bold text-foreground mb-1">{title}</h1>
      <p className="text-sm text-muted-foreground leading-relaxed">{subtitle}</p>
    </div>
  )
}

// ─── Outlet Type Step ─────────────────────────────────────────────────────────

function OutletTypeStep({
  selected,
  onSelect,
}: {
  selected: RestaurantType | null
  onSelect: (t: RestaurantType) => void
}) {
  return (
    <div>
      <StepHeader
        title="What type of outlet are you setting up?"
        subtitle="This lets us apply the right defaults and show only features relevant to your business."
      />
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
        {OUTLET_TYPES.map((ot) => {
          const Icon = ot.icon
          const isSelected = selected === ot.value
          return (
            <button
              key={ot.value}
              onClick={() => onSelect(ot.value)}
              className={cn(
                'relative flex flex-col items-start gap-2.5 p-4 rounded-xl border transition-all duration-150 text-left',
                isSelected
                  ? 'border-primary-500 bg-primary-500/10 shadow-[0_0_0_1px_#FF6B35]'
                  : 'border-border bg-background-card hover:border-primary-500/30 hover:bg-background-hover',
              )}
            >
              {isSelected && (
                <span className="absolute top-2.5 right-2.5 w-4 h-4 rounded-full bg-primary-500 flex items-center justify-center">
                  <Check className="w-2.5 h-2.5 text-white" />
                </span>
              )}
              <div className={cn(
                'w-9 h-9 rounded-lg flex items-center justify-center shrink-0',
                isSelected ? 'bg-primary-500 text-white' : 'bg-background-hover text-muted-foreground',
              )}>
                <Icon className="w-5 h-5" />
              </div>
              <div>
                <p className={cn('text-sm font-semibold leading-tight', isSelected ? 'text-primary-500' : 'text-foreground')}>
                  {ot.label}
                </p>
                <p className="text-xs text-muted-foreground mt-0.5 leading-snug">{ot.description}</p>
              </div>
            </button>
          )
        })}
      </div>
    </div>
  )
}

// ─── Features Step ────────────────────────────────────────────────────────────

function FeaturesStep({
  features,
  onChange,
  outletType,
}: {
  features: FeatureFlags
  onChange: (f: FeatureFlags) => void
  outletType: RestaurantType | null
}) {
  const outletLabel = outletType ? OUTLET_TYPES.find((t) => t.value === outletType)?.label : null

  function toggle(key: keyof FeatureFlags) {
    onChange({ ...features, [key]: !features[key] })
  }

  return (
    <div>
      <StepHeader
        title="Which features do you need?"
        subtitle={
          outletLabel
            ? `Smart defaults applied for ${outletLabel}. Toggle any feature on or off — you can always change this later in Settings.`
            : 'Choose the features you want to enable. You can always change these in Settings.'
        }
      />
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {FEATURES.map((feat) => {
          const Icon = feat.icon
          const enabled = features[feat.key]
          return (
            <button
              key={feat.key}
              onClick={() => toggle(feat.key)}
              className={cn(
                'flex items-center gap-3.5 p-4 rounded-xl border transition-all duration-150 text-left',
                enabled
                  ? 'border-primary-500 bg-primary-500/10'
                  : 'border-border bg-background-card hover:border-border/70',
              )}
            >
              <div className={cn(
                'w-9 h-9 rounded-lg flex items-center justify-center shrink-0',
                enabled ? 'bg-primary-500 text-white' : 'bg-background-hover text-muted-foreground',
              )}>
                <Icon className="w-4.5 h-4.5" />
              </div>
              <div className="flex-1 min-w-0">
                <p className={cn('text-sm font-semibold', enabled ? 'text-primary-500' : 'text-foreground')}>
                  {feat.label}
                </p>
                <p className="text-xs text-muted-foreground mt-0.5 leading-snug">{feat.description}</p>
              </div>
              <div className={cn(
                'w-5 h-5 rounded-full border-2 shrink-0 flex items-center justify-center transition-colors',
                enabled ? 'border-primary-500 bg-primary-500' : 'border-border bg-transparent',
              )}>
                {enabled && <Check className="w-3 h-3 text-white" />}
              </div>
            </button>
          )
        })}
      </div>
    </div>
  )
}

// ─── Branding Step ────────────────────────────────────────────────────────────

function BrandingStep({
  form,
  onChange,
}: {
  form: { name: string; logoUrl: string }
  onChange: (f: { name: string; logoUrl: string }) => void
}) {
  return (
    <div>
      <StepHeader
        title="Brand your restaurant"
        subtitle="Your name and logo appear on customer bills, receipts, and the QR menu."
      />
      <div className="space-y-5">
        <div>
          <Label htmlFor="brand-name">
            Restaurant Name <span className="text-danger text-xs">*</span>
          </Label>
          <Input
            id="brand-name"
            placeholder="e.g. Spice Garden"
            value={form.name}
            onChange={(e) => onChange({ ...form, name: e.target.value })}
            className="mt-1.5"
            maxLength={200}
            autoFocus
          />
        </div>

        <div>
          <Label htmlFor="brand-logo">
            Logo URL <span className="text-muted-foreground text-xs">(optional)</span>
          </Label>
          <Input
            id="brand-logo"
            placeholder="https://yoursite.com/logo.png"
            value={form.logoUrl}
            onChange={(e) => onChange({ ...form, logoUrl: e.target.value })}
            className="mt-1.5"
          />
          <p className="text-xs text-muted-foreground mt-1">
            Paste a hosted image URL. Square format, min 128×128 px recommended.
          </p>
        </div>

        {form.logoUrl && (
          <div className="flex items-center gap-3 p-3 rounded-xl bg-background-card border border-border">
            <img
              src={form.logoUrl}
              alt="Logo preview"
              className="w-12 h-12 rounded-lg object-cover bg-background-hover"
              onError={(e) => { (e.target as HTMLImageElement).style.opacity = '0.3' }}
            />
            <div>
              <p className="text-sm font-medium text-foreground">{form.name || 'Your Restaurant'}</p>
              <p className="text-xs text-muted-foreground">Logo preview</p>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

// ─── Legal Step ───────────────────────────────────────────────────────────────

function LegalStep({
  form,
  onChange,
}: {
  form: {
    gstin: string; fssaiLicense: string; panNumber: string
    addressLine1: string; city: string; state: string; pincode: string
  }
  onChange: (f: typeof form) => void
}) {
  function field(
    key: keyof typeof form,
    label: string,
    placeholder: string,
    hint?: string,
  ) {
    return (
      <div key={key}>
        <Label htmlFor={`legal-${key}`}>{label}</Label>
        <Input
          id={`legal-${key}`}
          placeholder={placeholder}
          value={form[key]}
          onChange={(e) => onChange({ ...form, [key]: e.target.value })}
          className="mt-1.5"
        />
        {hint && <p className="text-xs text-muted-foreground mt-1">{hint}</p>}
      </div>
    )
  }

  return (
    <div>
      <StepHeader
        title="Legal & address details"
        subtitle="Required for GST-compliant invoices. All fields are optional — you can fill these in later from Settings."
      />
      <div className="space-y-5">
        {field('gstin',        'GSTIN',                '22AAAAA0000A1Z5',    '15-character GST Identification Number')}
        {field('fssaiLicense', 'FSSAI Licence Number', '12345678901234',     '14-digit Food Safety & Standards licence')}
        {field('panNumber',    'PAN Number',           'AAAAA0000A',         '10-character Permanent Account Number')}

        <div className="pt-3 border-t border-border">
          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-4">
            Registered Address
          </p>
          <div className="space-y-4">
            {field('addressLine1', 'Street Address', 'Shop 12, MG Road')}
            <div className="grid grid-cols-2 gap-4">
              {field('city',   'City',  'Ahmedabad')}
              {field('state',  'State', 'Gujarat')}
            </div>
            {field('pincode', 'Pincode', '380001')}
          </div>
        </div>
      </div>
    </div>
  )
}

// ─── Tables Step ──────────────────────────────────────────────────────────────

function TablesStep() {
  return (
    <div>
      <StepHeader
        title="Set up your floor plan"
        subtitle="Add sections, tables, and capacity. Full configuration is in Settings → Floor Plan."
      />
      <div className="rounded-xl border border-border bg-background-card p-8 flex flex-col items-center text-center gap-4">
        <div className="w-14 h-14 rounded-2xl bg-primary-500/10 flex items-center justify-center">
          <LayoutGrid className="w-7 h-7 text-primary-500" />
        </div>
        <div>
          <p className="text-sm font-medium text-foreground mb-1">Floor plan setup is available after onboarding</p>
          <p className="text-sm text-muted-foreground">
            Click <strong>Continue</strong> to finish setup. You&apos;ll be able to configure tables, sections, and seating capacity from the Floor Plan page.
          </p>
        </div>
      </div>
    </div>
  )
}

// ─── Menu Step ────────────────────────────────────────────────────────────────

function MenuStep() {
  return (
    <div>
      <StepHeader
        title="Set up your menu"
        subtitle="Add categories and items. You can add a full menu right after completing setup."
      />
      <div className="rounded-xl border border-border bg-background-card p-8 flex flex-col items-center text-center gap-4">
        <div className="w-14 h-14 rounded-2xl bg-primary-500/10 flex items-center justify-center">
          <UtensilsCrossed className="w-7 h-7 text-primary-500" />
        </div>
        <div>
          <p className="text-sm font-medium text-foreground mb-1">Menu is managed in Menu Management</p>
          <p className="text-sm text-muted-foreground">
            Click <strong>Continue</strong> to finish setup. You&apos;ll be redirected to Menu Management where you can add categories, items, variants, and modifiers.
          </p>
        </div>
      </div>
    </div>
  )
}

// ─── Staff Step ───────────────────────────────────────────────────────────────

function StaffStep() {
  return (
    <div>
      <StepHeader
        title="Add your team"
        subtitle="Invite managers, cashiers, waiters, and kitchen staff. Each role has custom access permissions."
      />
      <div className="rounded-xl border border-border bg-background-card p-8 flex flex-col items-center text-center gap-4">
        <div className="w-14 h-14 rounded-2xl bg-primary-500/10 flex items-center justify-center">
          <Users className="w-7 h-7 text-primary-500" />
        </div>
        <div>
          <p className="text-sm font-medium text-foreground mb-1">Staff management is in the Staff section</p>
          <p className="text-sm text-muted-foreground">
            Click <strong>Continue</strong> to finish setup. Add team members, assign roles, and set PINs for quick login right after.
          </p>
        </div>
      </div>
    </div>
  )
}

// ─── Payments Step ────────────────────────────────────────────────────────────

function PaymentsStep() {
  return (
    <div>
      <StepHeader
        title="Payment methods"
        subtitle="Configure which payment methods you accept. Cash, Card, and UPI are enabled by default."
      />
      <div className="rounded-xl border border-border bg-background-card p-8 flex flex-col items-center text-center gap-4">
        <div className="w-14 h-14 rounded-2xl bg-primary-500/10 flex items-center justify-center">
          <CreditCard className="w-7 h-7 text-primary-500" />
        </div>
        <div>
          <p className="text-sm font-medium text-foreground mb-1">Detailed payment config is in Settings → Payments</p>
          <p className="text-sm text-muted-foreground">
            Click <strong>Continue</strong> to finish. You can configure service charges, GST rates, and enable additional payment providers after setup.
          </p>
        </div>
      </div>
    </div>
  )
}

// ─── Devices Step ─────────────────────────────────────────────────────────────

function DevicesStep() {
  return (
    <div>
      <StepHeader
        title="Register your devices"
        subtitle="Connect POS terminals, KDS screens, and printers. Each device gets a unique token for secure real-time sync."
      />
      <div className="rounded-xl border border-border bg-background-card p-8 flex flex-col items-center text-center gap-4">
        <div className="w-14 h-14 rounded-2xl bg-primary-500/10 flex items-center justify-center">
          <Printer className="w-7 h-7 text-primary-500" />
        </div>
        <div>
          <p className="text-sm font-medium text-foreground mb-1">Device registration is in Settings → Devices</p>
          <p className="text-sm text-muted-foreground">
            Click <strong>Complete Setup</strong> to launch your restaurant on Atlas. You can add and configure devices from the Devices section immediately after.
          </p>
        </div>
      </div>
    </div>
  )
}
