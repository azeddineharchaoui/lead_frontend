import type { ApiOptions } from './client-options'

export interface PlanResponse {
  id: string
  name: string
  max_leads: number
  max_targets: number
  max_agents: number
  price_monthly_usd: string
  created_at: string
}

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'

/**
 * Fetch available plans — public endpoint, no auth required
 */
export async function listPlans(): Promise<PlanResponse[]> {
  const res = await fetch(`${API_BASE}/api/v1/plans`, {
    method: 'GET',
    headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
  })

  if (!res.ok) {
    const body = await res.json().catch(() => ({}))
    const message =
      typeof body?.detail === 'string'
        ? body.detail
        : body?.detail?.message || `Request failed (${res.status})`
    throw new Error(message)
  }

  return res.json() as Promise<PlanResponse[]>
}
