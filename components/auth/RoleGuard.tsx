'use client'

/**
 * components/auth/RoleGuard.tsx
 * Conditionally renders children only when the current user has one of the specified roles.
 *
 * Usage:
 *   <RoleGuard roles={['owner', 'admin']}>
 *     <button>Delete target</button>
 *   </RoleGuard>
 *
 *   <RoleGuard roles={['owner']} fallback={<p>Owners only</p>}>
 *     <BillingPage />
 *   </RoleGuard>
 */

import React from 'react'
import type { UserRole } from '@/lib/types'
import { useAuth } from '@/hooks/useAuth'

interface RoleGuardProps {
  roles: UserRole[]
  children: React.ReactNode
  fallback?: React.ReactNode
}

export function RoleGuard({ roles, children, fallback = null }: RoleGuardProps) {
  const { user, isLoading } = useAuth()

  if (isLoading) return null
  if (!user) return <>{fallback}</>
  if (!roles.includes(user.role as UserRole)) return <>{fallback}</>

  return <>{children}</>
}
