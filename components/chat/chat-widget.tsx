'use client'

import { useState, useEffect, useRef } from 'react'
import { X, MessageCircle } from 'lucide-react'
import { LeadChatPanel } from './lead-chat-panel'
import { PrechatForm } from './prechat-form'
import { useApi } from '@/lib/api-context'
import { cn } from '@/lib/utils'

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
  const api = useApi()
  const [isOpen, setIsOpen] = useState(defaultOpen)
  const [leadId, setLeadId] = useState<string | null>(initialLeadId || null)
  const [showPrechat, setShowPrechat] = useState(!initialLeadId)
  const [qualificationScore, setQualificationScore] = useState<number | null>(null)
  const pulseRef = useRef<NodeJS.Timeout | null>(null)
  const prefersReducedMotion = useRef(false)

  // Check for reduced motion preference
  useEffect(() => {
    prefersReducedMotion.current = window.matchMedia('(prefers-reduced-motion: reduce)').matches
  }, [])

  // Load lead ID from sessionStorage if not provided
  useEffect(() => {
    if (initialLeadId) return

    const storedLeadId = sessionStorage.getItem('lead_widget_lead')
    if (storedLeadId) {
      setLeadId(storedLeadId)
      setShowPrechat(false)
    }
  }, [initialLeadId])

  const handlePrechatSubmit = (newLeadId: string) => {
    setLeadId(newLeadId)
    sessionStorage.setItem('lead_widget_lead', newLeadId)
    setShowPrechat(false)
  }

  const handleLeadStatusChange = (status: string, score: number | null) => {
    setQualificationScore(score)
    if (status === 'qualifie' && onQualified) {
      onQualified()
    }
  }

  const handleClose = () => {
    setIsOpen(false)
    onClose?.()
  }

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

  return (
    <>
      {/* Floating bubble - FAB */}
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

      {/* Chat window */}
      {isOpen && (
        <div
          className={cn(
            'fixed z-[9999] flex flex-col bg-white dark:bg-slate-950 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden',
            'animate-in fade-in slide-in-from-bottom-4 duration-300',
            'w-96 h-[560px] md:w-[380px] md:h-[560px]',
            'max-w-[90vw] max-h-[90dvh]',
            position === 'bottom-right' ? 'bottom-6 right-6' : 'bottom-6 left-6',
            // Mobile fullscreen
            'sm:max-w-none sm:max-h-none sm:bottom-0 sm:right-0 sm:left-0 sm:top-0 sm:rounded-none sm:h-screen sm:w-screen',
          )}
        >
          {/* Header */}
          <div className="px-4 py-3 text-white flex items-center justify-between gap-2" style={headerStyle}>
            <div className="flex items-center gap-2 flex-1 min-w-0">
              {orgLogoUrl && <img src={orgLogoUrl} alt={orgName} className="w-6 h-6 rounded-full" />}
              <div className="min-w-0">
                <h3 className="font-semibold text-sm truncate">Assistant {orgName}</h3>
                <p className="text-xs opacity-75">En ligne</p>
              </div>
            </div>
            {qualificationScore != null && qualificationScore > 0 && (
              <div className="flex items-center gap-1 text-xs font-medium bg-white/20 px-2 py-1 rounded">
                {qualificationScore.toFixed(0)}
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

          {/* Content */}
          {showPrechat && !leadId ? (
            <PrechatForm onSubmit={handlePrechatSubmit} />
          ) : leadId ? (
            <LeadChatPanel
              leadId={leadId}
              channel={channel}
              onLeadStatusChange={handleLeadStatusChange}
            />
          ) : (
            <div className="flex-1 flex items-center justify-center text-slate-500">
              Chargement...
            </div>
          )}
        </div>
      )}

      {/* Backdrop */}
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
