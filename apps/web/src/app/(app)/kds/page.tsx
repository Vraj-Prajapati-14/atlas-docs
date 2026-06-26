import type { Metadata } from 'next'
import { ChefHat } from 'lucide-react'

export const metadata: Metadata = { title: 'Kitchen Display' }

export default function KDSPage() {
  return (
    <div className="flex flex-col items-center justify-center py-20 gap-4">
      <div className="flex items-center justify-center w-14 h-14 rounded-xl bg-red-500/10">
        <ChefHat size={24} className="text-red-500" />
      </div>
      <div className="text-center">
        <p className="text-sm font-semibold text-foreground">KDS — coming in Phase 3</p>
        <p className="text-xs text-muted-foreground mt-1 max-w-xs">
          Full-screen dark-mode kitchen display with age-coloured ticket cards and one-tap serve.
        </p>
      </div>
    </div>
  )
}
