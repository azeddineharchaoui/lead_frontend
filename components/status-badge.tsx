import type { LeadStatus } from '@/lib/types'

interface StatusBadgeProps {
  status: LeadStatus
}

const statusConfig: Record<
  LeadStatus,
  { className: string; label: string }
> = {
  nouveau: {
    className: 'bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-200',
    label: 'Nouveau',
  },
  en_cours: {
    className: 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-200',
    label: 'En cours',
  },
  qualifie: {
    className: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-200',
    label: 'Qualifié',
  },
  rejete: {
    className: 'bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-200',
    label: 'Rejeté',
  },
}

export function StatusBadge({ status }: StatusBadgeProps) {
  const config = statusConfig[status]
  return (
    <span
      className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold ${config.className}`}
    >
      {config.label}
    </span>
  )
}
