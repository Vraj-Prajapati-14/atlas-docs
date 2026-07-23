import { Instagram, Linkedin, Twitter, Facebook } from 'lucide-react'
import { Logo } from './logo'
import { NewsletterForm } from './newsletter-form'

const COLUMNS = [
  {
    title: 'Product',
    links: [
      { label: 'Billing & POS', href: '/features/billing' },
      { label: 'Inventory', href: '/features/inventory' },
      { label: 'Online Ordering', href: '/features/online-ordering' },
      { label: 'Reports & Analytics', href: '/features/reports' },
      { label: 'Menu Management', href: '/features/menu' },
      { label: 'CRM & Loyalty', href: '/features/crm' },
      { label: 'Pricing', href: '/#pricing' },
    ],
  },
  {
    title: 'Outlet Types',
    links: [
      { label: 'Fine Dining', href: '/#outlet-types' },
      { label: 'QSR', href: '/#outlet-types' },
      { label: 'Café', href: '/#outlet-types' },
      { label: 'Cloud Kitchen', href: '/#outlet-types' },
      { label: 'Bakery & Sweet Shop', href: '/#outlet-types' },
      { label: 'Franchise & Chains', href: '/#outlet-types' },
    ],
  },
  {
    title: 'Resources',
    links: [
      { label: 'FAQ', href: '/#faq' },
      { label: 'Help Center', href: '/help-center' },
      { label: 'Guides', href: '/guides' },
      { label: 'Blog', href: '/blog' },
    ],
  },
  {
    title: 'Company',
    links: [
      { label: 'About Us', href: '/about' },
      { label: 'Careers', href: '/careers' },
      { label: 'Contact Us', href: '/contact' },
      { label: 'Privacy Policy', href: '/privacy-policy' },
      { label: 'Terms of Service', href: '/terms' },
    ],
  },
]

export function Footer() {
  return (
    <footer className="bg-ink-900 pt-16 text-ink-300">
      <div className="container">
        <div className="grid grid-cols-2 gap-10 pb-12 sm:grid-cols-3 lg:grid-cols-6">
          <div className="col-span-2 lg:col-span-2">
            <Logo dark />
            <p className="mt-4 max-w-xs text-sm text-ink-400">
              India&apos;s AI-native restaurant operating system — billing,
              kitchen, inventory, staff, customers, and AI in one platform.
            </p>
            <div className="mt-5 flex gap-3">
              {[Facebook, Instagram, Twitter, Linkedin].map((Icon, i) => (
                <a
                  key={i}
                  href="#"
                  aria-label="Social link"
                  className="grid h-9 w-9 place-items-center rounded-lg bg-white/5 text-ink-300 transition-colors hover:bg-white/10 hover:text-white"
                >
                  <Icon size={16} />
                </a>
              ))}
            </div>
          </div>

          {COLUMNS.map((col) => (
            <div key={col.title}>
              <p className="text-sm font-semibold text-white">{col.title}</p>
              <ul className="mt-4 space-y-3">
                {col.links.map((link) => (
                  <li key={link.label}>
                    <a href={link.href} className="text-sm text-ink-400 hover:text-white">
                      {link.label}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}

          <div className="col-span-2 sm:col-span-3 lg:col-span-1">
            <p className="text-sm font-semibold text-white">Stay Updated</p>
            <p className="mt-4 text-sm text-ink-400">Product updates, no spam.</p>
            <div className="mt-3">
              <NewsletterForm />
            </div>
          </div>
        </div>

        <div className="flex flex-col items-center justify-between gap-4 border-t border-white/10 py-6 text-xs text-ink-500 sm:flex-row">
          <p>© {new Date().getFullYear()} Atlas. All rights reserved.</p>
          <div className="flex gap-5">
            <a href="/terms" className="hover:text-white">Terms of Service</a>
            <a href="/privacy-policy" className="hover:text-white">Privacy Policy</a>
          </div>
        </div>
      </div>
    </footer>
  )
}
