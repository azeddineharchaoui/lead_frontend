export interface ApiClientOptions {
  baseUrl: string
  apiKey?: string
  accessToken?: string
}

const DEV_BYPASS_TOKEN = 'dev-bypass-token'

function applyAuthHeaders(headers: Headers, options: ApiClientOptions): void {
  const token = options.accessToken
  if (token && token !== DEV_BYPASS_TOKEN) {
    headers.set('Authorization', `Bearer ${token}`)
  } else if (options.apiKey) {
    headers.set('X-API-Key', options.apiKey)
  }
}

export async function apiRequest<T>(
  options: ApiClientOptions,
  path: string,
  init: RequestInit = {},
): Promise<T> {
  const headers = new Headers(init.headers)
  headers.set('Accept', 'application/json')

  if (init.body && !headers.has('Content-Type')) {
    headers.set('Content-Type', 'application/json')
  }

  applyAuthHeaders(headers, options)

  const response = await fetch(`${options.baseUrl}${path}`, {
    ...init,
    headers,
  })

  if (response.status === 204) {
    return undefined as T
  }

  const contentType = response.headers.get('content-type') || ''
  const body = contentType.includes('application/json')
    ? await response.json()
    : await response.text()

  if (!response.ok) {
    throw normalizeApiError(response.status, body)
  }

  return body as T
}

/**
 * Make an API request with automatic 401 refresh retry.
 * This wrapper calls the auth context's refreshSession() if a 401 occurs,
 * then retries the request once with the new token.
 */
export async function apiRequestWithRetry<T>(
  options: ApiClientOptions,
  path: string,
  init: RequestInit = {},
  onRefresh?: () => Promise<string | null>, // Callback to refresh token (e.g., from useAuth context)
): Promise<T> {
  try {
    return await apiRequest<T>(options, path, init)
  } catch (error) {
    // If 401 and we have a refresh callback, try to refresh and retry once
    if (
      error instanceof Error &&
      (error as Error & { status?: number }).status === 401 &&
      options.accessToken &&
      onRefresh
    ) {
      const newToken = await onRefresh()
      if (newToken) {
        // Retry with new token
        const newOptions = { ...options, accessToken: newToken }
        return apiRequest<T>(newOptions, path, init)
      } else {
        // Refresh failed, redirect to login will be handled by auth context
        throw error
      }
    }
    throw error
  }
}

export function normalizeApiError(status: number, body: any): Error {
  let message = `Request failed (${status})`
  let code = 'request_failed'

  if (Array.isArray(body?.detail)) {
    message = body.detail[0]?.msg || message
    code = 'validation_error'
  } else if (typeof body?.detail === 'string') {
    message = body.detail
    code = status === 401 ? 'unauthorized' : 'api_error'
  } else if (body?.detail?.message) {
    message = body.detail.message
    code = body.detail.error || code
  } else if (body?.message) {
    message = body.message
    code = body.error || code
  }

  const error = new Error(message) as Error & {
    status?: number
    code?: string
    raw?: unknown
  }
  error.status = status
  error.code = code
  error.raw = body
  return error
}

export function buildAuthHeaderRecord(options: ApiClientOptions): Record<string, string> {
  const headers = new Headers()
  applyAuthHeaders(headers, options)
  const record: Record<string, string> = {}
  headers.forEach((value, key) => {
    record[key] = value
  })
  return record
}
