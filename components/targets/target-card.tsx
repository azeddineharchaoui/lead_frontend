'use client'

import { useApi } from '@/lib/api-context'
import { toggleTarget, deleteTarget } from '@/lib/api/targets'
import { showApiError } from '@/lib/api-errors'
import type { ScrapingTarget } from '@/lib/types'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Switch } from '@/components/ui/switch'
import { TargetStatusBadge } from './target-status-badge'
import { ScrapeNowButton } from './scrape-now-button'
import { Globe, Trash2, ExternalLink, AlertTriangle } from 'lucide-react'
import { toast } from 'sonner'
import { useState } from 'react'

interface TargetCardProps {
  target: ScrapingTarget
  onEdit: (target: ScrapingTarget) => void
  onDelete: (targetId: string) => void
  onScrapingComplete: () => void
}

function formatRelativeTime(dateString: string | null): string {
  if (!dateString) return 'Jamais'
  const date = new Date(dateString)
  const now = new Date()
  const seconds = Math.floor((now.getTime() - date.getTime()) / 1000)
  if (seconds < 60) return "À l'instant"
  if (seconds < 3600) return `Il y a ${Math.floor(seconds / 60)}m`
  if (seconds < 86400) return `Il y a ${Math.floor(seconds / 3600)}h`
  return `Il y a ${Math.floor(seconds / 86400)}j`
}

export function TargetCard({
  target,
  onEdit,
  onDelete,
  onScrapingComplete,
}: TargetCardProps) {
  const api = useApi()
  const [toggling, setToggling] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)

  const handleToggle = async () => {
    setToggling(true)
    try {
      await toggleTarget(api, target.id)
      toast.success(target.is_active ? 'Cible désactivée' : 'Cible activée')
      // Parent component will handle refresh
    } catch (err) {
      showApiError(err)
    } finally {
      setToggling(false)
    }
  }

  const handleDelete = async () => {
    setDeleting(true)
    try {
      await deleteTarget(api, target.id)
      toast.success('Cible supprimée')
      onDelete(target.id)
      setShowDeleteConfirm(false)
    } catch (err) {
      showApiError(err)
    } finally {
      setDeleting(false)
    }
  }

  const hasErrors = target.error_count >= 3
  const isInactive = !target.is_active

  return (
    <Card
      className={`p-4 space-y-4 ${isInactive ? 'opacity-60' : ''} ${
        hasErrors ? 'border-amber-200 bg-amber-50' : ''
      }`}
    >
      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-2">
            <a
              href={target.domain}
              target="_blank"
              rel="noopener noreferrer"
              className="font-medium text-slate-900 dark:text-white hover:text-indigo-600 flex items-center gap-1 truncate"
            >
              {isInactive && <span className="line-through">{target.domain}</span>}
              {!isInactive && target.domain}
              <ExternalLink className="w-3 h-3 flex-shrink-0" />
            </a>
          </div>
          {target.name && (
            <p className="text-sm text-slate-600 dark:text-slate-400 truncate">{target.name}</p>
          )}
        </div>

        {/* Active switch */}
        <Switch
          checked={target.is_active}
          onCheckedChange={handleToggle}
          disabled={toggling}
        />
      </div>

      {/* Warning banner for errors */}
      {hasErrors && (
        <div className="flex items-start gap-2 bg-amber-100/50 p-2 rounded border border-amber-200">
          <AlertTriangle className="w-4 h-4 text-amber-700 flex-shrink-0 mt-0.5" />
          <div className="text-sm text-amber-800">
            <p className="font-medium">Cible instable</p>
            <p className="text-xs">{target.error_count} erreurs consécutives</p>
          </div>
        </div>
      )}

      {/* Stats */}
      <div className="grid grid-cols-3 gap-3 text-sm">
        <div className="bg-slate-100 dark:bg-slate-800 p-2 rounded">
          <p className="text-xs text-slate-600 dark:text-slate-400">Leads</p>
          <p className="font-semibold text-slate-900 dark:text-white">{target.leads_count}</p>
        </div>
        <div className="bg-slate-100 dark:bg-slate-800 p-2 rounded">
          <p className="text-xs text-slate-600 dark:text-slate-400">Erreurs</p>
          <p className="font-semibold text-slate-900 dark:text-white">{target.error_count}</p>
        </div>
        <div className="bg-slate-100 dark:bg-slate-800 p-2 rounded">
          <p className="text-xs text-slate-600 dark:text-slate-400">Freq.</p>
          <p className="font-semibold text-slate-900 dark:text-white">{target.scraping_frequency_hours}h</p>
        </div>
      </div>

      {/* Last scraped status */}
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs text-slate-600 dark:text-slate-400">Dernier scraping</p>
          <p className="text-sm text-slate-900 dark:text-white">
            {formatRelativeTime(target.last_scraped_at)}
          </p>
        </div>
        <TargetStatusBadge status={target.last_scraping_status} errorCount={target.error_count} />
      </div>

      {/* Actions */}
      <div className="flex gap-2 pt-2 border-t">
        <ScrapeNowButton targetId={target.id} onComplete={onScrapingComplete} />
        <Button
          variant="outline"
          size="sm"
          onClick={() => onEdit(target)}
          className="flex-1"
        >
          Éditer
        </Button>
        {!showDeleteConfirm ? (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setShowDeleteConfirm(true)}
            className="text-red-600 hover:text-red-700"
          >
            <Trash2 className="w-4 h-4" />
          </Button>
        ) : (
          <div className="flex gap-1">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowDeleteConfirm(false)}
              disabled={deleting}
            >
              Annuler
            </Button>
            <Button
              variant="destructive"
              size="sm"
              onClick={handleDelete}
              disabled={deleting}
            >
              Confirmer
            </Button>
          </div>
        )}
      </div>
    </Card>
  )
}
