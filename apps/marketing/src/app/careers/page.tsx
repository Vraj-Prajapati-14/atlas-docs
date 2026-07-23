import type { Metadata } from 'next'
import { Briefcase } from 'lucide-react'
import { PageHeader } from '@/components/marketing/page-header'
import { ComingSoon } from '@/components/marketing/coming-soon'

export const metadata: Metadata = {
  title: 'Careers',
  description: 'Open roles at Atlas.',
}

export default function CareersPage() {
  return (
    <main>
      <PageHeader eyebrow="Join Us" title="Careers at Atlas" />
      <ComingSoon
        icon={Briefcase}
        title="No open roles listed yet."
        description="We're a small team building fast. When we're hiring, openings will be posted here first — reach out if you'd like to be considered early."
      />
    </main>
  )
}
