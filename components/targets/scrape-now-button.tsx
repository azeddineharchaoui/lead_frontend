'use client'

import { useEffect, useState } from 'react'
import { useApi } from '@/lib/api-context'
import { scrapeTargetNow } from '@/lib/api/targets'
import { getTaskStatus } from '@/lib/api/tasks'
import { showApiError } from '@/lib/api-errors'
import { Button } from '@/components/ui/button'
import { Loader2, Play, CheckCircle2, AlertCircle } from 'lucide-react'
import { toast } from 'sonner'

interface ScrapeNowButtonProps {
  targetId: string
  onComplete?: () => void
}

export function ScrapeNowButton({ targetId, onComplete }: ScrapeNowButtonProps) {
  const api = useApi()
  const [loading, setLoading] = useState(false)
  const [polling, setPolling] = useState(false)
  const [pollCount, setPollCount] = useState(0)
  const [taskId, setTaskId] = useState<string | null>(null)
  const [taskState, setTaskState] = useState<string | null>(null)

  // Poll for task status every 2 seconds, max 60 seconds (30 polls)
  useEffect(() => {
    if (!polling || !taskId) return

    if (pollCount >= 30) {
      setPolling(false)
      toast.error('Timeout du scraping (60s). Veuillez réessayer.')
      return
    }

    const timeout = setTimeout(async () => {
      try {
        const status = await getTaskStatus(api, taskId)
        setTaskState(status.state)

        if (status.state === 'success') {
          setPolling(false)
          toast.success('Scraping terminé avec succès')
          onComplete?.()
        } else if (status.state === 'failure') {
          setPolling(false)
          toast.error('Erreur durant le scraping. Veuillez réessayer.')
        } else {
          setPollCount((c) => c + 1)
        }
      } catch (err) {
        showApiError(err)
        setPolling(false)
      }
    }, 2000)

    return () => clearTimeout(timeout)
  }, [polling, taskId, pollCount, api, onComplete])

  const handleScrapeNow = async () => {
    setLoading(true)
    setPollCount(0)
    try {
      const result = await scrapeTargetNow(api, targetId)
      if (result.task_id) {
        setTaskId(result.task_id)
        setPolling(true)
        toast.success('Scraping lancé')
      } else {
        toast.error('Erreur: pas d\'ID de tâche reçu')
      }
    } catch (err) {
      showApiError(err)
    } finally {
      setLoading(false)
    }
  }

  const isRunning = loading || polling

  return (
    <Button
      onClick={handleScrapeNow}
      disabled={isRunning}
      variant={
        taskState === 'success'
          ? 'outline'
          : taskState === 'failure'
            ? 'destructive'
            : 'outline'
      }
      size="sm"
      className="gap-2"
    >
      {isRunning && <Loader2 className="w-4 h-4 animate-spin" />}
      {!isRunning && taskState === 'success' && <CheckCircle2 className="w-4 h-4" />}
      {!isRunning && taskState === 'failure' && <AlertCircle className="w-4 h-4" />}
      {!isRunning && !taskState && <Play className="w-4 h-4" />}

      {isRunning
        ? polling
          ? 'Scraping...'
          : 'Démarrage...'
        : taskState === 'success'
          ? 'Succès'
          : taskState === 'failure'
            ? 'Erreur'
            : 'Scraper maintenant'}
    </Button>
  )
}
