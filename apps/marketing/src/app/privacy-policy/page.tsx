import type { Metadata } from 'next'
import { PageHeader } from '@/components/marketing/page-header'
import { LegalNotice } from '@/components/marketing/legal-notice'

export const metadata: Metadata = {
  title: 'Privacy Policy',
  description: 'How Atlas collects, uses, and protects your data.',
}

export default function PrivacyPolicyPage() {
  return (
    <main>
      <PageHeader eyebrow="Legal" title="Privacy Policy" />

      <section className="section bg-white">
        <div className="container max-w-3xl">
          <LegalNotice />

          <div className="prose-legal space-y-8 text-sm leading-relaxed text-ink-600">
            <p className="text-ink-400">Last updated: [Effective Date]</p>

            <div>
              <h2 className="text-lg font-bold text-ink">1. Introduction</h2>
              <p className="mt-2">
                [Company Legal Name] (&quot;Atlas&quot;, &quot;we&quot;, &quot;us&quot;) provides restaurant
                management software (&quot;Service&quot;) to restaurant owners and their
                staff (&quot;Customers&quot;). This policy explains what information we
                collect, why, and how it is handled when you use our website
                or Service.
              </p>
            </div>

            <div>
              <h2 className="text-lg font-bold text-ink">2. Information We Collect</h2>
              <ul className="mt-2 list-disc space-y-1.5 pl-5">
                <li>Account information: name, email, phone number, restaurant details.</li>
                <li>Operational data you enter into the Service: menu, orders, inventory, staff, and customer records for your restaurant.</li>
                <li>Billing information necessary to process subscription payments.</li>
                <li>Usage data: pages visited, device/browser information, and diagnostic logs.</li>
                <li>Communications you send us via WhatsApp, email, phone, or contact forms.</li>
              </ul>
            </div>

            <div>
              <h2 className="text-lg font-bold text-ink">3. How We Use Information</h2>
              <ul className="mt-2 list-disc space-y-1.5 pl-5">
                <li>To provide, maintain, and improve the Service.</li>
                <li>To send operational alerts (e.g. WhatsApp daily summaries, low-stock warnings) you have configured.</li>
                <li>To provide customer support and respond to requests.</li>
                <li>To detect, investigate, and prevent fraudulent or unauthorized activity.</li>
                <li>To comply with legal and tax obligations (e.g. GST reporting).</li>
              </ul>
            </div>

            <div>
              <h2 className="text-lg font-bold text-ink">4. Data Sharing</h2>
              <p className="mt-2">
                We do not sell customer data. We share data only with: service
                providers who help us operate the Service (hosting, payments,
                messaging) under confidentiality obligations; payment
                aggregator/delivery partners you explicitly connect (e.g.
                Zomato, Swiggy); and authorities where required by law.
              </p>
            </div>

            <div>
              <h2 className="text-lg font-bold text-ink">5. Data Retention & Security</h2>
              <p className="mt-2">
                We retain data for as long as your account is active or as
                needed to provide the Service, and take reasonable
                administrative and technical measures to protect it against
                unauthorized access, loss, or misuse.
              </p>
            </div>

            <div>
              <h2 className="text-lg font-bold text-ink">6. Your Rights</h2>
              <p className="mt-2">
                You may request access to, correction of, or deletion of your
                personal data by contacting us at{' '}
                <a href="mailto:hello@atlas-restaurant.com" className="font-medium text-primary">
                  hello@atlas-restaurant.com
                </a>
                .
              </p>
            </div>

            <div>
              <h2 className="text-lg font-bold text-ink">7. Changes to This Policy</h2>
              <p className="mt-2">
                We may update this policy from time to time. Material changes
                will be notified to Customers via email or in-app notice.
              </p>
            </div>

            <div>
              <h2 className="text-lg font-bold text-ink">8. Contact Us</h2>
              <p className="mt-2">
                Questions about this policy can be sent to{' '}
                <a href="mailto:hello@atlas-restaurant.com" className="font-medium text-primary">
                  hello@atlas-restaurant.com
                </a>{' '}
                or via our <a href="/contact" className="font-medium text-primary">Contact page</a>.
              </p>
            </div>
          </div>
        </div>
      </section>
    </main>
  )
}
