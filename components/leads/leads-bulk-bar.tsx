'use client'

import { Button } from '@/components/ui/button'
import { X } from 'lucide-react'

interface LeadsBulkBarProps {
  selectedCount: number
  onChangeStatus: () => void
  onCancel: () => void
}

export function LeadsBulkBar({ selectedCount, onChangeStatus, onCancel }: LeadsBulkBarProps) {
  return (
    <div className="fixed bottom-4 left-4 right-4 sm:left-auto sm:right-4 sm:w-auto bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg shadow-lg p-4 flex items-center gap-4">
      <div className="flex-1">
        <p className="text-sm font-medium text-slate-900 dark:text-white">
          {selectedCount} lead{selectedCount > 1 ? 's' : ''} sélectionné{selectedCount > 1 ? 's' : ''}
        </p>
      </div>
      
      <div className="flex items-center gap-2">
        <Button
          size="sm"
          onClick={onChangeStatus}
          className="bg-indigo-600 hover:bg-indigo-700 text-white"
        >
          Changer statut
        </Button>
        <Button
          size="sm"
          variant="outline"
          onClick={onCancel}
          className="gap-2"
        >
          <X className="w-4 h-4" />
          Annuler
        </Button>
      </div>
    </div>
  )
}
