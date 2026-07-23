import { Hero } from '@/components/marketing/hero'
import { LiveStatsStrip } from '@/components/marketing/live-stats-strip'
import { FeatureGrid } from '@/components/marketing/feature-grid'
import { FeatureShowcase } from '@/components/marketing/feature-showcase'
import { FlowStrip } from '@/components/marketing/flow-strip'
import { DashboardShowcase } from '@/components/marketing/dashboard-showcase'
import { AdvisorPanels } from '@/components/marketing/advisor-panels'
import { OutletTypes } from '@/components/marketing/outlet-types'
import { TrustSection } from '@/components/marketing/trust-section'
import { PricingSection } from '@/components/marketing/pricing-section'
import { FaqSection } from '@/components/marketing/faq-section'
import { FinalCta } from '@/components/marketing/final-cta'

export default function HomePage() {
  return (
    <main>
      <Hero />
      <LiveStatsStrip />
      <FeatureGrid />
      <FeatureShowcase />
      <FlowStrip />
      <DashboardShowcase />
      <AdvisorPanels />
      <OutletTypes />
      <TrustSection />
      <PricingSection />
      <FaqSection />
      <FinalCta />
    </main>
  )
}
