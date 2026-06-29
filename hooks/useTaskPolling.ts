'use client'

import { useEffect, useState, useCallback, useRef } from 'react'
import { getTaskStatus } from '@/lib/api/tasks'
import { useApiClient } from '@/hooks/useApiClient'
import type { TaskStatusResponse } from '@/lib/types'

export interface UseTaskPollingOptions {
  enabled?: boolean
  interval?: number // milliseconds
  onComplete?: (result: TaskStatusResponse) => void
  onError?: (error: Error) => void
}

export function useTaskPolling(
  taskId: string | null,
  options: UseTaskPollingOptions = {}
) {
  const { enabled = true, interval = 2000, onComplete, onError } = options
  const apiClient = useApiClient()

  const [status, setStatus] = useState<TaskStatusResponse | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<Error | null>(null)
  const intervalRef = useRef<NodeJS.Timeout | null>(null)

  const pollTask = useCallback(async () => {
    if (!taskId || !enabled) return

    setLoading(true)
    setError(null)

    try {
      const response = await getTaskStatus(
        {
          baseUrl: apiClient.baseUrl,
          apiKey: apiClient.apiKey,
        },
        taskId
      )

      setStatus(response)

      // If task is complete, call the callback and stop polling
      if (response.ready) {
        if (intervalRef.current) {
          clearInterval(intervalRef.current)
          intervalRef.current = null
        }

        if (response.state === 'failure' && onError) {
          const errorMessage = typeof response.result === 'string'
            ? response.result
            : 'Task failed'
          onError(new Error(errorMessage))
        } else if (response.state === 'success' && onComplete) {
          onComplete(response)
        }
      }
    } catch (err) {
      const error = err instanceof Error ? err : new Error(String(err))
      setError(error)

      if (onError) {
        onError(error)
      }
    } finally {
      setLoading(false)
    }
  }, [taskId, enabled, apiClient.baseUrl, apiClient.apiKey, onComplete, onError])

  useEffect(() => {
    if (!taskId || !enabled) return

    // Poll immediately
    pollTask()

    // Set up interval
    intervalRef.current = setInterval(pollTask, interval)

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
      }
    }
  }, [taskId, enabled, interval, pollTask])

  return {
    status,
    loading,
    error,
    isComplete: status?.ready ?? false,
    isSuccess: status?.state === 'success' && status?.ready,
    isFailure: status?.state === 'failure' && status?.ready,
    isPending: status?.state === 'pending',
    isStarted: status?.state === 'started',
    progress: status?.progress ?? null,
  }
}
