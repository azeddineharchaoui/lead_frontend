'use client'

import { useAuth } from '@/hooks/useAuth'
import type { ApiClientOptions } from '@/lib/api-client'

export function useApiClient(): ApiClientOptions {
  const { accessToken, isDevBypass } = useAuth()

  const baseUrl = process.env.NEXT_PUBLIC_API_URL || ''
  const apiKey = process.env.NEXT_PUBLIC_DEFAULT_API_KEY || undefined

  return {
    baseUrl: baseUrl.replace(/\/$/, ''),
    apiKey: apiKey || undefined,
    accessToken: isDevBypass ? undefined : accessToken ?? undefined,
  }
}
