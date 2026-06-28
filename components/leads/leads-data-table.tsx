'use client'

import Link from 'next/link'
import { useState } from 'react'
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
import { formatPhoneDisplay, formatRelativeTime, truncate, copyToClipboard } from '@/lib/format'
import { Copy, ArrowRight, Phone, Building2 } from 'lucide-react'
import { toast } from 'sonner'

interface LeadsDataTableProps {
  leads: Lead[]
  onPhoneClick?: (phone: string) => void
}

export function LeadsDataTable({ leads, onPhoneClick }: LeadsDataTableProps) {
  const [copiedId, setCopiedId] = useState<string | null>(null)

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
      <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-12 text-center">
        <Phone className="w-12 h-12 text-slate-300 dark:text-slate-700 mx-auto mb-3" />
        <h3 className="font-semibold text-slate-900 dark:text-white mb-1">Aucun lead</h3>
        <p className="text-sm text-slate-500 dark:text-slate-400">
          Aucun lead ne correspond à vos filtres
        </p>
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
                Téléphone
              </th>
              <th className="px-6 py-3 text-left text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
                Entreprise
              </th>
              <th className="px-6 py-3 text-left text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
                Domaine
              </th>
              <th className="px-6 py-3 text-left text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
                Statut
              </th>
              <th className="px-6 py-3 text-center text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
                Score
              </th>
              <th className="px-6 py-3 text-center text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
                Appels
              </th>
              <th className="px-6 py-3 text-left text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
                Créé
              </th>
              <th className="px-6 py-3 text-right text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
                Action
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
            {leads.map((lead) => (
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
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
