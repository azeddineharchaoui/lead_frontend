import type { LeadStatus } from '@/lib/types'

interface StatusBadgeProps {
  status: LeadStatus
}

const statusConfig: Record<
  LeadStatus,
  { bgColor: string; textColor: string; label: string }
> = {
  nouveau: {
    bgColor: 'bg-blue-50',
    textColor: 'text-blue-700',
    label: 'Nouveau',
  },
  en_cours: {
    bgColor: 'bg-amber-50',
    textColor: 'text-amber-700',
    label: 'En cours',
  },
  qualifie: {
    bgColor: 'bg-green-50',
    textColor: 'text-green-700',
    label: 'Qualifié',
  },
  rejete: {
    bgColor: 'bg-gray-100',
    textColor: 'text-gray-700',
    label: 'Rejeté',
  },
}

export function StatusBadge({ status }: StatusBadgeProps) {
  const config = statusConfig[status]
  return (
    <span
      className={`inline-block px-2.5 py-0.5 rounded text-sm font-medium ${config.bgColor} ${config.textColor}`}
    >
      {config.label}
    </span>
  )
}
