'use client'

import type { CaptureStatus } from '@/lib/types'
import { cn } from '@/lib/utils'

interface CaptureStatusBannerProps {
  status: CaptureStatus
  missingFields: string[]
  extractedPhone?: string | null
  className?: string
}

export function CaptureStatusBanner({
  status,
  missingFields,
  extractedPhone,
  className,
}: CaptureStatusBannerProps) {
  if (status === 'complete') return null

  if (status === 'need_confirm' && extractedPhone) {
    return (
      <div
        className={cn(
          'mx-3 mt-3 rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-sm text-amber-900 dark:border-amber-800 dark:bg-amber-950 dark:text-amber-100',
          className,
        )}
      >
        J&apos;ai noté le numéro <strong>{extractedPhone}</strong>. Répondez &quot;oui&quot; pour
        confirmer.
      </div>
    )
  }

  if (status === 'need_phone' || missingFields.includes('phone_number')) {
    return (
      <div
        className={cn(
          'mx-3 mt-3 rounded-lg border border-indigo-200 bg-indigo-50 px-3 py-2 text-sm text-indigo-900 dark:border-indigo-800 dark:bg-indigo-950 dark:text-indigo-100',
          className,
        )}
      >
        Partagez votre numéro de téléphone pour qu&apos;un conseiller puisse vous rappeler.
      </div>
    )
  }

  return null
}
