'use client'

import { useState, useEffect, useCallback } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { useApiClient } from '@/hooks/useApiClient'
import { getLead, updateLeadStatus, deleteLead, updateLead, assignLead, retryCrmPush } from '@/lib/api'
import { listChatSessions, getChatSession, closeChatSession } from '@/lib/api'
import { showApiError } from '@/lib/api-errors'
import type { LeadDetailResponse, ChatSession, LeadStatus } from '@/lib/types'
import { PageHeader } from '@/components/page-header'
import { StatusTransitionSelect } from '@/components/leads/status-transition-select'
import { StatusHistoryTimeline } from '@/components/leads/status-history-timeline'
import { CrmDeliveryCard } from '@/components/leads/crm-delivery-card'
import { CrmTab } from '@/components/leads/crm-tab'
import { AssignLeadDialog } from '@/components/leads/assign-lead-dialog'
import { QualificationPanel } from '@/components/leads/QualificationPanel'
import { LeadChatPanel } from '@/components/chat/lead-chat-panel'
import { SessionSidebar } from '@/components/chat/session-sidebar'
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
  const api = useApiClient()

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
  const [isRetryingCrm, setIsRetryingCrm] = useState(false)

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

  const handleRetryCrmPush = async () => {
    if (!lead) return
    try {
      setIsRetryingCrm(true)
      await retryCrmPush(api, lead.id)
      toast.success('Envoi CRM en attente')
      // Refresh lead to get updated status
      await loadLead()
    } catch (err) {
      showApiError(err)
    } finally {
      setIsRetryingCrm(false)
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

          {/* CRM status card */}
          <CrmDeliveryCard
            lead={lead}
            onRetry={handleRetryCrmPush}
            isRetrying={isRetryingCrm}
          />

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
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="overview">Fiche</TabsTrigger>
              <TabsTrigger value="history" className="gap-1">
                <History className="w-4 h-4" />
                <span className="hidden sm:inline">Historique</span>
              </TabsTrigger>
              <TabsTrigger value="chat" className="gap-1">
                <MessageSquare className="w-4 h-4" />
                <span className="hidden sm:inline">Chat</span>
              </TabsTrigger>
              <TabsTrigger value="crm">CRM</TabsTrigger>
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
              <div className="flex h-[600px] border rounded-lg overflow-hidden bg-white dark:bg-slate-900">
                <SessionSidebar
                  sessions={lead.chat_sessions}
                  activeId={selectedSessionId || undefined}
                  onSelect={setSelectedSessionId}
                  onNew={() => {
                    setSelectedSessionId(null)
                    setSelectedSession(null)
                    loadLead()
                  }}
                  onClose={handleCloseSession}
                  isLoading={sessionLoading}
                />
                <div className="flex-1 flex flex-col overflow-hidden">
                  {selectedSessionId && lead.chat_sessions.length > 0 ? (
                    <LeadChatPanel
                      leadId={lead.id}
                      canSendMessage={true}
                      onLeadStatusChange={(status, score) => {
                        loadLead()
                        toast.success(`Statut changé: ${status}`)
                      }}
                      channel="web_chat"
                    />
                  ) : (
                    <div className="flex-1 flex items-center justify-center text-slate-500 dark:text-slate-400">
                      <p>Sélectionnez une session pour commencer</p>
                    </div>
                  )}
                </div>
              </div>
            </TabsContent>

            {/* CRM TAB */}
            <TabsContent value="crm" className="mt-4">
              <CrmTab
                lead={lead}
                onRetry={handleRetryCrmPush}
                isRetrying={isRetryingCrm}
              />
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
