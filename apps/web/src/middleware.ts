import { NextRequest, NextResponse } from 'next/server'

const PUBLIC_PATHS = ['/login', '/order/', '/register', '/admin']

function decodeJWTPayload(token: string): { onboardingCompleted?: boolean; role?: string } | null {
  try {
    const parts = token.split('.')
    if (parts.length !== 3 || !parts[1]) return null
    const base64 = parts[1].replace(/-/g, '+').replace(/_/g, '/')
    const json = atob(base64)
    return JSON.parse(json) as { onboardingCompleted?: boolean; role?: string }
  } catch {
    return null
  }
}

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl
  const isPublic = PUBLIC_PATHS.some((p) => pathname.startsWith(p))
  const hasAuth = request.cookies.has('atlas_auth')
  const isOnboarding = pathname.startsWith('/onboarding')

  // Authenticated on a public path → go to dashboard
  if (isPublic && hasAuth) {
    return NextResponse.redirect(new URL('/dashboard', request.url))
  }

  // Unauthenticated on any protected path (including /onboarding) → login
  if (!isPublic && !hasAuth) {
    return NextResponse.redirect(new URL('/login', request.url))
  }

  // Onboarding gate — decode JWT without verification (signature checked by API on every request)
  if (hasAuth) {
    const token = request.cookies.get('atlas_auth')?.value ?? ''
    const payload = decodeJWTPayload(token)
    const isOwner = payload?.role === 'OWNER'

    // OWNER with incomplete onboarding must finish the wizard before using the app
    if (isOwner && payload?.onboardingCompleted === false && !isOnboarding) {
      return NextResponse.redirect(new URL('/onboarding', request.url))
    }

    // OWNER who already completed onboarding visiting /onboarding → send to app
    if (isOwner && payload?.onboardingCompleted === true && isOnboarding) {
      return NextResponse.redirect(new URL('/dashboard', request.url))
    }
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico|api/).*)'],
}
