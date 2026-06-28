'use client'

import { useEffect, useState } from 'react'
import { useApi } from '@/lib/api-context'
import { listLeads } from '@/lib/api'
import { VoiceChatWidget } from '@/components/chat/VoiceChatWidget'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import type { Lead } from '@/lib/types'

export default function ChatWidgetDemo() {
  const api = useApi()
  const [leadId, setLeadId] = useState('')
  const [recentLeads, setRecentLeads] = useState<Lead[]>([])
  const [leadStatus, setLeadStatus] = useState<string | null>(null)
  const [qualScore, setQualScore] = useState<number | null>(null)

  useEffect(() => {
    listLeads(api, { page: 1, page_size: 20 })
      .then((data) => setRecentLeads(data.items))
      .catch(() => {})
  }, [api])

  const selectedLead = recentLeads.find((l) => l.id === leadId)

  return (
    <div className="w-full min-h-screen bg-gradient-to-br from-slate-900 to-slate-800">
      <div className="max-w-6xl mx-auto px-6 py-12">
        <div className="text-white mb-8">
          <h1 className="text-4xl font-bold mb-3">Démo Chatbot RAG + Voix</h1>
          <p className="text-gray-300 text-lg">
            Testez le chatbot Gemini Flash avec RAG pgvector, Whisper STT et gTTS
          </p>

          {/* Feature pills */}
          <div className="flex flex-wrap gap-2 mt-4">
            {[
              'Gemini 2.0 Flash',
              'RAG pgvector',
              'sentence-transformers',
              'Whisper STT',
              'gTTS',
              'Score 0-100',
            ].map((f) => (
              <span
                key={f}
                className="text-xs bg-white/10 text-gray-300 border border-white/20 px-3 py-1 rounded-full"
              >
                {f}
              </span>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Config panel */}
          <Card className="p-5 space-y-4 h-fit">
            <h2 className="font-semibold text-gray-900">Configuration</h2>

            <div className="space-y-2">
              <Label>Lead UUID</Label>
              <Input
                placeholder="Coller un UUID de lead..."
                value={leadId}
                onChange={(e) => setLeadId(e.target.value)}
                className="font-mono text-xs"
              />
            </div>

            {recentLeads.length > 0 && (
              <div className="space-y-2">
                <Label>Ou choisir un lead récent</Label>
                <Select value={leadId} onValueChange={(v) => v && setLeadId(v)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Sélectionner..." />
                  </SelectTrigger>
                  <SelectContent>
                    {recentLeads.map((lead) => (
                      <SelectItem key={lead.id} value={lead.id}>
                        {lead.phone_number}
                        {lead.company_name ? ` — ${lead.company_name}` : ''}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}

            {selectedLead && (
              <div className="bg-gray-50 rounded-lg p-3 text-sm space-y-1">
                <p className="font-medium text-gray-900">{selectedLead.phone_number}</p>
                {selectedLead.company_name && (
                  <p className="text-gray-600">{selectedLead.company_name}</p>
                )}
                <div className="flex items-center gap-2 mt-2">
                  <span className="text-xs text-gray-500">Statut actuel:</span>
                  <Badge variant="outline" className="text-xs">
                    {leadStatus ?? selectedLead.status}
                  </Badge>
                </div>
                {qualScore != null && (
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-gray-500">Score RAG:</span>
                    <span
                      className={`text-xs font-bold ${
                        qualScore >= 70 ? 'text-green-600' :
                        qualScore >= 40 ? 'text-yellow-600' :
                        'text-red-500'
                      }`}
                    >
                      {qualScore.toFixed(0)}/100
                    </span>
                  </div>
                )}
              </div>
            )}

            {/* How-to */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 text-xs text-blue-700">
              <p className="font-semibold mb-1">Comment tester :</p>
              <ol className="list-decimal list-inside space-y-1 text-blue-600">
                <li>Sélectionnez un lead ci-dessus</li>
                <li>Cliquez sur &ldquo;⌨️ Texte&rdquo; ou &ldquo;🔊 Voix&rdquo;</li>
                <li>En mode voix : cliquez sur le micro, parlez, relâchez</li>
                <li>Le chatbot répond via Gemini + RAG</li>
              </ol>
            </div>
          </Card>

          {/* Chat widget */}
          <div className="lg:col-span-2">
            {leadId ? (
              <VoiceChatWidget
                leadId={leadId}
                onStatusChange={(status, score) => {
                  setLeadStatus(status)
                  setQualScore(score)
                }}
              />
            ) : (
              <div className="h-[560px] flex items-center justify-center bg-white/5 border border-white/10 rounded-xl text-gray-400">
                <p className="text-center">
                  Sélectionnez un lead pour démarrer la conversation
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
