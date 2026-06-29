'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '@/hooks/useAuth'
import { useOrg } from '@/hooks/useOrg'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Loader2 } from 'lucide-react'
import { toast } from 'sonner'

export default function OrganisationTab() {
  const { organisation } = useAuth()
  const { org, loading, fetchOrg, updateOrgDetails } = useOrg()
  
  const [orgName, setOrgName] = useState('')
  const [timezone, setTimezone] = useState('Africa/Casablanca')
  const [webhookUrl, setWebhookUrl] = useState('')
  const [saving, setSaving] = useState(false)

  // Load org data on mount
  useEffect(() => {
    fetchOrg()
  }, [fetchOrg])

  // Update form when org data changes
  useEffect(() => {
    if (org) {
      setOrgName(org.name || '')
      setTimezone((org.settings as any)?.timezone || 'Africa/Casablanca')
      setWebhookUrl((org.settings as any)?.webhook_url || '')
    }
  }, [org])

  const handleSaveOrg = async () => {
    if (!orgName.trim()) {
      toast.error('Le nom de l\'organisation ne peut pas être vide')
      return
    }
    setSaving(true)
    try {
      await updateOrgDetails({
        name: orgName,
        timezone,
        webhook_url: webhookUrl,
      })
    } finally {
      setSaving(false)
    }
  }

  const timezones = [
    { value: 'Africa/Casablanca', label: 'Casablanca (GMT+1/+0)' },
    { value: 'Africa/Rabat', label: 'Rabat (GMT+1/+0)' },
    { value: 'Africa/Fez', label: 'Fez (GMT+1/+0)' },
    { value: 'UTC', label: 'UTC' },
    { value: 'Europe/Paris', label: 'Paris (GMT+2/+1)' },
  ]

  return (
    <div className="space-y-6">
      {/* Organisation info */}
      <Card>
        <CardHeader>
          <CardTitle>Informations de l&apos;organisation</CardTitle>
          <CardDescription>Mettez à jour les paramètres de votre organisation</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="orgName">Nom de l&apos;organisation</Label>
            <Input
              id="orgName"
              value={orgName}
              onChange={(e) => setOrgName(e.target.value)}
              placeholder="Nom de votre entreprise"
              className="w-full"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="timezone">Fuseau horaire</Label>
            <Select value={timezone} onValueChange={setTimezone}>
              <SelectTrigger id="timezone">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {timezones.map((tz) => (
                  <SelectItem key={tz.value} value={tz.value}>
                    {tz.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <Button onClick={handleSaveOrg} disabled={saving || loading} className="w-full">
            {saving ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Sauvegarde...
              </>
            ) : (
              'Sauvegarder les modifications'
            )}
          </Button>
        </CardContent>
      </Card>

      {/* Webhook settings */}
      <Card>
        <CardHeader>
          <CardTitle>Webhooks</CardTitle>
          <CardDescription>Recevez des mises à jour en temps réel sur vos leads</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="webhookUrl">URL Webhook</Label>
            <Input
              id="webhookUrl"
              type="url"
              value={webhookUrl}
              onChange={(e) => setWebhookUrl(e.target.value)}
              placeholder="https://votre-domaine.com/webhooks/lead"
              className="w-full"
            />
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Optionnel. Les événements seront envoyés à cette URL quand le statut d&apos;un lead change.
            </p>
          </div>

          <Button variant="outline" className="w-full" disabled>
            Tester le webhook
          </Button>
        </CardContent>
      </Card>

      {/* Organization stats */}
      <Card>
        <CardHeader>
          <CardTitle>À propos de votre organisation</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3 text-sm">
          <div className="flex items-center justify-between py-2 border-b border-slate-200 dark:border-slate-800">
            <span className="text-slate-600 dark:text-slate-400">Plan actuel</span>
            <span className="font-semibold text-slate-900 dark:text-white">Essai gratuit</span>
          </div>
          <div className="flex items-center justify-between py-2 border-b border-slate-200 dark:border-slate-800">
            <span className="text-slate-600 dark:text-slate-400">Membres</span>
            <span className="font-semibold text-slate-900 dark:text-white">À déterminer</span>
          </div>
          <div className="flex items-center justify-between py-2">
            <span className="text-slate-600 dark:text-slate-400">Créée le</span>
            <span className="font-semibold text-slate-900 dark:text-white">
              {organisation?.created_at
                ? new Date(organisation.created_at).toLocaleDateString('fr-FR')
                : '-'}
            </span>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
