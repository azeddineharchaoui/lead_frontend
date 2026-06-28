import { Card } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'

export function LeadsTableSkeleton() {
  return (
    <Card>
      <div className="p-6 space-y-4">
        {/* Header */}
        <div className="flex gap-3 mb-6">
          <Skeleton className="h-10 flex-1 max-w-sm" />
          <Skeleton className="h-10 w-32" />
          <Skeleton className="h-10 w-32" />
        </div>

        {/* Table header */}
        <div className="border-b border-gray-200 pb-3">
          <div className="grid grid-cols-6 gap-4">
            <Skeleton className="h-4 w-20" />
            <Skeleton className="h-4 w-24" />
            <Skeleton className="h-4 w-16" />
            <Skeleton className="h-4 w-16" />
            <Skeleton className="h-4 w-16" />
            <Skeleton className="h-4 w-12" />
          </div>
        </div>

        {/* Table rows */}
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="grid grid-cols-6 gap-4 py-3 border-b border-gray-100">
            <Skeleton className="h-4" />
            <Skeleton className="h-4" />
            <Skeleton className="h-4" />
            <Skeleton className="h-4" />
            <Skeleton className="h-6 w-16" />
            <Skeleton className="h-8 w-20" />
          </div>
        ))}

        {/* Pagination */}
        <div className="flex justify-between items-center mt-6 pt-4 border-t border-gray-200">
          <Skeleton className="h-4 w-32" />
          <div className="flex gap-2">
            <Skeleton className="h-10 w-10" />
            <Skeleton className="h-10 w-10" />
            <Skeleton className="h-10 w-10" />
            <Skeleton className="h-10 w-10" />
          </div>
        </div>
      </div>
    </Card>
  )
}
