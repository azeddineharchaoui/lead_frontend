'use client'

import { useState, useEffect } from 'react'
import { useChatSession } from '@/hooks/useChatSession'
import { useTtsPlayback } from '@/hooks/useTtsPlayback'
import { useApiClient } from '@/hooks/useApiClient'
import { ChatComposer } from './chat-composer'
import { MessageList } from './message-list'
import { RagIntelligencePanel } from './rag-intelligence-panel'
import { SessionSelector } from './session-selector'
import { AutoReadToggle } from './auto-read-toggle'
import { VoiceModeOverlay } from './voice-mode-overlay'
import { VoiceTranscriptBubble } from './voice-transcript-bubble'
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet'
import { Button } from '@/components/ui/button'
import { AlertCircle, PanelRight } from 'lucide-react'
import type { LeadStatus, AudioChatResponse } from '@/lib/types'
import { fetchTtsAudio } from '@/lib/api/chat'
import { cn } from '@/lib/utils'
import { toast } from 'sonner'

interface LeadChatPanelProps {
  leadId: string
  canSendMessage?: boolean
  onLeadStatusChange?: (status: LeadStatus, score: number | null) => void
  channel?: 'web_chat' | 'whatsapp' | 'sms' | 'email'
}

export function LeadChatPanel({
  leadId,
  canSendMessage = true,
  onLeadStatusChange,
  channel = 'web_chat',
}: LeadChatPanelProps) {
  const [showIntelligencePanel, setShowIntelligencePanel] = useState(false)
  const [intelligenceOpen, setIntelligenceOpen] = useState(false)
  const [autoRead, setAutoRead] = useState(false)
  const [voiceOverlayOpen, setVoiceOverlayOpen] = useState(false)
  const api = useApiClient()

  const {
    messages,
    sessionId,
    isSending,
    error,
    lastResponse,
    qualificationScore,
    suggestedActions,
    sendMessage,
    loadSession,
    startNewSession,
    isLoading,
  } = useChatSession({
    leadId,
    channel,
    onLeadStatusChange,
  })

  const { isPlaying, isLoading: isTtsLoading, currentMessageId, play, stop, pause, resume } =
    useTtsPlayback()

  // Show intelligence panel on desktop by default after first message
  useEffect(() => {
    if (lastResponse && !showIntelligencePanel) {
      setShowIntelligencePanel(true)
    }
  }, [lastResponse, showIntelligencePanel])

  // Auto-read new assistant messages when enabled
  useEffect(() => {
    if (autoRead && messages.length > 0) {
      const lastMessage = messages[messages.length - 1]
      if (lastMessage.role === 'assistant' && lastMessage.content && !isPlaying) {
        const messageId = `${messages.length - 1}`
        play(messageId, lastMessage.content)
      }
    }
  }, [autoRead, messages, isPlaying, play])

  // Handle audio response from voice overlay
  const handleAudioResponse = (response: AudioChatResponse) => {
    // Append user transcript message
    const userMessage = {
      role: 'user' as const,
      content: response.transcript,
      timestamp: new Date().toISOString(),
      isVoice: true,
    }

    // Append assistant response
    const assistantMessage = {
      role: 'assistant' as const,
      content: response.response_text,
      timestamp: new Date().toISOString(),
    }

    // Update session and trigger onLeadStatusChange if status changed
    if (response.lead_status_changed && response.new_lead_status && onLeadStatusChange) {
      onLeadStatusChange(response.new_lead_status, response.qualification_score ?? null)
      toast.success(`Lead statut changé: ${response.new_lead_status}`)
    }

    // Auto-play TTS if auto-read enabled
    if (autoRead && response.response_text) {
      play('audio-response', response.response_text)
    }
  }

  return (
    <div className="flex flex-col h-full bg-white dark:bg-slate-900 rounded-lg border border-slate-200 dark:border-slate-800">
      {/* Header with session selector */}
      <div className="border-b border-slate-200 dark:border-slate-700 p-4 space-y-3">
        <div className="flex items-center justify-between gap-2">
          <SessionSelector leadId={leadId} onLoadSession={loadSession} onNewSession={startNewSession} />
          <AutoReadToggle enabled={autoRead} onToggle={setAutoRead} />
        </div>

        {/* Desktop toggle for intelligence panel */}
        <div className="hidden lg:flex justify-end">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowIntelligencePanel(!showIntelligencePanel)}
            className="gap-2 text-xs"
          >
            <PanelRight className="w-4 h-4" />
            {showIntelligencePanel ? 'Masquer' : 'Analyser'}
          </Button>
        </div>
      </div>

      {/* Main layout: messages + intelligence (desktop) */}
      <div className="flex-1 overflow-hidden flex">
        {/* Messages column */}
        <div className="flex-1 flex flex-col min-w-0">
          <div className="flex-1 overflow-y-auto p-4">
            {error && (
              <div className="mb-4 p-3 bg-red-50 dark:bg-red-950 border border-red-200 dark:border-red-800 rounded-lg flex gap-2">
                <AlertCircle className="w-4 h-4 text-red-600 dark:text-red-400 shrink-0 mt-0.5" />
                <p className="text-sm text-red-700 dark:text-red-200">{error}</p>
              </div>
            )}
            <MessageList
              messages={messages}
              isLoading={isLoading}
              isSending={isSending}
              currentTtsMessageId={currentMessageId}
              isTtsPlaying={isPlaying}
              isTtsLoading={isTtsLoading}
              onTtsPlay={play}
              onTtsStop={stop}
              onTtsPause={pause}
              onTtsResume={resume}
            />
          </div>

          {/* Composer */}
          <div className="border-t border-slate-200 dark:border-slate-700 p-4">
            <ChatComposer
              onSendMessage={sendMessage}
              isSending={isSending}
              disabled={!canSendMessage}
              showVoiceButton={true}
              onVoiceClick={() => setVoiceOverlayOpen(true)}
            />
          </div>
        </div>

        {/* Intelligence panel (desktop only) */}
        {showIntelligencePanel && (
          <div className="hidden lg:block w-80 border-l border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900">
            <RagIntelligencePanel response={lastResponse} channel={channel} />
          </div>
        )}
      </div>

      {/* Mobile intelligence sheet */}
      <Sheet open={intelligenceOpen} onOpenChange={setIntelligenceOpen}>
        <SheetContent side="bottom" className="h-[60vh]">
          <SheetHeader className="mb-4">
            <SheetTitle>Analyse du chatbot</SheetTitle>
          </SheetHeader>
          <RagIntelligencePanel response={lastResponse} channel={channel} />
        </SheetContent>
      </Sheet>

      {/* Mobile: floating button for intelligence */}
      <div className="lg:hidden fixed bottom-24 right-4 z-40">
        {lastResponse && (
          <Button
            onClick={() => setIntelligenceOpen(true)}
            size="icon"
            className="rounded-full h-14 w-14 shadow-lg"
          >
            <PanelRight className="w-6 h-6" />
          </Button>
        )}
      </div>

      {/* Voice Mode Overlay */}
      <VoiceModeOverlay
        open={voiceOverlayOpen}
        onClose={() => setVoiceOverlayOpen(false)}
        leadId={leadId}
        sessionId={sessionId}
        onResponse={handleAudioResponse}
      />
    </div>
  )
}
