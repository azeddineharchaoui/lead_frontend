'use client'

import { useEffect, useState } from 'react'
import { useAuth } from './useAuth'
import { useApi } from '@/lib/api-context'
import { fetchHealth, getStatsOverview, listLeads, listPendingLeads } from '@/lib/api'
import type { HealthResponse, StatsOverviewResponse, PaginatedResponse, Lead } from '@/lib/types'

export interface DashboardData {
  health: HealthResponse | null
  stats: StatsOverviewResponse | null
  recentLeads: Lead[]
  pendingCount: number
  loading: boolean
  error: string | null
  refetch: () => Promise<void>
}

export function useDashboardData(): DashboardData {
  const { accessToken } = useAuth()
  const api = useApi()
  const [health, setHealth] = useState<HealthResponse | null>(null)
  const [stats, setStats] = useState<StatsOverviewResponse | null>(null)
  const [recentLeads, setRecentLeads] = useState<Lead[]>([])
  const [pendingCount, setPendingCount] = useState(0)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchData = async () => {
    try {
      setLoading(true)
      setError(null)

      // Parallel fetch: health, stats overview, recent leads, pending count
      const [healthRes, statsRes, leadsRes, pendingRes] = await Promise.all([
        fetchHealth({ baseUrl: api.baseUrl, apiKey: api.apiKey }).catch(() => null),
        getStatsOverview(api).catch(() => null),
        listLeads(api, { page: 1, page_size: 10 }).catch(() => ({ items: [], total: 0 } as PaginatedResponse<Lead>)),
        listPendingLeads(api, 200).catch(() => []),
      ])

      setHealth(healthRes)
      setStats(statsRes)
      setRecentLeads(leadsRes?.items || [])
      setPendingCount(pendingRes?.length || 0)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur lors du chargement du tableau de bord')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchData()
  }, [accessToken, api])

  return {
    health,
    stats,
    recentLeads,
    pendingCount,
    loading,
    error,
    refetch: fetchData,
  }
}
