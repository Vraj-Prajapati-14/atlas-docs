import type { Metadata } from 'next'
import { MessageCircle, Mail, Phone, Clock } from 'lucide-react'
import { PageHeader } from '@/components/marketing/page-header'
import { ContactForm } from '@/components/marketing/contact-form'
import { Reveal } from '@/components/marketing/reveal'

export const metadata: Metadata = {
  title: 'Contact Us',
  description: 'Talk to the Atlas team — book a live demo or ask us anything on WhatsApp, phone, or email.',
}

// Placeholder contact channels — replace with real business details before launch.
const CHANNELS = [
  {
    icon: MessageCircle,
    label: 'WhatsApp',
    value: '+91 00000 00000',
    href: 'https://wa.me/910000000000?text=Hi%20Atlas%2C%20I%27d%20like%20to%20book%20a%20demo',
    tone: 'text-success bg-success/10',
  },
  {
    icon: Phone,
    label: 'Call Us',
    value: '+91 00000 00000',
    href: 'tel:+910000000000',
    tone: 'text-primary bg-primary-50',
  },
  {
    icon: Mail,
    label: 'Email',
    value: 'hello@atlas-restaurant.com',
    href: 'mailto:hello@atlas-restaurant.com',
    tone: 'text-info bg-info/10',
  },
]

export default function ContactPage() {
  return (
    <main>
      <PageHeader
        eyebrow="Get in Touch"
        title="Let's Talk About Your Restaurant."
        description="Book a live demo, ask a question, or just say hi — WhatsApp-first, like everything else at Atlas."
      />

      <section className="section bg-white">
        <div className="container grid gap-10 lg:grid-cols-[1fr_1.1fr] lg:gap-16">
          <Reveal>
            <div className="space-y-4">
              {CHANNELS.map((channel) => (
                <a
                  key={channel.label}
                  href={channel.href}
                  target={channel.href.startsWith('http') ? '_blank' : undefined}
                  rel={channel.href.startsWith('http') ? 'noopener noreferrer' : undefined}
                  className="flex items-center gap-4 rounded-2xl border border-ink-100 p-5 shadow-soft transition-colors hover:border-primary-200 hover:bg-primary-50/30"
                >
                  <span className={`grid h-11 w-11 shrink-0 place-items-center rounded-xl ${channel.tone}`}>
                    <channel.icon size={19} />
                  </span>
                  <div>
                    <p className="text-sm font-medium text-ink-400">{channel.label}</p>
                    <p className="font-semibold text-ink">{channel.value}</p>
                  </div>
                </a>
              ))}

              <div className="flex items-center gap-4 rounded-2xl border border-ink-100 p-5">
                <span className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-warning/10 text-warning">
                  <Clock size={19} />
                </span>
                <div>
                  <p className="text-sm font-medium text-ink-400">Support Hours</p>
                  <p className="font-semibold text-ink">Every day, 9 AM – 11 PM IST</p>
                </div>
              </div>
            </div>
          </Reveal>

          <Reveal delay={0.1}>
            <div className="rounded-2xl border border-ink-100 bg-white p-6 shadow-panel sm:p-8">
              <h2 className="text-xl font-bold text-ink">Request a Callback</h2>
              <p className="mt-1 text-sm text-ink-500">
                Tell us a little about your restaurant and we&apos;ll reach out within one business day.
              </p>
              <div className="mt-6">
                <ContactForm />
              </div>
            </div>
          </Reveal>
        </div>
      </section>
    </main>
  )
}
