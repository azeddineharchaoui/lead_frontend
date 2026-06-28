'use client'

import { useState, useRef } from 'react'
import { Mic, Square, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { sendAudioMessage } from '@/lib/api/chat'
import { useApi } from '@/lib/api-context'
import { toast } from 'sonner'
import type { AudioChatResponse } from '@/lib/types'

interface VoiceInputButtonProps {
  leadId: string
  sessionId?: string
  onTranscript?: (transcript: string) => void
  onResponse?: (response: AudioChatResponse) => void
}

export function VoiceInputButton({
  leadId,
  sessionId,
  onTranscript,
  onResponse,
}: VoiceInputButtonProps) {
  const api = useApi()
  const [isRecording, setIsRecording] = useState(false)
  const [isSending, setIsSending] = useState(false)
  const mediaRecorderRef = useRef<MediaRecorder | null>(null)
  const audioChunksRef = useRef<Blob[]>([])

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      const mediaRecorder = new MediaRecorder(stream)
      audioChunksRef.current = []

      mediaRecorder.ondataavailable = (event) => {
        audioChunksRef.current.push(event.data)
      }

      mediaRecorder.onstart = () => {
        setIsRecording(true)
        toast.success('Enregistrement démarré')
      }

      mediaRecorder.onstop = async () => {
        setIsRecording(false)
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/wav' })
        await sendAudio(audioBlob)
        stream.getTracks().forEach((track) => track.stop())
      }

      mediaRecorderRef.current = mediaRecorder
      mediaRecorder.start()
    } catch (err) {
      toast.error('Microphone non accessible')
      console.error('[v0] Mic error:', err)
    }
  }

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop()
    }
  }

  const sendAudio = async (blob: Blob) => {
    setIsSending(true)
    try {
      const response = await sendAudioMessage(api, new FormData())
      // Manually build FormData since the function signature needs adjustment
      const formData = new FormData()
      formData.append('audio', blob, 'audio.wav')
      formData.append('lead_id', leadId)
      if (sessionId) {
        formData.append('session_id', sessionId)
      }

      const opts = api
      const baseUrl = typeof window !== 'undefined' && localStorage.getItem('apiBaseUrl')
        ? localStorage.getItem('apiBaseUrl') || 'http://localhost:8000'
        : 'http://localhost:8000'

      const res = await fetch(`${baseUrl}/webhook/chat/audio`, {
        method: 'POST',
        body: formData,
      })

      if (!res.ok) {
        throw new Error('Erreur lors de l\'envoi audio')
      }

      const data = await res.json()
      onTranscript?.(data.transcript)
      onResponse?.(data)
      toast.success('Message vocal envoyé')
    } catch (err) {
      toast.error('Erreur lors de l\'envoi du message vocal')
      console.error('[v0] Audio send error:', err)
    } finally {
      setIsSending(false)
    }
  }

  return (
    <Button
      variant={isRecording ? 'destructive' : 'outline'}
      size="icon"
      onClick={isRecording ? stopRecording : startRecording}
      disabled={isSending}
      title={isRecording ? 'Arrêter l\'enregistrement' : 'Démarrer l\'enregistrement'}
      className="flex-shrink-0"
    >
      {isSending ? (
        <Loader2 className="w-4 h-4 animate-spin" />
      ) : isRecording ? (
        <Square className="w-4 h-4" />
      ) : (
        <Mic className="w-4 h-4" />
      )}
    </Button>
  )
}
