'use client'

import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import type { StatsOverviewResponse } from '@/lib/types'

interface TopTargetsChartProps {
  stats: StatsOverviewResponse | null
}

export function TopTargetsChart({ stats }: TopTargetsChartProps) {
  if (!stats || !stats.scraping.top_targets || stats.scraping.top_targets.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Meilleures cibles</CardTitle>
          <CardDescription>Cibles avec le plus de leads</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center h-[300px] text-slate-500">
            Aucune données disponible
          </div>
        </CardContent>
      </Card>
    )
  }

  const chartData = stats.scraping.top_targets.slice(0, 10).map((target) => ({
    name: target.domain.replace('https://', '').replace('www.', '').substring(0, 20),
    domain: target.domain,
    leads: target.leads_count,
  }))

  return (
    <Card>
      <CardHeader>
        <CardTitle>Meilleures cibles</CardTitle>
        <CardDescription>Cibles avec le plus de leads ({chartData.length})</CardDescription>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart
            data={chartData}
            layout="vertical"
            margin={{ top: 5, right: 30, left: 200, bottom: 5 }}
          >
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis type="number" />
            <YAxis dataKey="name" type="category" width={190} tick={{ fontSize: 12 }} />
            <Tooltip
              contentStyle={{
                backgroundColor: '#1e293b',
                border: '1px solid #475569',
                borderRadius: '8px',
              }}
              labelStyle={{ color: '#f1f5f9' }}
              formatter={(value) => `${value} leads`}
            />
            <Bar dataKey="leads" fill="#3b82f6" />
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  )
}
