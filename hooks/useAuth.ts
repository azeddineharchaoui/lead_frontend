/**
 * hooks/useAuth.ts
 * Thin wrapper over the auth context for easy consumption in components.
 */

import { useRouter } from 'next/navigation'
import { useCallback } from 'react'
import { useAuthContext } from '@/lib/auth-context'
import type { UserRole } from '@/lib/types'

export function useAuth() {
  const ctx = useAuthContext()
  const router = useRouter()

  const signOut = useCallback(async () => {
    await ctx.logout()
    router.push('/login')
  }, [ctx, router])

  const hasRole = useCallback(
    (...roles: UserRole[]) => !!ctx.user && roles.includes(ctx.user.role as UserRole),
    [ctx.user],
  )

  const isOwner  = hasRole('owner')
  const isAdmin  = hasRole('owner', 'admin')
  const isAgent  = hasRole('owner', 'admin', 'agent')

  return {
    ...ctx,
    signOut,
    hasRole,
    isOwner,
    isAdmin,
    isAgent,
    role: ctx.user?.role as UserRole | undefined,
  }
}
