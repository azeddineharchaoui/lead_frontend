'use client'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Globe, Users, RotateCcw } from 'lucide-react'
import type { StatsOverviewResponse } from '@/lib/types'

interface ScrapingStatsCardsProps {
  stats: StatsOverviewResponse
}

export function ScrapingStatsCards({ stats }: ScrapingStatsCardsProps) {
  const stats_data = [
    {
      title: 'Active Targets',
      value: stats.active_targets_count ?? 0,
      description: 'Currently scraping',
      icon: Globe,
      color: 'bg-blue-600',
    },
    {
      title: 'Total Leads',
      value: stats.total_leads_count ?? 0,
      description: 'Collected so far',
      icon: Users,
      color: 'bg-green-600',
    },
    {
      title: 'Last Scrape',
      value: stats.last_scrape_at ? new Date(stats.last_scrape_at).toLocaleDateString() : 'Never',
      description: 'Last job completed',
      icon: RotateCcw,
      color: 'bg-indigo-600',
    },
  ]

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      {stats_data.map((stat) => {
        const Icon = stat.icon
        return (
          <Card key={stat.title}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{stat.title}</CardTitle>
              <div className={`${stat.color} p-2 rounded-lg`}>
                <Icon className="w-4 h-4 text-white" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stat.value}</div>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                {stat.description}
              </p>
            </CardContent>
          </Card>
        )
      })}
    </div>
  )
}
