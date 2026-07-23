import type { LucideIcon } from 'lucide-react'
import type { ReactNode } from 'react'
import type { FaqItem } from './faq-accordion'

export type FeatureCapability = { icon: LucideIcon; title: string; desc: string }
export type FeatureStat = { value: string; label: string }

export type FeaturePageConfig = {
  slug: string
  navLabel: string
  eyebrow: string
  headline: string
  subheadline: string
  visual: ReactNode
  capabilities: FeatureCapability[]
  highlights: string[]
  stats: FeatureStat[]
  faqs: FaqItem[]
}
