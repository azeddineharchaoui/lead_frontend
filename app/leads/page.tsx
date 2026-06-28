'use client'

import { useState, useEffect, useCallback } from 'react'
import Link from 'next/link'
import { useApi } from '@/lib/api-context'
import { listLeads } from '@/lib/api'
import { showApiError } from '@/lib/api-errors'
import type { Lead, LeadStatus } from '@/lib/types'
import { StatusBadge } from '@/components/status-badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Alert, AlertDescription } from '@/components/ui/alert'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { LeadsTableSkeleton } from '@/components/leads-table-skeleton'
import { EmptyState } from '@/components/empty-state'
import { CreateLeadModal } from '@/components/create-lead-modal'
import { ChevronLeft, ChevronRight, Eye, Inbox, Plus } from 'lucide-react'

const STATUS_OPTIONS: { label: string; value: string }[] = [
  { label: 'Tous', value: 'all' },
  { label: 'Nouveau', value: 'nouveau' },
  { label: 'En cours', value: 'en_cours' },
  { label: 'Qualifié', value: 'qualifie' },
  { label: 'Rejeté', value: 'rejete' },
]

export default function LeadsPage() {
  const api = useApi()
  const [leads, setLeads] = useState<Lead[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false)
  const [searchDomain, setSearchDomain] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [pageSize, setPageSize] = useState('10')
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [total, setTotal] = useState(0)

  const fetchLeads = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)
      const response = await listLeads(api, {
        page,
        page_size: Number(pageSize),
        domain: searchDomain || undefined,
        status: statusFilter !== 'all' ? (statusFilter as LeadStatus) : undefined,
      })
      setLeads(response.items)
      setTotal(response.total)
      setTotalPages(response.total_pages)
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Impossible de charger les leads'
      setError(message)
      showApiError(err)
      setLeads([])
      setTotal(0)
      setTotalPages(1)
    } finally {
      setLoading(false)
    }
  }, [api, page, pageSize, searchDomain, statusFilter])

  useEffect(() => {
    fetchLeads()
  }, [fetchLeads])

  const handleResetFilters = () => {
    setSearchDomain('')
    setStatusFilter('all')
    setPage(1)
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Leads</h1>
          <p className="text-gray-600 mt-2">GET /api/v1/leads</p>
        </div>
        <Button onClick={() => setIsCreateModalOpen(true)} size="lg" className="gap-2">
          <Plus className="w-5 h-5" />
          Ajouter un lead
        </Button>
      </div>

      {error && (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <div className="bg-white rounded-lg shadow p-4 space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Domaine</label>
            <Input
              placeholder="Rechercher par domaine..."
              value={searchDomain}
              onChange={(e) => {
                setSearchDomain(e.target.value)
                setPage(1)
              }}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Statut</label>
            <Select
              value={statusFilter}
              onValueChange={(v) => {
                if (v) {
                  setStatusFilter(v)
                  setPage(1)
                }
              }}
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Tous les statuts" />
              </SelectTrigger>
              <SelectContent>
                {STATUS_OPTIONS.map((opt) => (
                  <SelectItem key={opt.value} value={opt.value}>
                    {opt.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Par page</label>
            <Select
              value={pageSize}
              onValueChange={(v) => {
                if (v) {
                  setPageSize(v)
                  setPage(1)
                }
              }}
            >
              <SelectTrigger className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {['10', '25', '50'].map((size) => (
                  <SelectItem key={size} value={size}>
                    {size}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="flex items-end">
            <Button variant="outline" onClick={handleResetFilters} className="w-full">
              Réinitialiser
            </Button>
          </div>
        </div>
      </div>

      {loading ? (
        <LeadsTableSkeleton />
      ) : leads.length === 0 ? (
        <div className="bg-white rounded-lg shadow">
          <EmptyState
            icon={Inbox}
            title="Aucun lead trouvé"
            description="Aucun lead ne correspond à vos critères."
          />
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase">Téléphone</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase">Entreprise</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase">Statut</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase">Tentatives</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {leads.map((lead) => (
                  <tr key={lead.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <a href={`tel:${lead.phone_number}`} className="text-blue-600 hover:underline font-medium">
                        {lead.phone_number}
                      </a>
                    </td>
                    <td className="px-6 py-4">
                      <p className="font-medium text-gray-900">{lead.company_name || '-'}</p>
                      <p className="text-sm text-gray-500">{lead.website_domain || '-'}</p>
                    </td>
                    <td className="px-6 py-4">
                      <StatusBadge status={lead.status} />
                    </td>
                    <td className="px-6 py-4 text-center">{lead.call_attempts}</td>
                    <td className="px-6 py-4">
                      <Link href={`/leads/${lead.id}`}>
                        <Button variant="ghost" size="sm" className="gap-2">
                          <Eye className="w-4 h-4" />
                          Voir
                        </Button>
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      <div className="flex items-center justify-between">
        <div className="text-sm text-gray-600">
          Page {page} sur {totalPages} ({total} total)
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page === 1}>
            <ChevronLeft className="w-4 h-4" />
            Précédent
          </Button>
          <Button variant="outline" size="sm" onClick={() => setPage((p) => Math.min(totalPages, p + 1))} disabled={page === totalPages}>
            Suivant
            <ChevronRight className="w-4 h-4" />
          </Button>
        </div>
      </div>

      <CreateLeadModal
        open={isCreateModalOpen}
        onOpenChange={setIsCreateModalOpen}
        onLeadCreated={() => {
          setPage(1)
          fetchLeads()
        }}
      />
    </div>
  )
}
