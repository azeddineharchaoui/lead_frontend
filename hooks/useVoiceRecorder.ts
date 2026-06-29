'use client'

import { useCallback, useRef, useState, useEffect } from 'react'

export type RecorderState = 'idle' | 'recording' | 'processing'

const MAX_DURATION_SEC = 120
const MAX_FILE_SIZE = 10_485_760 // 10 MB

export interface UseVoiceRecorderReturn {
  state: RecorderState
  start: () => Promise<void>
  stop: () => void
  audioBlob: Blob | null
  error: string | null
  analyser: AnalyserNode | null
  duration: number
}

/**
 * Hook MediaRecorder pour la capture vocale dans le navigateur.
 *
 * Usage:
 *   const { start, stop, audioBlob, state, error, analyser, duration } = useVoiceRecorder()
 *
 * Formats : priorité webm/opus > ogg/opus > mp4 (selon le navigateur)
 * Compatible Chrome, Firefox, Edge, Safari (iOS 14.5+)
 * Limits: 120s max, 10MB max file size
 */
export function useVoiceRecorder(): UseVoiceRecorderReturn {
  const [state, setState] = useState<RecorderState>('idle')
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [analyser, setAnalyser] = useState<AnalyserNode | null>(null)
  const [duration, setDuration] = useState(0)

  const recorderRef = useRef<MediaRecorder | null>(null)
  const chunksRef = useRef<Blob[]>([])
  const streamRef = useRef<MediaStream | null>(null)
  const audioContextRef = useRef<AudioContext | null>(null)
  const timerRef = useRef<NodeJS.Timeout | null>(null)

  const start = useCallback(async () => {
    setError(null)
    setAudioBlob(null)
    setDuration(0)
    chunksRef.current = []

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      streamRef.current = stream

      // Create AudioContext for waveform analyser
      const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)()
      audioContextRef.current = audioContext
      const source = audioContext.createMediaStreamSource(stream)
      const newAnalyser = audioContext.createAnalyser()
      newAnalyser.fftSize = 256
      source.connect(newAnalyser)
      setAnalyser(newAnalyser)

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

        // Vérifier la taille du fichier
        if (blob.size > MAX_FILE_SIZE) {
          setError('Fichier trop volumineux (max 10 MB)')
          setState('idle')
          return
        }

        setAudioBlob(blob)
        setState('processing')
        // Libérer le micro
        stream.getTracks().forEach((t) => t.stop())
        streamRef.current = null
        if (timerRef.current) clearInterval(timerRef.current)
        if (audioContextRef.current) audioContextRef.current.close()
        setAnalyser(null)
      }

      recorder.start(250) // collecte toutes les 250ms
      setState('recording')

      // Timer pour la durée et auto-stop à 120s
      let elapsed = 0
      timerRef.current = setInterval(() => {
        elapsed += 1
        setDuration(elapsed)
        if (elapsed >= MAX_DURATION_SEC) {
          recorder.stop()
          clearInterval(timerRef.current!)
        }
      }, 1000)
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
    if (timerRef.current) {
      clearInterval(timerRef.current)
    }
  }, [])

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (timerRef.current) clearInterval(timerRef.current)
      if (streamRef.current) streamRef.current.getTracks().forEach(t => t.stop())
      if (audioContextRef.current) audioContextRef.current.close()
    }
  }, [])

  return { state, start, stop, audioBlob, error, analyser, duration }
}
