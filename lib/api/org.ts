/**
 * lib/api/org.ts
 * Organisation management — team, API keys, settings
 */

import type {
  ApiKeyResponse,
  ApiKeyCreatedResponse,
  AuthOrganisation,
  AuthUser,
  UserRole,
} from '@/lib/types'

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'

export interface ApiOptions {
  baseUrl?: string
  apiKey?: string
  accessToken?: string
}

// Internal helper
async function backendFetch<T>(
  path: string,
  init: RequestInit = {},
  accessToken?: string | null,
): Promise<T> {
  const headers = new Headers(init.headers)
  headers.set('Content-Type', 'application/json')
  headers.set('Accept', 'application/json')
  if (accessToken) {
    headers.set('Authorization', `Bearer ${accessToken}`)
  }

  const res = await fetch(`${API_BASE}${path}`, { ...init, headers })

  if (!res.ok) {
    const body = await res.json().catch(() => ({}))
    const message =
      typeof body?.detail === 'string'
        ? body.detail
        : body?.detail?.message || `Request failed (${res.status})`
    throw new Error(message)
  }
  if (res.status === 204) return undefined as unknown as T
  return res.json() as Promise<T>
}

// ─────────────────────────────────────────────────────────────────────────
// Organisation
// ─────────────────────────────────────────────────────────────────────────

export async function getOrg(accessToken: string): Promise<AuthOrganisation> {
  return backendFetch<AuthOrganisation>('/api/v1/org', { method: 'GET' }, accessToken)
}

export async function updateOrg(
  accessToken: string,
  data: Partial<{ name: string; settings: object }>,
): Promise<AuthOrganisation> {
  return backendFetch<AuthOrganisation>(
    '/api/v1/org',
    {
      method: 'PATCH',
      body: JSON.stringify(data),
    },
    accessToken,
  )
}

// ─────────────────────────────────────────────────────────────────────────
// Team Members
// ─────────────────────────────────────────────────────────────────────────

export async function listMembers(accessToken: string): Promise<AuthUser[]> {
  return backendFetch<AuthUser[]>('/api/v1/org/members', { method: 'GET' }, accessToken)
}

export async function inviteMember(
  accessToken: string,
  payload: { email: string; full_name: string; role: UserRole },
): Promise<AuthUser> {
  return backendFetch<AuthUser>(
    '/api/v1/org/invite',
    {
      method: 'POST',
      body: JSON.stringify(payload),
    },
    accessToken,
  )
}

export async function removeMember(accessToken: string, userId: string): Promise<void> {
  return backendFetch('/api/v1/org/members/' + userId, { method: 'DELETE' }, accessToken)
}

export async function updateMemberRole(
  accessToken: string,
  userId: string,
  role: UserRole,
): Promise<AuthUser> {
  return backendFetch<AuthUser>(
    `/api/v1/org/members/${userId}/role`,
    {
      method: 'PATCH',
      body: JSON.stringify({ role }),
    },
    accessToken,
  )
}

// ─────────────────────────────────────────────────────────────────────────
// API Keys
// ─────────────────────────────────────────────────────────────────────────

export async function listApiKeys(accessToken: string): Promise<ApiKeyResponse[]> {
  return backendFetch<ApiKeyResponse[]>('/api/v1/org/api-keys', { method: 'GET' }, accessToken)
}

export async function createApiKey(
  accessToken: string,
  payload: { name: string; scopes: string[] },
): Promise<ApiKeyCreatedResponse> {
  return backendFetch<ApiKeyCreatedResponse>(
    '/api/v1/org/api-keys',
    {
      method: 'POST',
      body: JSON.stringify(payload),
    },
    accessToken,
  )
}

export async function revokeApiKey(accessToken: string, keyId: string): Promise<void> {
  return backendFetch('/api/v1/org/api-keys/' + keyId, { method: 'DELETE' }, accessToken)
}
