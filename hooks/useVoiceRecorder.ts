'use client'

import { useCallback, useRef, useState } from 'react'

export type RecorderState = 'idle' | 'recording' | 'processing'

export interface UseVoiceRecorderReturn {
  state: RecorderState
  start: () => Promise<void>
  stop: () => void
  audioBlob: Blob | null
  error: string | null
}

/**
 * Hook MediaRecorder pour la capture vocale dans le navigateur.
 *
 * Usage:
 *   const { start, stop, audioBlob, state, error } = useVoiceRecorder()
 *
 * Formats : priorité webm/opus > ogg/opus > mp4 (selon le navigateur)
 * Compatible Chrome, Firefox, Edge, Safari (iOS 14.5+)
 */
export function useVoiceRecorder(): UseVoiceRecorderReturn {
  const [state, setState] = useState<RecorderState>('idle')
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null)
  const [error, setError] = useState<string | null>(null)

  const recorderRef = useRef<MediaRecorder | null>(null)
  const chunksRef = useRef<Blob[]>([])
  const streamRef = useRef<MediaStream | null>(null)

  const start = useCallback(async () => {
    setError(null)
    setAudioBlob(null)
    chunksRef.current = []

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      streamRef.current = stream

      // Sélectionner le meilleur format supporté
      const mimeType = [
        'audio/webm;codecs=opus',
        'audio/webm',
        'audio/ogg;codecs=opus',
        'audio/mp4',
      ].find((t) => MediaRecorder.isTypeSupported(t)) ?? ''

      const recorder = new MediaRecorder(stream, mimeType ? { mimeType } : {})
      recorderRef.current = recorder

      recorder.ondataavailable = (e) => {
        if (e.data.size > 0) {
          chunksRef.current.push(e.data)
        }
      }

      recorder.onstop = () => {
        const blob = new Blob(chunksRef.current, {
          type: mimeType || 'audio/webm',
        })
        setAudioBlob(blob)
        setState('processing')
        // Libérer le micro
        stream.getTracks().forEach((t) => t.stop())
        streamRef.current = null
      }

      recorder.start(250) // collecte toutes les 250ms
      setState('recording')
    } catch (err) {
      const msg =
        err instanceof Error
          ? err.message
          : 'Impossible d\'accéder au microphone'
      setError(msg)
      setState('idle')
    }
  }, [])

  const stop = useCallback(() => {
    if (recorderRef.current && recorderRef.current.state !== 'inactive') {
      recorderRef.current.stop()
    }
  }, [])

  return { state, start, stop, audioBlob, error }
}
