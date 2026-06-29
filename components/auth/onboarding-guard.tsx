'use client'

import { useEffect } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import { useAuth } from '@/hooks/useAuth'

/**
 * OnboardingGuard - Redirects to onboarding if user hasn't completed it
 * Place this in the root layout or any protected route
 */
export function OnboardingGuard({ children }: { children: React.ReactNode }) {
  const router = useRouter()
  const pathname = usePathname()
  const { user, organisation, isLoading, isDevBypass } = useAuth()

  useEffect(() => {
    if (isLoading) return

    // Skip guard in dev bypass mode
    if (isDevBypass) return

    // Skip guard on auth/public pages
    const publicPaths = [
      '/login',
      '/register',
      '/forgot-password',
      '/reset-password',
      '/verify-email',
      '/embed',
      '/chat-widget-demo',
      '/onboarding',
    ]

    if (publicPaths.some((p) => pathname === p || pathname.startsWith(p + '/'))) {
      return
    }

    // Skip guard if no user
    if (!user || !organisation) return

    // If onboarding not complete, redirect
    if (!organisation.settings?.onboarding_complete && pathname !== '/onboarding') {
      router.push('/onboarding')
      return
    }

    // If onboarding complete but on onboarding page, redirect home
    if (organisation.settings?.onboarding_complete && pathname === '/onboarding') {
      router.push('/')
      return
    }
  }, [user, organisation, isLoading, isDevBypass, pathname, router])

  return <>{children}</>
}
