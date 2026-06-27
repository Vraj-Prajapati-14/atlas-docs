'use client'

import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'

export interface AuthUser {
  id: string
  name: string
  email: string | null
  phone: string
  role: string
  tenantId: string
}

interface AuthState {
  user: AuthUser | null
  setAuth(user: AuthUser, accessToken: string, refreshToken: string): void
  clearAuth(): void
  getRefreshToken(): string | null
}

const AUTH_COOKIE_TTL = 30 * 24 * 3600 // 30 days — matches refresh token

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,

      setAuth(user, accessToken, refreshToken) {
        // api-client reads atlas_token directly from localStorage
        localStorage.setItem('atlas_token', accessToken)
        localStorage.setItem('atlas_refresh', refreshToken)
        // presence cookie for Next.js middleware (not httpOnly — client-set)
        document.cookie = `atlas_auth=1; path=/; max-age=${AUTH_COOKIE_TTL}; SameSite=Lax`
        set({ user })
      },

      clearAuth() {
        localStorage.removeItem('atlas_token')
        localStorage.removeItem('atlas_refresh')
        document.cookie = 'atlas_auth=; path=/; max-age=0; SameSite=Lax'
        set({ user: null })
      },

      getRefreshToken() {
        return typeof window !== 'undefined' ? localStorage.getItem('atlas_refresh') : null
      },
    }),
    {
      name: 'atlas-auth',
      storage: createJSONStorage(() => localStorage),
      partialize: (s) => ({ user: s.user }),
      skipHydration: true,
      onRehydrateStorage: () => (state) => {
        // Restore atlas_token for api-client after page reload
        if (state?.user && typeof window !== 'undefined') {
          const token = localStorage.getItem('atlas_token')
          if (!token) state.clearAuth()
        }
      },
    },
  ),
)
