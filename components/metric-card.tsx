import { LucideIcon } from 'lucide-react'
import { TrendingUp } from 'lucide-react'

interface MetricCardProps {
  label: string
  value: string | number
  icon?: LucideIcon
  iconColor?: string
  trend?: number
  subtitle?: string
}

export function MetricCard({
  label,
  value,
  icon: Icon,
  iconColor = 'text-indigo-600',
  trend,
  subtitle,
}: MetricCardProps) {
  return (
    <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-6 hover:shadow-md dark:hover:shadow-lg transition-all duration-200">
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1">
          <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">{label}</p>
          <p className="text-4xl font-bold text-slate-900 dark:text-white mt-3 font-mono tabular-nums">{value}</p>
          {subtitle && <p className="text-sm text-slate-500 dark:text-slate-400 mt-2">{subtitle}</p>}
        </div>
        {Icon && (
          <div className={`p-3 rounded-lg ${iconColor.replace('text-', 'bg-').replace('-600', '-100').replace('-500', '-100')} dark:bg-opacity-10`}>
            <Icon className={`w-6 h-6 ${iconColor}`} />
          </div>
        )}
      </div>

      {trend !== undefined && (
        <div className="flex items-center gap-1 text-emerald-600 dark:text-emerald-400 text-sm font-medium">
          <TrendingUp className="w-4 h-4" />
          <span>+{trend}% ce mois</span>
        </div>
      )}
    </div>
  )
}
