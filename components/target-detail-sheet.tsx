'use client'

import { useEffect, useState } from 'react'
import { useApi } from '@/lib/api-context'
import {
  getTarget,
  updateTarget,
  toggleTarget,
  scrapeTargetNow,
  listTargetLeads,
} from '@/lib/api'
import { showApiError } from '@/lib/api-errors'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { StatusBadge } from '@/components/status-badge'
import { X, Loader2, Ghost, Play } from 'lucide-react'
import { toast } from 'sonner'
import type { ScrapingTarget, Lead } from '@/lib/types'

interface TargetDetailSheetProps {
  target: ScrapingTarget | null
  open: boolean
  onOpenChange: (open: boolean) => void
  onUpdate: (target: ScrapingTarget) => void
}

export function TargetDetailSheet({
  target,
  open,
  onOpenChange,
  onUpdate,
}: TargetDetailSheetProps) {
  const api = useApi()
  const [detail, setDetail] = useState<ScrapingTarget | null>(null)
  const [leads, setLeads] = useState<Lead[]>([])
  const [leadsLoading, setLeadsLoading] = useState(false)
  const [formData, setFormData] = useState({
    name: '',
    frequency: '24',
    selectors: '{}',
  })
  const [isUpdating, setIsUpdating] = useState(false)
  const [scraping, setScraping] = useState(false)

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
    try {
      const updated = await toggleTarget(api, target.id)
      setDetail(updated)
      onUpdate(updated)
    } catch (err) {
      showApiError(err)
    }
  }

  const handleScrapeNow = async () => {
    setScraping(true)
    try {
      const res = await scrapeTargetNow(api, target.id)
      toast.success(res.message || 'Scraping lancé')
      const refreshed = await getTarget(api, target.id)
      setDetail(refreshed)
      onUpdate(refreshed)
    } catch (err) {
      showApiError(err)
    } finally {
      setScraping(false)
    }
  }

  const handleUpdate = async () => {
    setIsUpdating(true)
    try {
      let custom_selectors: Record<string, string> | null = null
      try {
        custom_selectors = JSON.parse(formData.selectors)
      } catch {
        toast.error('JSON des sélecteurs invalide')
        return
      }
      const updated = await updateTarget(api, target.id, {
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

  return (
    <div className={`fixed inset-0 z-50 transition-all duration-300 ${open ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}>
      <div className="absolute inset-0 bg-black/40" onClick={() => onOpenChange(false)} />
      <div
        className={`absolute top-0 right-0 bottom-0 w-full max-w-2xl bg-white shadow-xl transition-transform duration-300 ${
          open ? 'translate-x-0' : 'translate-x-full'
        } overflow-y-auto`}
      >
        <div className="sticky top-0 bg-white border-b border-gray-200 p-6 flex justify-between items-center">
          <div>
            <h2 className="text-lg font-semibold">{detail.name || detail.domain}</h2>
            <p className="text-sm text-gray-600">{detail.domain}</p>
          </div>
          <div className="flex items-center gap-3">
            <Switch checked={detail.is_active} onCheckedChange={handleToggle} />
            <Button variant="ghost" size="sm" onClick={() => onOpenChange(false)} className="h-8 w-8 p-0">
              <X className="w-4 h-4" />
            </Button>
          </div>
        </div>

        <Tabs defaultValue="configuration" className="w-full">
          <TabsList className="w-full rounded-none border-b border-gray-200 bg-transparent p-0 h-auto">
            <TabsTrigger value="configuration" className="rounded-none border-b-2 border-transparent py-3 data-[state=active]:border-blue-500">
              Configuration
            </TabsTrigger>
            <TabsTrigger
              value="leads"
              className="rounded-none border-b-2 border-transparent py-3 data-[state=active]:border-blue-500"
              onClick={loadLeads}
            >
              Leads Collectés
            </TabsTrigger>
          </TabsList>

          <TabsContent value="configuration" className="p-6 space-y-6">
            <div>
              <Label className="font-medium">Domaine (lecture seule)</Label>
              <div className="mt-2 p-3 bg-gray-100 rounded text-gray-600">{detail.domain}</div>
            </div>
            <div>
              <Label htmlFor="name">Nom de la cible</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData((prev) => ({ ...prev, name: e.target.value }))}
                disabled={isUpdating}
                className="mt-2"
              />
            </div>
            <div>
              <Label htmlFor="frequency">Fréquence de scraping (heures)</Label>
              <Input
                id="frequency"
                type="number"
                min="1"
                max="168"
                value={formData.frequency}
                onChange={(e) => setFormData((prev) => ({ ...prev, frequency: e.target.value }))}
                disabled={isUpdating}
                className="mt-2"
              />
            </div>
            <div>
              <Label htmlFor="selectors">Sélecteurs personnalisés (JSON)</Label>
              <textarea
                id="selectors"
                value={formData.selectors}
                onChange={(e) => setFormData((prev) => ({ ...prev, selectors: e.target.value }))}
                disabled={isUpdating}
                className="mt-2 w-full h-40 p-3 border border-gray-300 rounded font-mono text-sm bg-gray-50"
              />
            </div>
            <Button onClick={handleUpdate} disabled={isUpdating} className="w-full gap-2">
              {isUpdating && <Loader2 className="w-4 h-4 animate-spin" />}
              Mettre à jour
            </Button>
            <Button onClick={handleScrapeNow} disabled={scraping} variant="outline" className="w-full gap-2">
              {scraping ? <Loader2 className="w-4 h-4 animate-spin" /> : <Play className="w-4 h-4" />}
              Lancer le scraping maintenant
            </Button>
          </TabsContent>

          <TabsContent value="leads" className="p-6">
            {leadsLoading ? (
              <div className="flex justify-center py-12">
                <Loader2 className="w-6 h-6 animate-spin text-gray-400" />
              </div>
            ) : leads.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <Ghost className="w-12 h-12 text-gray-400 mb-4" />
                <p className="text-gray-600">Aucun lead extrait de cette cible.</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-gray-200">
                      <th className="text-left py-2 px-4 font-medium text-gray-700">Téléphone</th>
                      <th className="text-left py-2 px-4 font-medium text-gray-700">Statut</th>
                      <th className="text-left py-2 px-4 font-medium text-gray-700">Date</th>
                    </tr>
                  </thead>
                  <tbody>
                    {leads.map((lead) => (
                      <tr key={lead.id} className="border-b border-gray-200 hover:bg-gray-50">
                        <td className="py-2 px-4">
                          <a href={`/leads/${lead.id}`} className="text-blue-600 hover:underline">
                            {lead.phone_number}
                          </a>
                        </td>
                        <td className="py-2 px-4">
                          <StatusBadge status={lead.status} />
                        </td>
                        <td className="py-2 px-4 text-gray-600">
                          {new Date(lead.created_at).toLocaleDateString('fr-FR')}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
