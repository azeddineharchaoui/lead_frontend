'use client'

import { useEffect, useState } from 'react'
import { useApi } from '@/lib/api-context'
import { getStatsOverview, listLeads } from '@/lib/api'
import type { StatsOverviewResponse } from '@/lib/types'
import { MetricCard } from '@/components/metric-card'
import { HealthWidget } from '@/components/health-widget'
import { ScrapingOverview } from '@/components/scraping-overview'
import { RecentLeadsTable } from '@/components/recent-leads-table'
import { DashboardSkeleton } from '@/components/metric-card-skeleton'
import { Users, UserPlus, CheckCircle, TrendingUp } from 'lucide-react'

interface DashboardStats {
  totalLeads: number
  newLeads: number
  qualifiedLeads: number
  conversionRate: number
}

export default function DashboardPage() {
  const api = useApi()
  const [stats, setStats] = useState<DashboardStats>({
    totalLeads: 0,
    newLeads: 0,
    qualifiedLeads: 0,
    conversionRate: 0,
  })
  const [overview, setOverview] = useState<StatsOverviewResponse | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchStats = async () => {
      try {
        setLoading(true)

        if (api.apiKey) {
          const data = await getStatsOverview(api)
          setOverview(data)
          setStats({
            totalLeads: data.leads.total,
            newLeads: data.leads.by_status.nouveau ?? 0,
            qualifiedLeads: data.leads.by_status.qualifie ?? 0,
            conversionRate: data.leads.conversion_rate,
          })
        } else {
          const [totalRes, newRes, qualifiedRes] = await Promise.all([
            listLeads(api, { page: 1, page_size: 1 }),
            listLeads(api, { page: 1, page_size: 1, status: 'nouveau' }),
            listLeads(api, { page: 1, page_size: 1, status: 'qualifie' }),
          ])
          const total = totalRes.total
          const qualified = qualifiedRes.total
          setStats({
            totalLeads: total,
            newLeads: newRes.total,
            qualifiedLeads: qualified,
            conversionRate: total > 0 ? parseFloat(((qualified / total) * 100).toFixed(2)) : 0,
          })
        }
      } catch (error) {
        console.error('Failed to fetch stats:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchStats()
  }, [api])

  if (loading) {
    return <DashboardSkeleton />
  }

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Tableau de bord</h1>
        <p className="text-gray-600 mt-2">Bienvenue sur le CRM Lead.ma</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard label="Leads totaux" value={stats.totalLeads} icon={Users} iconColor="text-blue-600" />
        <MetricCard label="Nouveaux leads" value={stats.newLeads} icon={UserPlus} iconColor="text-blue-500" />
        <MetricCard label="Leads qualifiés" value={stats.qualifiedLeads} icon={CheckCircle} iconColor="text-green-600" />
        <MetricCard
          label="Taux de conversion"
          value={`${stats.conversionRate}%`}
          icon={TrendingUp}
          iconColor="text-emerald-600"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <HealthWidget />
        <ScrapingOverview overview={overview} />
      </div>

      <RecentLeadsTable />
    </div>
  )
}
