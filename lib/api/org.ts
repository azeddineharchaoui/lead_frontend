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
import { apiRequest, type ApiClientOptions } from '@/lib/api-client'

// ─────────────────────────────────────────────────────────────────────────
// Organisation
// ─────────────────────────────────────────────────────────────────────────

export async function getOrg(options: ApiClientOptions): Promise<AuthOrganisation> {
  return apiRequest<AuthOrganisation>(options, '/api/v1/org', { method: 'GET' })
}

export async function updateOrg(
  options: ApiClientOptions,
  data: Partial<{ name: string; timezone?: string; webhook_url?: string }>,
): Promise<AuthOrganisation> {
  return apiRequest<AuthOrganisation>(options, '/api/v1/org', {
    method: 'PATCH',
    body: JSON.stringify(data),
  })
}

// ─────────────────────────────────────────────────────────────────────────
// Team Members
// ─────────────────────────────────────────────────────────────────────────

export async function listMembers(options: ApiClientOptions): Promise<AuthUser[]> {
  return apiRequest<AuthUser[]>(options, '/api/v1/org/members', { method: 'GET' })
}

export async function inviteMember(
  options: ApiClientOptions,
  payload: { email: string; full_name: string; role: UserRole },
): Promise<AuthUser> {
  return apiRequest<AuthUser>(options, '/api/v1/org/invite', {
    method: 'POST',
    body: JSON.stringify(payload),
  })
}

export async function removeMember(options: ApiClientOptions, userId: string): Promise<void> {
  return apiRequest(options, `/api/v1/org/members/${userId}`, { method: 'DELETE' })
}

export async function updateMemberRole(
  options: ApiClientOptions,
  userId: string,
  role: UserRole,
): Promise<AuthUser> {
  return apiRequest<AuthUser>(options, `/api/v1/org/members/${userId}/role`, {
    method: 'PATCH',
    body: JSON.stringify({ role }),
  })
}

// ─────────────────────────────────────────────────────────────────────────
// API Keys
// ─────────────────────────────────────────────────────────────────────────

export async function listApiKeys(options: ApiClientOptions): Promise<ApiKeyResponse[]> {
  return apiRequest<ApiKeyResponse[]>(options, '/api/v1/org/api-keys', { method: 'GET' })
}

export async function createApiKey(
  options: ApiClientOptions,
  payload: { name: string; scopes: string[] },
): Promise<ApiKeyCreatedResponse> {
  return apiRequest<ApiKeyCreatedResponse>(options, '/api/v1/org/api-keys', {
    method: 'POST',
    body: JSON.stringify(payload),
  })
}

export async function revokeApiKey(options: ApiClientOptions, keyId: string): Promise<void> {
  return apiRequest(options, `/api/v1/org/api-keys/${keyId}`, { method: 'DELETE' })
}
