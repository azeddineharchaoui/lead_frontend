'use client'

import { Badge } from '@/components/ui/badge'
import { AlertCircle } from 'lucide-react'
import type { ScrapingStatus } from '@/lib/types'

interface TargetStatusBadgeProps {
  status: ScrapingStatus | null
  errorCount?: number
}

export function TargetStatusBadge({ status, errorCount = 0 }: TargetStatusBadgeProps) {
  if (!status) {
    return <Badge variant="outline">Jamais scrappé</Badge>
  }

  if (status === 'success') {
    return <Badge variant="default" className="bg-green-600 hover:bg-green-700">Succès</Badge>
  }

  if (status === 'failed') {
    return (
      <div className="flex items-center gap-1">
        <Badge variant="destructive">Erreur</Badge>
        {errorCount >= 3 && (
          <AlertCircle className="w-4 h-4 text-red-600" title={`${errorCount} erreurs`} />
        )}
      </div>
    )
  }

  return <Badge variant="outline">En attente</Badge>
}
