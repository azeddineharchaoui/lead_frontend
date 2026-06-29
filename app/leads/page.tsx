'use client'

import { useState, useEffect, useCallback } from 'react'
import { useApiClient } from '@/hooks/useApiClient'
import { listLeads } from '@/lib/api'
import { showApiError } from '@/lib/api-errors'
import type { Lead, LeadStatus } from '@/lib/types'
import { PageHeader } from '@/components/page-header'
import { LeadsFilterBar, type FilterState } from '@/components/leads/leads-filter-bar'
import { LeadsDataTable } from '@/components/leads/leads-data-table'
import { LeadsPagination } from '@/components/leads/leads-pagination'
import { LeadsTableSkeleton } from '@/components/leads-table-skeleton'
import { CreateLeadModal } from '@/components/create-lead-modal'
import { Button } from '@/components/ui/button'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Plus, AlertCircle } from 'lucide-react'

export default function LeadsPage() {
  const api = useApiClient()
  const [leads, setLeads] = useState<Lead[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false)

  // Filters
  const [filters, setFilters] = useState<FilterState>({})

  // Pagination
  const [page, setPage] = useState(1)
  const [pageSize, setPageSize] = useState(20)
  const [totalPages, setTotalPages] = useState(1)
  const [total, setTotal] = useState(0)

  const fetchLeads = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)
      const response = await listLeads(api, {
        page,
        page_size: pageSize,
        status: filters.status as LeadStatus | undefined,
        domain: filters.domain,
      })
      setLeads(response.items)
      setTotal(response.total)
      setTotalPages(response.total_pages)
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Impossible de charger les leads'
      setError(message)
      console.error('[v0] Leads fetch error:', err)
      setLeads([])
      setTotal(0)
      setTotalPages(1)
    } finally {
      setLoading(false)
    }
  }, [api, page, pageSize, filters])

  useEffect(() => {
    fetchLeads()
  }, [fetchLeads])

  const handleFilterChange = (newFilters: FilterState) => {
    setFilters(newFilters)
    setPage(1) // Reset to first page when filters change
  }

  const handlePageChange = (newPage: number) => {
    setPage(newPage)
  }

  const handlePageSizeChange = (newSize: number) => {
    setPageSize(newSize)
    setPage(1) // Reset to first page when page size changes
  }

  const handleLeadCreated = () => {
    setPage(1)
    setFilters({})
    fetchLeads()
  }

  return (
    <div className="space-y-6">
      {/* Header with create button */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <PageHeader
          title="Leads"
          description={`${total} leads totaux`}
        />
        <Button
          onClick={() => setIsCreateModalOpen(true)}
          size="lg"
          className="gap-2"
        >
          <Plus className="w-5 h-5" />
          Créer un lead
        </Button>
      </div>

      {/* Error state */}
      {error && (
        <Alert variant="destructive">
          <AlertCircle className="w-4 h-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* Filters */}
      {!loading && (
        <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-4">
          <LeadsFilterBar
            onFilterChange={handleFilterChange}
            isLoading={loading}
          />
        </div>
      )}

      {/* Table or skeleton */}
      {loading ? (
        <LeadsTableSkeleton />
      ) : (
        <LeadsDataTable leads={leads} />
      )}

      {/* Pagination */}
      {!loading && (
        <LeadsPagination
          page={page}
          pageSize={pageSize}
          totalPages={totalPages}
          total={total}
          onPageChange={handlePageChange}
          onPageSizeChange={handlePageSizeChange}
          isLoading={loading}
        />
      )}

      {/* Create Lead Modal */}
      <CreateLeadModal
        open={isCreateModalOpen}
        onOpenChange={setIsCreateModalOpen}
        onLeadCreated={handleLeadCreated}
      />
    </div>
  )
}
