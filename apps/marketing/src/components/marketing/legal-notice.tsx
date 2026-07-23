import { AlertTriangle } from 'lucide-react'

export function LegalNotice() {
  return (
    <div className="mb-10 flex items-start gap-3 rounded-xl border border-warning/30 bg-warning/5 p-4 text-sm text-ink-600">
      <AlertTriangle size={18} className="mt-0.5 shrink-0 text-warning" />
      <p>
        This is a standard draft template with placeholder fields (shown in{' '}
        <span className="font-mono">[brackets]</span>). Have it reviewed by
        qualified legal counsel and filled in with your registered business
        details before publishing.
      </p>
    </div>
  )
}
