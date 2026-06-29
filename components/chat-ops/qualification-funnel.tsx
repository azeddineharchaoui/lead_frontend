'use client'

import { useEffect, useState } from 'react'
import { useApiClient } from '@/hooks/useApiClient'
import { listLeads } from '@/lib/api'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Loader2 } from 'lucide-react'
import type { PaginatedResponse, Lead } from '@/lib/types'

interface FunnelStage {
  name: string
  count: number
  color: string
}

export function QualificationFunnel() {
  const api = useApiClient()
  const [stages, setStages] = useState<FunnelStage[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const loadFunnelData = async () => {
      try {
        setLoading(true)

        // Get all leads to count statuses
        const leadsRes = await listLeads(api as any, { page: 1, page_size: 1000 })
        const allLeads = leadsRes?.items || []

        // Count by status
        const nouveau = allLeads.filter((l) => l.status === 'nouveau').length
        const enCours = allLeads.filter((l) => l.status === 'en_cours').length
        const qualifie = allLeads.filter((l) => l.status === 'qualifie').length
        const rejete = allLeads.filter((l) => l.status === 'rejete').length

        const total = allLeads.length

        const funnelStages: FunnelStage[] = [
          {
            name: 'Sessions créées',
            count: total,
            color: 'bg-slate-500',
          },
          {
            name: 'En cours',
            count: enCours,
            color: 'bg-blue-500',
          },
          {
            name: 'Qualifiés',
            count: qualifie,
            color: 'bg-green-500',
          },
        ]

        setStages(funnelStages)
      } catch (err) {
        console.error('Failed to load funnel data:', err)
      } finally {
        setLoading(false)
      }
    }

    loadFunnelData()
  }, [api])

  if (loading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center h-64">
          <div className="flex items-center gap-2">
            <Loader2 className="w-5 h-5 animate-spin" />
            Chargement du funnel...
          </div>
        </CardContent>
      </Card>
    )
  }

  const maxValue = Math.max(...stages.map((s) => s.count), 1)

  return (
    <Card>
      <CardHeader>
        <CardTitle>Funnel de qualification</CardTitle>
        <CardDescription>Conversion des leads à travers les étapes</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6 py-6">
        {stages.map((stage, index) => {
          const percentage =
            index === 0 ? 100 : Math.round((stage.count / stages[0].count) * 100)
          const width = (stage.count / maxValue) * 100

          return (
            <div key={stage.name}>
              <div className="flex items-center justify-between mb-2">
                <span className="font-medium text-slate-900 dark:text-white">
                  {stage.name}
                </span>
                <div className="flex items-baseline gap-2">
                  <span className="text-2xl font-bold text-slate-900 dark:text-white">
                    {stage.count}
                  </span>
                  <span className="text-sm text-slate-600 dark:text-slate-400">
                    {percentage}%
                  </span>
                </div>
              </div>

              <div className="bg-slate-200 dark:bg-slate-800 rounded-full h-8 overflow-hidden">
                <div
                  className={`${stage.color} h-full transition-all duration-500 flex items-center justify-end pr-3`}
                  style={{ width: `${width}%` }}
                >
                  {width > 20 && (
                    <span className="text-xs font-semibold text-white truncate">
                      {((stage.count / maxValue) * 100).toFixed(0)}%
                    </span>
                  )}
                </div>
              </div>

              {index < stages.length - 1 && (
                <div className="mt-4 text-xs text-slate-500 dark:text-slate-400">
                  {stages[index + 1].count > 0 &&
                    `Conversion: ${Math.round(
                      (stages[index + 1].count / stage.count) * 100
                    )}%`}
                </div>
              )}
            </div>
          )
        })}

        {/* Summary */}
        <div className="pt-4 mt-4 border-t border-slate-200 dark:border-slate-800">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-xs text-slate-600 dark:text-slate-400">Taux de conversion global</p>
              <p className="text-2xl font-bold text-slate-900 dark:text-white">
                {stages[0].count > 0
                  ? Math.round((stages[stages.length - 1].count / stages[0].count) * 100)
                  : 0}
                %
              </p>
            </div>
            <div>
              <p className="text-xs text-slate-600 dark:text-slate-400">Taux de rejet</p>
              <p className="text-2xl font-bold text-red-600">
                {stages[0].count > 0
                  ? Math.round(((stages[0].count - stages[stages.length - 1].count) / stages[0].count) * 100)
                  : 0}
                %
              </p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
