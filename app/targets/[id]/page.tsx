'use client'

import { useParams } from 'next/navigation'
import { useEffect, useState } from 'react'
import { getTarget, listTargetLeads } from '@/lib/api/targets'
import { useApiClient } from '@/hooks/useApiClient'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { ChevronLeft, Loader2, AlertCircle } from 'lucide-react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import type { ScrapingTarget, Lead, PaginatedResponse } from '@/lib/types'

export default function TargetDetailPage() {
  const params = useParams()
  const router = useRouter()
  const targetId = params.id as string
  const apiClient = useApiClient()

  const [target, setTarget] = useState<ScrapingTarget | null>(null)
  const [leads, setLeads] = useState<PaginatedResponse<Lead> | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [page, setPage] = useState(1)

  useEffect(() => {
    const loadData = async () => {
      setLoading(true)
      setError(null)

      try {
        const [targetData, leadsData] = await Promise.all([
          getTarget({ baseUrl: apiClient.baseUrl, apiKey: apiClient.apiKey }, targetId),
          listTargetLeads({ baseUrl: apiClient.baseUrl, apiKey: apiClient.apiKey }, targetId, page, 20),
        ])

        setTarget(targetData)
        setLeads(leadsData)
      } catch (err) {
        setError((err as Error).message || 'Failed to load target details')
      } finally {
        setLoading(false)
      }
    }

    if (targetId) {
      loadData()
    }
  }, [targetId, page, apiClient.baseUrl, apiClient.apiKey])

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="w-8 h-8 animate-spin text-indigo-600" />
      </div>
    )
  }

  if (error || !target) {
    return (
      <div className="rounded-lg bg-red-50 dark:bg-red-950/30 p-4 border border-red-200 dark:border-red-800 flex gap-3">
        <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
        <div>
          <h3 className="font-semibold text-red-800 dark:text-red-200">Error loading target</h3>
          <p className="text-sm text-red-700 dark:text-red-300">{error || 'Target not found'}</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Back button */}
      <Link href="/targets">
        <Button variant="ghost" className="gap-2">
          <ChevronLeft className="w-4 h-4" />
          Back to Targets
        </Button>
      </Link>

      {/* Target info */}
      <Card>
        <CardHeader>
          <CardTitle>{target.domain}</CardTitle>
          <CardDescription>
            {target.is_active ? 'Active' : 'Inactive'} • Last scraped:{' '}
            {target.last_scraped_at
              ? new Date(target.last_scraped_at).toLocaleDateString()
              : 'Never'}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div>
              <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase">
                Leads Found
              </p>
              <p className="text-2xl font-bold">{target.leads_count ?? 0}</p>
            </div>
            <div>
              <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase">
                Status
              </p>
              <p className="text-2xl font-bold capitalize">{target.last_status}</p>
            </div>
            <div>
              <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase">
                Created
              </p>
              <p className="text-sm">{new Date(target.created_at).toLocaleDateString()}</p>
            </div>
            <div>
              <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase">
                Success Rate
              </p>
              <p className="text-2xl font-bold">
                {target.success_rate_percent ?? 0}%
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Leads list */}
      <Card>
        <CardHeader>
          <CardTitle>Leads ({leads?.total ?? 0})</CardTitle>
          <CardDescription>All leads found for this target</CardDescription>
        </CardHeader>
        <CardContent>
          {leads && leads.items.length > 0 ? (
            <div className="space-y-4">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="border-b border-slate-200 dark:border-slate-800">
                    <tr>
                      <th className="text-left py-2 px-3 font-semibold">Phone</th>
                      <th className="text-left py-2 px-3 font-semibold">Company</th>
                      <th className="text-left py-2 px-3 font-semibold">Status</th>
                      <th className="text-left py-2 px-3 font-semibold">Attempts</th>
                    </tr>
                  </thead>
                  <tbody>
                    {leads.items.map((lead) => (
                      <tr
                        key={lead.id}
                        className="border-b border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-900/50"
                      >
                        <td className="py-2 px-3">{lead.phone_number}</td>
                        <td className="py-2 px-3">{lead.company_name || '-'}</td>
                        <td className="py-2 px-3 capitalize">{lead.status}</td>
                        <td className="py-2 px-3">{lead.call_attempts}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Pagination */}
              {leads.pages > 1 && (
                <div className="flex items-center justify-between pt-4">
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    Page {leads.page} of {leads.pages}
                  </p>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setPage(Math.max(1, page - 1))}
                      disabled={page === 1}
                    >
                      Previous
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setPage(Math.min(leads.pages, page + 1))}
                      disabled={page >= leads.pages}
                    >
                      Next
                    </Button>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="text-center py-8">
              <p className="text-slate-500 dark:text-slate-400">
                No leads found for this target yet
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
