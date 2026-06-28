'use client'

import { useEffect, useState } from 'react'
import { useApi } from '@/lib/api-context'
import { listLeads } from '@/lib/api'
import type { Lead } from '@/lib/types'
import { StatusBadge } from './status-badge'
import { AlertCircle } from 'lucide-react'

function formatRelativeTime(dateString: string): string {
  const date = new Date(dateString)
  const now = new Date()
  const seconds = Math.floor((now.getTime() - date.getTime()) / 1000)
  if (seconds < 60) return "À l'instant"
  if (seconds < 3600) return `Il y a ${Math.floor(seconds / 60)}m`
  if (seconds < 86400) return `Il y a ${Math.floor(seconds / 3600)}h`
  return `Il y a ${Math.floor(seconds / 86400)}j`
}

export function RecentLeadsTable() {
  const api = useApi()
  const [leads, setLeads] = useState<Lead[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchLeads = async () => {
      try {
        setLoading(true)
        setError(null)
        const data = await listLeads(api, { page: 1, page_size: 5 })
        setLeads(data.items)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch leads')
        setLeads([])
      } finally {
        setLoading(false)
      }
    }
    fetchLeads()
  }, [api])

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
        <div className="flex items-center gap-2 text-red-700">
          <AlertCircle className="w-5 h-5" />
          <span className="text-sm">{error}</span>
        </div>
      </div>
    )
  }

  if (leads.length === 0) {
    return (
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <p className="text-sm text-gray-500">Aucun lead pour le moment.</p>
      </div>
    )
  }

  return (
    <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
      <div className="px-6 py-4 border-b border-gray-200">
        <h3 className="font-semibold text-gray-900">Leads récents</h3>
      </div>
      <table className="w-full">
        <thead className="bg-gray-50 border-b border-gray-200">
          <tr>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">Téléphone</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">Entreprise</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">Statut</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">Date</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-200">
          {leads.map((lead) => (
            <tr key={lead.id} className="hover:bg-gray-50 transition-colors">
              <td className="px-6 py-4 whitespace-nowrap">
                <a href={`/leads/${lead.id}`} className="text-sm font-medium text-blue-600 hover:text-blue-700">
                  {lead.phone_number}
                </a>
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                <span className="text-sm text-gray-700">{lead.company_name || '-'}</span>
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                <StatusBadge status={lead.status} />
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                {formatRelativeTime(lead.created_at)}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
