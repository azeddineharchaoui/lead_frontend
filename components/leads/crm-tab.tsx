'use client'

import { CrmDeliveryCard } from './crm-delivery-card'
import type { Lead } from '@/lib/types'

interface CrmTabProps {
  lead: Lead
  onRetry: () => Promise<void>
  isRetrying: boolean
}

export function CrmTab({ lead, onRetry, isRetrying }: CrmTabProps) {
  return (
    <div className="space-y-4">
      <CrmDeliveryCard lead={lead} onRetry={onRetry} isRetrying={isRetrying} />

      {/* Webhook info section */}
      <div className="p-4 rounded-lg bg-slate-50 dark:bg-slate-900/30 border border-slate-200 dark:border-slate-800 space-y-2">
        <p className="text-sm font-medium text-slate-700 dark:text-slate-300">Webhooks</p>
        <p className="text-xs text-slate-600 dark:text-slate-400">
          Les leads qualifiés sont automatiquement envoyés au CRM configuré dans les paramètres.
        </p>
        <p className="text-xs text-slate-500 dark:text-slate-400">
          Configurez votre URL webhook dans{' '}
          <a href="/settings" className="text-indigo-600 dark:text-indigo-400 hover:underline">
            les paramètres
          </a>
          .
        </p>
      </div>
    </div>
  )
}
