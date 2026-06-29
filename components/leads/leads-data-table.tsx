'use client'

import Link from 'next/link'
import { useState } from 'react'
import { useApiClient } from '@/hooks/useApiClient'
import { deleteLead } from '@/lib/api/leads'
import { RoleGuard } from '@/components/auth/RoleGuard'
import type { Lead } from '@/lib/types'
import { StatusBadge } from '@/components/status-badge'
import { Button } from '@/components/ui/button'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import { formatPhoneDisplay, formatRelativeTime, truncate, copyToClipboard } from '@/lib/format'
import { Copy, ArrowRight, Phone, Building2, ArrowUpDown, ArrowUp, ArrowDown, Trash2 } from 'lucide-react'
import { toast } from 'sonner'

type SortKey = 'created_at' | 'status' | 'company_name' | 'phone_number'
type SortOrder = 'asc' | 'desc'

interface LeadsDataTableProps {
  leads: Lead[]
  onPhoneClick?: (phone: string) => void
  onLeadDeleted?: (leadId: string) => void
}

export function LeadsDataTable({ leads, onPhoneClick, onLeadDeleted }: LeadsDataTableProps) {
  const api = useApiClient()
  const { user } = useAuth()
  const [copiedId, setCopiedId] = useState<string | null>(null)
  const [sortKey, setSortKey] = useState<SortKey>('created_at')
  const [sortOrder, setSortOrder] = useState<SortOrder>('desc')
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null)
  const [isDeleting, setIsDeleting] = useState(false)

  const toggleSort = (key: SortKey) => {
    if (sortKey === key) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')
    } else {
      setSortKey(key)
      setSortOrder('asc')
    }
  }

  const sortLeads = (leadsToSort: Lead[]) => {
    return [...leadsToSort].sort((a, b) => {
      let aVal: any = a[sortKey as keyof Lead]
      let bVal: any = b[sortKey as keyof Lead]

      // Handle null/undefined
      if (aVal == null && bVal == null) return 0
      if (aVal == null) return sortOrder === 'asc' ? 1 : -1
      if (bVal == null) return sortOrder === 'asc' ? -1 : 1

      // String comparison (case-insensitive)
      if (typeof aVal === 'string' && typeof bVal === 'string') {
        aVal = aVal.toLowerCase()
        bVal = bVal.toLowerCase()
      }

      const comparison = aVal < bVal ? -1 : aVal > bVal ? 1 : 0
      return sortOrder === 'asc' ? comparison : -comparison
    })
  }

  const getSortIcon = (key: SortKey) => {
    if (sortKey !== key) {
      return <ArrowUpDown className="w-4 h-4 text-slate-400" />
    }
    return sortOrder === 'asc' ? (
      <ArrowUp className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
    ) : (
      <ArrowDown className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
    )
  }

  const sortedLeads = sortLeads(leads)

  const handleDelete = async (leadId: string) => {
    try {
      setIsDeleting(true)
      await deleteLead(api, leadId)
      toast.success('Lead supprimé')
      setDeleteConfirmId(null)
      onLeadDeleted?.(leadId)
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Impossible de supprimer le lead')
    } finally {
      setIsDeleting(false)
    }
  }

  const handleCopyPhone = async (phone: string, leadId: string) => {
    try {
      await copyToClipboard(phone)
      setCopiedId(leadId)
      toast.success('Numéro copié')
      setTimeout(() => setCopiedId(null), 2000)
    } catch {
      toast.error('Impossible de copier')
    }
  }

  if (leads.length === 0) {
    return (
      <div className="space-y-4">
        <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-12 text-center">
          <Phone className="w-12 h-12 text-slate-300 dark:text-slate-700 mx-auto mb-3" />
          <h3 className="font-semibold text-slate-900 dark:text-white mb-1">Aucun lead</h3>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Aucun lead ne correspond à vos filtres
          </p>
        </div>

        {/* Delete confirmation dialog even when no leads */}
        <AlertDialog open={deleteConfirmId !== null} onOpenChange={(open) => !open && setDeleteConfirmId(null)}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Supprimer le lead</AlertDialogTitle>
              <AlertDialogDescription>
                Cette action est irréversible. Le lead sera supprimé définitivement.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <div className="flex gap-2 justify-end">
              <AlertDialogCancel disabled={isDeleting}>Annuler</AlertDialogCancel>
              <AlertDialogAction
                disabled={isDeleting}
                onClick={() => deleteConfirmId && handleDelete(deleteConfirmId)}
                className="bg-red-600 hover:bg-red-700"
              >
                {isDeleting ? 'Suppression...' : 'Supprimer'}
              </AlertDialogAction>
            </div>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    )
  }

  return (
    <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-slate-50 dark:bg-slate-800/50 border-b border-slate-200 dark:border-slate-800">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
                <button
                  onClick={() => toggleSort('phone_number')}
                  className="flex items-center gap-2 hover:text-slate-900 dark:hover:text-white transition-colors"
                >
                  Téléphone
                  {getSortIcon('phone_number')}
                </button>
              </th>
              <th className="px-6 py-3 text-left text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
                <button
                  onClick={() => toggleSort('company_name')}
                  className="flex items-center gap-2 hover:text-slate-900 dark:hover:text-white transition-colors"
                >
                  Entreprise
                  {getSortIcon('company_name')}
                </button>
              </th>
              <th className="px-6 py-3 text-left text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
                Domaine
              </th>
              <th className="px-6 py-3 text-left text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
                Assigné à
              </th>
              <th className="px-6 py-3 text-left text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
                <button
                  onClick={() => toggleSort('status')}
                  className="flex items-center gap-2 hover:text-slate-900 dark:hover:text-white transition-colors"
                >
                  Statut
                  {getSortIcon('status')}
                </button>
              </th>
              <th className="px-6 py-3 text-center text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
                Score
              </th>
              <th className="px-6 py-3 text-center text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
                Appels
              </th>
              <th className="px-6 py-3 text-left text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
                <button
                  onClick={() => toggleSort('created_at')}
                  className="flex items-center gap-2 hover:text-slate-900 dark:hover:text-white transition-colors"
                >
                  Créé
                  {getSortIcon('created_at')}
                </button>
              </th>
              <th className="px-6 py-3 text-right text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
                Action
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
            {sortedLeads.map((lead) => (
              <tr
                key={lead.id}
                className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors duration-150 group"
              >
                {/* Phone */}
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center gap-2">
                    <Phone className="w-4 h-4 text-slate-400 flex-shrink-0" />
                    <div className="flex flex-col gap-1">
                      <code className="text-sm font-mono text-slate-900 dark:text-white">
                        {formatPhoneDisplay(lead.phone_number)}
                      </code>
                      <button
                        onClick={() => handleCopyPhone(lead.phone_number, lead.id)}
                        className="opacity-0 group-hover:opacity-100 transition-opacity text-xs text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 dark:hover:text-indigo-300 inline-flex items-center gap-1"
                      >
                        <Copy className="w-3 h-3" />
                        {copiedId === lead.id ? 'Copié' : 'Copier'}
                      </button>
                    </div>
                  </div>
                </td>

                {/* Company */}
                <td className="px-6 py-4 whitespace-nowrap">
                  {lead.company_name ? (
                    <div className="flex items-center gap-2">
                      <Building2 className="w-4 h-4 text-slate-400 flex-shrink-0" />
                      <span className="text-sm text-slate-900 dark:text-white font-medium">
                        {truncate(lead.company_name, 25)}
                      </span>
                    </div>
                  ) : (
                    <span className="text-sm text-slate-500 dark:text-slate-400">-</span>
                  )}
                </td>

                {/* Domain */}
                <td className="px-6 py-4 whitespace-nowrap">
                  {lead.website_domain ? (
                    <a
                      href={`https://${lead.website_domain}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-sm text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 dark:hover:text-indigo-300 truncate"
                    >
                      {truncate(lead.website_domain, 20)}
                    </a>
                  ) : (
                    <span className="text-sm text-slate-500 dark:text-slate-400">-</span>
                  )}
                </td>

                {/* Assignee */}
                <td className="px-6 py-4 whitespace-nowrap">
                  {lead.assigned_to ? (
                    <span className="text-sm text-slate-900 dark:text-white font-medium">
                      {truncate(lead.assigned_to, 20)}
                    </span>
                  ) : (
                    <span className="text-sm text-slate-500 dark:text-slate-400">-</span>
                  )}
                </td>

                {/* Status */}
                <td className="px-6 py-4 whitespace-nowrap">
                  <StatusBadge status={lead.status} />
                </td>

                {/* Score */}
                <td className="px-6 py-4 whitespace-nowrap text-center">
                  {lead.qualification_score !== null && lead.qualification_score !== undefined ? (
                    <div className="flex items-center gap-2 justify-center">
                      <div className="w-12 h-1.5 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-indigo-600 dark:bg-indigo-500 rounded-full"
                          style={{
                            width: `${Math.min(lead.qualification_score, 100)}%`,
                          }}
                        />
                      </div>
                      <span className="text-xs font-semibold text-slate-700 dark:text-slate-300 tabular-nums w-6">
                        {lead.qualification_score}%
                      </span>
                    </div>
                  ) : (
                    <span className="text-sm text-slate-500 dark:text-slate-400">-</span>
                  )}
                </td>

                {/* Call Attempts */}
                <td className="px-6 py-4 whitespace-nowrap text-center">
                  <span className="text-sm font-semibold text-slate-900 dark:text-white tabular-nums">
                    {lead.call_attempts}
                  </span>
                </td>

                {/* Created */}
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className="text-sm text-slate-600 dark:text-slate-400">
                    {formatRelativeTime(lead.created_at)}
                  </span>
                </td>

                {/* Action */}
                <td className="px-6 py-4 whitespace-nowrap text-right">
                  <div className="flex items-center justify-end gap-2">
                    <Link href={`/leads/${lead.id}`}>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="gap-1.5 text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 dark:hover:text-indigo-300"
                      >
                        Voir
                        <ArrowRight className="w-4 h-4" />
                      </Button>
                    </Link>

                    <RoleGuard roles={['owner', 'admin']} fallback={null}>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setDeleteConfirmId(lead.id)}
                        className="text-red-600 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </RoleGuard>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Delete confirmation dialog */}
      <AlertDialog open={deleteConfirmId !== null} onOpenChange={(open) => !open && setDeleteConfirmId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Supprimer le lead</AlertDialogTitle>
            <AlertDialogDescription>
              Cette action est irréversible. Le lead sera supprimé définitivement.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <div className="flex gap-2 justify-end">
            <AlertDialogCancel disabled={isDeleting}>Annuler</AlertDialogCancel>
            <AlertDialogAction
              disabled={isDeleting}
              onClick={() => deleteConfirmId && handleDelete(deleteConfirmId)}
              className="bg-red-600 hover:bg-red-700"
            >
              {isDeleting ? 'Suppression...' : 'Supprimer'}
            </AlertDialogAction>
          </div>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
