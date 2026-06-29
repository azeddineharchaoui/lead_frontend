'use client'

import { Button } from '@/components/ui/button'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { ChevronLeft, ChevronRight } from 'lucide-react'

interface AuditPaginationProps {
  page: number
  pageSize: number
  totalPages: number
  total: number
  onPageChange: (page: number) => void
  onPageSizeChange: (size: number) => void
}

export function AuditPagination({
  page,
  pageSize,
  totalPages,
  total,
  onPageChange,
  onPageSizeChange,
}: AuditPaginationProps) {
  const start = (page - 1) * pageSize + 1
  const end = Math.min(page * pageSize, total)

  return (
    <div className="flex flex-col sm:flex-row items-center justify-between gap-4 py-4">
      <div className="text-sm text-slate-600 dark:text-slate-400">
        Affichage {start} à {end} sur {total} entrées
      </div>

      <div className="flex items-center gap-2">
        <Button
          variant="outline"
          size="sm"
          onClick={() => onPageChange(page - 1)}
          disabled={page === 1}
          className="gap-1"
        >
          <ChevronLeft className="w-4 h-4" />
          Précédent
        </Button>

        <div className="flex items-center gap-2">
          <span className="text-sm text-slate-600 dark:text-slate-400">Page</span>
          <input
            type="number"
            min="1"
            max={totalPages}
            value={page}
            onChange={(e) => {
              const value = parseInt(e.target.value, 10)
              if (!isNaN(value) && value >= 1 && value <= totalPages) {
                onPageChange(value)
              }
            }}
            className="w-12 px-2 py-1 border border-slate-200 dark:border-slate-700 rounded text-center text-sm"
          />
          <span className="text-sm text-slate-600 dark:text-slate-400">sur {totalPages}</span>
        </div>

        <Button
          variant="outline"
          size="sm"
          onClick={() => onPageChange(page + 1)}
          disabled={page === totalPages}
          className="gap-1"
        >
          Suivant
          <ChevronRight className="w-4 h-4" />
        </Button>
      </div>

      <div className="flex items-center gap-2">
        <span className="text-sm text-slate-600 dark:text-slate-400">Entrées par page</span>
        <Select value={String(pageSize)} onValueChange={(v) => onPageSizeChange(parseInt(v, 10))}>
          <SelectTrigger className="w-20">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="10">10</SelectItem>
            <SelectItem value="20">20</SelectItem>
            <SelectItem value="50">50</SelectItem>
            <SelectItem value="100">100</SelectItem>
          </SelectContent>
        </Select>
      </div>
    </div>
  )
}
