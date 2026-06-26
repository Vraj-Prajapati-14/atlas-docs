import type { Metadata } from 'next'
import { Receipt } from 'lucide-react'

export const metadata: Metadata = { title: 'Billing' }

export default function BillingPage() {
  return (
    <div className="flex flex-col items-center justify-center py-20 gap-4">
      <div className="flex items-center justify-center w-14 h-14 rounded-xl bg-primary-500/10">
        <Receipt size={24} className="text-primary-500" />
      </div>
      <div className="text-center">
        <p className="text-sm font-semibold text-foreground">Billing — coming in Phase 3</p>
        <p className="text-xs text-muted-foreground mt-1 max-w-xs">
          GST invoice generation, split payment, UPI/cash/card, and receipt printing.
        </p>
      </div>
    </div>
  )
}
