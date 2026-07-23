'use client'

import Link from 'next/link'
import { useEffect, useRef, useState } from 'react'
import {
  Menu,
  X,
  ChevronDown,
  Calculator,
  Package,
  Globe,
  BarChart3,
  ClipboardList,
  Heart,
  Plug,
  UtensilsCrossed,
  Zap,
  Coffee,
  ChefHat,
  Cookie,
  Store,
  Beer,
  Building2,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { Logo } from './logo'
import { NavDropdown, type NavDropdownItem } from './nav-dropdown'

const FEATURE_ITEMS: NavDropdownItem[] = [
  { icon: Calculator, label: 'Billing & POS', href: '/features/billing' },
  { icon: Package, label: 'Inventory', href: '/features/inventory' },
  { icon: Globe, label: 'Online Ordering', href: '/features/online-ordering' },
  { icon: BarChart3, label: 'Reports & Analytics', href: '/features/reports' },
  { icon: ClipboardList, label: 'Menu Management', href: '/features/menu' },
  { icon: Heart, label: 'CRM & Loyalty', href: '/features/crm' },
  { icon: Plug, label: 'Integrations', href: '/#solutions' },
]

const OUTLET_ITEMS: NavDropdownItem[] = [
  { icon: UtensilsCrossed, label: 'Fine Dining', href: '/#outlet-types' },
  { icon: Zap, label: 'QSR', href: '/#outlet-types' },
  { icon: Coffee, label: 'Café', href: '/#outlet-types' },
  { icon: ChefHat, label: 'Cloud Kitchen', href: '/#outlet-types' },
  { icon: Cookie, label: 'Bakery & Sweet Shop', href: '/#outlet-types' },
  { icon: Store, label: 'Food Court', href: '/#outlet-types' },
  { icon: Beer, label: 'Bar & Brewery', href: '/#outlet-types' },
  { icon: Building2, label: 'Franchise & Chains', href: '/#outlet-types' },
]

export function Navbar() {
  const [scrolled, setScrolled] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)
  const [openMenu, setOpenMenu] = useState<'features' | 'outlets' | null>(null)
  const [mobileGroup, setMobileGroup] = useState<'features' | 'outlets' | null>(null)
  const navRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8)
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  useEffect(() => {
    document.body.style.overflow = mobileOpen ? 'hidden' : ''
    return () => {
      document.body.style.overflow = ''
    }
  }, [mobileOpen])

  useEffect(() => {
    function onOutsideClick(e: MouseEvent) {
      if (navRef.current && !navRef.current.contains(e.target as Node)) {
        setOpenMenu(null)
      }
    }
    document.addEventListener('click', onOutsideClick)
    return () => document.removeEventListener('click', onOutsideClick)
  }, [])

  return (
    <header
      className={cn(
        'sticky top-0 z-50 w-full transition-shadow duration-300',
        scrolled ? 'bg-white/85 shadow-soft backdrop-blur-md' : 'bg-white/0'
      )}
    >
      <nav ref={navRef} className="container flex h-16 items-center justify-between sm:h-20">
        <Link href="/" className="flex items-center gap-2">
          <Logo />
        </Link>

        <div className="hidden items-center gap-7 lg:flex">
          <NavDropdown
            label="Features"
            items={FEATURE_ITEMS}
            columns={1}
            open={openMenu === 'features'}
            onToggle={() => setOpenMenu(openMenu === 'features' ? null : 'features')}
            onClose={() => setOpenMenu(null)}
          />
          <NavDropdown
            label="Outlet Types"
            items={OUTLET_ITEMS}
            columns={2}
            open={openMenu === 'outlets'}
            onToggle={() => setOpenMenu(openMenu === 'outlets' ? null : 'outlets')}
            onClose={() => setOpenMenu(null)}
          />
          <a href="/#pricing" className="text-sm font-medium text-ink-600 transition-colors hover:text-ink">
            Pricing
          </a>
          <a href="/help-center" className="text-sm font-medium text-ink-600 transition-colors hover:text-ink">
            Resources
          </a>
        </div>

        <div className="hidden items-center gap-3 lg:flex">
          <a
            href="/contact"
            className="rounded-lg border border-ink-200 px-4 py-2 text-sm font-semibold text-ink transition-colors hover:border-ink-300 hover:bg-ink-50"
          >
            Book a Demo
          </a>
          <a
            href="/#pricing"
            className="rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-white shadow-soft transition-colors hover:bg-primary-600"
          >
            Start Free Trial
          </a>
        </div>

        <button
          type="button"
          aria-label={mobileOpen ? 'Close menu' : 'Open menu'}
          onClick={() => setMobileOpen((v) => !v)}
          className="grid h-10 w-10 place-items-center rounded-lg text-ink lg:hidden"
        >
          {mobileOpen ? <X size={22} /> : <Menu size={22} />}
        </button>
      </nav>

      {mobileOpen && (
        <div className="max-h-[calc(100dvh-4rem)] overflow-y-auto border-t border-ink-100 bg-white px-5 pb-6 pt-2 lg:hidden">
          <div className="flex flex-col gap-1">
            <button
              type="button"
              onClick={() => setMobileGroup(mobileGroup === 'features' ? null : 'features')}
              className="flex items-center justify-between rounded-lg px-3 py-3 text-base font-medium text-ink-600"
            >
              Features
              <ChevronDown size={16} className={cn('transition-transform', mobileGroup === 'features' && 'rotate-180')} />
            </button>
            {mobileGroup === 'features' && (
              <div className="mb-1 grid gap-1 pl-3">
                {FEATURE_ITEMS.map((item) => (
                  <a
                    key={item.label}
                    href={item.href}
                    onClick={() => setMobileOpen(false)}
                    className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm text-ink-600 hover:bg-ink-50"
                  >
                    <item.icon size={15} className="text-primary" />
                    {item.label}
                  </a>
                ))}
              </div>
            )}

            <button
              type="button"
              onClick={() => setMobileGroup(mobileGroup === 'outlets' ? null : 'outlets')}
              className="flex items-center justify-between rounded-lg px-3 py-3 text-base font-medium text-ink-600"
            >
              Outlet Types
              <ChevronDown size={16} className={cn('transition-transform', mobileGroup === 'outlets' && 'rotate-180')} />
            </button>
            {mobileGroup === 'outlets' && (
              <div className="mb-1 grid grid-cols-2 gap-1 pl-3">
                {OUTLET_ITEMS.map((item) => (
                  <a
                    key={item.label}
                    href={item.href}
                    onClick={() => setMobileOpen(false)}
                    className="flex items-center gap-2.5 rounded-lg px-2.5 py-2.5 text-sm text-ink-600 hover:bg-ink-50"
                  >
                    <item.icon size={15} className="shrink-0 text-primary" />
                    {item.label}
                  </a>
                ))}
              </div>
            )}

            <a
              href="/#pricing"
              onClick={() => setMobileOpen(false)}
              className="rounded-lg px-3 py-3 text-base font-medium text-ink-600 hover:bg-ink-50 hover:text-ink"
            >
              Pricing
            </a>
            <a
              href="/help-center"
              onClick={() => setMobileOpen(false)}
              className="rounded-lg px-3 py-3 text-base font-medium text-ink-600 hover:bg-ink-50 hover:text-ink"
            >
              Resources
            </a>
          </div>
          <div className="mt-4 flex flex-col gap-3">
            <a
              href="/contact"
              onClick={() => setMobileOpen(false)}
              className="rounded-lg border border-ink-200 px-4 py-3 text-center text-sm font-semibold text-ink"
            >
              Book a Demo
            </a>
            <a
              href="/#pricing"
              onClick={() => setMobileOpen(false)}
              className="rounded-lg bg-primary px-4 py-3 text-center text-sm font-semibold text-white"
            >
              Start Free Trial
            </a>
          </div>
        </div>
      )}
    </header>
  )
}
