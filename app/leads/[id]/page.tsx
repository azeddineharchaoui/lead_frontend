'use client'

import { useState, useEffect, useCallback } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { useApi } from '@/lib/api-context'
import { getLead, updateLeadStatus, deleteLead, updateLead, assignLead } from '@/lib/api'
import { listChatSessions, getChatSession, closeChatSession } from '@/lib/api'
import { showApiError } from '@/lib/api-errors'
import type { LeadDetailResponse, ChatSession, LeadStatus } from '@/lib/types'
import { PageHeader } from '@/components/page-header'
import { StatusTransitionSelect } from '@/components/leads/status-transition-select'
import { StatusHistoryTimeline } from '@/components/leads/status-history-timeline'
import { CrmDeliveryBadge } from '@/components/leads/crm-delivery-badge'
import { AssignLeadDialog } from '@/components/leads/assign-lead-dialog'
import { QualificationPanel } from '@/components/leads/QualificationPanel'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Card } from '@/components/ui/card'
import { Globe, Phone, Calendar, MessageSquare, Check, Lock, Trash2, Loader2, Copy, Users, History, ArrowLeft } from 'lucide-react'
import { toast } from 'sonner'
import { formatPhoneDisplay, copyToClipboard, formatRelativeTime } from '@/lib/format'

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
  const [isUpdatingStatus, setIsUpdatingStatus] = useState(false)
  const [isAssignDialogOpen, setIsAssignDialogOpen] = useState(false)
  const [isNoteSaving, setIsNoteSaving] = useState(false)
  const [notesSaveTimeout, setNotesSaveTimeout] = useState<NodeJS.Timeout | null>(null)
  const [activeTab, setActiveTab] = useState('overview')

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

  const handleUpdateStatus = async (status: LeadStatus, notes?: string) => {
    if (!lead) return
    setIsUpdatingStatus(true)
    try {
      const updated = await updateLeadStatus(api, lead.id, { status, notes })
      setLead({ ...lead, ...updated })
    } catch (err) {
      throw err
    } finally {
      setIsUpdatingStatus(false)
    }
  }

  const handleAutoSaveNotes = useCallback((notes: string) => {
    if (notesSaveTimeout) clearTimeout(notesSaveTimeout)
    
    if (!notes.trim()) {
      setNewNote('')
      return
    }

    setIsNoteSaving(true)
    const timeout = setTimeout(async () => {
      if (!lead) return
      try {
        const updated = await updateLead(api, lead.id, { notes })
        setLead({ ...lead, ...updated })
        toast.success('Note enregistrée')
        setNewNote('')
      } catch (err) {
        toast.error('Erreur lors de l\'enregistrement')
      } finally {
        setIsNoteSaving(false)
      }
    }, 500)

    setNotesSaveTimeout(timeout)
  }, [lead, api, notesSaveTimeout])

  const handleAssignLead = async (agent: string, notes?: string) => {
    if (!lead) return
    try {
      const updated = await assignLead(api, lead.id, agent, notes)
      setLead({ ...lead, ...updated })
    } catch (err) {
      throw err
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
      <div className="flex items-center justify-center py-20">
        <Loader2 className="w-8 h-8 animate-spin text-slate-400" />
      </div>
    )
  }

  if (error || !lead) {
    return (
      <div className="space-y-4">
        <Button variant="ghost" onClick={() => router.back()} className="gap-2">
          <ArrowLeft className="w-4 h-4" />
          Retour
        </Button>
        <Alert variant="destructive">
          <AlertDescription>{error ?? 'Lead introuvable'}</AlertDescription>
        </Alert>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Breadcrumb */}
      <div className="flex items-center justify-between gap-4">
        <Button variant="ghost" onClick={() => router.back()} className="gap-2">
          <ArrowLeft className="w-4 h-4" />
          Leads
        </Button>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={() => setIsAssignDialogOpen(true)} className="gap-2">
            <Users className="w-4 h-4" />
            Assigner
          </Button>
          <Button
            variant="destructive"
            size="sm"
            onClick={() => setShowDeleteConfirm(true)}
            className="gap-2"
          >
            <Trash2 className="w-4 h-4" />
            Supprimer
          </Button>
        </div>
      </div>

      {/* Phone header */}
      <div className="flex items-center justify-between gap-4">
        <div>
          <p className="text-sm text-slate-600 dark:text-slate-400 mb-1">Numéro de téléphone</p>
          <div className="flex items-center gap-2">
            <p className="text-3xl font-mono font-bold text-slate-900 dark:text-white">
              {formatPhoneDisplay(lead.phone_number)}
            </p>
            <Button
              variant="ghost"
              size="sm"
              className="h-8 w-8 p-0"
              onClick={() => {
                copyToClipboard(lead.phone_number)
                toast.success('Numéro copié')
              }}
            >
              <Copy className="w-4 h-4" />
            </Button>
          </div>
        </div>
        <div className="text-right">
          <p className="text-sm text-slate-600 dark:text-slate-400 mb-2">Statut actuel</p>
          <p className="text-lg font-semibold text-slate-900 dark:text-white">{lead.company_name || '—'}</p>
        </div>
      </div>

      {/* Delete confirmation */}
      {showDeleteConfirm && (
        <Alert variant="destructive">
          <AlertDescription className="flex items-center justify-between gap-4">
            <span>Supprimer ce lead ? Cette action est irréversible.</span>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowDeleteConfirm(false)}
                disabled={isDeleting}
              >
                Annuler
              </Button>
              <Button
                variant="destructive"
                size="sm"
                onClick={handleDeleteLead}
                disabled={isDeleting}
              >
                {isDeleting && <Loader2 className="w-4 h-4 mr-1 animate-spin" />}
                Confirmer
              </Button>
            </div>
          </AlertDescription>
        </Alert>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* LEFT SIDEBAR */}
        <div className="lg:col-span-1 space-y-4">
          {/* Status transition */}
          <Card className="p-4">
            <StatusTransitionSelect
              currentStatus={lead.status}
              onStatusChange={handleUpdateStatus}
              isLoading={isUpdatingStatus}
            />
          </Card>

          {/* Lead identity card */}
          <Card className="p-4 space-y-3">
            <p className="text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wider">
              Informations
            </p>
            <div className="space-y-3 text-sm">
              {lead.company_name && (
                <div className="flex items-start gap-2">
                  <span className="text-xs text-slate-600 dark:text-slate-400 mt-0.5">Entreprise:</span>
                  <span className="font-medium text-slate-900 dark:text-white">{lead.company_name}</span>
                </div>
              )}
              {lead.website_domain && (
                <div className="flex items-start gap-2">
                  <span className="text-xs text-slate-600 dark:text-slate-400 mt-0.5">Domaine:</span>
                  <a
                    href={`https://${lead.website_domain}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="font-medium text-indigo-600 dark:text-indigo-400 hover:underline flex items-center gap-1"
                  >
                    {lead.website_domain}
                    <Globe className="w-3 h-3" />
                  </a>
                </div>
              )}
              {lead.assigned_to && (
                <div className="flex items-start gap-2">
                  <span className="text-xs text-slate-600 dark:text-slate-400 mt-0.5">Assigné à:</span>
                  <span className="font-medium text-slate-900 dark:text-white">{lead.assigned_to}</span>
                </div>
              )}
              <div className="flex items-start gap-2">
                <span className="text-xs text-slate-600 dark:text-slate-400 mt-0.5">Appels:</span>
                <span className="font-medium text-slate-900 dark:text-white">{lead.call_attempts}</span>
              </div>
              {lead.last_called_at && (
                <div className="flex items-start gap-2">
                  <span className="text-xs text-slate-600 dark:text-slate-400 mt-0.5">Dernier:</span>
                  <span className="font-medium text-slate-900 dark:text-white">
                    {formatRelativeTime(lead.last_called_at)}
                  </span>
                </div>
              )}
            </div>
          </Card>

          {/* CRM status */}
          {(lead.crm_pushed_at || lead.crm_last_error || lead.crm_push_attempts) && (
            <Card className="p-4">
              <CrmDeliveryBadge
                crm_pushed_at={lead.crm_pushed_at}
                crm_last_error={lead.crm_last_error}
                crm_push_attempts={lead.crm_push_attempts}
              />
            </Card>
          )}

          {/* Qualification score */}
          {lead.qualification_score !== undefined && (
            <Card className="p-4 space-y-2">
              <p className="text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wider">
                Score de qualification
              </p>
              <div className="flex items-center gap-3">
                <div className="flex-1 h-2 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-indigo-600 dark:bg-indigo-500 transition-all"
                    style={{ width: `${lead.qualification_score}%` }}
                  />
                </div>
                <span className="font-semibold text-slate-900 dark:text-white text-sm w-10 text-right">
                  {lead.qualification_score}%
                </span>
              </div>
            </Card>
          )}

          {/* QualificationPanel */}
          <QualificationPanel
            lead={lead}
            onLeadUpdate={(updates) => setLead((prev) => prev ? { ...prev, ...updates } : prev)}
            onOpenChat={() => setActiveTab('chat')}
          />
        </div>

        {/* MAIN CONTENT */}
        <div className="lg:col-span-3">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="overview">Aperçu</TabsTrigger>
              <TabsTrigger value="history" className="gap-1">
                <History className="w-4 h-4" />
                <span className="hidden sm:inline">Historique</span>
              </TabsTrigger>
              <TabsTrigger value="chat" className="gap-1">
                <MessageSquare className="w-4 h-4" />
                <span className="hidden sm:inline">Chat</span>
              </TabsTrigger>
            </TabsList>

            {/* OVERVIEW TAB */}
            <TabsContent value="overview" className="mt-4 space-y-4">
              {/* Notes section */}
              <Card className="p-4 space-y-3">
                <p className="text-sm font-semibold text-slate-900 dark:text-white">Notes</p>
                {lead.notes && (
                  <div className="bg-slate-50 dark:bg-slate-800/50 p-3 rounded text-sm text-slate-700 dark:text-slate-300 max-h-40 overflow-y-auto whitespace-pre-wrap border border-slate-200 dark:border-slate-700">
                    {lead.notes}
                  </div>
                )}
                <div className="space-y-2">
                  <Textarea
                    placeholder="Ajouter une note (auto-enregistrée)..."
                    value={newNote}
                    onChange={(e) => {
                      setNewNote(e.target.value)
                      handleAutoSaveNotes(e.target.value)
                    }}
                    disabled={isNoteSaving}
                    className="min-h-20 resize-none"
                  />
                  {isNoteSaving && (
                    <p className="text-xs text-slate-500 dark:text-slate-400">Enregistrement en cours...</p>
                  )}
                </div>
              </Card>
            </TabsContent>

            {/* HISTORY TAB */}
            <TabsContent value="history" className="mt-4">
              <Card className="p-4">
                <StatusHistoryTimeline leadId={lead.id} />
              </Card>
            </TabsContent>

            {/* CHAT TAB */}
            <TabsContent value="chat" className="mt-4">
              <Card className="p-4 space-y-4 min-h-[400px] flex flex-col">
                {sessionSummaries.length === 0 ? (
                  <div className="flex-1 flex items-center justify-center text-slate-500 dark:text-slate-400">
                    <p>Aucune conversation pour ce lead</p>
                  </div>
                ) : (
                  <>
                    <div className="flex items-center justify-between">
                      <label className="text-sm font-medium text-slate-700 dark:text-slate-300">
                        Sélectionner une conversation
                      </label>
                      {selectedSessionId && selectedSession?.is_active && (
                        <Button
                          variant="outline"
                          size="sm"
                          className="gap-2"
                          onClick={handleCloseSession}
                        >
                          <Lock className="w-4 h-4" />
                          Clôturer
                        </Button>
                      )}
                    </div>

                    <select
                      value={selectedSessionId || ''}
                      onChange={(e) => setSelectedSessionId(e.target.value)}
                      className="px-3 py-2 rounded-md border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-sm"
                    >
                      <option value="">Choisir...</option>
                      {sessionSummaries.map((session) => (
                        <option key={session.id} value={session.id}>
                          {new Date(session.created_at).toLocaleDateString('fr-FR')} —{' '}
                          {new Date(session.created_at).toLocaleTimeString('fr-FR', {
                            hour: '2-digit',
                            minute: '2-digit',
                          })}
                          {session.is_active ? ' (active)' : ''}
                        </option>
                      ))}
                    </select>

                    {sessionLoading ? (
                      <div className="flex-1 flex justify-center items-center">
                        <Loader2 className="w-6 h-6 animate-spin text-slate-400" />
                      </div>
                    ) : selectedSession ? (
                      <>
                        {selectedSession.intent_detected && (
                          <div className="bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-800 rounded-lg p-3">
                            <p className="text-sm font-medium text-emerald-900 dark:text-emerald-100">
                              Intention détectée: {selectedSession.intent_detected}
                            </p>
                            {selectedSession.intent_confidence != null && (
                              <p className="text-xs text-emerald-700 dark:text-emerald-300 mt-1">
                                Confiance: {(selectedSession.intent_confidence * 100).toFixed(0)}%
                              </p>
                            )}
                          </div>
                        )}
                        <div className="flex-1 overflow-y-auto space-y-2 bg-slate-50 dark:bg-slate-800/50 p-3 rounded border border-slate-200 dark:border-slate-700">
                          {selectedSession.chat_history.map((msg, idx) => (
                            <div
                              key={idx}
                              className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                            >
                              <div
                                className={`max-w-xs px-3 py-2 rounded-lg text-sm ${
                                  msg.role === 'user'
                                    ? 'bg-indigo-600 text-white rounded-br-none'
                                    : 'bg-slate-300 dark:bg-slate-600 text-slate-900 dark:text-white rounded-bl-none'
                                }`}
                              >
                                <p>{msg.content}</p>
                                <p className="text-xs opacity-60 mt-0.5">
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
                  </>
                )}
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>

      {/* Assign dialog */}
      <AssignLeadDialog
        open={isAssignDialogOpen}
        onOpenChange={setIsAssignDialogOpen}
        currentAssignedTo={lead.assigned_to}
        onAssign={handleAssignLead}
      />
    </div>
  )
}
