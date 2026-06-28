'use client'

import { Clock, Target } from 'lucide-react'
import type { StatsOverviewResponse } from '@/lib/types'

interface ScrapingOverviewProps {
  overview?: StatsOverviewResponse | null
}

function formatRelativeTime(dateString: string | null): string {
  if (!dateString) return 'Jamais'
  const date = new Date(dateString)
  const now = new Date()
  const seconds = Math.floor((now.getTime() - date.getTime()) / 1000)
  if (seconds < 60) return "À l'instant"
  if (seconds < 3600) return `Il y a ${Math.floor(seconds / 60)}m`
  if (seconds < 86400) return `Il y a ${Math.floor(seconds / 3600)}h`
  return `Il y a ${Math.floor(seconds / 86400)}j`
}

export function ScrapingOverview({ overview }: ScrapingOverviewProps) {
  const activeTargets = overview?.targets.active ?? 0
  const totalTargets = overview?.targets.total ?? 0
  const lastScrape = overview?.scraping.last_activity
  const topTargets = overview?.scraping.top_targets ?? []

  // Find max for bar chart scaling
  const maxLeads = Math.max(...topTargets.map((t) => t.leads_count), 1)

  return (
    <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-6">
      <h3 className="font-semibold text-slate-900 dark:text-white mb-4">Aperçu du scraping</h3>

      <div className="space-y-5">
        {/* Stats row */}
        <div className="flex gap-4">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1">
              <Target className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
              <span className="text-xs font-medium text-slate-600 dark:text-slate-400 uppercase tracking-wider">
                Cibles actives
              </span>
            </div>
            <p className="text-2xl font-bold text-slate-900 dark:text-white font-mono tabular-nums">
              {activeTargets}/{totalTargets}
            </p>
          </div>
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1">
              <Clock className="w-4 h-4 text-amber-600 dark:text-amber-400" />
              <span className="text-xs font-medium text-slate-600 dark:text-slate-400 uppercase tracking-wider">
                Dernier scraping
              </span>
            </div>
            <p className="text-sm font-medium text-slate-900 dark:text-white">{formatRelativeTime(lastScrape ?? null)}</p>
          </div>
        </div>

        {/* Bar chart */}
        {topTargets.length > 0 && (
          <div className="pt-4 border-t border-slate-200 dark:border-slate-700">
            <p className="text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wider mb-3">
              Top cibles par leads
            </p>
            <div className="space-y-3">
              {topTargets.slice(0, 5).map((target, idx) => {
                const percentage = (target.leads_count / maxLeads) * 100
                const statusColor = target.is_active
                  ? 'bg-indigo-600 dark:bg-indigo-500'
                  : 'bg-slate-400 dark:bg-slate-600'

                return (
                  <div key={target.domain} className="group cursor-pointer">
                    <div className="flex items-end justify-between gap-2 mb-1">
                      <div className="flex-1 min-w-0">
                        <p className="text-sm text-slate-700 dark:text-slate-300 truncate font-medium">
                          {target.domain}
                        </p>
                      </div>
                      <p className="text-xs font-semibold text-slate-600 dark:text-slate-400 font-mono whitespace-nowrap">
                        {target.leads_count}
                      </p>
                    </div>
                    <div className="h-2 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                      <div
                        className={`h-full ${statusColor} transition-all duration-300 rounded-full`}
                        style={{ width: `${Math.max(percentage, 5)}%` }}
                      />
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        )}

        {!overview && (
          <p className="text-xs text-slate-500 dark:text-slate-400 pt-2">
            Configurez une clé API pour les statistiques complètes de scraping.
          </p>
        )}
      </div>
    </div>
  )
}
