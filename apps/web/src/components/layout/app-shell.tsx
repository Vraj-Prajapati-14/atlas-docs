'use client'

import { useEffect } from 'react'
import { Sidebar } from './sidebar'
import { TopBar } from './top-bar'
import { useAuthStore } from '@/lib/auth-store'

interface AppShellProps {
  children: React.ReactNode
}

export function AppShell({ children }: AppShellProps) {
  useEffect(() => {
    // Rehydrate zustand persist store (skipHydration=true prevents SSR mismatch)
    useAuthStore.persist.rehydrate()
  }, [])

  return (
    <div className="flex h-dvh overflow-hidden bg-background">
      <Sidebar />
      <div className="flex flex-col flex-1 min-w-0">
        <TopBar />
        <main className="flex-1 overflow-y-auto p-6">
          {children}
        </main>
      </div>
    </div>
  )
}
