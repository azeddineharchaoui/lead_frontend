import type { AuthOrganisation, AuthUser } from './types'

/** True when running `npm run dev` — auth is bypassed for local testing only. */
export function isDevAuthBypass(): boolean {
  return process.env.NODE_ENV === 'development'
}

export const DEV_MOCK_ACCESS_TOKEN = 'dev-bypass-token'

const NOW = '2024-01-01T00:00:00.000Z'

export const DEV_MOCK_USER: AuthUser = {
  id: '00000000-0000-0000-0000-000000000099',
  email: 'dev@lead.ma',
  full_name: 'Dev Owner',
  role: 'owner',
  is_active: true,
  is_verified: true,
  organisation_id: '00000000-0000-0000-0000-000000000001',
  avatar_url: null,
  last_login_at: NOW,
  created_at: NOW,
}

export const DEV_MOCK_ORG: AuthOrganisation = {
  id: '00000000-0000-0000-0000-000000000001',
  name: 'Dev Organisation',
  slug: 'dev-org',
  is_active: true,
  trial_ends_at: null,
  settings: {},
  created_at: NOW,
}
