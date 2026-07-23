import type { Metadata } from 'next'
import { Newspaper } from 'lucide-react'
import { PageHeader } from '@/components/marketing/page-header'
import { ComingSoon } from '@/components/marketing/coming-soon'

export const metadata: Metadata = {
  title: 'Blog',
  description: 'Restaurant operations, industry insights, and Atlas product updates.',
}

export default function BlogPage() {
  return (
    <main>
      <PageHeader eyebrow="Resources" title="The Atlas Blog" />
      <ComingSoon
        icon={Newspaper}
        title="Our first posts are in the oven."
        description="We're writing about restaurant operations, industry trends, and everything we're building at Atlas. Check back soon."
      />
    </main>
  )
}
