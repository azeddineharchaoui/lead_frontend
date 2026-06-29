'use client'

import { useState } from 'react'
import { useTaskPolling } from '@/hooks/useTaskPolling'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Progress } from '@/components/ui/progress'
import { Badge } from '@/components/ui/badge'
import { AlertCircle, CheckCircle2, Loader2 } from 'lucide-react'

interface ScrapeProgressDialogProps {
  taskId: string | null
  open: boolean
  onOpenChange: (open: boolean) => void
  onComplete?: (result: any) => void
}

export function ScrapeProgressDialog({
  taskId,
  open,
  onOpenChange,
  onComplete,
}: ScrapeProgressDialogProps) {
  const { status, isComplete, isSuccess, isFailure, progress } = useTaskPolling(
    taskId,
    {
      enabled: open && !!taskId,
      onComplete: (result) => {
        if (onComplete) {
          onComplete(result)
        }
      },
    }
  )

  const progressPercent = progress
    ? Math.round((progress.current / progress.total) * 100)
    : 0

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Scraping Progress</DialogTitle>
          <DialogDescription>
            Scraping your targets for leads...
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* Status badge */}
          <div className="flex items-center justify-between">
            {isSuccess && (
              <Badge variant="default" className="bg-green-600">
                <CheckCircle2 className="w-3 h-3 mr-1" />
                Completed
              </Badge>
            )}
            {isFailure && (
              <Badge variant="destructive">
                <AlertCircle className="w-3 h-3 mr-1" />
                Failed
              </Badge>
            )}
            {!isComplete && (
              <Badge variant="outline">
                <Loader2 className="w-3 h-3 mr-1 animate-spin" />
                In Progress
              </Badge>
            )}
          </div>

          {/* Progress bar */}
          {!isComplete && (
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-slate-600 dark:text-slate-400">
                  {progress?.current ?? 0} / {progress?.total ?? 0} leads
                </span>
                <span className="font-medium">{progressPercent}%</span>
              </div>
              <Progress value={progressPercent} className="h-2" />
            </div>
          )}

          {/* Error message */}
          {isFailure && status?.result && (
            <div className="rounded-lg bg-red-50 dark:bg-red-950/30 p-3 border border-red-200 dark:border-red-800">
              <p className="text-sm text-red-800 dark:text-red-200">
                <strong>Error:</strong>{' '}
                {typeof status.result === 'string'
                  ? status.result
                  : JSON.stringify(status.result)}
              </p>
            </div>
          )}

          {/* Success message */}
          {isSuccess && (
            <div className="rounded-lg bg-green-50 dark:bg-green-950/30 p-3 border border-green-200 dark:border-green-800">
              <p className="text-sm text-green-800 dark:text-green-200">
                <strong>Success!</strong> Your scraping task has completed.
              </p>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}
