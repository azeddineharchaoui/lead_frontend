'use client'

import { useCallback, useEffect, useState } from 'react'
import { useApiClient } from '@/hooks/useApiClient'
import { sendVisitorMessage, startVisitorChat } from '@/lib/api/chat'
import { showApiError } from '@/lib/api-errors'
import { toast } from 'sonner'
import type {
  CaptureStatus,
  ChatMessage,
  LeadStatus,
  VisitorChatResponse,
  VisitorStartRequest,
} from '@/lib/types'

const VISITOR_TOKEN_KEY = 'lead_visitor_token'
const VISITOR_LEAD_KEY = 'lead_visitor_lead_id'

export interface UseVisitorChatSessionOptions {
  sourceUrl?: string
  channel?: VisitorStartRequest['channel']
  onLeadStatusChange?: (status: LeadStatus, score: number | null) => void
}

export interface UseVisitorChatSessionReturn {
  messages: ChatMessage[]
  visitorToken: string | null
  leadId: string | null
  captureStatus: CaptureStatus
  missingFields: string[]
  extractedPhone: string | null
  isSending: boolean
  isStarting: boolean
  error: string | null
  lastResponse: VisitorChatResponse | null
  qualificationScore: number | null
  startSession: (payload?: VisitorStartRequest) => Promise<void>
  sendMessage: (text: string) => Promise<void>
  resumeFromStorage: () => boolean
}

function applyAssistantMessage(
  prev: ChatMessage[],
  responseText: string,
): ChatMessage[] {
  if (!responseText) return prev
  const last = prev[prev.length - 1]
  if (last?.role === 'assistant' && last.content === responseText) return prev
  return [
    ...prev,
    {
      role: 'assistant',
      content: responseText,
      timestamp: new Date().toISOString(),
    },
  ]
}

export function useVisitorChatSession(
  options: UseVisitorChatSessionOptions = {},
): UseVisitorChatSessionReturn {
  const api = useApiClient()
  const { sourceUrl, channel = 'web_chat', onLeadStatusChange } = options

  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [visitorToken, setVisitorToken] = useState<string | null>(null)
  const [leadId, setLeadId] = useState<string | null>(null)
  const [captureStatus, setCaptureStatus] = useState<CaptureStatus>('need_phone')
  const [missingFields, setMissingFields] = useState<string[]>(['phone_number'])
  const [extractedPhone, setExtractedPhone] = useState<string | null>(null)
  const [isSending, setIsSending] = useState(false)
  const [isStarting, setIsStarting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [lastResponse, setLastResponse] = useState<VisitorChatResponse | null>(null)

  const applyResponse = useCallback(
    (response: VisitorChatResponse, userText?: string) => {
      if (response.visitor_token) setVisitorToken(response.visitor_token)
      if (response.lead_id) setLeadId(response.lead_id)
      setCaptureStatus(response.capture_status)
      setMissingFields(response.missing_fields ?? [])
      setExtractedPhone(response.extracted?.phone ?? null)
      setLastResponse(response)

      if (response.lead_created) {
        toast.success('Lead enregistré — un conseiller pourra vous contacter.')
      }

      if (response.lead_status_changed && response.new_lead_status) {
        onLeadStatusChange?.(
          response.new_lead_status,
          response.qualification_score ?? null,
        )
        if (response.new_lead_status === 'qualifie') {
          toast.success('Lead qualifié automatiquement par le chatbot !')
        }
      }

      setMessages((prev) => {
        let next = prev
        if (userText) {
          next = [
            ...prev,
            {
              role: 'user',
              content: userText,
              timestamp: new Date().toISOString(),
            },
          ]
        }
        return applyAssistantMessage(next, response.response_text)
      })
    },
    [onLeadStatusChange],
  )

  useEffect(() => {
    if (visitorToken) sessionStorage.setItem(VISITOR_TOKEN_KEY, visitorToken)
    if (leadId) sessionStorage.setItem(VISITOR_LEAD_KEY, leadId)
  }, [visitorToken, leadId])

  const resumeFromStorage = useCallback(() => {
    const token = sessionStorage.getItem(VISITOR_TOKEN_KEY)
    const storedLead = sessionStorage.getItem(VISITOR_LEAD_KEY)
    if (token) {
      setVisitorToken(token)
      if (storedLead) {
        setLeadId(storedLead)
        setCaptureStatus('complete')
        setMissingFields([])
      }
      return true
    }
    return false
  }, [])

  const startSession = useCallback(
    async (payload: VisitorStartRequest = {}) => {
      setIsStarting(true)
      setError(null)
      try {
        const response = await startVisitorChat(api, {
          channel,
          source_url:
            payload.source_url ??
            sourceUrl ??
            (typeof window !== 'undefined' ? window.location.href : undefined),
          ...payload,
        })
        applyResponse(response)
      } catch (err) {
        showApiError(err)
        setError(err instanceof Error ? err.message : 'Impossible de démarrer le chat')
        throw err
      } finally {
        setIsStarting(false)
      }
    },
    [api, applyResponse, channel, sourceUrl],
  )

  const sendMessage = useCallback(
    async (text: string) => {
      if (!text.trim() || isSending || !visitorToken) return

      setError(null)
      setIsSending(true)

      const userMessage: ChatMessage = {
        role: 'user',
        content: text,
        timestamp: new Date().toISOString(),
      }
      setMessages((prev) => [...prev, userMessage])

      try {
        const response = await sendVisitorMessage(api, {
          visitor_token: visitorToken,
          message: text,
        })
        setMessages((prev) => {
          const withoutDupUser = prev.slice(0, -1)
          return applyAssistantMessage(
            [
              ...withoutDupUser,
              {
                role: 'user',
                content: text,
                timestamp: new Date().toISOString(),
              },
            ],
            response.response_text,
          )
        })
        if (response.visitor_token) setVisitorToken(response.visitor_token)
        if (response.lead_id) setLeadId(response.lead_id)
        setCaptureStatus(response.capture_status)
        setMissingFields(response.missing_fields ?? [])
        setExtractedPhone(response.extracted?.phone ?? null)
        setLastResponse(response)

        if (response.lead_created) {
          toast.success('Lead enregistré — un conseiller pourra vous contacter.')
        }
        if (response.lead_status_changed && response.new_lead_status) {
          onLeadStatusChange?.(
            response.new_lead_status,
            response.qualification_score ?? null,
          )
        }
      } catch (err) {
        showApiError(err)
        setError(err instanceof Error ? err.message : "Erreur d'envoi")
        setMessages((prev) => prev.slice(0, -1))
      } finally {
        setIsSending(false)
      }
    },
    [api, isSending, onLeadStatusChange, visitorToken],
  )

  return {
    messages,
    visitorToken,
    leadId,
    captureStatus,
    missingFields,
    extractedPhone,
    isSending,
    isStarting,
    error,
    lastResponse,
    qualificationScore: lastResponse?.qualification_score ?? null,
    startSession,
    sendMessage,
    resumeFromStorage,
  }
}
