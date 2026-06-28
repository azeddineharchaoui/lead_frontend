'use client'

import { useEffect, useState } from 'react'
import { useApi } from '@/lib/api-context'
import { fetchHealth } from '@/lib/api'
import { isApiHealthy, isDatabaseHealthy, type HealthResponse } from '@/lib/types'
import { CheckCircle2, AlertCircle, AlertTriangle } from 'lucide-react'

export function HealthWidget() {
  const { baseUrl, apiKey } = useApi()
  const [health, setHealth] = useState<HealthResponse | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [lastRefresh, setLastRefresh] = useState<Date | null>(null)

  const load = async () => {
    try {
      setLoading(true)
      setError(null)
      const data = await fetchHealth({ baseUrl, apiKey })
      setHealth(data)
      setLastRefresh(new Date())
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Échec du healthcheck')
      setHealth(null)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    load()
    // Auto-refresh every 30 seconds
    const interval = setInterval(load, 30000)
    return () => clearInterval(interval)
  }, [baseUrl, apiKey])

  const apiOk = health && isApiHealthy(health)
  const dbOk = health && isDatabaseHealthy(health)
  const isDegraded = health && (!apiOk || !dbOk)

  if (loading && !health) {
    return (
      <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-6">
        <p className="text-sm text-slate-600 dark:text-slate-400">Vérification en cours...</p>
      </div>
    )
  }

  if (error && !health) {
    return (
      <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-6">
        <h3 className="font-semibold text-slate-900 dark:text-white mb-4">État du service</h3>
        <div className="flex items-start gap-3 bg-rose-50 dark:bg-rose-950/20 p-3 rounded-lg border border-rose-200 dark:border-rose-800">
          <AlertCircle className="w-5 h-5 text-rose-600 dark:text-rose-400 flex-shrink-0 mt-0.5" />
          <span className="text-sm text-rose-700 dark:text-rose-200">{error}</span>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-semibold text-slate-900 dark:text-white">État du service</h3>
        {isDegraded && (
          <span className="inline-flex items-center gap-1 px-2 py-1 bg-amber-100 dark:bg-amber-950/30 text-amber-800 dark:text-amber-200 text-xs font-semibold rounded-full">
            <AlertTriangle className="w-3 h-3" />
            Dégradé
          </span>
        )}
      </div>

      {isDegraded && (
        <div className="mb-4 p-3 bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-800 rounded-lg">
          <p className="text-xs text-amber-800 dark:text-amber-200">
            Service dégradé — certaines fonctions peuvent être lentes
          </p>
        </div>
      )}

      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-sm text-slate-600 dark:text-slate-400">API</span>
          <div className="flex items-center gap-2">
            {apiOk ? (
              <>
                <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
                <span className="text-sm font-medium text-emerald-700 dark:text-emerald-400">Opérationnelle</span>
              </>
            ) : (
              <>
                <div className="w-2 h-2 bg-rose-500 rounded-full" />
                <span className="text-sm font-medium text-rose-700 dark:text-rose-400">Problème</span>
              </>
            )}
          </div>
        </div>

        <div className="flex items-center justify-between">
          <span className="text-sm text-slate-600 dark:text-slate-400">Base de données</span>
          <div className="flex items-center gap-2">
            {dbOk ? (
              <>
                <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                <span className="text-sm font-medium text-emerald-700 dark:text-emerald-400">OK</span>
              </>
            ) : (
              <>
                <AlertCircle className="w-4 h-4 text-rose-600 dark:text-rose-400" />
                <span className="text-sm font-medium text-rose-700 dark:text-rose-400">Problème</span>
              </>
            )}
          </div>
        </div>

        {health?.version && (
          <div className="flex items-center justify-between pt-3 border-t border-slate-200 dark:border-slate-700">
            <span className="text-xs text-slate-500 dark:text-slate-400">Version</span>
            <span className="text-xs font-mono text-slate-700 dark:text-slate-300">
              {health.version} ({health.environment})
            </span>
          </div>
        )}

        {lastRefresh && (
          <div className="text-xs text-slate-400 dark:text-slate-500 pt-2 border-t border-slate-200 dark:border-slate-700">
            Mis à jour {lastRefresh.toLocaleTimeString('fr-FR')}
          </div>
        )}
      </div>
    </div>
  )
}
