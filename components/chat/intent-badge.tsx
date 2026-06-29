'use client'

import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'

const INTENT_LABELS: Record<string, { label: string; color: string }> = {
  interet_achat: { label: 'Intérêt d\'achat', color: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900 dark:text-emerald-200' },
  question_technique: { label: 'Question technique', color: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200' },
  refus: { label: 'Refus', color: 'bg-rose-100 text-rose-800 dark:bg-rose-900 dark:text-rose-200' },
  indecis: { label: 'Indécis', color: 'bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-200' },
  demande_rappel: { label: 'Demande de rappel', color: 'bg-violet-100 text-violet-800 dark:bg-violet-900 dark:text-violet-200' },
}

interface IntentBadgeProps {
  intent: string | null
  confidence?: number | null
  size?: 'sm' | 'md' | 'lg'
}

export function IntentBadge({ intent, confidence = 0, size = 'md' }: IntentBadgeProps) {
  if (!intent) {
    return (
      <Badge variant="outline" className={size === 'sm' ? 'text-xs' : size === 'lg' ? 'text-base' : 'text-sm'}>
        Aucune intention détectée
      </Badge>
    )
  }

  const config = INTENT_LABELS[intent] || {
    label: intent.replace(/_/g, ' '),
    color: 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200',
  }

  const sizeClasses = {
    sm: 'px-2 py-1 text-xs',
    md: 'px-3 py-2 text-sm',
    lg: 'px-4 py-2 text-base',
  }

  return (
    <div className="space-y-1">
      <div className={`${sizeClasses[size]} font-medium rounded-md inline-block ${config.color}`}>
        {config.label}
      </div>
      {confidence !== null && confidence > 0 && (
        <div className="space-y-0.5">
          <div className="flex items-center justify-between">
            <span className="text-xs text-slate-600 dark:text-slate-400">Confiance</span>
            <span className="text-xs font-medium text-slate-700 dark:text-slate-300">
              {Math.round(confidence * 100)}%
            </span>
          </div>
          <Progress value={confidence * 100} className="h-1.5" />
        </div>
      )}
    </div>
  )
}
