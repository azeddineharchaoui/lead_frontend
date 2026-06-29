'use client'

import { useState } from 'react'
import { CaptureStatusBanner } from './capture-status-banner'
import { ChatComposer } from './chat-composer'
import { MessageList } from './message-list'
import { VoiceModeOverlay } from './voice-mode-overlay'
import { AlertCircle } from 'lucide-react'
import type { UseVisitorChatSessionReturn } from '@/hooks/useVisitorChatSession'
import type { AudioChatResponse } from '@/lib/types'
import { toast } from 'sonner'

interface VisitorChatPanelProps {
  session: UseVisitorChatSessionReturn
  canSendMessage?: boolean
  showVoiceButton?: boolean
}

export function VisitorChatPanel({
  session,
  canSendMessage = true,
  showVoiceButton = true,
}: VisitorChatPanelProps) {
  const {
    messages,
    captureStatus,
    missingFields,
    extractedPhone,
    isSending,
    isStarting,
    error,
    sendMessage,
    visitorToken,
  } = session

  const [voiceOverlayOpen, setVoiceOverlayOpen] = useState(false)

  const disabled = !canSendMessage || !visitorToken || isStarting

  const handleAudioResponse = (response: AudioChatResponse) => {
    // Append user transcript as message
    sendMessage(response.transcript)

    // Show lead status change if applicable
    if (response.lead_status_changed) {
      toast.success(`Statut changé: ${response.new_lead_status}`)
    }
  }

  return (
    <div className="flex flex-1 flex-col min-h-0">
      <CaptureStatusBanner
        status={captureStatus}
        missingFields={missingFields}
        extractedPhone={extractedPhone}
      />

      <div className="flex-1 overflow-y-auto p-4 min-h-0">
        {error && (
          <div className="mb-4 flex gap-2 rounded-lg border border-red-200 bg-red-50 p-3 dark:border-red-800 dark:bg-red-950">
            <AlertCircle className="mt-0.5 h-4 w-4 shrink-0 text-red-600 dark:text-red-400" />
            <p className="text-sm text-red-700 dark:text-red-200">{error}</p>
          </div>
        )}
        <MessageList messages={messages} isSending={isSending} />
      </div>

      <div className="border-t border-slate-200 p-4 dark:border-slate-700">
        <ChatComposer
          onSendMessage={sendMessage}
          isSending={isSending}
          disabled={disabled}
          showVoiceButton={showVoiceButton && !disabled}
          onVoiceClick={() => setVoiceOverlayOpen(true)}
        />
      </div>

      {/* Voice Mode Overlay */}
      <VoiceModeOverlay
        open={voiceOverlayOpen}
        onClose={() => setVoiceOverlayOpen(false)}
        visitorToken={visitorToken || undefined}
        onResponse={handleAudioResponse}
      />
    </div>
  )
}
