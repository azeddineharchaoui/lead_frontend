'use client'

/**
 * lib/auth-context.tsx
 * React context that holds the current auth state (user, org, token).
 * Token is kept in memory; httpOnly cookie handles persistence.
 */

import React, { createContext, useCallback, useContext, useEffect, useState } from 'react'
import type { AuthOrganisation, AuthUser, LoginPayload, RegisterPayload } from './types'
import { getMe, login as apiLogin, logout as apiLogout, register as apiRegister, refreshTokens } from './api/auth'

interface AuthContextValue {
  user: AuthUser | null
  organisation: AuthOrganisation | null
  accessToken: string | null
  isLoading: boolean
  isAuthenticated: boolean
  login: (payload: LoginPayload) => Promise<void>
  register: (payload: RegisterPayload) => Promise<void>
  logout: () => Promise<void>
  refreshUser: () => Promise<void>
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null)
  const [organisation, setOrganisation] = useState<AuthOrganisation | null>(null)
  const [accessToken, setAccessToken] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  // ── Load session on mount ────────────────────────────────────────────────
  useEffect(() => {
    const init = async () => {
      try {
        // Try to get a new access token via refresh cookie
        const tokens = await refreshTokens()
        setAccessToken(tokens.access_token)
        const me = await getMe(tokens.access_token)
        setUser(me.user)
        setOrganisation(me.organisation)
      } catch {
        // No valid session — stay logged out
        setUser(null)
        setOrganisation(null)
        setAccessToken(null)
      } finally {
        setIsLoading(false)
      }
    }
    init()
  }, [])

  // ── Login ────────────────────────────────────────────────────────────────
  const login = useCallback(async (payload: LoginPayload) => {
    const tokens = await apiLogin(payload)
    setAccessToken(tokens.access_token)
    const me = await getMe(tokens.access_token)
    setUser(me.user)
    setOrganisation(me.organisation)
  }, [])

  // ── Register ─────────────────────────────────────────────────────────────
  const register = useCallback(async (payload: RegisterPayload) => {
    const result = await apiRegister(payload) as any
    // access token comes in the X-Access-Token header, captured in api/auth.ts
    const token = result._accessToken || null
    if (token) {
      setAccessToken(token)
      const me = await getMe(token)
      setUser(me.user)
      setOrganisation(me.organisation)
    } else {
      setUser(result.user)
      setOrganisation(result.organisation)
    }
  }, [])

  // ── Logout ───────────────────────────────────────────────────────────────
  const logout = useCallback(async () => {
    await apiLogout(accessToken)
    setUser(null)
    setOrganisation(null)
    setAccessToken(null)
  }, [accessToken])

  // ── Refresh user profile ─────────────────────────────────────────────────
  const refreshUser = useCallback(async () => {
    if (!accessToken) return
    try {
      const me = await getMe(accessToken)
      setUser(me.user)
      setOrganisation(me.organisation)
    } catch {
      // Token expired — try silent refresh
      try {
        const tokens = await refreshTokens()
        setAccessToken(tokens.access_token)
        const me = await getMe(tokens.access_token)
        setUser(me.user)
        setOrganisation(me.organisation)
      } catch {
        await logout()
      }
    }
  }, [accessToken, logout])

  return (
    <AuthContext.Provider
      value={{
        user,
        organisation,
        accessToken,
        isLoading,
        isAuthenticated: !!user,
        login,
        register,
        logout,
        refreshUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export function useAuthContext(): AuthContextValue {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuthContext must be used within AuthProvider')
  return ctx
}
