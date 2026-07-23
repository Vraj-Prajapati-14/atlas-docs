import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { FEATURE_PAGES } from '@/components/marketing/feature-pages-data'
import { FeaturePageContent } from '@/components/marketing/feature-page-content'

type Props = { params: { slug: string } }

export function generateStaticParams() {
  return FEATURE_PAGES.map((page) => ({ slug: page.slug }))
}

export function generateMetadata({ params }: Props): Metadata {
  const page = FEATURE_PAGES.find((p) => p.slug === params.slug)
  if (!page) return {}
  return {
    title: page.navLabel,
    description: page.subheadline,
  }
}

export default function FeaturePage({ params }: Props) {
  const page = FEATURE_PAGES.find((p) => p.slug === params.slug)
  if (!page) notFound()
  return <FeaturePageContent config={page} />
}
