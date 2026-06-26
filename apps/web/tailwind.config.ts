import type { Config } from 'tailwindcss'
import { fontFamily } from 'tailwindcss/defaultTheme'

const config: Config = {
  darkMode: ['class'],
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    container: {
      center: true,
      padding: '1rem',
    },
    extend: {
      // ─── Atlas Design Tokens ──────────────────────────────────────────────
      colors: {
        // Brand — Atlas orange
        primary: {
          DEFAULT: '#FF6B35',
          50:  '#FFF3EE',
          100: '#FFE4D6',
          200: '#FFC9AD',
          300: '#FFAD84',
          400: '#FF915B',
          500: '#FF6B35',  // main brand colour
          600: '#E5501A',
          700: '#BF3B0E',
          800: '#992E0A',
          900: '#732207',
        },

        // Dark surfaces — slate-based
        background: {
          DEFAULT: '#0C0F18',
          card:    '#141828',
          hover:   '#1A2035',
          border:  '#252D45',
        },

        // Semantic
        success: {
          DEFAULT: '#22C55E',
          light:   '#DCFCE7',
          dark:    '#15803D',
        },
        danger: {
          DEFAULT: '#EF4444',
          light:   '#FEE2E2',
          dark:    '#B91C1C',
        },
        warning: {
          DEFAULT: '#F59E0B',
          light:   '#FEF3C7',
          dark:    '#B45309',
        },
        info: {
          DEFAULT: '#3B82F6',
          light:   '#DBEAFE',
          dark:    '#1D4ED8',
        },

        // shadcn/ui CSS variable bridge
        border:  'hsl(var(--border))',
        input:   'hsl(var(--input))',
        ring:    'hsl(var(--ring))',
        foreground: 'hsl(var(--foreground))',
        muted: {
          DEFAULT:    'hsl(var(--muted))',
          foreground: 'hsl(var(--muted-foreground))',
        },
        accent: {
          DEFAULT:    'hsl(var(--accent))',
          foreground: 'hsl(var(--accent-foreground))',
        },
        popover: {
          DEFAULT:    'hsl(var(--popover))',
          foreground: 'hsl(var(--popover-foreground))',
        },
        card: {
          DEFAULT:    'hsl(var(--card))',
          foreground: 'hsl(var(--card-foreground))',
        },
        destructive: {
          DEFAULT:    'hsl(var(--destructive))',
          foreground: 'hsl(var(--destructive-foreground))',
        },
        secondary: {
          DEFAULT:    'hsl(var(--secondary))',
          foreground: 'hsl(var(--secondary-foreground))',
        },
      },

      fontFamily: {
        sans: ['var(--font-inter)', ...fontFamily.sans],
        mono: ['var(--font-jetbrains-mono)', ...fontFamily.mono],
      },

      // 4px grid spacing scale
      spacing: {
        '4.5': '1.125rem',
        '13':  '3.25rem',
        '15':  '3.75rem',
        '18':  '4.5rem',
      },

      borderRadius: {
        lg: 'var(--radius)',
        md: 'calc(var(--radius) - 2px)',
        sm: 'calc(var(--radius) - 4px)',
      },

      // Tabular numbers for prices — no layout shift
      fontVariantNumeric: {
        tabular: 'tabular-nums',
      },

      keyframes: {
        'accordion-down': {
          from: { height: '0' },
          to:   { height: 'var(--radix-accordion-content-height)' },
        },
        'accordion-up': {
          from: { height: 'var(--radix-accordion-content-height)' },
          to:   { height: '0' },
        },
        'fade-in': {
          from: { opacity: '0', transform: 'translateY(4px)' },
          to:   { opacity: '1', transform: 'translateY(0)' },
        },
        'slide-in-from-right': {
          from: { transform: 'translateX(100%)' },
          to:   { transform: 'translateX(0)' },
        },
        pulse: {
          '0%, 100%': { opacity: '1' },
          '50%':      { opacity: '0.4' },
        },
      },

      animation: {
        'accordion-down':      'accordion-down 0.2s ease-out',
        'accordion-up':        'accordion-up 0.2s ease-out',
        'fade-in':             'fade-in 0.15s ease-out',
        'slide-in-from-right': 'slide-in-from-right 0.3s ease-out',
        'pulse-slow':          'pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite',
      },

      // Skeleton shimmer
      backgroundImage: {
        'skeleton-shimmer':
          'linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.04) 50%, transparent 100%)',
      },
    },
  },
  plugins: [require('tailwindcss-animate')],
}

export default config
