import type { Config } from 'tailwindcss'
import { fontFamily } from 'tailwindcss/defaultTheme'

const config: Config = {
  darkMode: ['class'],
  content: [
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    container: {
      center: true,
      padding: '1.25rem',
      screens: {
        sm: '640px',
        md: '768px',
        lg: '1024px',
        xl: '1180px',
        '2xl': '1280px',
      },
    },
    extend: {
      // ─── Atlas brand tokens — shared with @atlas/web, light-theme surfaces ──
      colors: {
        primary: {
          DEFAULT: '#FF6B35',
          50: '#FFF3EE',
          100: '#FFE4D6',
          200: '#FFC9AD',
          300: '#FFAD84',
          400: '#FF915B',
          500: '#FF6B35',
          600: '#E5501A',
          700: '#BF3B0E',
          800: '#992E0A',
          900: '#732207',
        },
        ink: {
          DEFAULT: '#111827',
          50: '#F4F5F7',
          100: '#E4E6EA',
          200: '#C4C8D1',
          300: '#9CA3AF',
          400: '#6B7280',
          500: '#4B5566',
          600: '#374151',
          700: '#252D45',
          800: '#1A1A2E',
          900: '#0F1220',
        },
        success: { DEFAULT: '#22C55E', light: '#DCFCE7', dark: '#15803D' },
        warning: { DEFAULT: '#F59E0B', light: '#FEF3C7', dark: '#B45309' },
        info: { DEFAULT: '#3B82F6', light: '#DBEAFE', dark: '#1D4ED8' },
        danger: { DEFAULT: '#EF4444', light: '#FEE2E2', dark: '#B91C1C' },
      },

      fontFamily: {
        sans: ['var(--font-inter)', ...fontFamily.sans],
        mono: ['var(--font-jetbrains-mono)', ...fontFamily.mono],
      },

      backgroundImage: {
        'grid-pattern':
          'linear-gradient(to right, rgba(17,24,39,0.045) 1px, transparent 1px), linear-gradient(to bottom, rgba(17,24,39,0.045) 1px, transparent 1px)',
        'radial-fade':
          'radial-gradient(60% 60% at 50% 0%, rgba(255,107,53,0.10) 0%, rgba(255,107,53,0) 70%)',
      },
      backgroundSize: {
        grid: '32px 32px',
      },

      keyframes: {
        'fade-in-up': {
          from: { opacity: '0', transform: 'translateY(16px)' },
          to: { opacity: '1', transform: 'translateY(0)' },
        },
        'float-slow': {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-8px)' },
        },
        marquee: {
          from: { transform: 'translateX(0)' },
          to: { transform: 'translateX(-50%)' },
        },
        'dash-flow': {
          to: { strokeDashoffset: '-24' },
        },
        'pulse-dot': {
          '0%, 100%': { opacity: '1', transform: 'scale(1)' },
          '50%': { opacity: '0.55', transform: 'scale(0.85)' },
        },
      },
      animation: {
        'fade-in-up': 'fade-in-up 0.6s cubic-bezier(0.16,1,0.3,1) both',
        'float-slow': 'float-slow 5s ease-in-out infinite',
        marquee: 'marquee 32s linear infinite',
        'dash-flow': 'dash-flow 1.2s linear infinite',
        'pulse-dot': 'pulse-dot 2s ease-in-out infinite',
      },

      boxShadow: {
        soft: '0 2px 8px rgba(17,24,39,0.06)',
        card: '0 8px 24px -6px rgba(17,24,39,0.10)',
        panel: '0 24px 64px -12px rgba(17,24,39,0.18)',
      },
    },
  },
  plugins: [],
}

export default config
