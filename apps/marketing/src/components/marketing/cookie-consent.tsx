'use client'

import { useEffect, useState } from 'react'
import { Cookie } from 'lucide-react'

const STORAGE_KEY = 'atlas_cookie_consent'

export function CookieConsent() {
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    if (!window.localStorage.getItem(STORAGE_KEY)) {
      setVisible(true)
    }
  }, [])

  function respond(value: 'accepted' | 'declined') {
    window.localStorage.setItem(STORAGE_KEY, value)
    setVisible(false)
  }

  if (!visible) return null

  return (
    <div className="fixed inset-x-0 bottom-0 z-[60] border-t border-ink-100 bg-white/95 p-4 shadow-panel backdrop-blur-md sm:p-5">
      <div className="container flex flex-col items-center gap-4 sm:flex-row">
        <Cookie size={22} className="hidden shrink-0 text-primary sm:block" />
        <p className="text-center text-sm text-ink-500 sm:text-left">
          This website stores cookies on your computer to improve your
          browsing experience and for analytics about our visitors. See our{' '}
          <a href="/privacy-policy" className="font-semibold text-ink underline">
            Privacy Policy
          </a>{' '}
          to learn more.
        </p>
        <div className="flex w-full shrink-0 gap-2 sm:w-auto">
          <button
            type="button"
            onClick={() => respond('declined')}
            className="flex-1 rounded-lg border border-ink-200 px-4 py-2 text-sm font-semibold text-ink transition-colors hover:bg-ink-50 sm:flex-none"
          >
            Decline
          </button>
          <button
            type="button"
            onClick={() => respond('accepted')}
            className="flex-1 rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-primary-600 sm:flex-none"
          >
            Accept
          </button>
        </div>
      </div>
    </div>
  )
}
