'use client'

import { useEffect, useRef, useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Send, Loader2, MessageCircle } from 'lucide-react'
import { VoiceInputButton } from './voice-input-button'
import { TtsPlayButton } from './tts-play-button'
import { SessionSelector } from './session-selector'
import { sendChatMessage, getChatSession } from '@/lib/api/chat'
import { useApi } from '@/lib/api-context'
import { toast } from 'sonner'
import type { ChatSession, ChatMessage, ChatbotResponse } from '@/lib/types'

interface LeadChatPanelProps {
  leadId: string
  onQualificationUpdate?: (response: ChatbotResponse) => void
}

export function LeadChatPanel({
  leadId,
  onQualificationUpdate,
}: LeadChatPanelProps) {
  const api = useApi()
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [input, setInput] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [sessionId, setSessionId] = useState<string | null>(null)
  const [session, setSession] = useState<ChatSession | null>(null)
  const scrollRef = useRef<HTMLDivElement>(null)

  // Load session when selected
  useEffect(() => {
    const loadSession = async () => {
      if (!sessionId) {
        setMessages([])
        setSession(null)
        return
      }

      try {
        const data = await getChatSession(api, leadId, sessionId)
        setSession(data)
        setMessages(data.chat_history || [])
      } catch (err) {
        toast.error('Impossible de charger la session')
        console.error('[v0] Load session error:', err)
      }
    }

    loadSession()
  }, [api, leadId, sessionId])

  // Auto-scroll to bottom
  useEffect(() => {
    scrollRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!input.trim()) return

    const userMessage = input.trim()
    setInput('')
    setIsLoading(true)

    try {
      // Add user message to UI
      setMessages((prev) => [
        ...prev,
        {
          role: 'user',
          content: userMessage,
          timestamp: new Date().toISOString(),
        },
      ])

      // Send to chatbot
      const response = await sendChatMessage(api, {
        lead_id: leadId,
        message: userMessage,
        channel: 'web_chat',
        session_id: sessionId,
      })

      // Add assistant message
      setMessages((prev) => [
        ...prev,
        {
          role: 'assistant',
          content: response.response_text,
          timestamp: new Date().toISOString(),
        },
      ])

      // Update session if new
      if (!sessionId && response.session_id) {
        setSessionId(response.session_id)
      }

      // Notify parent of qualification changes
      onQualificationUpdate?.(response)

      // Show qualification toast
      if (response.lead_status_changed && response.new_lead_status === 'qualifie') {
        toast.success('Lead qualifié automatiquement!')
      }
    } catch (err) {
      toast.error('Impossible d\'envoyer le message')
      console.error('[v0] Send message error:', err)
      // Remove user message on error
      setMessages((prev) => prev.slice(0, -1))
    } finally {
      setIsLoading(false)
    }
  }

  const handleVoiceResponse = (response: any) => {
    // Add transcript as user message
    if (response.transcript) {
      setMessages((prev) => [
        ...prev,
        {
          role: 'user',
          content: response.transcript,
          timestamp: new Date().toISOString(),
        },
      ])
    }

    // Add bot response
    setMessages((prev) => [
      ...prev,
      {
        role: 'assistant',
        content: response.response_text,
        timestamp: new Date().toISOString(),
      },
    ])

    onQualificationUpdate?.(response)
  }

  return (
    <div className="flex flex-col h-full bg-white dark:bg-slate-900 rounded-lg border border-slate-200 dark:border-slate-800">
      {/* Header */}
      <div className="px-4 py-3 border-b border-slate-200 dark:border-slate-800">
        <SessionSelector
          leadId={leadId}
          selectedSessionId={sessionId || undefined}
          onSessionChange={setSessionId}
          onNewSession={() => setSessionId(null)}
        />
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center">
            <MessageCircle className="w-8 h-8 text-slate-400 mb-2" />
            <p className="text-slate-600 dark:text-slate-400 text-sm">
              Bonjour ! Comment puis-je vous aider concernant votre demande ?
            </p>
          </div>
        ) : (
          messages.map((msg, idx) => (
            <div
              key={idx}
              className={`flex ${
                msg.role === 'user' ? 'justify-end' : 'justify-start'
              }`}
            >
              <div
                className={`max-w-xs px-3 py-2 rounded-lg ${
                  msg.role === 'user'
                    ? 'bg-indigo-600 text-white rounded-br-none'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-slate-100 rounded-bl-none'
                }`}
              >
                <p className="text-sm break-words">{msg.content}</p>
                <p
                  className={`text-xs mt-1 ${
                    msg.role === 'user'
                      ? 'text-indigo-100'
                      : 'text-slate-500 dark:text-slate-400'
                  }`}
                >
                  {new Date(msg.timestamp).toLocaleTimeString('fr-FR', {
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                </p>
              </div>

              {/* TTS button for assistant messages */}
              {msg.role === 'assistant' && (
                <div className="ml-2 flex items-center">
                  <TtsPlayButton text={msg.content} />
                </div>
              )}
            </div>
          ))
        )}

        {isLoading && (
          <div className="flex justify-start">
            <div className="bg-slate-100 dark:bg-slate-800 rounded-lg px-3 py-2">
              <Loader2 className="w-4 h-4 animate-spin text-slate-600 dark:text-slate-400" />
            </div>
          </div>
        )}

        <div ref={scrollRef} />
      </div>

      {/* Input */}
      <form
        onSubmit={handleSendMessage}
        className="px-4 py-3 border-t border-slate-200 dark:border-slate-800 flex gap-2"
      >
        <VoiceInputButton
          leadId={leadId}
          sessionId={sessionId || undefined}
          onResponse={handleVoiceResponse}
        />
        <Input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Tapez votre message..."
          disabled={isLoading}
          className="flex-1"
        />
        <Button
          type="submit"
          size="icon"
          disabled={isLoading || !input.trim()}
          className="bg-indigo-600 hover:bg-indigo-700 flex-shrink-0"
        >
          {isLoading ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <Send className="w-4 h-4" />
          )}
        </Button>
      </form>
    </div>
  )
}
