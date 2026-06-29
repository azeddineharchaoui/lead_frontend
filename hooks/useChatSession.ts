'use client'

import { useState, useCallback, useRef, useEffect } from 'react'
import { useApiClient } from '@/hooks/useApiClient'
import { sendChatMessage, listChatSessions, getChatSession } from '@/lib/api/chat'
import { showApiError } from '@/lib/api-errors'
import { toast } from 'sonner'
import type { ChatMessage, ChatbotResponse, ChatSession, IncomingChatMessage, LeadStatus } from '@/lib/types'

export interface UseChatSessionOptions {
  leadId: string
  initialSessionId?: string | null
  channel?: IncomingChatMessage['channel']
  onLeadStatusChange?: (status: LeadStatus, score: number | null) => void
}

export interface UseChatSessionReturn {
  messages: ChatMessage[]
  sessionId: string | null
  isSending: boolean
  error: string | null
  lastResponse: ChatbotResponse | null
  qualificationScore: number | null
  suggestedActions: string[]
  sendMessage: (text: string) => Promise<void>
  loadSession: (sessionId: string) => Promise<void>
  startNewSession: () => void
  closeSession: () => Promise<void>
  isLoading: boolean
}

export function useChatSession(options: UseChatSessionOptions): UseChatSessionReturn {
  const api = useApiClient()
  const { leadId, initialSessionId, channel = 'web_chat', onLeadStatusChange } = options

  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [sessionId, setSessionId] = useState<string | null>(initialSessionId || null)
  const [isSending, setIsSending] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [lastResponse, setLastResponse] = useState<ChatbotResponse | null>(null)

  // Persist session ID to sessionStorage
  useEffect(() => {
    if (sessionId) {
      sessionStorage.setItem(`chat_session_${leadId}`, sessionId)
    }
  }, [sessionId, leadId])

  // Load session from sessionStorage on mount
  useEffect(() => {
    if (!sessionId) {
      const stored = sessionStorage.getItem(`chat_session_${leadId}`)
      if (stored) {
        setSessionId(stored)
      }
    }
  }, [leadId, sessionId])

  const sendMessage = useCallback(
    async (text: string) => {
      if (!text.trim() || isSending) return

      setError(null)
      setIsSending(true)

      // Optimistic UI: add user message immediately
      const userMessage: ChatMessage = {
        role: 'user',
        content: text,
        timestamp: new Date().toISOString(),
      }
      setMessages((prev) => [...prev, userMessage])

      try {
        const payload: IncomingChatMessage = {
          lead_id: leadId,
          message: text,
          channel,
          session_id: sessionId || undefined,
        }

        const response = await sendChatMessage(api, payload)

        // Update session ID from first response
        if (!sessionId) {
          setSessionId(response.session_id)
        }

        // Add assistant message
        const assistantMessage: ChatMessage = {
          role: 'assistant',
          content: response.response_text,
          timestamp: new Date().toISOString(),
        }
        setMessages((prev) => [...prev, assistantMessage])

        // Update last response and qualification
        setLastResponse(response)

        // Handle lead status change
        if (response.lead_status_changed && response.new_lead_status) {
          const score = response.qualification_score ?? null
          onLeadStatusChange?.(response.new_lead_status, score)
          toast.success(
            `Lead qualifié automatiquement par le chatbot ! (Score: ${score || 'N/A'})`
          )
        }
      } catch (err) {
        showApiError(err)
        setError(err instanceof Error ? err.message : 'Erreur lors de l\'envoi du message')
        // Roll back optimistic message on error
        setMessages((prev) => prev.slice(0, -1))
      } finally {
        setIsSending(false)
      }
    },
    [api, leadId, sessionId, channel, isSending, onLeadStatusChange]
  )

  const loadSession = useCallback(
    async (sid: string) => {
      setIsLoading(true)
      setError(null)
      try {
        const session = await getChatSession(api, leadId, sid)
        setMessages(session.chat_history)
        setSessionId(session.id)
        setLastResponse(null)
      } catch (err) {
        // If session not found, start fresh
        if (err instanceof Error && err.message.includes('404')) {
          setMessages([])
          setSessionId(null)
        } else {
          showApiError(err)
          setError(err instanceof Error ? err.message : 'Erreur lors du chargement de la session')
        }
      } finally {
        setIsLoading(false)
      }
    },
    [api, leadId]
  )

  const startNewSession = useCallback(() => {
    setMessages([])
    setSessionId(null)
    setError(null)
    setLastResponse(null)
    sessionStorage.removeItem(`chat_session_${leadId}`)
  }, [leadId])

  const closeSession = useCallback(async () => {
    if (!sessionId) return
    try {
      // Backend expects DELETE to close the session
      // This is a stub – actual close would be implemented if needed
      toast.success('Session fermée')
      startNewSession()
    } catch (err) {
      showApiError(err)
    }
  }, [sessionId, startNewSession])

  return {
    messages,
    sessionId,
    isSending,
    error,
    lastResponse,
    qualificationScore: lastResponse?.qualification_score ?? null,
    suggestedActions: lastResponse?.suggested_actions ?? [],
    sendMessage,
    loadSession,
    startNewSession,
    closeSession,
    isLoading,
  }
}
