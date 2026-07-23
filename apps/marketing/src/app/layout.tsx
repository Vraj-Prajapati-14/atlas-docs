import type { Metadata, Viewport } from 'next'
import { Inter, JetBrains_Mono } from 'next/font/google'
import { Navbar } from '@/components/marketing/navbar'
import { Footer } from '@/components/marketing/footer'
import { CookieConsent } from '@/components/marketing/cookie-consent'
import './globals.css'

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
})

const jetbrainsMono = JetBrains_Mono({
  subsets: ['latin'],
  variable: '--font-jetbrains-mono',
  display: 'swap',
})

export const viewport: Viewport = {
  themeColor: '#FF6B35',
  width: 'device-width',
  initialScale: 1,
}

// TODO: replace with the real production domain once registered.
const siteUrl = 'https://www.atlas-restaurant.com'

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: 'Atlas — AI Restaurant Operating System for India',
    template: '%s | Atlas',
  },
  description:
    'Billing, kitchen, inventory, staff, customers, and AI — one platform to run your entire restaurant. Guided setup in under 30 minutes, transparent pricing, WhatsApp built in.',
  keywords: [
    'restaurant POS software',
    'restaurant management system India',
    'cloud kitchen software',
    'KOT software',
    'restaurant billing software',
    'Petpooja alternative',
  ],
  robots: { index: true, follow: true },
  openGraph: {
    type: 'website',
    locale: 'en_IN',
    siteName: 'Atlas',
    title: 'Atlas — AI Restaurant Operating System for India',
    description:
      'Billing, kitchen, inventory, staff, customers, and AI — one platform to run your entire restaurant.',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Atlas — AI Restaurant Operating System for India',
    description:
      'Billing, kitchen, inventory, staff, customers, and AI — one platform to run your entire restaurant.',
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" className={`${inter.variable} ${jetbrainsMono.variable}`}>
      <body className="bg-white font-sans text-ink">
        <Navbar />
        {children}
        <Footer />
        <CookieConsent />
      </body>
    </html>
  )
}
