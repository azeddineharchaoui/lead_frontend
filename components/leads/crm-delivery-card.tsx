'use client'

import { useState } from 'react'
import { CheckCircle2, AlertCircle, Clock, ChevronDown, ChevronUp, Repeat2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { formatRelativeTime } from '@/lib/format'
import { toast } from 'sonner'
import type { Lead } from '@/lib/types'

interface CrmDeliveryCardProps {
  lead: Lead
  onRetry: () => Promise<void>
  isRetrying: boolean
}

export function CrmDeliveryCard({ lead, onRetry, isRetrying }: CrmDeliveryCardProps) {
  const [showError, setShowError] = useState(false)

  // Determine status
  let status: 'sent' | 'error' | 'pending' | 'not_applicable' = 'not_applicable'
  let statusLabel = 'Non applicable'
  let statusColor = 'text-slate-600 dark:text-slate-400'
  let bgColor = 'bg-slate-50 dark:bg-slate-900/30'
  let borderColor = 'border-slate-200 dark:border-slate-800'

  if (lead.crm_pushed_at) {
    status = 'sent'
    statusLabel = 'Envoyé'
    statusColor = 'text-emerald-600 dark:text-emerald-400'
    bgColor = 'bg-emerald-50 dark:bg-emerald-950/30'
    borderColor = 'border-emerald-200 dark:border-emerald-800'
  } else if (lead.crm_last_error) {
    status = 'error'
    statusLabel = 'Erreur'
    statusColor = 'text-rose-600 dark:text-rose-400'
    bgColor = 'bg-rose-50 dark:bg-rose-950/30'
    borderColor = 'border-rose-200 dark:border-rose-800'
  } else if (lead.status === 'qualifie' && !lead.crm_pushed_at) {
    status = 'pending'
    statusLabel = 'En attente'
    statusColor = 'text-amber-600 dark:text-amber-400'
    bgColor = 'bg-amber-50 dark:bg-amber-950/30'
    borderColor = 'border-amber-200 dark:border-amber-800'
  }

  const showRetryButton = (status === 'pending' || status === 'error') && lead.status === 'qualifie'

  return (
    <Card className={`border ${borderColor} ${bgColor}`}>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            {status === 'sent' && <CheckCircle2 className={`w-5 h-5 ${statusColor}`} />}
            {status === 'error' && <AlertCircle className={`w-5 h-5 ${statusColor}`} />}
            {status === 'pending' && <Clock className={`w-5 h-5 ${statusColor} animate-pulse`} />}
            {status === 'not_applicable' && <Clock className={`w-5 h-5 ${statusColor}`} />}
            <div>
              <CardTitle className="text-base">CRM</CardTitle>
              <CardDescription className={statusColor}>{statusLabel}</CardDescription>
            </div>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Last push date */}
        {lead.crm_pushed_at && (
          <div className="space-y-1">
            <p className="text-sm font-medium text-slate-700 dark:text-slate-300">
              Dernière poussée
            </p>
            <p className="text-sm text-slate-600 dark:text-slate-400">
              {formatRelativeTime(lead.crm_pushed_at)}
            </p>
          </div>
        )}

        {/* Attempts */}
        {(lead.crm_push_attempts ?? 0) > 0 && (
          <div className="space-y-1">
            <p className="text-sm font-medium text-slate-700 dark:text-slate-300">
              Tentatives
            </p>
            <p className="text-sm text-slate-600 dark:text-slate-400">
              {lead.crm_push_attempts ?? 0}
            </p>
          </div>
        )}

        {/* Error message */}
        {lead.crm_last_error && (
          <div className="space-y-2">
            <button
              onClick={() => setShowError(!showError)}
              className="flex items-center gap-2 text-sm font-medium text-rose-700 dark:text-rose-300 hover:opacity-80 transition-opacity"
            >
              {showError ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
              Afficher l&apos;erreur
            </button>
            {showError && (
              <div className="p-3 bg-white dark:bg-slate-950 border border-rose-200 dark:border-rose-800 rounded text-xs text-rose-700 dark:text-rose-300 break-words">
                {lead.crm_last_error}
              </div>
            )}
          </div>
        )}

        {/* Retry button */}
        {showRetryButton && (
          <Button
            onClick={async () => {
              try {
                await onRetry()
                toast.success('Envoi CRM en attente')
              } catch (err) {
                toast.error(err instanceof Error ? err.message : 'Erreur lors de l\'envoi')
              }
            }}
            disabled={isRetrying}
            size="sm"
            className="w-full gap-2"
          >
            <Repeat2 className={`w-4 h-4 ${isRetrying ? 'animate-spin' : ''}`} />
            {isRetrying ? 'Envoi en cours...' : 'Réessayer l\'envoi CRM'}
          </Button>
        )}
      </CardContent>
    </Card>
  )
}
