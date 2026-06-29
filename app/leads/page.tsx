'use client'

import { useState, useEffect, useCallback } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { useApiClient } from '@/hooks/useApiClient'
import { useAuthContext } from '@/lib/auth-context'
import { listLeads, getMyLeads } from '@/lib/api'
import { showApiError } from '@/lib/api-errors'
import { RoleGuard } from '@/components/auth/RoleGuard'
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
  const router = useRouter()
  const searchParams = useSearchParams()
  const { user } = useAuthContext()
  
  const [leads, setLeads] = useState<Lead[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false)

  // State from URL
  const [filters, setFilters] = useState<FilterState>({})
  const [page, setPage] = useState(1)
  const [pageSize, setPageSize] = useState(20)
  const [mineOnly, setMineOnly] = useState(false)
  const [totalPages, setTotalPages] = useState(1)
  const [total, setTotal] = useState(0)

  // Initialize state from URL
  useEffect(() => {
    const status = searchParams.get('status') as LeadStatus | null
    const domain = searchParams.get('domain')
    const pageParam = searchParams.get('page')
    const pageSizeParam = searchParams.get('page_size')
    const mineParam = searchParams.get('mine')

    setFilters({
      status: status || undefined,
      domain: domain || undefined,
    })
    setPage(pageParam ? parseInt(pageParam, 10) : 1)
    setPageSize(pageSizeParam ? parseInt(pageSizeParam, 10) : 20)
    setMineOnly(mineParam === '1')
  }, [searchParams])

  const fetchLeads = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)
      
      let response
      if (mineOnly && user?.id) {
        // Use getMyLeads if available, otherwise use listLeads with assigned_to_user_id filter
        try {
          response = await getMyLeads(api, {
            page,
            page_size: pageSize,
            status: filters.status as LeadStatus | undefined,
            domain: filters.domain,
          })
        } catch {
          // Fallback to listLeads with filter
          response = await listLeads(api, {
            page,
            page_size: pageSize,
            status: filters.status as LeadStatus | undefined,
            domain: filters.domain,
            assigned_to_user_id: user.id,
          })
        }
      } else {
        response = await listLeads(api, {
          page,
          page_size: pageSize,
          status: filters.status as LeadStatus | undefined,
          domain: filters.domain,
        })
      }
      
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
  }, [api, page, pageSize, filters, mineOnly, user?.id])

  useEffect(() => {
    fetchLeads()
  }, [fetchLeads])

  const updateURL = useCallback((newPage?: number, newFilters?: FilterState, newMine?: boolean) => {
    const params = new URLSearchParams()
    
    const filterToUse = newFilters || filters
    const pageToUse = newPage || page
    const mineToUse = newMine !== undefined ? newMine : mineOnly

    if (filterToUse.status) params.set('status', filterToUse.status)
    if (filterToUse.domain) params.set('domain', filterToUse.domain)
    if (pageToUse > 1) params.set('page', String(pageToUse))
    if (pageSize !== 20) params.set('page_size', String(pageSize))
    if (mineToUse) params.set('mine', '1')

    const query = params.toString()
    router.replace(`/leads${query ? '?' + query : ''}`)
  }, [router, filters, page, pageSize, mineOnly])

  const handleFilterChange = (newFilters: FilterState) => {
    setFilters(newFilters)
    updateURL(1, newFilters, mineOnly)
  }

  const handlePageChange = (newPage: number) => {
    setPage(newPage)
    updateURL(newPage)
  }

  const handlePageSizeChange = (newSize: number) => {
    setPageSize(newSize)
    updateURL(1)
  }

  const handleMineToggle = () => {
    const newMine = !mineOnly
    setMineOnly(newMine)
    updateURL(1, filters, newMine)
  }

  const handleLeadCreated = () => {
    updateURL(1, {}, mineOnly)
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
        <RoleGuard roles={['owner', 'admin', 'agent']} fallback={null}>
          <Button
            onClick={() => setIsCreateModalOpen(true)}
            size="lg"
            className="gap-2"
          >
            <Plus className="w-5 h-5" />
            Créer un lead
          </Button>
        </RoleGuard>
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
        <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-4 space-y-4">
          <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
            <LeadsFilterBar
              onFilterChange={handleFilterChange}
              isLoading={loading}
            />
            <RoleGuard roles={['owner', 'admin', 'agent']} fallback={null}>
              <Button
                variant={mineOnly ? 'default' : 'outline'}
                onClick={handleMineToggle}
                className="whitespace-nowrap"
              >
                Mes leads
              </Button>
            </RoleGuard>
          </div>
        </div>
      )}

      {/* Table or skeleton */}
      {loading ? (
        <LeadsTableSkeleton />
      ) : (
        <LeadsDataTable
          leads={leads}
          onLeadDeleted={(leadId) => {
            setLeads(leads.filter(l => l.id !== leadId))
          }}
        />
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
      <RoleGuard roles={['owner', 'admin', 'agent']} fallback={null}>
        <CreateLeadModal
          open={isCreateModalOpen}
          onOpenChange={setIsCreateModalOpen}
          onLeadCreated={handleLeadCreated}
        />
      </RoleGuard>
    </div>
  )
}
