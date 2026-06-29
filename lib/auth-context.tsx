'use client'

/**
 * lib/auth-context.tsx
 * React context that holds the current auth state (user, org, token).
 * Token is kept in memory; httpOnly cookie handles persistence.
 */

import React, { createContext, useCallback, useContext, useEffect, useState } from 'react'
import type { AuthOrganisation, AuthUser, LoginPayload, RegisterPayload } from './types'
import { getMe, login as apiLogin, logout as apiLogout, register as apiRegister, refreshTokens, updateProfile, changePassword } from './api/auth'
import {
  DEV_MOCK_ACCESS_TOKEN,
  DEV_MOCK_ORG,
  DEV_MOCK_USER,
  isDevAuthBypass,
} from './dev-auth'

interface AuthContextValue {
  user: AuthUser | null
  organisation: AuthOrganisation | null
  accessToken: string | null
  isLoading: boolean
  isAuthenticated: boolean
  isDevBypass: boolean
  login: (payload: LoginPayload) => Promise<void>
  register: (payload: RegisterPayload) => Promise<void>
  logout: () => Promise<void>
  refreshUser: () => Promise<void>
  refreshSession: () => Promise<string | null>
  updateProfile: (full_name: string) => Promise<void>
  changePassword: (current_password: string, new_password: string) => Promise<void>
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
      if (isDevAuthBypass()) {
        setAccessToken(DEV_MOCK_ACCESS_TOKEN)
        setUser(DEV_MOCK_USER)
        setOrganisation(DEV_MOCK_ORG)
        setIsLoading(false)
        return
      }

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

  // ── Refresh session (get new token) ──────────────────────────────────────
  const refreshSession = useCallback(async (): Promise<string | null> => {
    try {
      const tokens = await refreshTokens()
      setAccessToken(tokens.access_token)
      return tokens.access_token
    } catch {
      setAccessToken(null)
      return null
    }
  }, [])

  // ── Update profile ──────────────────────────────────────────────────────
  const updateProfileFn = useCallback(async (full_name: string) => {
    if (!accessToken) throw new Error('Not authenticated')
    await updateProfile(full_name, accessToken)
    await refreshUser()
  }, [accessToken, refreshUser])

  // ── Change password ────────────────────────────────────────────────────
  const changePasswordFn = useCallback(async (current_password: string, new_password: string) => {
    if (!accessToken) throw new Error('Not authenticated')
    await changePassword(current_password, new_password, accessToken)
  }, [accessToken])

  return (
    <AuthContext.Provider
      value={{
        user,
        organisation,
        accessToken,
        isLoading,
        isAuthenticated: !!user,
        isDevBypass: isDevAuthBypass(),
        login,
        register,
        logout,
        refreshUser,
        refreshSession,
        updateProfile: updateProfileFn,
        changePassword: changePasswordFn,
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
