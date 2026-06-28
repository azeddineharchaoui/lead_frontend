'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useApi } from '@/lib/api-context'
import { fetchHealth } from '@/lib/api'
import { isApiHealthy } from '@/lib/types'
import { AlertCircle, CheckCircle2, AlertTriangle } from 'lucide-react'

export function Header() {
  const { baseUrl, apiKey } = useApi()
  const [healthy, setHealthy] = useState<boolean | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const check = async () => {
      try {
        setLoading(true)
        const data = await fetchHealth({ baseUrl, apiKey })
        setHealthy(isApiHealthy(data))
      } catch {
        setHealthy(false)
      } finally {
        setLoading(false)
      }
    }

    check()
    const interval = setInterval(check, 10000)
    return () => clearInterval(interval)
  }, [baseUrl, apiKey])

  return (
    <header className="bg-white border-b border-gray-200 sticky top-0 z-40">
      <div className="px-6 py-4 flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 px-3 py-1 bg-slate-100 rounded-full text-xs font-medium text-slate-700">
            <span className="w-2 h-2 bg-slate-400 rounded-full"></span>
            Lead.ma CRM
          </div>
        </div>

        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            {!loading && (
              <>
                {healthy ? (
                  <>
                    <CheckCircle2 className="w-4 h-4 text-green-600" />
                    <span className="text-sm text-green-700">API connectée</span>
                  </>
                ) : (
                  <>
                    <AlertCircle className="w-4 h-4 text-red-600" />
                    <span className="text-sm text-red-700">Hors ligne</span>
                  </>
                )}
              </>
            )}
          </div>

          {!apiKey && (
            <div className="flex items-center gap-2 px-3 py-1.5 bg-yellow-50 border border-yellow-200 rounded text-xs font-medium text-yellow-800">
              <AlertTriangle className="w-4 h-4" />
              Clé API requise
            </div>
          )}
        </div>
      </div>

      {!apiKey && (
        <div className="px-6 py-3 bg-yellow-50 border-t border-yellow-200 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 text-yellow-600" />
            <span className="text-sm text-yellow-800">
              Clé API admin requise pour les cibles de scraping (voir docs-01-api-reference.md)
            </span>
          </div>
          <Link
            href="/settings"
            className="text-sm font-medium text-yellow-900 hover:text-yellow-700 underline"
          >
            Paramètres
          </Link>
        </div>
      )}
    </header>
  )
}
