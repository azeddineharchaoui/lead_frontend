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

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-6">
      <h3 className="font-semibold text-gray-900 mb-4">Aperçu du scraping</h3>
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Target className="w-5 h-5 text-blue-600" />
            <div>
              <p className="text-sm text-gray-600">Cibles actives</p>
              <p className="text-lg font-semibold text-gray-900">
                {activeTargets} / {totalTargets}
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center justify-between pt-2 border-t border-gray-100">
          <div className="flex items-center gap-3">
            <Clock className="w-5 h-5 text-amber-600" />
            <div>
              <p className="text-sm text-gray-600">Dernier scraping</p>
              <p className="text-sm font-medium text-gray-900">{formatRelativeTime(lastScrape ?? null)}</p>
            </div>
          </div>
        </div>

        {topTargets.length > 0 && (
          <div className="pt-2 border-t border-gray-100">
            <p className="text-sm text-gray-600 mb-2">Top cibles</p>
            <ul className="space-y-1">
              {topTargets.slice(0, 5).map((t) => (
                <li key={t.domain} className="flex justify-between text-sm">
                  <span className="text-gray-900">{t.domain}</span>
                  <span className="text-gray-600">{t.leads_count} leads</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {!overview && (
          <p className="text-xs text-gray-500 pt-2 border-t border-gray-100">
            Configurez une clé API pour les statistiques complètes de scraping.
          </p>
        )}
      </div>
    </div>
  )
}
