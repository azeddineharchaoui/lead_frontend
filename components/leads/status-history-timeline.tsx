'use client'

import { useEffect, useState } from 'react'
import type { HistoryEntry } from '@/lib/types'
import { useApi } from '@/lib/api-context'
import { getLeadHistory } from '@/lib/api'
import { AlertCircle, Loader2 } from 'lucide-react'
import { formatRelativeTime } from '@/lib/format'

const STATUS_COLORS: Record<string, string> = {
  nouveau: 'bg-slate-400',
  en_cours: 'bg-blue-500',
  qualifie: 'bg-emerald-500',
  rejete: 'bg-rose-500',
}

const STATUS_LABELS: Record<string, string> = {
  nouveau: 'Nouveau',
  en_cours: 'En cours',
  qualifie: 'Qualifié',
  rejete: 'Rejeté',
}

interface StatusHistoryTimelineProps {
  leadId: string
}

export function StatusHistoryTimeline({ leadId }: StatusHistoryTimelineProps) {
  const api = useApi()
  const [entries, setEntries] = useState<HistoryEntry[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true)
        setError(null)
        const history = await getLeadHistory(api, leadId)
        setEntries(history.sort((a, b) => 
          new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
        ))
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Erreur de chargement')
      } finally {
        setLoading(false)
      }
    }

    load()
  }, [api, leadId])

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <Loader2 className="w-5 h-5 animate-spin text-slate-400" />
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex items-start gap-3 p-4 bg-rose-50 dark:bg-rose-950/20 border border-rose-200 dark:border-rose-800 rounded-lg">
        <AlertCircle className="w-5 h-5 text-rose-600 dark:text-rose-400 flex-shrink-0 mt-0.5" />
        <p className="text-sm text-rose-700 dark:text-rose-200">{error}</p>
      </div>
    )
  }

  if (entries.length === 0) {
    return (
      <div className="py-8 text-center text-slate-500 dark:text-slate-400">
        <p className="text-sm">Aucun historique de statut</p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {entries.map((entry, index) => {
        const fromStatusLabel = entry.from_status 
          ? STATUS_LABELS[entry.from_status] || entry.from_status
          : 'Création'
        const toStatusLabel = STATUS_LABELS[entry.to_status] || entry.to_status
        const dotColor = STATUS_COLORS[entry.to_status] || 'bg-slate-400'
        const isLast = index === entries.length - 1

        return (
          <div key={entry.id} className="relative flex gap-4">
            {/* Timeline line */}
            <div className="flex flex-col items-center">
              <div className={`w-3 h-3 rounded-full ${dotColor}`} />
              {!isLast && (
                <div className="w-0.5 h-16 bg-slate-200 dark:bg-slate-700 mt-2" />
              )}
            </div>

            {/* Content */}
            <div className="pb-8 flex-1">
              <div className="bg-slate-50 dark:bg-slate-800/50 rounded-lg p-3 border border-slate-200 dark:border-slate-700">
                <div className="flex items-start justify-between gap-2 mb-1">
                  <p className="text-sm font-medium text-slate-900 dark:text-white">
                    {fromStatusLabel} → {toStatusLabel}
                  </p>
                  <span className="text-xs text-slate-500 dark:text-slate-400 whitespace-nowrap">
                    {formatRelativeTime(entry.created_at)}
                  </span>
                </div>

                {entry.changed_by && (
                  <p className="text-xs text-slate-600 dark:text-slate-400">
                    Par {entry.changed_by}
                  </p>
                )}

                {entry.reason && (
                  <p className="text-sm text-slate-700 dark:text-slate-300 mt-2 italic">
                    "{entry.reason}"
                  </p>
                )}

                {entry.extra_data?.qualification_score !== undefined && (
                  <div className="mt-2 flex items-center gap-2">
                    <span className="text-xs text-slate-600 dark:text-slate-400">Score:</span>
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-indigo-100 dark:bg-indigo-950/30 text-indigo-700 dark:text-indigo-300 text-xs font-semibold rounded-full">
                      {entry.extra_data.qualification_score}%
                    </span>
                  </div>
                )}
              </div>
            </div>
          </div>
        )
      })}
    </div>
  )
}
