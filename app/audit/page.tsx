'use client'

import { useState, useEffect, useCallback } from 'react'
import { useSearchParams } from 'next/navigation'
import { useApiClient } from '@/hooks/useApiClient'
import { listAuditLogs, exportAuditCsv } from '@/lib/api/audit'
import { RoleGuard } from '@/components/auth/RoleGuard'
import { PageHeader } from '@/components/page-header'
import { AuditDataTable } from '@/components/audit/audit-data-table'
import { AuditFilterBar } from '@/components/audit/audit-filter-bar'
import { AuditPagination } from '@/components/audit/audit-pagination'
import { Button } from '@/components/ui/button'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { AlertCircle, Download, Loader2 } from 'lucide-react'
import { toast } from 'sonner'
import type { AuditLogEntry } from '@/lib/types'

export default function AuditPage() {
  const api = useApiClient()
  const searchParams = useSearchParams()
  
  const [entries, setEntries] = useState<AuditLogEntry[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [exporting, setExporting] = useState(false)
  
  const [page, setPage] = useState(1)
  const [pageSize, setPageSize] = useState(20)
  const [totalPages, setTotalPages] = useState(1)
  const [total, setTotal] = useState(0)
  
  const [action, setAction] = useState(searchParams.get('action') || '')
  const [entityType, setEntityType] = useState(searchParams.get('entity_type') || '')
  const [dateFrom, setDateFrom] = useState(searchParams.get('date_from') || '')
  const [dateTo, setDateTo] = useState(searchParams.get('date_to') || '')
  const [entityId, setEntityId] = useState(searchParams.get('entity_id') || '')

  const fetchAuditLogs = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)
      
      const response = await listAuditLogs(api, {
        page,
        page_size: pageSize,
        action: action || undefined,
        entity_type: (entityType as any) || undefined,
        date_from: dateFrom || undefined,
        date_to: dateTo || undefined,
        entity_id: entityId || undefined,
      })
      
      setEntries(response.items)
      setTotal(response.total)
      setTotalPages(response.total_pages)
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Impossible de charger le journal d\'audit'
      setError(message)
      console.error('[v0] Audit fetch error:', err)
      setEntries([])
      setTotal(0)
      setTotalPages(1)
    } finally {
      setLoading(false)
    }
  }, [api, page, pageSize, action, entityType, dateFrom, dateTo, entityId])

  useEffect(() => {
    fetchAuditLogs()
  }, [fetchAuditLogs])

  const handleFilterChange = () => {
    setPage(1)
    fetchAuditLogs()
  }

  const handleExport = async () => {
    try {
      setExporting(true)
      const blob = await exportAuditCsv(api, {
        action: action || undefined,
        entity_type: (entityType as any) || undefined,
        date_from: dateFrom || undefined,
        date_to: dateTo || undefined,
        entity_id: entityId || undefined,
      })
      
      const url = URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      link.download = `audit_${new Date().toISOString().split('T')[0]}.csv`
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      URL.revokeObjectURL(url)
      
      toast.success('Journal exporté')
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Erreur lors de l\'export')
      console.error('[v0] CSV export error:', err)
    } finally {
      setExporting(false)
    }
  }

  return (
    <RoleGuard roles={['owner', 'admin']} fallback={<div className="p-6 text-center text-slate-500">Accès non autorisé</div>}>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <PageHeader
            title="Journal d'audit"
            description={`${total} entrées totales`}
          />
          <Button
            onClick={handleExport}
            disabled={exporting || entries.length === 0}
            variant="outline"
            className="gap-2"
          >
            {exporting && <Loader2 className="w-4 h-4 animate-spin" />}
            <Download className="w-4 h-4" />
            Exporter
          </Button>
        </div>

        {error && (
          <Alert variant="destructive">
            <AlertCircle className="w-4 h-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-4">
          <AuditFilterBar
            action={action}
            onActionChange={(value) => {
              setAction(value)
              handleFilterChange()
            }}
            entityType={entityType}
            onEntityTypeChange={(value) => {
              setEntityType(value)
              handleFilterChange()
            }}
            dateFrom={dateFrom}
            onDateFromChange={(value) => {
              setDateFrom(value)
              handleFilterChange()
            }}
            dateTo={dateTo}
            onDateToChange={(value) => {
              setDateTo(value)
              handleFilterChange()
            }}
            isLoading={loading}
          />
        </div>

        {loading ? (
          <div className="p-12 text-center">
            <Loader2 className="w-8 h-8 animate-spin text-slate-400 mx-auto" />
          </div>
        ) : (
          <>
            <AuditDataTable entries={entries} />
            
            {!loading && (
              <AuditPagination
                page={page}
                pageSize={pageSize}
                totalPages={totalPages}
                total={total}
                onPageChange={setPage}
                onPageSizeChange={setPageSize}
              />
            )}
          </>
        )}
      </div>
    </RoleGuard>
  )
}
