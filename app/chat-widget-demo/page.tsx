'use client'

import { useEffect, useState } from 'react'
import { useApiClient } from '@/hooks/useApiClient'
import { listLeads } from '@/lib/api/leads'
import { ChatWidget } from '@/components/chat/chat-widget'
import { EmbedSecurityNotice } from '@/components/chat/embed-security-notice'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Copy, Check } from 'lucide-react'
import { toast } from 'sonner'
import type { Lead } from '@/lib/types'

export default function ChatWidgetDemo() {
  const api = useApiClient()
  const [leadId, setLeadId] = useState('')
  const [recentLeads, setRecentLeads] = useState<Lead[]>([])
  const [orgName, setOrgName] = useState('Fibre Pro Maroc')
  const [primaryColor, setPrimaryColor] = useState('#4F46E5')
  const [position, setPosition] = useState<'bottom-right' | 'bottom-left'>('bottom-right')
  const [copiedSnippet, setCopiedSnippet] = useState(false)

  useEffect(() => {
    listLeads(api, { page: 1, page_size: 20 })
      .then((data) => setRecentLeads(data.items))
      .catch(() => {})
  }, [api])

  const selectedLead = recentLeads.find((l) => l.id === leadId)

  const embedCode = `<!-- Lead.ma Chat Widget -->
<script
  src="https://app.lead.ma/widget.js"
  data-org-id="YOUR_ORG_UUID"
  data-api-key="YOUR_WIDGET_KEY"
  data-primary="${primaryColor}"
  data-position="${position}"
  async
><\/script>`

  const handleCopySnippet = async () => {
    try {
      await navigator.clipboard.writeText(embedCode)
      setCopiedSnippet(true)
      toast.success('Code copié!')
      setTimeout(() => setCopiedSnippet(false), 2000)
    } catch {
      toast.error('Erreur lors de la copie')
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-950">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-0 min-h-screen">
        {/* Left: Mock customer site (60%) */}
        <div className="lg:col-span-2 p-8 lg:p-12 relative bg-white overflow-auto">
          <div className="max-w-2xl">
            {/* Header */}
            <div className="mb-8 pb-6 border-b border-slate-200">
              <h1 className="text-4xl font-bold text-slate-900 mb-2">Fibre Pro Maroc</h1>
              <p className="text-lg text-slate-600">Internet très haut débit pour votre entreprise</p>
            </div>

            {/* Hero */}
            <div className="mb-12 p-8 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl border border-blue-200">
              <h2 className="text-2xl font-bold text-slate-900 mb-2">Connectivité ultra-rapide</h2>
              <p className="text-slate-700 mb-4">
                Découvrez nos offres de fibre optique pour professionnels. Vitesses jusqu&apos;à 1 Gbps, support 24/7.
              </p>
              <button className="bg-indigo-600 hover:bg-indigo-700 text-white font-medium py-2 px-6 rounded-lg transition">
                Demander un devis
              </button>
            </div>

            {/* Features */}
            <div className="grid grid-cols-2 gap-4 mb-8">
              <div className="p-4 border border-slate-200 rounded-lg">
                <p className="font-semibold text-slate-900 mb-1">Vitesse</p>
                <p className="text-sm text-slate-600">Jusqu&apos;à 1 Gbps</p>
              </div>
              <div className="p-4 border border-slate-200 rounded-lg">
                <p className="font-semibold text-slate-900 mb-1">Support</p>
                <p className="text-sm text-slate-600">24h/24, 7j/7</p>
              </div>
              <div className="p-4 border border-slate-200 rounded-lg">
                <p className="font-semibold text-slate-900 mb-1">Installation</p>
                <p className="text-sm text-slate-600">En 48h</p>
              </div>
              <div className="p-4 border border-slate-200 rounded-lg">
                <p className="font-semibold text-slate-900 mb-1">Tarif</p>
                <p className="text-sm text-slate-600">À partir de 1000 DH</p>
              </div>
            </div>

            {/* CTA */}
            <div className="bg-slate-900 text-white p-8 rounded-lg text-center">
              <p className="text-sm text-slate-400 mb-2">Des questions? Utilisez le chat en bas à droite</p>
              <p className="font-semibold">Notre équipe répondra immédiatement</p>
            </div>

            {/* Footer */}
            <div className="mt-12 pt-6 border-t border-slate-200 text-sm text-slate-600">
              <p>&copy; 2024 Fibre Pro Maroc. Tous droits réservés.</p>
            </div>
          </div>

          {/* Widget embedded on page — no leadId = visitor capture flow */}
          <ChatWidget
            leadId={leadId || undefined}
            orgName={orgName}
            primaryColor={primaryColor}
            position={position}
          />
        </div>

        {/* Right: Config panel (40%) */}
        <div className="lg:col-span-1 p-6 lg:p-8 bg-slate-900 border-l border-slate-800 overflow-y-auto space-y-6 h-screen">
          <div>
            <h2 className="text-xl font-bold text-white mb-1">Configuration Widget</h2>
            <p className="text-sm text-slate-400">Personnalisez le widget en direct</p>
          </div>

          {/* Org Name */}
          <div className="space-y-2">
            <Label className="text-white text-sm">Nom Organisation</Label>
            <Input
              value={orgName}
              onChange={(e) => setOrgName(e.target.value)}
              className="bg-slate-800 border-slate-700 text-white"
              placeholder="Fibre Pro Maroc"
            />
          </div>

          {/* Primary Color */}
          <div className="space-y-2">
            <Label className="text-white text-sm">Couleur Primaire</Label>
            <div className="flex gap-2">
              <input
                type="color"
                value={primaryColor}
                onChange={(e) => setPrimaryColor(e.target.value)}
                className="w-12 h-10 rounded cursor-pointer"
              />
              <Input
                value={primaryColor}
                onChange={(e) => setPrimaryColor(e.target.value)}
                className="flex-1 bg-slate-800 border-slate-700 text-white font-mono text-sm"
              />
            </div>
          </div>

          {/* Position */}
          <div className="space-y-2">
            <Label className="text-white text-sm">Position</Label>
            <Select value={position} onValueChange={(v: any) => setPosition(v)}>
              <SelectTrigger className="bg-slate-800 border-slate-700 text-white">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-slate-800 border-slate-700">
                <SelectItem value="bottom-right">En bas à droite</SelectItem>
                <SelectItem value="bottom-left">En bas à gauche</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Lead Selection (dev: legacy flow with existing lead) */}
          <div className="space-y-2 pt-4 border-t border-slate-700">
            <Label className="text-white text-sm">Mode développeur (optionnel)</Label>
            <p className="text-xs text-slate-500 mb-2">
              Par défaut, le widget utilise la capture visiteur (prechat + extraction téléphone).
              Sélectionnez un lead existant pour tester le flux agent.
            </p>
            <Select value={leadId} onValueChange={setLeadId}>
              <SelectTrigger className="bg-slate-800 border-slate-700 text-white">
                <SelectValue placeholder="Sélectionner un lead ou utiliser le formulaire" />
              </SelectTrigger>
              <SelectContent className="bg-slate-800 border-slate-700">
                <SelectItem value="">Capture visiteur (défaut)</SelectItem>
                {recentLeads.map((lead) => (
                  <SelectItem key={lead.id} value={lead.id}>
                    {lead.phone_number}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            {/* Lead Details */}
            {selectedLead && (
              <div className="mt-3 p-3 bg-slate-800 rounded-lg text-sm space-y-1 text-white border border-slate-700">
                <p className="font-medium">{selectedLead.phone_number}</p>
                {selectedLead.company_name && <p className="text-slate-400">{selectedLead.company_name}</p>}
                {selectedLead.qualification_score != null && (
                  <div className="text-xs">
                    Score:{' '}
                    <span
                      className={
                        selectedLead.qualification_score >= 70
                          ? 'text-green-400'
                          : selectedLead.qualification_score >= 40
                            ? 'text-yellow-400'
                            : 'text-red-400'
                      }
                    >
                      {selectedLead.qualification_score.toFixed(0)}/100
                    </span>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Embed Code */}
          <div className="space-y-2 pt-4 border-t border-slate-700">
            <Label className="text-white text-sm">Code à Insérer</Label>
            <div className="relative">
              <pre className="bg-slate-800 border border-slate-700 rounded p-3 text-xs text-slate-300 overflow-x-auto max-h-32">
                {embedCode}
              </pre>
              <Button
                onClick={handleCopySnippet}
                size="sm"
                className="absolute top-2 right-2 bg-slate-700 hover:bg-slate-600"
              >
                {copiedSnippet ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
              </Button>
            </div>
          </div>

          {/* Security Notice */}
          <div className="pt-4 border-t border-slate-700">
            <EmbedSecurityNotice />
          </div>
        </div>
      </div>
    </div>
  )
}
