'use client'

import { useState, useEffect, useCallback } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { useApi } from '@/lib/api-context'
import { getLead, updateLeadStatus, deleteLead } from '@/lib/api'
import { listChatSessions, getChatSession, closeChatSession } from '@/lib/api'
import { showApiError } from '@/lib/api-errors'
import type { LeadDetailResponse, ChatSession, LeadStatus } from '@/lib/types'
import { StatusBadge } from '@/components/status-badge'
import { QualificationPanel } from '@/components/leads/QualificationPanel'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Alert, AlertDescription } from '@/components/ui/alert'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Card } from '@/components/ui/card'
import { Globe, Phone, Calendar, MessageSquare, Check, Lock, Trash2, Loader2 } from 'lucide-react'
import { toast } from 'sonner'

export default function LeadDetailPage() {
  const params = useParams()
  const router = useRouter()
  const leadId = params.id as string
  const api = useApi()

  const [lead, setLead] = useState<LeadDetailResponse | null>(null)
  const [sessionSummaries, setSessionSummaries] = useState<{ id: string; created_at: string; is_active: boolean }[]>([])
  const [selectedSession, setSelectedSession] = useState<ChatSession | null>(null)
  const [selectedSessionId, setSelectedSessionId] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [newNote, setNewNote] = useState('')
  const [isDeleting, setIsDeleting] = useState(false)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const [sessionLoading, setSessionLoading] = useState(false)

  const loadLead = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)
      const data = await getLead(api, leadId)
      setLead(data)
      setSessionSummaries(
        data.chat_sessions.map((s) => ({
          id: s.id,
          created_at: s.created_at,
          is_active: s.is_active,
        })),
      )
      if (data.chat_sessions.length > 0) {
        setSelectedSessionId(data.chat_sessions[0].id)
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Lead introuvable')
      showApiError(err)
    } finally {
      setLoading(false)
    }
  }, [api, leadId])

  useEffect(() => {
    loadLead()
  }, [loadLead])

  useEffect(() => {
    if (!selectedSessionId || !leadId) {
      setSelectedSession(null)
      return
    }
    let cancelled = false
    const loadSession = async () => {
      setSessionLoading(true)
      try {
        const session = await getChatSession(api, leadId, selectedSessionId)
        if (!cancelled) setSelectedSession(session)
      } catch (err) {
        if (!cancelled) showApiError(err)
      } finally {
        if (!cancelled) setSessionLoading(false)
      }
    }
    loadSession()
    return () => {
      cancelled = true
    }
  }, [api, leadId, selectedSessionId])

  const handleAddNote = async () => {
    if (!newNote.trim() || !lead) return
    const updatedNotes = lead.notes
      ? `${lead.notes}\n---\n${new Date().toLocaleString('fr-FR')}\n${newNote}`
      : `${new Date().toLocaleString('fr-FR')}\n${newNote}`
    try {
      const updated = await updateLeadStatus(api, lead.id, {
        status: lead.status,
        notes: updatedNotes,
      })
      setLead({ ...lead, ...updated })
      setNewNote('')
      toast.success('Note ajoutée')
    } catch (err) {
      showApiError(err)
    }
  }

  const handleUpdateStatus = async (status: LeadStatus) => {
    if (!lead) return
    try {
      const updated = await updateLeadStatus(api, lead.id, { status })
      setLead({ ...lead, ...updated })
      toast.success('Statut mis à jour')
    } catch (err) {
      showApiError(err)
    }
  }

  const handleDeleteLead = async () => {
    if (!lead) return
    setIsDeleting(true)
    try {
      await deleteLead(api, lead.id)
      toast.success('Lead supprimé')
      router.push('/leads')
    } catch (err) {
      showApiError(err)
    } finally {
      setIsDeleting(false)
    }
  }

  const handleCloseSession = async () => {
    if (!selectedSessionId || !lead) return
    try {
      await closeChatSession(api, lead.id, selectedSessionId)
      toast.success('Session clôturée')
      const sessions = await listChatSessions(api, lead.id)
      setSessionSummaries(
        sessions.map((s) => ({
          id: s.id,
          created_at: s.created_at,
          is_active: s.is_active,
        })),
      )
      setSelectedSessionId(sessions[0]?.id ?? null)
      setSelectedSession(null)
    } catch (err) {
      showApiError(err)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <Loader2 className="w-8 h-8 animate-spin text-gray-400" />
      </div>
    )
  }

  if (error || !lead) {
    return (
      <div className="p-6">
        <Alert variant="destructive">
          <AlertDescription>{error ?? 'Lead introuvable'}</AlertDescription>
        </Alert>
      </div>
    )
  }

  return (
    <div className="p-6 space-y-6">
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-gray-600 mb-2">Numéro</p>
            <p className="text-3xl font-mono font-bold text-gray-900">{lead.phone_number}</p>
          </div>
          <div className="text-right space-y-3">
            <StatusBadge status={lead.status} />
            <p className="text-lg font-semibold text-gray-900">{lead.company_name}</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-1 space-y-6">
          <Card className="p-6 space-y-4">
            <h3 className="font-bold text-gray-900">Informations</h3>
            <div className="space-y-3">
              {lead.source_url && (
                <div className="flex items-start gap-3">
                  <Globe className="w-5 h-5 text-gray-400 mt-0.5" />
                  <div className="min-w-0 flex-1">
                    <p className="text-xs text-gray-600">Source</p>
                    <p className="text-sm font-medium text-blue-600 break-words">{lead.source_url}</p>
                  </div>
                </div>
              )}
              {lead.website_domain && (
                <div className="flex items-start gap-3">
                  <Globe className="w-5 h-5 text-gray-400 mt-0.5" />
                  <div className="min-w-0 flex-1">
                    <p className="text-xs text-gray-600">Domaine</p>
                    <p className="text-sm font-medium text-gray-900">{lead.website_domain}</p>
                  </div>
                </div>
              )}
              <div className="flex items-start gap-3">
                <Phone className="w-5 h-5 text-gray-400 mt-0.5" />
                <div className="flex-1">
                  <p className="text-xs text-gray-600">Tentatives d&apos;appel</p>
                  <p className="text-sm font-medium text-gray-900">{lead.call_attempts}</p>
                </div>
              </div>
              {lead.last_called_at && (
                <div className="flex items-start gap-3">
                  <Calendar className="w-5 h-5 text-gray-400 mt-0.5" />
                  <div className="flex-1">
                    <p className="text-xs text-gray-600">Dernier appel</p>
                    <p className="text-sm font-medium text-gray-900">
                      {new Date(lead.last_called_at).toLocaleDateString('fr-FR')}
                    </p>
                  </div>
                </div>
              )}
              <div className="flex items-start gap-3">
                <Calendar className="w-5 h-5 text-gray-400 mt-0.5" />
                <div className="flex-1">
                  <p className="text-xs text-gray-600">Date création</p>
                  <p className="text-sm font-medium text-gray-900">
                    {new Date(lead.created_at).toLocaleDateString('fr-FR')}
                  </p>
                </div>
              </div>
            </div>
          </Card>

          <Card className="p-6 space-y-4">
            <h3 className="font-bold text-gray-900">Statut</h3>
            <Select value={lead.status} onValueChange={(v) => handleUpdateStatus(v as LeadStatus)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="nouveau">Nouveau</SelectItem>
                <SelectItem value="en_cours">En cours</SelectItem>
                <SelectItem value="qualifie">Qualifié</SelectItem>
                <SelectItem value="rejete">Rejeté</SelectItem>
              </SelectContent>
            </Select>
            <div className="mt-4 space-y-4">
              {['nouveau', 'en_cours', 'qualifie'].map((status, idx) => (
                <div key={status} className="flex gap-3">
                  <div className="flex flex-col items-center">
                    <div
                      className={`w-8 h-8 rounded-full flex items-center justify-center ${
                        ['nouveau', 'en_cours', 'qualifie'].indexOf(lead.status) >= idx
                          ? 'bg-green-500 text-white'
                          : 'bg-gray-200 text-gray-600'
                      }`}
                    >
                      {['nouveau', 'en_cours', 'qualifie'].indexOf(lead.status) >= idx ? (
                        <Check className="w-4 h-4" />
                      ) : (
                        idx + 1
                      )}
                    </div>
                    {idx < 2 && (
                      <div
                        className={`w-1 h-6 ${
                          ['nouveau', 'en_cours', 'qualifie'].indexOf(lead.status) > idx
                            ? 'bg-green-500'
                            : 'bg-gray-200'
                        }`}
                      />
                    )}
                  </div>
                  <div>
                    <p className="font-medium text-gray-900 capitalize">
                      {status === 'en_cours' ? 'En cours' : status}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </Card>

          <QualificationPanel
            lead={lead}
            onLeadUpdate={(updates) => setLead((prev) => prev ? { ...prev, ...updates } : prev)}
          />

          <Card className="p-6 space-y-4">
            <h3 className="font-bold text-gray-900">Notes</h3>
            {lead.notes && (
              <div className="bg-gray-50 p-3 rounded text-sm text-gray-700 max-h-40 overflow-y-auto whitespace-pre-wrap">
                {lead.notes}
              </div>
            )}
            <div className="space-y-2">
              <Textarea
                placeholder="Ajouter une note..."
                value={newNote}
                onChange={(e) => setNewNote(e.target.value)}
                className="min-h-24"
              />
              <Button onClick={handleAddNote} disabled={!newNote.trim()} className="w-full">
                Ajouter une note
              </Button>
            </div>
            <div className="pt-4 border-t border-gray-200">
              {!showDeleteConfirm ? (
                <Button
                  variant="destructive"
                  className="w-full gap-2"
                  onClick={() => setShowDeleteConfirm(true)}
                >
                  <Trash2 className="w-4 h-4" />
                  Supprimer définitivement
                </Button>
              ) : (
                <div className="space-y-2">
                  <p className="text-sm text-gray-700">
                    Êtes-vous sûr ? Cette action est irréversible.
                  </p>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      className="flex-1"
                      onClick={() => setShowDeleteConfirm(false)}
                      disabled={isDeleting}
                    >
                      Annuler
                    </Button>
                    <Button
                      variant="destructive"
                      className="flex-1"
                      onClick={handleDeleteLead}
                      disabled={isDeleting}
                    >
                      {isDeleting && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                      Confirmer
                    </Button>
                  </div>
                </div>
              )}
            </div>
          </Card>
        </div>

        <div className="lg:col-span-2">
          <Card className="p-6 h-full flex flex-col">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold text-gray-900 flex items-center gap-2">
                <MessageSquare className="w-5 h-5" />
                Historique de chat
              </h3>
              {selectedSessionId && selectedSession?.is_active && (
                <Button variant="ghost" size="sm" className="gap-2" onClick={handleCloseSession}>
                  <Lock className="w-4 h-4" />
                  Clôturer la session
                </Button>
              )}
            </div>

            {sessionSummaries.length === 0 ? (
              <div className="flex-1 flex items-center justify-center text-gray-500">
                <p>Aucune conversation pour ce lead</p>
              </div>
            ) : (
              <div className="space-y-4 flex-1 flex flex-col">
                <Select value={selectedSessionId || ''} onValueChange={setSelectedSessionId}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {sessionSummaries.map((session) => (
                      <SelectItem key={session.id} value={session.id}>
                        {new Date(session.created_at).toLocaleDateString('fr-FR')} —{' '}
                        {new Date(session.created_at).toLocaleTimeString('fr-FR', {
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                        {session.is_active ? ' (active)' : ''}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                {sessionLoading ? (
                  <div className="flex justify-center py-8">
                    <Loader2 className="w-6 h-6 animate-spin text-gray-400" />
                  </div>
                ) : selectedSession ? (
                  <>
                    {selectedSession.intent_detected && (
                      <div className="bg-green-50 border border-green-200 rounded-lg p-3">
                        <p className="text-sm font-medium text-gray-900">Intention détectée</p>
                        <p className="text-sm text-gray-600 mt-1">
                          <span className="font-semibold text-green-700">
                            {selectedSession.intent_detected}
                          </span>
                          {selectedSession.intent_confidence != null &&
                            ` (${(selectedSession.intent_confidence * 100).toFixed(0)}% de confiance)`}
                        </p>
                      </div>
                    )}
                    <div className="flex-1 overflow-y-auto space-y-3 bg-gray-50 p-4 rounded-lg border min-h-[300px]">
                      {selectedSession.chat_history.map((msg, idx) => (
                        <div
                          key={idx}
                          className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                        >
                          <div
                            className={`max-w-xs px-4 py-2 rounded-lg ${
                              msg.role === 'user'
                                ? 'bg-blue-500 text-white rounded-br-none'
                                : 'bg-gray-300 text-gray-900 rounded-bl-none'
                            }`}
                          >
                            <p className="text-sm">{msg.content}</p>
                            <p
                              className={`text-xs mt-1 opacity-60 ${
                                msg.role === 'user' ? 'text-blue-100' : 'text-gray-600'
                              }`}
                            >
                              {new Date(msg.timestamp).toLocaleTimeString('fr-FR', {
                                hour: '2-digit',
                                minute: '2-digit',
                              })}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </>
                ) : null}
              </div>
            )}
          </Card>
        </div>
      </div>
    </div>
  )
}
