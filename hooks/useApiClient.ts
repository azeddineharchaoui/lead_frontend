'use client'

import { useApiClient } from '@/hooks/useApiClient'
import { useAuth } from '@/hooks/useAuth'
import type { ApiClientOptions } from '@/lib/api-client'

export function useApiClient(): ApiClientOptions {
  const { baseUrl, apiKey } = useApiClient()
  const { accessToken, isDevBypass } = useAuth()

  return {
    baseUrl: baseUrl.replace(/\/$/, ''),
    apiKey: apiKey || undefined,
    accessToken: isDevBypass ? undefined : accessToken ?? undefined,
  }
}
