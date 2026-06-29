'use client'

import { PieChart, Pie, Cell, Legend, Tooltip, ResponsiveContainer } from 'recharts'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import type { StatsOverviewResponse } from '@/lib/types'

interface LeadStatusChartProps {
  stats: StatsOverviewResponse | null
}

export function LeadStatusChart({ stats }: LeadStatusChartProps) {
  if (!stats) return null

  const chartData = [
    { name: 'Nouveau', value: stats.leads.by_status.nouveau, fill: '#64748b' },
    { name: 'En cours', value: stats.leads.by_status.en_cours, fill: '#3b82f6' },
    { name: 'Qualifié', value: stats.leads.by_status.qualifie, fill: '#22c55e' },
    { name: 'Rejeté', value: stats.leads.by_status.rejete, fill: '#ef4444' },
  ]

  const total = chartData.reduce((sum, item) => sum + item.value, 0)

  return (
    <Card>
      <CardHeader>
        <CardTitle>Distribution des leads</CardTitle>
        <CardDescription>Statut des leads ({total} total)</CardDescription>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <PieChart>
            <Pie
              data={chartData}
              cx="50%"
              cy="50%"
              innerRadius={60}
              outerRadius={100}
              paddingAngle={2}
              dataKey="value"
            >
              {chartData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.fill} />
              ))}
            </Pie>
            <Tooltip
              contentStyle={{
                backgroundColor: '#1e293b',
                border: '1px solid #475569',
                borderRadius: '8px',
              }}
              labelStyle={{ color: '#f1f5f9' }}
              formatter={(value) => `${value} leads`}
            />
            <Legend />
          </PieChart>
        </ResponsiveContainer>

        {/* Stats breakdown */}
        <div className="grid grid-cols-2 gap-4 mt-6">
          {chartData.map((item) => (
            <div key={item.name} className="flex items-center gap-3">
              <div
                className="w-3 h-3 rounded-full"
                style={{ backgroundColor: item.fill }}
              />
              <div className="flex-1 min-w-0">
                <p className="text-xs text-slate-600 dark:text-slate-400">{item.name}</p>
                <p className="font-semibold text-slate-900 dark:text-white">{item.value}</p>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
