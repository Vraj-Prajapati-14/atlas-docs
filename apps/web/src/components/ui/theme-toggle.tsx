'use client'

import { useEffect, useState } from 'react'
import { useTheme } from 'next-themes'
import { Sun, Moon } from 'lucide-react'
import { cn } from '@/lib/utils'

export function ThemeToggle() {
  const { theme, setTheme } = useTheme()
  const [mounted, setMounted] = useState(false)

  useEffect(() => { setMounted(true) }, [])
  if (!mounted) return <div className="w-9 h-9" />

  const isDark = theme === 'dark'

  return (
    <button
      type="button"
      aria-label={isDark ? 'Switch to light theme' : 'Switch to dark theme'}
      onClick={() => setTheme(isDark ? 'light' : 'dark')}
      className={cn(
        'relative flex items-center justify-center w-9 h-9 rounded-xl',
        'text-muted-foreground hover:text-foreground',
        'bg-background-hover/50 hover:bg-background-hover border border-border/60 hover:border-border',
        'transition-all duration-150 outline-none',
      )}
    >
      {isDark
        ? <Sun size={15} className="transition-transform duration-150" />
        : <Moon size={15} className="transition-transform duration-150" />}
    </button>
  )
}
