'use client'

import { useTheme } from 'next-themes'
import { Toaster } from 'sonner'

export function ClientToaster() {
  const { theme } = useTheme()

  return (
    <Toaster
      theme={(theme as 'dark' | 'light') ?? 'dark'}
      position="top-right"
      richColors
      closeButton
      toastOptions={{
        style: {
          background: 'hsl(var(--card))',
          border: '1px solid hsl(var(--border))',
          color: 'hsl(var(--foreground))',
        },
      }}
    />
  )
}
