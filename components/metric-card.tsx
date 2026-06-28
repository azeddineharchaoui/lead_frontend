import { LucideIcon } from 'lucide-react'

interface MetricCardProps {
  label: string
  value: string | number
  icon?: LucideIcon
  iconColor?: string
}

export function MetricCard({
  label,
  value,
  icon: Icon,
  iconColor = 'text-blue-600',
}: MetricCardProps) {
  return (
    <div className="bg-white rounded-lg border border-gray-200 p-6 hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm text-gray-600 font-medium">{label}</p>
          <p className="text-3xl font-bold text-gray-900 mt-2">{value}</p>
        </div>
        {Icon && <Icon className={`w-8 h-8 ${iconColor}`} />}
      </div>
    </div>
  )
}
