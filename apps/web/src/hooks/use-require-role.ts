'use client'

import { useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { useAuthStore } from '@/lib/auth-store'

export function useRequireRole(allowedRoles: string[]): boolean {
  const router = useRouter()
  const role = useAuthStore((s) => s.user?.role) ?? ''
  const rolesRef = useRef(allowedRoles)
  rolesRef.current = allowedRoles

  useEffect(() => {
    if (!role) return
    if (!rolesRef.current.includes(role)) {
      router.replace('/dashboard')
    }
  }, [role, router])

  return !!role && allowedRoles.includes(role)
}
