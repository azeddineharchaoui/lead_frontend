'use client'

import { useEffect, useState } from 'react'
import { useApiClient } from '@/hooks/useApiClient'
import {
  getTarget,
  updateTarget,
  toggleTarget,
  listTargetLeads,
  deleteTarget,
} from '@/lib/api/targets'
import { showApiError } from '@/lib/api-errors'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import { StatusBadge } from '@/components/status-badge'
import { ScrapeNowButton } from '@/components/targets/scrape-now-button'
import { Loader2, Trash2 } from 'lucide-react'
import { toast } from 'sonner'
import type { ScrapingTarget, Lead } from '@/lib/types'

interface TargetDetailSheetProps {
  target: ScrapingTarget | null
  open: boolean
  onOpenChange: (open: boolean) => void
  onUpdate: (target: ScrapingTarget) => void
  onDelete?: (targetId: string) => void
}

export function TargetDetailSheet({
  target,
  open,
  onOpenChange,
  onUpdate,
  onDelete,
}: TargetDetailSheetProps) {
  const api = useApiClient()
  const [detail, setDetail] = useState<ScrapingTarget | null>(null)
  const [leads, setLeads] = useState<Lead[]>([])
  const [leadsLoading, setLeadsLoading] = useState(false)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const [formData, setFormData] = useState({
    name: '',
    frequency: '24',
    selectors: '{}',
  })
  const [isUpdating, setIsUpdating] = useState(false)

  useEffect(() => {
    if (!open || !target) {
      setDetail(null)
      return
    }
    getTarget(api, target.id)
      .then((data) => {
        setDetail(data)
        setFormData({
          name: data.name || '',
          frequency: String(data.scraping_frequency_hours),
          selectors: JSON.stringify(data.custom_selectors ?? {}, null, 2),
        })
      })
      .catch(showApiError)
  }, [open, target, api])

  const loadLeads = async () => {
    if (!target) return
    setLeadsLoading(true)
    try {
      const data = await listTargetLeads(api, target.id, 1, 50)
      setLeads(data.items)
    } catch (err) {
      showApiError(err)
    } finally {
      setLeadsLoading(false)
    }
  }

  if (!open || !target || !detail) return null

  const handleToggle = async () => {
    if (!detail) return
    try {
      const updated = await toggleTarget(api, detail.id)
      setDetail(updated)
      onUpdate(updated)
      toast.success(updated.is_active ? 'Cible activée' : 'Cible désactivée')
    } catch (err) {
      showApiError(err)
    }
  }

  const handleUpdate = async () => {
    if (!detail) return
    setIsUpdating(true)
    try {
      let custom_selectors: Record<string, string> | null = null
      try {
        const parsed = JSON.parse(formData.selectors)
        custom_selectors = Object.keys(parsed).length > 0 ? parsed : null
      } catch {
        toast.error('JSON des sélecteurs invalide')
        return
      }
      const updated = await updateTarget(api, detail.id, {
        name: formData.name || null,
        scraping_frequency_hours: parseInt(formData.frequency, 10),
        custom_selectors,
      })
      setDetail(updated)
      onUpdate(updated)
      toast.success('Cible mise à jour')
    } catch (err) {
      showApiError(err)
    } finally {
      setIsUpdating(false)
    }
  }

  const handleDelete = async () => {
    if (!detail) return
    setDeleting(true)
    try {
      await deleteTarget(api, detail.id)
      toast.success('Cible supprimée')
      onDelete?.(detail.id)
      onOpenChange(false)
    } catch (err) {
      showApiError(err)
    } finally {
      setDeleting(false)
      setShowDeleteConfirm(false)
    }
  }

  const handleScrapingComplete = async () => {
    if (!detail) return
    try {
      const refreshed = await getTarget(api, detail.id)
      setDetail(refreshed)
      onUpdate(refreshed)
    } catch (err) {
      showApiError(err)
    }
  }

  if (!target || !detail) return null

  return (
    <>
      <Sheet open={open} onOpenChange={onOpenChange}>
        <SheetContent side="right" className="w-full sm:max-w-md overflow-y-auto">
          <SheetHeader className="mb-6">
            <SheetTitle>{detail.name || detail.domain}</SheetTitle>
            <SheetDescription className="break-words">{detail.domain}</SheetDescription>
          </SheetHeader>

          <Tabs defaultValue="overview" className="w-full">
            <TabsList className="grid w-full grid-cols-3 mb-4">
              <TabsTrigger value="overview" className="text-xs">
                Aperçu
              </TabsTrigger>
              <TabsTrigger value="config" className="text-xs">
                Config
              </TabsTrigger>
              <TabsTrigger value="leads" className="text-xs" onClick={loadLeads}>
                Leads
              </TabsTrigger>
            </TabsList>

            {/* Overview tab */}
            <TabsContent value="overview" className="space-y-4">
              <div className="grid grid-cols-3 gap-3">
                <div className="bg-slate-100 dark:bg-slate-800 p-3 rounded-lg">
                  <p className="text-xs text-slate-600 dark:text-slate-400">Leads</p>
                  <p className="text-lg font-semibold">{detail.leads_count}</p>
                </div>
                <div className="bg-slate-100 dark:bg-slate-800 p-3 rounded-lg">
                  <p className="text-xs text-slate-600 dark:text-slate-400">Erreurs</p>
                  <p className="text-lg font-semibold">{detail.error_count}</p>
                </div>
                <div className="bg-slate-100 dark:bg-slate-800 p-3 rounded-lg">
                  <p className="text-xs text-slate-600 dark:text-slate-400">Fréq</p>
                  <p className="text-lg font-semibold">{detail.scraping_frequency_hours}h</p>
                </div>
              </div>

              <div className="space-y-2">
                <p className="text-xs text-slate-600 dark:text-slate-400">Actif</p>
                <div className="flex items-center justify-between">
                  <span>{detail.is_active ? 'Oui' : 'Non'}</span>
                  <Switch checked={detail.is_active} onCheckedChange={handleToggle} />
                </div>
              </div>

              <ScrapeNowButton
                targetId={detail.id}
                onComplete={handleScrapingComplete}
              />
            </TabsContent>

            {/* Config tab */}
            <TabsContent value="config" className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Nom de la cible</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, name: e.target.value }))
                  }
                  disabled={isUpdating}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="frequency">Fréquence (heures)</Label>
                <Input
                  id="frequency"
                  type="number"
                  min="1"
                  max="168"
                  value={formData.frequency}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      frequency: e.target.value,
                    }))
                  }
                  disabled={isUpdating}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="selectors">Sélecteurs (JSON)</Label>
                <textarea
                  id="selectors"
                  value={formData.selectors}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      selectors: e.target.value,
                    }))
                  }
                  disabled={isUpdating}
                  className="w-full h-40 p-2 border rounded font-mono text-xs"
                />
              </div>

              <Button onClick={handleUpdate} disabled={isUpdating} className="w-full gap-2">
                {isUpdating && <Loader2 className="w-4 h-4 animate-spin" />}
                Mettre à jour
              </Button>

              <Button
                variant="destructive"
                onClick={() => setShowDeleteConfirm(true)}
                disabled={deleting}
                className="w-full gap-2"
              >
                <Trash2 className="w-4 h-4" />
                Supprimer
              </Button>
            </TabsContent>

            {/* Leads tab */}
            <TabsContent value="leads" className="space-y-4">
              {leadsLoading ? (
                <div className="flex justify-center py-12">
                  <Loader2 className="w-6 h-6 animate-spin" />
                </div>
              ) : leads.length === 0 ? (
                <div className="text-center py-8 text-slate-500">
                  <p>Aucun lead collecté</p>
                </div>
              ) : (
                <div className="space-y-2">
                  {leads.map((lead) => (
                    <a
                      key={lead.id}
                      href={`/leads/${lead.id}`}
                      className="block p-3 border rounded hover:bg-slate-50 dark:hover:bg-slate-800"
                    >
                      <p className="font-mono text-sm font-medium">{lead.phone_number}</p>
                      <div className="flex items-center justify-between mt-1">
                        <StatusBadge status={lead.status} />
                        <span className="text-xs text-slate-500">
                          {new Date(lead.created_at).toLocaleDateString('fr-FR')}
                        </span>
                      </div>
                    </a>
                  ))}
                </div>
              )}
            </TabsContent>
          </Tabs>
        </SheetContent>
      </Sheet>

      <AlertDialog open={showDeleteConfirm} onOpenChange={setShowDeleteConfirm}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Supprimer cette cible ?</AlertDialogTitle>
            <AlertDialogDescription>
              Cette action est irréversible. Tous les leads associés seront conservés mais
              cette cible de scraping sera supprimée.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <div className="flex items-center gap-3 rounded bg-amber-50 p-3 text-sm">
            <span className="text-amber-800">{detail.domain}</span>
          </div>
          <div className="flex gap-2 justify-end">
            <AlertDialogCancel disabled={deleting}>Annuler</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              disabled={deleting}
              className="bg-red-600 hover:bg-red-700"
            >
              {deleting && <Loader2 className="w-4 h-4 animate-spin mr-2" />}
              Supprimer
            </AlertDialogAction>
          </div>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}
