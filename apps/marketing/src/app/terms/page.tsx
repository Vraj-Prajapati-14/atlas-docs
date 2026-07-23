import type { Metadata } from 'next'
import { PageHeader } from '@/components/marketing/page-header'
import { LegalNotice } from '@/components/marketing/legal-notice'

export const metadata: Metadata = {
  title: 'Terms of Service',
  description: 'The terms that govern your use of Atlas.',
}

export default function TermsPage() {
  return (
    <main>
      <PageHeader eyebrow="Legal" title="Terms of Service" />

      <section className="section bg-white">
        <div className="container max-w-3xl">
          <LegalNotice />

          <div className="space-y-8 text-sm leading-relaxed text-ink-600">
            <p className="text-ink-400">Last updated: [Effective Date]</p>

            <div>
              <h2 className="text-lg font-bold text-ink">1. Acceptance of Terms</h2>
              <p className="mt-2">
                By creating an account or using Atlas (&quot;Service&quot;, operated
                by [Company Legal Name], &quot;we&quot;, &quot;us&quot;), you agree to these Terms
                of Service. If you are using the Service on behalf of a
                restaurant business, you confirm you have authority to bind
                that business to these terms.
              </p>
            </div>

            <div>
              <h2 className="text-lg font-bold text-ink">2. The Service</h2>
              <p className="mt-2">
                Atlas provides billing, kitchen display, inventory, staff,
                customer, and analytics software for restaurants, delivered
                as a cloud-hosted subscription service, with optional offline
                functionality as described in our product documentation.
              </p>
            </div>

            <div>
              <h2 className="text-lg font-bold text-ink">3. Accounts & Responsibilities</h2>
              <ul className="mt-2 list-disc space-y-1.5 pl-5">
                <li>You are responsible for the accuracy of data you enter (menu, pricing, tax rates, staff records).</li>
                <li>You are responsible for keeping login credentials confidential and for all activity under your account.</li>
                <li>You must comply with applicable tax, food safety, and business laws — Atlas provides tooling (e.g. GST calculations) but does not replace your own compliance obligations.</li>
              </ul>
            </div>

            <div>
              <h2 className="text-lg font-bold text-ink">4. Subscription & Billing</h2>
              <p className="mt-2">
                Plan pricing is listed on our{' '}
                <a href="/#pricing" className="font-medium text-primary">Pricing page</a>. Subscriptions
                renew automatically for the same billing period unless
                cancelled. Fees are non-refundable except where required by law.
              </p>
            </div>

            <div>
              <h2 className="text-lg font-bold text-ink">5. Acceptable Use</h2>
              <p className="mt-2">
                You may not use the Service to violate any law, infringe
                intellectual property, transmit malicious code, or attempt to
                gain unauthorized access to our systems or other customers&apos; data.
              </p>
            </div>

            <div>
              <h2 className="text-lg font-bold text-ink">6. Data Ownership</h2>
              <p className="mt-2">
                You retain ownership of your restaurant&apos;s operational data.
                We process it solely to provide the Service, as described in
                our <a href="/privacy-policy" className="font-medium text-primary">Privacy Policy</a>.
              </p>
            </div>

            <div>
              <h2 className="text-lg font-bold text-ink">7. Availability & Liability</h2>
              <p className="mt-2">
                We aim for high availability but do not guarantee
                uninterrupted service. To the maximum extent permitted by
                law, Atlas&apos;s liability for any claim relating to the Service
                is limited to the fees paid by you in the preceding 12 months.
              </p>
            </div>

            <div>
              <h2 className="text-lg font-bold text-ink">8. Termination</h2>
              <p className="mt-2">
                Either party may terminate the subscription per the notice
                period specified in your plan. We may suspend accounts that
                violate these terms or applicable law.
              </p>
            </div>

            <div>
              <h2 className="text-lg font-bold text-ink">9. Governing Law</h2>
              <p className="mt-2">
                These terms are governed by the laws of [Jurisdiction, e.g.
                India], without regard to conflict-of-law principles.
              </p>
            </div>

            <div>
              <h2 className="text-lg font-bold text-ink">10. Contact</h2>
              <p className="mt-2">
                Questions about these terms can be sent via our{' '}
                <a href="/contact" className="font-medium text-primary">Contact page</a>.
              </p>
            </div>
          </div>
        </div>
      </section>
    </main>
  )
}
