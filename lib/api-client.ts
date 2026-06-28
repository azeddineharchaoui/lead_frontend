type ApiErrorPayload =
  | {
      detail?:
        | { error?: string; message?: string; detail?: unknown }
        | string
        | Array<{ msg?: string }>
    }
  | { error?: string; message?: string; detail?: unknown }

export interface ApiClientOptions {
  baseUrl: string
  apiKey?: string
}

export async function apiRequest<T>(
  options: ApiClientOptions,
  path: string,
  init: RequestInit = {},
  requiresApiKey = false,
): Promise<T> {
  const headers = new Headers(init.headers)
  headers.set('Accept', 'application/json')

  if (init.body && !headers.has('Content-Type')) {
    headers.set('Content-Type', 'application/json')
  }

  if (requiresApiKey) {
    if (!options.apiKey) {
      throw new Error('Admin API key required')
    }
    headers.set('X-API-Key', options.apiKey)
  }

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
