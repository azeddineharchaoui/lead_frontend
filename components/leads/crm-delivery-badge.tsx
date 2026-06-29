'use client'

import { CheckCircle2, AlertCircle, Clock } from 'lucide-react'
import { formatRelativeTime } from '@/lib/format'

interface CrmDeliveryBadgeProps {
  crm_pushed_at?: string | null
  crm_last_error?: string | null
  crm_push_attempts?: number
}

export function CrmDeliveryBadge({
  crm_pushed_at,
  crm_last_error,
  crm_push_attempts = 0,
}: CrmDeliveryBadgeProps) {
  if (crm_pushed_at) {
    return (
      <div className="flex items-start gap-3 p-3 bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-800 rounded-lg">
        <CheckCircle2 className="w-5 h-5 text-emerald-600 dark:text-emerald-400 flex-shrink-0 mt-0.5" />
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-emerald-900 dark:text-emerald-100">
            Envoyé au CRM
          </p>
          <p className="text-xs text-emerald-700 dark:text-emerald-300 mt-0.5">
            {formatRelativeTime(crm_pushed_at)}
          </p>
        </div>
      </div>
    )
  }

  if (crm_last_error) {
    return (
      <div className="flex items-start gap-3 p-3 bg-rose-50 dark:bg-rose-950/20 border border-rose-200 dark:border-rose-800 rounded-lg">
        <AlertCircle className="w-5 h-5 text-rose-600 dark:text-rose-400 flex-shrink-0 mt-0.5" />
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-rose-900 dark:text-rose-100">
            Erreur d&apos;envoi CRM
          </p>
          <p className="text-xs text-rose-700 dark:text-rose-300 mt-1 break-words">
            {crm_last_error}
          </p>
          {crm_push_attempts > 0 && (
            <p className="text-xs text-rose-600 dark:text-rose-400 mt-1">
              Tentatives: {crm_push_attempts}
            </p>
          )}
        </div>
      </div>
    )
  }

  if (crm_push_attempts > 0) {
    return (
      <div className="flex items-start gap-3 p-3 bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-800 rounded-lg">
        <Clock className="w-5 h-5 text-amber-600 dark:text-amber-400 flex-shrink-0 mt-0.5 animate-pulse" />
        <div>
          <p className="text-sm font-medium text-amber-900 dark:text-amber-100">
            Tentative {crm_push_attempts}
          </p>
          <p className="text-xs text-amber-700 dark:text-amber-300">
            Envoi en cours vers le CRM...
          </p>
        </div>
      </div>
    )
  }

  return null
}
