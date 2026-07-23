import type { Metadata } from 'next'
import { BookOpen } from 'lucide-react'
import { PageHeader } from '@/components/marketing/page-header'
import { ComingSoon } from '@/components/marketing/coming-soon'

export const metadata: Metadata = {
  title: 'Guides',
  description: 'Setup guides and best practices for running your restaurant on Atlas.',
}

export default function GuidesPage() {
  return (
    <main>
      <PageHeader eyebrow="Resources" title="Guides" />
      <ComingSoon
        icon={BookOpen}
        title="Step-by-step guides are on the way."
        description="Menu setup, GST configuration, printer pairing, and staff onboarding walkthroughs are coming here. Need help now? Our Help Center covers the essentials."
      />
    </main>
  )
}
