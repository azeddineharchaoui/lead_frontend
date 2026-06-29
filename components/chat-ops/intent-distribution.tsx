'use client'

import { useEffect, useState } from 'react'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts'
import { useApiClient } from '@/hooks/useApiClient'
import { listLeads } from '@/lib/api'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Loader2 } from 'lucide-react'

interface IntentData {
  intent: string
  count: number
}

export function IntentDistribution() {
  const api = useApiClient()
  const [data, setData] = useState<IntentData[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const loadIntentData = async () => {
      try {
        setLoading(true)

        // This is a simplified implementation - aggregates from available lead data
        // In a real scenario, we'd have an intent distribution endpoint
        const leadsRes = await listLeads(api as any, { page: 1, page_size: 100 })
        const allLeads = leadsRes?.items || []

        // Count intents (this would come from session data in full implementation)
        const intentCounts: Record<string, number> = {}

        // Mock intent distribution based on status for demo
        allLeads.forEach((lead) => {
          const intent = lead.status === 'qualifie' ? 'Interest' :
                         lead.status === 'en_cours' ? 'Pricing' :
                         lead.status === 'rejete' ? 'Objection' :
                         'Unknown'

          intentCounts[intent] = (intentCounts[intent] || 0) + 1
        })

        const chartData = Object.entries(intentCounts)
          .map(([intent, count]) => ({
            intent,
            count,
          }))
          .sort((a, b) => b.count - a.count)

        setData(chartData)
      } catch (err) {
        console.error('Failed to load intent data:', err)
      } finally {
        setLoading(false)
      }
    }

    loadIntentData()
  }, [api])

  if (loading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center h-64">
          <div className="flex items-center gap-2">
            <Loader2 className="w-5 h-5 animate-spin" />
            Chargement des intentions...
          </div>
        </CardContent>
      </Card>
    )
  }

  if (data.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Distribution des intentions</CardTitle>
          <CardDescription>Intentions détectées dans les sessions</CardDescription>
        </CardHeader>
        <CardContent className="flex items-center justify-center h-64 text-slate-500">
          Aucune donnée disponible
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Distribution des intentions</CardTitle>
        <CardDescription>Intentions détectées dans les sessions</CardDescription>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={data}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="intent" />
            <YAxis />
            <Tooltip
              contentStyle={{
                backgroundColor: '#1e293b',
                border: '1px solid #475569',
                borderRadius: '8px',
              }}
              labelStyle={{ color: '#f1f5f9' }}
              formatter={(value) => `${value} sessions`}
            />
            <Bar dataKey="count" fill="#8b5cf6" name="Sessions" />
          </BarChart>
        </ResponsiveContainer>

        {/* Top intents list */}
        <div className="mt-6 space-y-3">
          <h4 className="font-semibold text-slate-900 dark:text-white">Top intentions</h4>
          {data.map((item, index) => (
            <div key={item.intent} className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <span className="text-sm font-medium text-slate-600 dark:text-slate-400">
                  {index + 1}.
                </span>
                <span className="font-medium text-slate-900 dark:text-white">
                  {item.intent}
                </span>
              </div>
              <span className="text-sm font-semibold text-slate-900 dark:text-white">
                {item.count}
              </span>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
