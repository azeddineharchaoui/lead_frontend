'use client'

import { useState } from 'react'
import { useApiClient } from '@/hooks/useApiClient'
import { createTarget } from '@/lib/api/targets'
import { showApiError } from '@/lib/api-errors'
import type { ScrapingTargetCreate } from '@/lib/types'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { Textarea } from '@/components/ui/textarea'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion'
import { AlertCircle, Loader2 } from 'lucide-react'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { toast } from 'sonner'

interface AddTargetDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onTargetCreated: (target: any) => void
}

function isValidHttpUrl(string: string) {
  try {
    const url = new URL(string)
    return url.protocol === 'http:' || url.protocol === 'https:'
  } catch (_) {
    return false
  }
}

export function AddTargetDialog({ open, onOpenChange, onTargetCreated }: AddTargetDialogProps) {
  const api = useApiClient()
  const [loading, setLoading] = useState(false)
  const [domain, setDomain] = useState('')
  const [name, setName] = useState('')
  const [frequency, setFrequency] = useState('24')
  const [isActive, setIsActive] = useState(true)
  const [selectors, setSelectors] = useState<Record<string, string>>({})
  const [selectorKey, setSelectorKey] = useState('')
  const [selectorValue, setSelectorValue] = useState('')
  const [error, setError] = useState<string | null>(null)

  const handleReset = () => {
    setDomain('')
    setName('')
    setFrequency('24')
    setIsActive(true)
    setSelectors({})
    setSelectorKey('')
    setSelectorValue('')
    setError(null)
  }

  const handleOpenChange = (newOpen: boolean) => {
    if (!newOpen) handleReset()
    onOpenChange(newOpen)
  }

  const handleAddSelector = () => {
    if (!selectorKey.trim() || !selectorValue.trim()) {
      toast.error('Clé et valeur du sélecteur requises')
      return
    }
    setSelectors((prev) => ({ ...prev, [selectorKey]: selectorValue }))
    setSelectorKey('')
    setSelectorValue('')
  }

  const handleRemoveSelector = (key: string) => {
    setSelectors((prev) => {
      const newSelectors = { ...prev }
      delete newSelectors[key]
      return newSelectors
    })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)

    if (!domain.trim()) {
      setError('L\'URL du domaine est requise')
      return
    }

    // Ensure URL has protocol
    let urlWithProtocol = domain
    if (!urlWithProtocol.startsWith('http://') && !urlWithProtocol.startsWith('https://')) {
      urlWithProtocol = 'https://' + urlWithProtocol
    }

    if (!isValidHttpUrl(urlWithProtocol)) {
      setError('Format d\'URL invalide (ex: https://annuaire.ma)')
      return
    }

    setLoading(true)
    try {
      const payload: ScrapingTargetCreate = {
        domain: urlWithProtocol,
        name: name.trim() || null,
        scraping_frequency_hours: parseInt(frequency, 10),
        is_active: isActive,
        custom_selectors: Object.keys(selectors).length > 0 ? selectors : null,
      }

      const created = await createTarget(api, payload)
      toast.success('Cible créée avec succès')
      onTargetCreated(created)
      handleReset()
      onOpenChange(false)
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erreur de création'
      setError(errorMessage)
      showApiError(err)
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>Ajouter une nouvelle cible</DialogTitle>
          <DialogDescription>
            Créez une cible de scraping pour collecter automatiquement des leads
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {/* Domain */}
          <div className="space-y-2">
            <Label htmlFor="domain">
              URL du domaine <span className="text-red-500">*</span>
            </Label>
            <Input
              id="domain"
              placeholder="https://annuaire.ma"
              value={domain}
              onChange={(e) => setDomain(e.target.value)}
              disabled={loading}
              required
            />
            <p className="text-xs text-slate-500">Doit être une URL valide commençant par https://</p>
          </div>

          {/* Name */}
          <div className="space-y-2">
            <Label htmlFor="name">Nom de la cible (optionnel)</Label>
            <Input
              id="name"
              placeholder="ex: Annuaire Casablanca"
              value={name}
              onChange={(e) => setName(e.target.value)}
              disabled={loading}
            />
          </div>

          {/* Frequency */}
          <div className="space-y-2">
            <Label htmlFor="frequency">Fréquence de scraping (heures)</Label>
            <Select value={frequency} onValueChange={setFrequency} disabled={loading}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {[6, 12, 24, 48, 72, 168].map((h) => (
                  <SelectItem key={h} value={String(h)}>
                    {h === 6
                      ? 'Toutes les 6 heures'
                      : h === 12
                        ? 'Toutes les 12 heures'
                        : h === 24
                          ? 'Chaque jour'
                          : h === 48
                            ? 'Tous les 2 jours'
                            : h === 72
                              ? 'Tous les 3 jours'
                              : 'Chaque semaine'}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Active switch */}
          <div className="flex items-center justify-between py-2">
            <Label htmlFor="isActive" className="flex-1">
              Activer immédiatement
            </Label>
            <Switch
              id="isActive"
              checked={isActive}
              onCheckedChange={setIsActive}
              disabled={loading}
            />
          </div>

          {/* Custom selectors accordion */}
          <Accordion type="single" collapsible>
            <AccordionItem value="selectors">
              <AccordionTrigger>Sélecteurs personnalisés (avancé)</AccordionTrigger>
              <AccordionContent className="space-y-3">
                <p className="text-xs text-slate-600">
                  Définissez des sélecteurs CSS personnalisés pour cibler des champs spécifiques
                </p>

                {/* Selector editor */}
                <div className="space-y-2">
                  <div className="grid grid-cols-2 gap-2">
                    <Input
                      placeholder="Clé (ex: phone)"
                      value={selectorKey}
                      onChange={(e) => setSelectorKey(e.target.value)}
                      disabled={loading}
                      size={1}
                    />
                    <Input
                      placeholder="Sélecteur CSS"
                      value={selectorValue}
                      onChange={(e) => setSelectorValue(e.target.value)}
                      disabled={loading}
                      size={1}
                    />
                  </div>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={handleAddSelector}
                    disabled={loading || !selectorKey || !selectorValue}
                    className="w-full"
                  >
                    Ajouter
                  </Button>
                </div>

                {/* List of selectors */}
                {Object.entries(selectors).length > 0 && (
                  <div className="space-y-2 border-t pt-3">
                    {Object.entries(selectors).map(([key, value]) => (
                      <div
                        key={key}
                        className="flex items-center justify-between bg-slate-50 p-2 rounded text-sm"
                      >
                        <div>
                          <span className="font-medium">{key}</span>
                          <span className="text-slate-500 ml-2">→ {value}</span>
                        </div>
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => handleRemoveSelector(key)}
                          disabled={loading}
                        >
                          Supprimer
                        </Button>
                      </div>
                    ))}
                  </div>
                )}
              </AccordionContent>
            </AccordionItem>
          </Accordion>

          {/* Actions */}
          <div className="flex gap-2 justify-end pt-6 border-t">
            <Button
              type="button"
              variant="outline"
              onClick={() => handleOpenChange(false)}
              disabled={loading}
            >
              Annuler
            </Button>
            <Button type="submit" disabled={loading} className="gap-2">
              {loading && <Loader2 className="w-4 h-4 animate-spin" />}
              Créer la cible
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
