'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import { useApiClient } from '@/hooks/useApiClient'
import { sendChatMessage, sendAudioMessage, fetchTTS } from '@/lib/api'
import { showApiError } from '@/lib/api-errors'
import { useVoiceRecorder } from '@/hooks/useVoiceRecorder'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Send, Mic, MicOff, Volume2, Loader2 } from 'lucide-react'
import { toast } from 'sonner'
import type { ChatMessage, AudioChatResponse, ChatbotResponse } from '@/lib/types'

interface VoiceChatWidgetProps {
  /** UUID du lead à qui appartient la conversation */
  leadId: string
  /** Appelé quand le statut du lead change (ex: qualifié) */
  onStatusChange?: (newStatus: string, score: number | null) => void
  /** Mode compact pour intégration dans d'autres pages */
  compact?: boolean
}

function TypingIndicator() {
  return (
    <div className="flex gap-1 items-center px-1 py-0.5">
      {[0, 0.2, 0.4].map((delay) => (
        <div
          key={delay}
          className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"
          style={{ animationDelay: `${delay}s` }}
        />
      ))}
    </div>
  )
}

function ScoreBadge({ score }: { score: number }) {
  const color =
    score >= 70 ? 'bg-green-100 text-green-800' :
    score >= 40 ? 'bg-yellow-100 text-yellow-800' :
                  'bg-red-100 text-red-800'
  return (
    <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${color}`}>
      Score {score.toFixed(0)}
    </span>
  )
}

/**
 * Widget de chat vocal/textuel connecté au backend RAG+Gemini.
 * - Mode texte : POST /webhook/chat
 * - Mode vocal  : POST /webhook/chat/audio (Whisper) → lecture via /webhook/chat/tts (gTTS)
 */
export function VoiceChatWidget({
  leadId,
  onStatusChange,
  compact = false,
}: VoiceChatWidgetProps) {
  const api = useApiClient()
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [inputValue, setInputValue] = useState('')
  const [isTyping, setIsTyping] = useState(false)
  const [sessionId, setSessionId] = useState<string | null>(null)
  const [suggestedActions, setSuggestedActions] = useState<string[]>([])
  const [qualificationScore, setQualificationScore] = useState<number | null>(null)
  const [voiceMode, setVoiceMode] = useState(false)
  const [isPlaying, setIsPlaying] = useState(false)
  const [transcript, setTranscript] = useState<string | null>(null)

  const messagesEndRef = useRef<HTMLDivElement>(null)
  const audioRef = useRef<HTMLAudioElement | null>(null)

  const { state: recorderState, start: startRecording, stop: stopRecording, audioBlob, error: recorderError } = useVoiceRecorder()

  // Scroll automatique
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, isTyping])

  // Afficher les erreurs micro
  useEffect(() => {
    if (recorderError) toast.error(recorderError)
  }, [recorderError])

  // Envoi auto quand le blob audio est prêt
  useEffect(() => {
    if (audioBlob && recorderState === 'processing') {
      handleSendAudio(audioBlob)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [audioBlob, recorderState])

  const handleResponse = useCallback((response: ChatbotResponse | AudioChatResponse) => {
    if (response.session_id) setSessionId(response.session_id)
    if (response.qualification_score != null) {
      setQualificationScore(response.qualification_score)
    }
    setSuggestedActions(response.suggested_actions ?? [])

    const assistantMsg: ChatMessage = {
      role: 'assistant',
      content: response.response_text,
      timestamp: new Date().toISOString(),
    }
    setMessages((prev) => [...prev, assistantMsg])

    if (response.lead_status_changed && response.new_lead_status) {
      toast.success(`Statut lead → ${response.new_lead_status}`, {
        description: response.qualification_score != null
          ? `Score: ${response.qualification_score.toFixed(0)}/100`
          : undefined,
      })
      onStatusChange?.(response.new_lead_status, response.qualification_score ?? null)
    }

    // Lecture TTS si mode vocal actif
    if (voiceMode) {
      playTTS(response.response_text)
    }
  }, [voiceMode, onStatusChange])

  const handleSendText = async () => {
    if (!inputValue.trim() || !leadId) return

    const userMsg: ChatMessage = {
      role: 'user',
      content: inputValue,
      timestamp: new Date().toISOString(),
    }
    setMessages((prev) => [...prev, userMsg])
    const text = inputValue
    setInputValue('')
    setIsTyping(true)

    try {
      const response = await sendChatMessage(api, {
        lead_id: leadId,
        message: text,
        session_id: sessionId ?? undefined,
        channel: 'web_chat',
      })
      handleResponse(response)
    } catch (err) {
      showApiError(err)
    } finally {
      setIsTyping(false)
    }
  }

  const handleSendAudio = async (blob: Blob) => {
    setIsTyping(true)
    setTranscript(null)

    try {
      const form = new FormData()
      form.append('lead_id', leadId)
      form.append('audio', blob, 'recording.webm')
      if (sessionId) form.append('session_id', sessionId)
      form.append('channel', 'web_chat')

      const response = await sendAudioMessage(api, form)

      // Afficher la transcription
      if (response.transcript) {
        setTranscript(response.transcript)
        setMessages((prev) => [
          ...prev,
          {
            role: 'user',
            content: response.transcript,
            timestamp: new Date().toISOString(),
          },
        ])
      }

      handleResponse(response)
    } catch (err) {
      showApiError(err)
    } finally {
      setIsTyping(false)
    }
  }

  const playTTS = useCallback(async (text: string) => {
    try {
      setIsPlaying(true)
      const blob = await fetchTTS(api, text, api.baseUrl.includes('localhost') ? 'fr' : undefined)
      const url = URL.createObjectURL(blob)

      if (audioRef.current) {
        audioRef.current.pause()
        URL.revokeObjectURL(audioRef.current.src)
      }

      const audio = new Audio(url)
      audioRef.current = audio
      audio.onended = () => {
        setIsPlaying(false)
        URL.revokeObjectURL(url)
      }
      audio.onerror = () => {
        setIsPlaying(false)
        URL.revokeObjectURL(url)
      }
      await audio.play()
    } catch (err) {
      setIsPlaying(false)
      const msg = err instanceof Error ? err.message : 'Erreur lecture audio'
      toast.error(`TTS indisponible: ${msg}`)
    }
  }, [api])

  const handleMicToggle = () => {
    if (recorderState === 'recording') {
      stopRecording()
    } else if (recorderState === 'idle') {
      startRecording()
    }
  }

  const height = compact ? 'h-[400px]' : 'h-[560px]'

  return (
    <div className={`flex flex-col ${height} bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden`}>
      {/* Header */}
      <div className="bg-blue-600 text-white px-4 py-3 flex items-center justify-between flex-shrink-0">
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 bg-green-400 rounded-full" />
          <span className="font-semibold text-sm">Assistant Lead.ma</span>
          {qualificationScore != null && <ScoreBadge score={qualificationScore} />}
        </div>
        <div className="flex items-center gap-2">
          {isPlaying && <Volume2 className="w-4 h-4 text-blue-200 animate-pulse" />}
          <button
            onClick={() => setVoiceMode((v) => !v)}
            className={`text-xs px-2 py-0.5 rounded-full transition-colors ${
              voiceMode ? 'bg-white text-blue-700 font-semibold' : 'text-blue-200 hover:text-white'
            }`}
          >
            {voiceMode ? '🔊 Voix' : '⌨️ Texte'}
          </button>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-gray-50">
        {messages.length === 0 && (
          <div className="text-center text-gray-500 py-8 text-sm">
            Commencez la conversation...
          </div>
        )}

        {messages.map((msg, idx) => (
          <div
            key={`${msg.timestamp}-${idx}`}
            className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div
              className={`max-w-[78%] px-3 py-2 rounded-2xl text-sm ${
                msg.role === 'user'
                  ? 'bg-blue-600 text-white rounded-br-sm'
                  : 'bg-white text-gray-900 border border-gray-200 rounded-bl-sm'
              }`}
            >
              <p className="leading-relaxed">{msg.content}</p>
              <p className={`text-[10px] mt-1 opacity-60 ${msg.role === 'user' ? 'text-right' : ''}`}>
                {new Date(msg.timestamp).toLocaleTimeString('fr-FR', {
                  hour: '2-digit',
                  minute: '2-digit',
                })}
              </p>
            </div>
          </div>
        ))}

        {isTyping && (
          <div className="flex justify-start">
            <div className="bg-white border border-gray-200 rounded-2xl rounded-bl-sm px-3 py-2">
              <TypingIndicator />
            </div>
          </div>
        )}

        {transcript && (
          <p className="text-xs text-gray-400 text-center italic">
            Transcription: &ldquo;{transcript}&rdquo;
          </p>
        )}

        {suggestedActions.length > 0 && (
          <div className="flex flex-wrap gap-1.5">
            {suggestedActions.map((action) => (
              <button
                key={action}
                onClick={() => setInputValue(action)}
                className="text-xs bg-blue-50 text-blue-700 border border-blue-200 px-2 py-1 rounded-full hover:bg-blue-100 transition-colors"
              >
                {action}
              </button>
            ))}
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="border-t border-gray-200 p-3 bg-white flex-shrink-0">
        {voiceMode ? (
          <div className="flex items-center justify-center gap-3">
            <button
              onClick={handleMicToggle}
              disabled={recorderState === 'processing' || isTyping}
              className={`w-14 h-14 rounded-full flex items-center justify-center transition-all shadow-md ${
                recorderState === 'recording'
                  ? 'bg-red-500 hover:bg-red-600 scale-110 animate-pulse'
                  : 'bg-blue-600 hover:bg-blue-700'
              } text-white disabled:opacity-50`}
            >
              {recorderState === 'processing' || isTyping ? (
                <Loader2 className="w-6 h-6 animate-spin" />
              ) : recorderState === 'recording' ? (
                <MicOff className="w-6 h-6" />
              ) : (
                <Mic className="w-6 h-6" />
              )}
            </button>
            <p className="text-sm text-gray-500">
              {recorderState === 'recording'
                ? 'Enregistrement... (cliquez pour arrêter)'
                : recorderState === 'processing' || isTyping
                ? 'Traitement...'
                : 'Cliquez pour parler'}
            </p>
          </div>
        ) : (
          <div className="flex gap-2">
            <Input
              placeholder="Écrivez votre message..."
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault()
                  handleSendText()
                }
              }}
              disabled={isTyping}
              className="flex-1 text-sm"
            />
            <Button
              size="sm"
              className="h-10 w-10 p-0"
              onClick={handleSendText}
              disabled={!inputValue.trim() || isTyping || !leadId}
            >
              {isTyping ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
            </Button>
          </div>
        )}
      </div>
    </div>
  )
}
