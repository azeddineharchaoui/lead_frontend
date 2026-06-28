'use client'

import { useState, useCallback } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { X } from 'lucide-react'
import type { LeadStatus } from '@/lib/types'

interface LeadsFilterBarProps {
  onFilterChange: (filters: FilterState) => void
  isLoading?: boolean
}

export interface FilterState {
  status?: LeadStatus
  domain?: string
  assigned_to?: string
}

const STATUS_CHIPS = [
  { label: 'Tous', value: undefined },
  { label: 'Nouveau', value: 'nouveau' as LeadStatus },
  { label: 'En cours', value: 'en_cours' as LeadStatus },
  { label: 'Qualifié', value: 'qualifie' as LeadStatus },
  { label: 'Rejeté', value: 'rejete' as LeadStatus },
]

export function LeadsFilterBar({
  onFilterChange,
  isLoading = false,
}: LeadsFilterBarProps) {
  const [filters, setFilters] = useState<FilterState>({})
  const [localDomain, setLocalDomain] = useState('')
  const [localAssignedTo, setLocalAssignedTo] = useState('')

  const hasActiveFilters = filters.status || filters.domain || filters.assigned_to

  const handleStatusChange = useCallback(
    (status: LeadStatus | undefined) => {
      const newFilters = { ...filters, status }
      setFilters(newFilters)
      onFilterChange(newFilters)
    },
    [filters, onFilterChange],
  )

  const handleDomainChange = useCallback(
    (value: string) => {
      setLocalDomain(value)
      // Debounce domain search by updating after user stops typing
    },
    [],
  )

  const handleDomainBlur = useCallback(() => {
    const newFilters = { ...filters, domain: localDomain || undefined }
    setFilters(newFilters)
    onFilterChange(newFilters)
  }, [filters, localDomain, onFilterChange])

  const handleDomainKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      const newFilters = { ...filters, domain: localDomain || undefined }
      setFilters(newFilters)
      onFilterChange(newFilters)
    }
  }

  const handleAssignedToChange = useCallback(
    (value: string) => {
      const newFilters = { ...filters, assigned_to: value || undefined }
      setFilters(newFilters)
      setLocalAssignedTo(value)
      onFilterChange(newFilters)
    },
    [filters, onFilterChange],
  )

  const handleClearFilters = useCallback(() => {
    const emptyFilters: FilterState = {}
    setFilters(emptyFilters)
    setLocalDomain('')
    setLocalAssignedTo('')
    onFilterChange(emptyFilters)
  }, [onFilterChange])

  return (
    <div className="space-y-4">
      {/* Status chips */}
      <div className="flex flex-wrap gap-2">
        {STATUS_CHIPS.map((chip) => (
          <button
            key={chip.label}
            onClick={() => handleStatusChange(chip.value)}
            disabled={isLoading}
            className={`px-3 py-1.5 rounded-full text-sm font-medium transition-all ${
              filters.status === chip.value
                ? 'bg-indigo-600 dark:bg-indigo-500 text-white'
                : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
            } disabled:opacity-50`}
          >
            {chip.label}
          </button>
        ))}
      </div>

      {/* Search and filter inputs */}
      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-3">
        <div>
          <Input
            placeholder="Domaine (ex: annuaire.ma)"
            value={localDomain}
            onChange={(e) => handleDomainChange(e.target.value)}
            onBlur={handleDomainBlur}
            onKeyDown={handleDomainKeyDown}
            disabled={isLoading}
            className="w-full"
          />
        </div>

        <div>
          <Select
            value={localAssignedTo}
            onValueChange={handleAssignedToChange}
            disabled={isLoading}
          >
            <SelectTrigger>
              <SelectValue placeholder="Assigné à..." />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="">Tous</SelectItem>
              <SelectItem value="agent_1">Agent 1</SelectItem>
              <SelectItem value="agent_2">Agent 2</SelectItem>
              <SelectItem value="agent_3">Agent 3</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {hasActiveFilters && (
          <div className="flex items-end">
            <Button
              variant="outline"
              size="sm"
              onClick={handleClearFilters}
              disabled={isLoading}
              className="w-full gap-2"
            >
              <X className="w-4 h-4" />
              Réinitialiser
            </Button>
          </div>
        )}
      </div>

      {/* Active filters display */}
      {hasActiveFilters && (
        <div className="flex flex-wrap gap-2 pt-2">
          {filters.status && (
            <div className="inline-flex items-center gap-1 px-3 py-1 bg-indigo-50 dark:bg-indigo-950/20 border border-indigo-200 dark:border-indigo-800 rounded-full text-sm text-indigo-700 dark:text-indigo-300">
              <span>Statut: {filters.status}</span>
              <button
                onClick={() => handleStatusChange(undefined)}
                className="ml-1 hover:text-indigo-900 dark:hover:text-indigo-200"
              >
                ✕
              </button>
            </div>
          )}
          {filters.domain && (
            <div className="inline-flex items-center gap-1 px-3 py-1 bg-indigo-50 dark:bg-indigo-950/20 border border-indigo-200 dark:border-indigo-800 rounded-full text-sm text-indigo-700 dark:text-indigo-300">
              <span>Domaine: {filters.domain}</span>
              <button
                onClick={() => {
                  const newFilters = { ...filters, domain: undefined }
                  setFilters(newFilters)
                  setLocalDomain('')
                  onFilterChange(newFilters)
                }}
                className="ml-1 hover:text-indigo-900 dark:hover:text-indigo-200"
              >
                ✕
              </button>
            </div>
          )}
          {filters.assigned_to && (
            <div className="inline-flex items-center gap-1 px-3 py-1 bg-indigo-50 dark:bg-indigo-950/20 border border-indigo-200 dark:border-indigo-800 rounded-full text-sm text-indigo-700 dark:text-indigo-300">
              <span>Assigné: {filters.assigned_to}</span>
              <button
                onClick={() => handleAssignedToChange('')}
                className="ml-1 hover:text-indigo-900 dark:hover:text-indigo-200"
              >
                ✕
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
