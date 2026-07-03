'use client'

import { useEffect } from 'react'
import { useSearchParams, usePathname, useRouter } from 'next/navigation'
import { toast } from 'sonner'

// Reads ?welcome=Name from URL (set by login onSuccess) and shows the toast
// AFTER navigation lands on the dashboard — never on the login page.
export function AuthTransitionToast() {
  const params = useSearchParams()
  const pathname = usePathname()
  const router = useRouter()

  useEffect(() => {
    const welcome = params.get('welcome')
    if (!welcome) return
    // id='auth-welcome' deduplicates in case the effect fires more than once.
    toast.success(`Welcome back, ${decodeURIComponent(welcome)}!`, { id: 'auth-welcome' })
    router.replace(pathname)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return null
}
