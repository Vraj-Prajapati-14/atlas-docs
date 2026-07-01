'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'

/**
 * /admin root — immediately redirects to /admin/dashboard.
 * The layout handles auth: if there is no token it shows the login form
 * before this page ever mounts, so no auth check is needed here.
 */
export default function AdminRootPage() {
  const router = useRouter()

  useEffect(() => {
    router.replace('/admin/dashboard')
  }, [router])

  return null
}
