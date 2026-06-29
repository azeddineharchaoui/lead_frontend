'use client'

import { useState, useEffect, useRef } from 'react'
import { X, MessageCircle } from 'lucide-react'
import { LeadChatPanel } from './lead-chat-panel'
import { PrechatForm } from './prechat-form'
import { VisitorChatPanel } from './visitor-chat-panel'
import { useVisitorChatSession } from '@/hooks/useVisitorChatSession'
import { cn } from '@/lib/utils'
import type { LeadStatus } from '@/lib/types'

interface ChatWidgetProps {
  leadId?: string
  orgName?: string
  orgLogoUrl?: string
  primaryColor?: string
  position?: 'bottom-right' | 'bottom-left'
  defaultOpen?: boolean
  channel?: 'web_chat'
  onQualified?: () => void
  onClose?: () => void
}

export function ChatWidget({
  leadId: initialLeadId,
  orgName = 'Lead.ma',
  orgLogoUrl,
  primaryColor = '#4F46E5',
  position = 'bottom-right',
  defaultOpen = false,
  channel = 'web_chat',
  onQualified,
  onClose,
}: ChatWidgetProps) {
  const useLegacyLeadFlow = Boolean(initialLeadId)
  const [isOpen, setIsOpen] = useState(defaultOpen)
  const [leadId, setLeadId] = useState<string | null>(initialLeadId || null)
  const [showPrechat, setShowPrechat] = useState(!initialLeadId)
  const [qualificationScore, setQualificationScore] = useState<number | null>(null)
  const prefersReducedMotion = useRef(false)
  const resumedRef = useRef(false)

  const handleLeadStatusChange = (status: LeadStatus, score: number | null) => {
    setQualificationScore(score)
    if (status === 'qualifie' && onQualified) {
      onQualified()
    }
  }

  const visitorSession = useVisitorChatSession({
    channel,
    onLeadStatusChange: handleLeadStatusChange,
  })
  const { resumeFromStorage, visitorToken, leadId: visitorLeadId, isStarting, qualificationScore: visitorScore } =
    visitorSession

  useEffect(() => {
    prefersReducedMotion.current = window.matchMedia('(prefers-reduced-motion: reduce)').matches
  }, [])

  useEffect(() => {
    if (initialLeadId || resumedRef.current) return
    resumedRef.current = true
    if (resumeFromStorage()) {
      setShowPrechat(false)
    }
  }, [initialLeadId, resumeFromStorage])

  useEffect(() => {
    if (visitorLeadId && !useLegacyLeadFlow) {
      setLeadId(visitorLeadId)
    }
  }, [visitorLeadId, useLegacyLeadFlow])

  const handlePrechatStart = async (payload: {
    phone_number?: string
    company_name?: string
  }) => {
    await visitorSession.startSession(payload)
    setShowPrechat(false)
  }

  const handlePrechatSkip = async () => {
    await visitorSession.startSession({})
    setShowPrechat(false)
  }

  const handleClose = () => {
    setIsOpen(false)
    onClose?.()
  }

  const showVisitorChat =
    !useLegacyLeadFlow && !showPrechat && Boolean(visitorToken)
  const showLegacyChat = useLegacyLeadFlow && Boolean(leadId)

  const positionClasses = cn(
    'fixed z-[9999] flex items-center justify-center w-14 h-14 rounded-full text-white shadow-xl transition-all duration-200',
    position === 'bottom-right' ? 'bottom-6 right-6' : 'bottom-6 left-6',
  )

  const bubbleStyle = {
    backgroundColor: primaryColor,
  } as React.CSSProperties

  const headerStyle = {
    backgroundColor: primaryColor,
  } as React.CSSProperties

  const activeScore = qualificationScore ?? visitorScore

  return (
    <>
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className={cn(positionClasses, 'hover:bg-opacity-90 hover:scale-110', 'group')}
          style={bubbleStyle}
          title="Ouvrir le chat"
          aria-label="Ouvrir le chat"
        >
          <MessageCircle className="w-6 h-6" />
          {!prefersReducedMotion.current && (
            <span className="absolute inset-0 rounded-full bg-current opacity-30 animate-pulse" />
          )}
        </button>
      )}

      {isOpen && (
        <div
          className={cn(
            'fixed z-[9999] flex flex-col bg-white dark:bg-slate-950 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden',
            'animate-in fade-in slide-in-from-bottom-4 duration-300',
            'w-96 h-[560px] md:w-[380px] md:h-[560px]',
            'max-w-[90vw] max-h-[90dvh]',
            position === 'bottom-right' ? 'bottom-6 right-6' : 'bottom-6 left-6',
            'sm:max-w-none sm:max-h-none sm:bottom-0 sm:right-0 sm:left-0 sm:top-0 sm:rounded-none sm:h-screen sm:w-screen',
          )}
        >
          <div
            className="px-4 py-3 text-white flex items-center justify-between gap-2"
            style={headerStyle}
          >
            <div className="flex items-center gap-2 flex-1 min-w-0">
              {orgLogoUrl && (
                <img src={orgLogoUrl} alt={orgName} className="w-6 h-6 rounded-full" />
              )}
              <div className="min-w-0">
                <h3 className="font-semibold text-sm truncate">Assistant {orgName}</h3>
                <p className="text-xs opacity-75">En ligne</p>
              </div>
            </div>
            {activeScore != null && activeScore > 0 && (
              <div className="flex items-center gap-1 text-xs font-medium bg-white/20 px-2 py-1 rounded">
                {activeScore.toFixed(0)}
              </div>
            )}
            <button
              onClick={handleClose}
              className="hover:bg-white/20 p-1 rounded transition-colors flex-shrink-0"
              title="Fermer"
              aria-label="Fermer le chat"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {showPrechat && !showLegacyChat && !showVisitorChat ? (
            <PrechatForm
              onStart={handlePrechatStart}
              onSkip={handlePrechatSkip}
              isLoading={isStarting}
            />
          ) : showLegacyChat && leadId ? (
            <LeadChatPanel
              leadId={leadId}
              channel={channel}
              onLeadStatusChange={handleLeadStatusChange}
            />
          ) : showVisitorChat ? (
            <VisitorChatPanel session={visitorSession} />
          ) : (
            <div className="flex-1 flex items-center justify-center text-slate-500">
              Chargement...
            </div>
          )}
        </div>
      )}

      {isOpen && (
        <div
          className="fixed inset-0 z-[9998] bg-black/20 sm:hidden"
          onClick={handleClose}
          aria-hidden="true"
        />
      )}
    </>
  )
}
