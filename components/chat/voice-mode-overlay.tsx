'use client'

import { useEffect, useState } from 'react'
import { useVoiceRecorder } from '@/hooks/useVoiceRecorder'
import { sendAudioMessage } from '@/lib/api/chat'
import { useApiClient } from '@/hooks/useApiClient'
import { VoiceWaveform } from './voice-waveform'
import { Button } from '@/components/ui/button'
import { X, Loader2 } from 'lucide-react'
import { cn } from '@/lib/utils'
import { toast } from 'sonner'
import type { AudioChatResponse } from '@/lib/types'

interface VoiceModeOverlayProps {
  open: boolean
  onClose: () => void
  leadId?: string
  visitorToken?: string
  sessionId?: string | null
  onResponse: (res: AudioChatResponse) => void
}

export function VoiceModeOverlay({
  open,
  onClose,
  leadId,
  visitorToken,
  sessionId,
  onResponse,
}: VoiceModeOverlayProps) {
  const api = useApiClient()
  const { state, start, stop, audioBlob, error, analyser, duration } = useVoiceRecorder()
  const [isHolding, setIsHolding] = useState(false)
  const [isSending, setIsSending] = useState(false)

  // Auto-format duration as MM:SS
  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  // Handle mouse/touch hold-to-talk
  const handleMouseDown = async () => {
    setIsHolding(true)
    await start()
  }

  const handleMouseUp = () => {
    setIsHolding(false)
    stop()
  }

  // Send audio when recording completes
  useEffect(() => {
    if (state === 'processing' && audioBlob) {
      sendAudio()
    }
  }, [state, audioBlob])

  const sendAudio = async () => {
    if (!audioBlob || (!leadId && !visitorToken)) {
      toast.error('Données manquantes pour envoyer')
      return
    }

    setIsSending(true)
    try {
      const formData = new FormData()
      formData.append('audio', audioBlob, 'recording.webm')

      if (leadId) {
        formData.append('lead_id', leadId)
      } else if (visitorToken) {
        formData.append('visitor_token', visitorToken)
      }

      if (sessionId) {
        formData.append('session_id', sessionId)
      }

      formData.append('channel', 'web_chat')

      const response = await sendAudioMessage(api, formData)
      onResponse(response)
      toast.success('Message vocal envoyé')
      onClose()
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Erreur lors de l\'envoi'
      toast.error(message)
      console.error('[v0] Audio send error:', err)
    } finally {
      setIsSending(false)
    }
  }

  if (!open) return null

  return (
    <div
      className="fixed inset-0 z-50 bg-black/50 dark:bg-black/70 flex items-center justify-center"
      onClick={onClose}
    >
      <div
        className="bg-white dark:bg-slate-900 rounded-2xl p-8 max-w-sm w-full mx-4 shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-lg font-semibold text-slate-900 dark:text-white">
            Mode vocal
          </h2>
          <Button
            variant="ghost"
            size="sm"
            onClick={onClose}
            disabled={isSending}
            className="rounded-full w-8 h-8"
          >
            <X className="w-4 h-4" />
          </Button>
        </div>

        {/* Error display */}
        {error && (
          <div className="mb-4 p-3 bg-red-50 dark:bg-red-950 border border-red-200 dark:border-red-800 rounded text-sm text-red-700 dark:text-red-200">
            {error}
          </div>
        )}

        {/* Waveform */}
        <div className="mb-6">
          <VoiceWaveform
            analyser={analyser}
            isRecording={state === 'recording'}
          />
        </div>

        {/* Timer */}
        <div className="text-center mb-6">
          <p className="text-2xl font-mono font-bold text-indigo-600 dark:text-indigo-400">
            {formatDuration(duration)} / 2:00
          </p>
          {state === 'recording' && (
            <p className="text-xs text-slate-600 dark:text-slate-400 mt-2">
              Enregistrement en cours...
            </p>
          )}
        </div>

        {/* Mic Button */}
        <div className="flex justify-center mb-6">
          <button
            onMouseDown={handleMouseDown}
            onMouseUp={handleMouseUp}
            onMouseLeave={handleMouseUp}
            onTouchStart={handleMouseDown}
            onTouchEnd={handleMouseUp}
            disabled={isSending}
            className={cn(
              'rounded-full w-24 h-24 flex items-center justify-center transition-all shadow-lg',
              'text-white font-semibold text-sm',
              isHolding || state === 'recording'
                ? 'bg-red-600 hover:bg-red-700 ring-4 ring-red-200 dark:ring-red-900 scale-110'
                : 'bg-indigo-600 hover:bg-indigo-700',
              isSending && 'opacity-50 cursor-not-allowed'
            )}
          >
            {isSending ? (
              <Loader2 className="w-8 h-8 animate-spin" />
            ) : (
              <div className="text-center">
                <div className="text-3xl">🎤</div>
              </div>
            )}
          </button>
        </div>

        {/* Instructions */}
        <p className="text-center text-sm text-slate-600 dark:text-slate-400">
          {isSending
            ? 'Envoi en cours...'
            : state === 'recording'
              ? 'Relâchez pour arrêter'
              : 'Tenez pour parler'}
        </p>
      </div>
    </div>
  )
}
