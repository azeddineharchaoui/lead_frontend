'use client'

import { useEffect, useState } from 'react'
import { useApi } from '@/lib/api-context'
import { fetchHealth } from '@/lib/api'
import { isApiHealthy, isDatabaseHealthy, type HealthResponse } from '@/lib/types'
import { CheckCircle2, AlertCircle } from 'lucide-react'

export function HealthWidget() {
  const { baseUrl, apiKey } = useApi()
  const [health, setHealth] = useState<HealthResponse | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true)
        setError(null)
        setHealth(await fetchHealth({ baseUrl, apiKey }))
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Échec du healthcheck')
        setHealth(null)
      } finally {
        setLoading(false)
      }
    }

    load()
  }, [baseUrl, apiKey])

  if (loading) {
    return (
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <p className="text-sm text-gray-600">Chargement...</p>
      </div>
    )
  }

  if (error) {
    return (
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <h3 className="font-semibold text-gray-900 mb-4">Santé de l&apos;API</h3>
        <div className="flex items-center gap-2">
          <AlertCircle className="w-5 h-5 text-red-600" />
          <span className="text-sm text-red-700">{error}</span>
        </div>
      </div>
    )
  }

  const apiOk = isApiHealthy(health)
  const dbOk = isDatabaseHealthy(health)

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-6">
      <h3 className="font-semibold text-gray-900 mb-4">Santé de l&apos;API</h3>
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-sm text-gray-600">API</span>
          <div className="flex items-center gap-2">
            {apiOk ? (
              <>
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                <span className="text-sm font-medium text-green-700">Opérationnelle</span>
              </>
            ) : (
              <>
                <div className="w-2 h-2 bg-red-500 rounded-full" />
                <span className="text-sm font-medium text-red-700">Dégradée</span>
              </>
            )}
          </div>
        </div>

        <div className="flex items-center justify-between">
          <span className="text-sm text-gray-600">Base de données</span>
          <div className="flex items-center gap-2">
            {dbOk ? (
              <>
                <CheckCircle2 className="w-4 h-4 text-green-600" />
                <span className="text-sm font-medium text-green-700">OK</span>
              </>
            ) : (
              <>
                <AlertCircle className="w-4 h-4 text-red-600" />
                <span className="text-sm font-medium text-red-700">Problème</span>
              </>
            )}
          </div>
        </div>

        {health?.version && (
          <div className="flex items-center justify-between pt-2 border-t border-gray-100">
            <span className="text-xs text-gray-500">Version / env</span>
            <span className="text-xs font-medium text-gray-700">
              {health.version} ({health.environment})
            </span>
          </div>
        )}
      </div>
    </div>
  )
}
