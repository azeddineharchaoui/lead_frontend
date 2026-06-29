'use client'

import Link from 'next/link'
import { useState } from 'react'
import type { AuditLogEntry } from '@/lib/types'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { ChevronDown, ChevronUp } from 'lucide-react'
import { formatRelativeTime } from '@/lib/format'

interface AuditDataTableProps {
  entries: AuditLogEntry[]
}

const ACTION_COLORS: Record<string, string> = {
  create: 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-800 dark:text-emerald-300 border-emerald-300 dark:border-emerald-700',
  update: 'bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300 border-blue-300 dark:border-blue-700',
  delete: 'bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-300 border-red-300 dark:border-red-700',
  status_change: 'bg-amber-100 dark:bg-amber-900/30 text-amber-800 dark:text-amber-300 border-amber-300 dark:border-amber-700',
  crm_push: 'bg-violet-100 dark:bg-violet-900/30 text-violet-800 dark:text-violet-300 border-violet-300 dark:border-violet-700',
}

export function AuditDataTable({ entries }: AuditDataTableProps) {
  const [expandedId, setExpandedId] = useState<string | null>(null)

  const getActionLabel = (action: string) => {
    const labels: Record<string, string> = {
      create: 'Créé',
      update: 'Mis à jour',
      delete: 'Supprimé',
      status_change: 'Changement de statut',
      crm_push: 'Envoi CRM',
    }
    return labels[action] || action
  }

  const getEntityTypeLabel = (type: string) => {
    const labels: Record<string, string> = {
      lead: 'Lead',
      target: 'Cible',
      session: 'Session',
      user: 'Utilisateur',
      api_key: 'Clé API',
    }
    return labels[type] || type
  }

  if (entries.length === 0) {
    return (
      <Card className="p-12 text-center">
        <p className="text-slate-500 dark:text-slate-400">Aucune entrée d&apos;audit</p>
      </Card>
    )
  }

  return (
    <div className="space-y-2">
      {entries.map((entry) => (
        <div key={entry.id} className="bg-white dark:bg-slate-900 rounded-lg border border-slate-200 dark:border-slate-800">
          <button
            onClick={() => setExpandedId(expandedId === entry.id ? null : entry.id)}
            className="w-full px-4 py-3 flex items-center gap-4 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors"
          >
            <div className="flex-1 flex items-center gap-4 text-left">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <time className="text-sm font-medium text-slate-900 dark:text-white whitespace-nowrap">
                    {new Date(entry.created_at).toLocaleDateString('fr-FR')} {new Date(entry.created_at).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}
                  </time>
                  <Badge variant="outline" className={ACTION_COLORS[entry.action] || ''}>
                    {getActionLabel(entry.action)}
                  </Badge>
                  <span className="text-xs font-medium text-slate-600 dark:text-slate-400">
                    {getEntityTypeLabel(entry.entity_type)}
                  </span>
                </div>
                <div className="flex items-center gap-2 mt-1 text-sm text-slate-600 dark:text-slate-400">
                  {entry.entity_label && (
                    <span>{entry.entity_label}</span>
                  )}
                  {entry.actor && (
                    <>
                      <span>•</span>
                      <span>{entry.actor}</span>
                    </>
                  )}
                  {entry.ip_address && (
                    <>
                      <span>•</span>
                      <span className="font-mono text-xs">{entry.ip_address}</span>
                    </>
                  )}
                </div>
              </div>
            </div>
            {entry.changes && (
              <div className="ml-auto">
                {expandedId === entry.id ? (
                  <ChevronUp className="w-5 h-5 text-slate-400" />
                ) : (
                  <ChevronDown className="w-5 h-5 text-slate-400" />
                )}
              </div>
            )}
          </button>

          {expandedId === entry.id && entry.changes && (
            <div className="px-4 py-3 border-t border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50">
              <pre className="text-xs font-mono text-slate-700 dark:text-slate-300 overflow-x-auto whitespace-pre-wrap break-words">
                {JSON.stringify(entry.changes, null, 2)}
              </pre>
            </div>
          )}
        </div>
      ))}
    </div>
  )
}
