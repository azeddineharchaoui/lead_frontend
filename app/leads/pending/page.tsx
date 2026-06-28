'use client'

import { useState, useEffect, useCallback } from 'react'
import { useApi } from '@/lib/api-context'
import { listPendingLeads, updateLeadStatus } from '@/lib/api'
import { showApiError } from '@/lib/api-errors'
import type { Lead, LeadStatus } from '@/lib/types'
import { StatusBadge } from '@/components/status-badge'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Phone, CheckCircle, XCircle, MessageSquare } from 'lucide-react'
import { toast } from 'sonner'

export default function PendingQueuePage() {
  const api = useApi()
  const [leads, setLeads] = useState<Lead[]>([])
  const [selectedLeadId, setSelectedLeadId] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [callStarted, setCallStarted] = useState(false)
  const [notes, setNotes] = useState('')
  const [busy, setBusy] = useState(false)

  const loadLeads = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)
      const data = await listPendingLeads(api, 50)
      setLeads(data)
      if (data.length > 0) {
        setSelectedLeadId((prev) => prev && data.some((l) => l.id === prev) ? prev : data[0].id)
      } else {
        setSelectedLeadId(null)
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Impossible de charger la file')
      showApiError(err)
      setLeads([])
    } finally {
      setLoading(false)
    }
  }, [api])

  useEffect(() => {
    loadLeads()
  }, [loadLeads])

  const selectedLead = leads.find((l) => l.id === selectedLeadId)

  const patchStatus = async (status: LeadStatus, successMsg: string) => {
    if (!selectedLead) return
    setBusy(true)
    try {
      const updated = await updateLeadStatus(api, selectedLead.id, {
        status,
        notes: notes.trim() || undefined,
      })
      toast.success(successMsg)
      setLeads((prev) => prev.filter((l) => l.id !== updated.id))
      resetCall()
      const remaining = leads.filter((l) => l.id !== updated.id)
      setSelectedLeadId(remaining[0]?.id ?? null)
    } catch (err) {
      showApiError(err)
    } finally {
      setBusy(false)
    }
  }

  const handleStartCall = async () => {
    if (!selectedLead) return
    setBusy(true)
    try {
      const updated = await updateLeadStatus(api, selectedLead.id, { status: 'en_cours' })
      setLeads((prev) => prev.map((l) => (l.id === updated.id ? updated : l)))
      setCallStarted(true)
    } catch (err) {
      showApiError(err)
    } finally {
      setBusy(false)
    }
  }

  const handleQualify = () => patchStatus('qualifie', `Lead qualifié: ${selectedLead?.phone_number}`)
  const handleReject = () => patchStatus('rejete', `Lead rejeté: ${selectedLead?.phone_number}`)

  const handleSaveNote = async () => {
    if (!selectedLead || !notes.trim()) return
    setBusy(true)
    try {
      const updated = await updateLeadStatus(api, selectedLead.id, {
        status: selectedLead.status,
        notes: notes.trim(),
      })
      setLeads((prev) => prev.map((l) => (l.id === updated.id ? updated : l)))
      toast.success('Note enregistrée')
    } catch (err) {
      showApiError(err)
    } finally {
      setBusy(false)
    }
  }

  const resetCall = () => {
    setCallStarted(false)
    setNotes('')
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <p className="text-gray-500">Chargement...</p>
      </div>
    )
  }

  return (
    <div className="flex h-full overflow-hidden bg-white">
      <div className="w-[30%] border-r bg-slate-50 overflow-y-auto flex flex-col">
        <div className="sticky top-0 p-4 border-b bg-white">
          <h2 className="font-bold text-gray-900">File d&apos;attente</h2>
          <p className="text-sm text-gray-600">GET /api/v1/leads/pending — {leads.length} leads</p>
        </div>
        {error && (
          <Alert variant="destructive" className="m-2">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}
        <div className="flex-1 overflow-y-auto p-2 space-y-2">
          {leads.length === 0 ? (
            <p className="p-4 text-center text-gray-500 text-sm">Aucun lead en attente</p>
          ) : (
            leads.map((lead) => (
              <button
                key={lead.id}
                type="button"
                onClick={() => {
                  setSelectedLeadId(lead.id)
                  resetCall()
                }}
                className={`w-full p-3 rounded text-left transition-colors ${
                  selectedLeadId === lead.id ? 'bg-blue-500 text-white' : 'bg-white hover:bg-gray-100'
                }`}
              >
                <p className="font-mono font-bold">{lead.phone_number}</p>
                <p className="text-xs mt-1 opacity-75">{lead.company_name || lead.website_domain || 'N/A'}</p>
              </button>
            ))
          )}
        </div>
      </div>

      <div className="flex-1 flex flex-col overflow-hidden">
        {selectedLead ? (
          <>
            <div className="border-b p-6 bg-white">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <p className="text-sm text-gray-600">Numéro à appeler</p>
                  <p className="text-4xl font-bold font-mono text-gray-900 mt-2">{selectedLead.phone_number}</p>
                </div>
                <div className="text-right">
                  <p className="text-sm text-gray-600 mb-2">{selectedLead.company_name}</p>
                  <StatusBadge status={selectedLead.status} />
                </div>
              </div>
              {!callStarted && (
                <Button
                  onClick={handleStartCall}
                  disabled={busy}
                  size="lg"
                  className="w-full gap-2 bg-green-600 hover:bg-green-700"
                >
                  <Phone className="w-5 h-5" />
                  Démarrer l&apos;appel (PATCH → en_cours)
                </Button>
              )}
            </div>
            <div className="flex-1 overflow-y-auto p-6 space-y-6">
              {callStarted ? (
                <>
                  <div className="grid grid-cols-3 gap-3">
                    <Button onClick={handleQualify} disabled={busy} size="lg" className="gap-2 bg-green-600">
                      <CheckCircle className="w-4 h-4" />
                      Qualifier
                    </Button>
                    <Button onClick={handleReject} disabled={busy} size="lg" variant="destructive" className="gap-2">
                      <XCircle className="w-4 h-4" />
                      Rejeter
                    </Button>
                    <Button onClick={handleSaveNote} disabled={busy} size="lg" variant="outline" className="gap-2">
                      <MessageSquare className="w-4 h-4" />
                      Note
                    </Button>
                  </div>
                  <Textarea
                    placeholder="Notes d'appel..."
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    className="min-h-48"
                  />
                </>
              ) : (
                <p className="text-center text-gray-500 py-12">Démarrez l&apos;appel pour qualifier ou rejeter</p>
              )}
            </div>
          </>
        ) : (
          <div className="flex items-center justify-center h-full text-gray-500">Aucun lead sélectionné</div>
        )}
      </div>
    </div>
  )
}
