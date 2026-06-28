'use client'

import { useCallback, useEffect, useState } from 'react'
import { useApi } from '@/lib/api-context'
import {
  listTargets,
  createTarget,
  toggleTarget,
  scrapeTargetNow,
  deleteTarget,
} from '@/lib/api'
import { showApiError } from '@/lib/api-errors'
import type { ScrapingTarget } from '@/lib/types'
import { Button } from '@/components/ui/button'
import { AlertCircle, Plus, Play, Trash2, X } from 'lucide-react'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { toast } from 'sonner'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { Card } from '@/components/ui/card'
import { TargetDetailSheet } from '@/components/target-detail-sheet'

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

function StatusDot({ status }: { status: string | null }) {
  const colors = {
    success: 'bg-green-500',
    failed: 'bg-red-500',
    pending: 'bg-yellow-500',
    null: 'bg-gray-300',
  }
  return (
    <div
      className={`w-2 h-2 rounded-full ${colors[status as keyof typeof colors] || colors.null}`}
    />
  )
}

export default function TargetsPage() {
  const api = useApi()
  const [targets, setTargets] = useState<ScrapingTarget[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [scrapingId, setScrapingId] = useState<string | null>(null)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [selectedTarget, setSelectedTarget] = useState<ScrapingTarget | null>(null)
  const [isDetailSheetOpen, setIsDetailSheetOpen] = useState(false)
  const [formData, setFormData] = useState({ domain: '', name: '', frequency: '24' })

  const loadTargets = useCallback(async () => {
    if (!api.apiKey) return
    try {
      setLoading(true)
      setError(null)
      const data = await listTargets(api, { page: 1, page_size: 100 })
      setTargets(data.items)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur de chargement')
      showApiError(err)
    } finally {
      setLoading(false)
    }
  }, [api])

  useEffect(() => {
    loadTargets()
  }, [loadTargets])

  if (!api.apiKey) {
    return (
      <div className="p-6">
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            <p className="font-semibold">Clé API admin requise (401)</p>
            <p className="text-sm mt-2">
              Configurez votre clé API dans les paramètres pour accéder aux cibles de scraping.
            </p>
            <Button variant="outline" size="sm" className="mt-4" onClick={() => (window.location.href = '/settings')}>
              Aller aux Paramètres
            </Button>
          </AlertDescription>
        </Alert>
      </div>
    )
  }

  const handleScrapingNow = async (e: React.MouseEvent, targetId: string) => {
    e.stopPropagation()
    setScrapingId(targetId)
    try {
      const res = await scrapeTargetNow(api, targetId)
      toast.success(res.message || 'Scraping lancé')
      await loadTargets()
    } catch (err) {
      showApiError(err)
    } finally {
      setScrapingId(null)
    }
  }

  const handleDeleteTarget = async (e: React.MouseEvent, targetId: string) => {
    e.stopPropagation()
    try {
      await deleteTarget(api, targetId)
      toast.success('Cible supprimée')
      setTargets((prev) => prev.filter((t) => t.id !== targetId))
    } catch (err) {
      showApiError(err)
    }
  }

  const handleToggleActive = async (targetId: string) => {
    try {
      const updated = await toggleTarget(api, targetId)
      setTargets((prev) => prev.map((t) => (t.id === targetId ? updated : t)))
    } catch (err) {
      showApiError(err)
    }
  }

  const handleCreateTarget = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!formData.domain) {
      toast.error('URL du domaine est requise')
      return
    }
    try {
      const created = await createTarget(api, {
        domain: formData.domain,
        name: formData.name || null,
        scraping_frequency_hours: parseInt(formData.frequency, 10),
        is_active: true,
      })
      setTargets((prev) => [created, ...prev])
      setIsDialogOpen(false)
      setFormData({ domain: '', name: '', frequency: '24' })
      toast.success('Nouvelle cible créée')
    } catch (err) {
      showApiError(err)
    }
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Cibles de scraping</h1>
          <p className="text-gray-600 mt-2">Gérez les sources de leads pour le scraping</p>
        </div>
        <Button onClick={() => setIsDialogOpen(true)}>
          <Plus className="w-4 h-4 mr-2" />
          Nouvelle Cible
        </Button>
      </div>

      {error && (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {loading ? (
        <p className="text-gray-500">Chargement...</p>
      ) : (
        <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase">Nom / Domaine</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase">Statut</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase">Fréquence</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase">Dernier Scraping</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase">Leads Générés</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {targets.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-8 text-center text-gray-500">
                    Aucune cible configurée
                  </td>
                </tr>
              ) : (
                targets.map((target) => (
                  <tr
                    key={target.id}
                    className="hover:bg-gray-50 cursor-pointer"
                    onClick={() => {
                      setSelectedTarget(target)
                      setIsDetailSheetOpen(true)
                    }}
                  >
                    <td className="px-6 py-4">
                      <p className="font-medium text-gray-900">{target.name || target.domain}</p>
                      <p className="text-sm text-gray-600">{target.domain}</p>
                    </td>
                    <td className="px-6 py-4" onClick={(e) => e.stopPropagation()}>
                      <Switch
                        checked={target.is_active}
                        onCheckedChange={() => handleToggleActive(target.id)}
                      />
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-900">{target.scraping_frequency_hours}h</td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <StatusDot status={target.last_scraping_status} />
                        <span className="text-sm text-gray-900">
                          {formatRelativeTime(target.last_scraped_at)}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-900">
                      {target.leads_count}
                      {target.error_count > 0 && (
                        <p className="text-xs text-red-600 mt-1">{target.error_count} erreurs</p>
                      )}
                    </td>
                    <td className="px-6 py-4" onClick={(e) => e.stopPropagation()}>
                      <div className="flex items-center gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={(e) => handleScrapingNow(e, target.id)}
                          disabled={scrapingId === target.id}
                          className="h-8 w-8 p-0"
                        >
                          {scrapingId === target.id ? (
                            <div className="w-4 h-4 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
                          ) : (
                            <Play className="w-4 h-4" />
                          )}
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={(e) => handleDeleteTarget(e, target.id)}
                          className="h-8 w-8 p-0 text-red-600 hover:text-red-700"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}

      {isDialogOpen && (
        <div className="fixed inset-0 bg-black/50 z-40 flex items-center justify-center">
          <Card className="w-full max-w-md">
            <div className="flex justify-between items-center p-6 border-b border-gray-200">
              <h2 className="text-lg font-semibold">Créer une nouvelle cible</h2>
              <Button variant="ghost" size="sm" onClick={() => setIsDialogOpen(false)} className="h-8 w-8 p-0">
                <X className="w-4 h-4" />
              </Button>
            </div>
            <form onSubmit={handleCreateTarget} className="p-6 space-y-4">
              <div>
                <Label htmlFor="domain">URL du domaine *</Label>
                <Input
                  id="domain"
                  placeholder="exemple.com"
                  value={formData.domain}
                  onChange={(e) => setFormData((prev) => ({ ...prev, domain: e.target.value }))}
                  className="mt-2"
                />
              </div>
              <div>
                <Label htmlFor="name">Nom de la cible</Label>
                <Input
                  id="name"
                  placeholder="Ex: LinkedIn Professionals"
                  value={formData.name}
                  onChange={(e) => setFormData((prev) => ({ ...prev, name: e.target.value }))}
                  className="mt-2"
                />
              </div>
              <div>
                <Label htmlFor="frequency">Fréquence (heures)</Label>
                <Select
                  value={formData.frequency}
                  onValueChange={(value) => value && setFormData((prev) => ({ ...prev, frequency: value }))}
                >
                  <SelectTrigger className="mt-2">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="6">Toutes les 6 heures</SelectItem>
                    <SelectItem value="12">Toutes les 12 heures</SelectItem>
                    <SelectItem value="24">Tous les jours</SelectItem>
                    <SelectItem value="48">Tous les 2 jours</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="flex gap-2 justify-end pt-4 border-t border-gray-200 mt-6">
                <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                  Annuler
                </Button>
                <Button type="submit">Créer</Button>
              </div>
            </form>
          </Card>
        </div>
      )}

      <TargetDetailSheet
        target={selectedTarget}
        open={isDetailSheetOpen}
        onOpenChange={setIsDetailSheetOpen}
        onUpdate={(updatedTarget) => {
          setTargets((prev) => prev.map((t) => (t.id === updatedTarget.id ? updatedTarget : t)))
          setSelectedTarget(updatedTarget)
        }}
      />
    </div>
  )
}
