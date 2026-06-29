import type { ApiClientOptions } from '@/lib/api-client'
import type { ApiContextType } from '@/lib/types'

export type ApiOptions = Pick<ApiContextType, 'baseUrl' | 'apiKey'> & {
  accessToken?: string
}

export function toClientOptions(ctx: ApiOptions): ApiClientOptions {
  return {
    baseUrl: ctx.baseUrl.replace(/\/$/, ''),
    apiKey: ctx.apiKey || undefined,
    accessToken: ctx.accessToken,
  }
}
