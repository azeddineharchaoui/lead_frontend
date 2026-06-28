'use client'

import { useRef, useState, useCallback, useEffect } from 'react'
import { fetchTtsAudio } from '@/lib/api/chat'
import { useApi } from '@/lib/api-context'
import { chunkTextForTts } from '@/lib/tts-chunker'
import { toast } from 'sonner'

interface QueuedChunk {
  messageId: string
  text: string
  chunkIndex: number
  totalChunks: number
  lang?: 'fr' | 'ar'
  url?: string
}

export interface UseTtsPlaybackReturn {
  isPlaying: boolean
  isLoading: boolean
  currentMessageId: string | null
  currentChunkIndex: number
  totalChunks: number
  play: (messageId: string, text: string, lang?: 'fr' | 'ar') => Promise<void>
  stop: () => void
  pause: () => void
  resume: () => void
  setPlaybackRate: (rate: number) => void
  playbackRate: number
  queueLength: number
}

export function useTtsPlayback(): UseTtsPlaybackReturn {
  const api = useApi()
  const audioRef = useRef<HTMLAudioElement | null>(null)
  const [isPlaying, setIsPlaying] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [currentMessageId, setCurrentMessageId] = useState<string | null>(null)
  const [currentChunkIndex, setCurrentChunkIndex] = useState(0)
  const [totalChunks, setTotalChunks] = useState(0)
  const [playbackRate, setPlaybackRate] = useState(1.0)
  const queueRef = useRef<QueuedChunk[]>([])
  const objectUrlsRef = useRef<string[]>([])
  const failureCountRef = useRef(0)
  const MAX_FAILURES = 3

  // Initialize audio element on mount
  useEffect(() => {
    if (!audioRef.current) {
      audioRef.current = new Audio()
      audioRef.current.playbackRate = playbackRate
    }

    return () => {
      // Cleanup on unmount
      if (audioRef.current) {
        audioRef.current.pause()
        audioRef.current.src = ''
      }
      objectUrlsRef.current.forEach((url) => URL.revokeObjectURL(url))
      objectUrlsRef.current = []
    }
  }, [])

  // Update playback rate
  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.playbackRate = playbackRate
    }
  }, [playbackRate])

  // Revoke object URLs when no longer needed
  const revokeUrls = useCallback(() => {
    objectUrlsRef.current.forEach((url) => URL.revokeObjectURL(url))
    objectUrlsRef.current = []
  }, [])

  // Detect language: simple heuristic for Arabic script
  const detectLanguage = useCallback((text: string): 'fr' | 'ar' => {
    const arabicRegex = /[\u0600-\u06FF]/g
    const arabicCount = (text.match(arabicRegex) || []).length
    return arabicCount > text.length * 0.3 ? 'ar' : 'fr'
  }, [])

  // Fetch and play next chunk from queue
  const playNextChunk = useCallback(async () => {
    if (queueRef.current.length === 0) {
      setIsPlaying(false)
      revokeUrls()
      return
    }

    const chunk = queueRef.current[0]
    queueRef.current.shift()

    setCurrentMessageId(chunk.messageId)
    setCurrentChunkIndex(chunk.chunkIndex)
    setTotalChunks(chunk.totalChunks)
    setIsLoading(true)

    try {
      let url = chunk.url
      if (!url) {
        const blob = await fetchTtsAudio(api, chunk.text, chunk.lang)
        url = URL.createObjectURL(blob)
        objectUrlsRef.current.push(url)
      }

      if (audioRef.current) {
        audioRef.current.src = url
        audioRef.current.onended = () => {
          playNextChunk()
        }

        await audioRef.current.play()
        setIsPlaying(true)
        failureCountRef.current = 0
      }
    } catch (error) {
      console.error('[v0] TTS playback error:', error)
      failureCountRef.current++

      if (failureCountRef.current >= MAX_FAILURES) {
        toast.error('Synthèse vocale indisponible après plusieurs tentatives')
        setIsPlaying(false)
        setIsLoading(false)
        queueRef.current = []
      } else if ((error as Error).message === 'tts_unavailable') {
        toast.error('Synthèse vocale indisponible (gTTS)')
        setIsPlaying(false)
        setIsLoading(false)
        queueRef.current = []
      } else {
        toast.error('Erreur lors de la lecture audio')
        // Try next chunk
        playNextChunk()
      }
    } finally {
      setIsLoading(false)
    }
  }, [api, revokeUrls])

  // Start playing a message (chunks it if needed)
  const play = useCallback(
    async (messageId: string, text: string, lang?: 'fr' | 'ar') => {
      // Stop any current playback
      if (audioRef.current && isPlaying) {
        audioRef.current.pause()
        audioRef.current.currentTime = 0
      }

      const detectedLang = lang || detectLanguage(text)
      const chunks = chunkTextForTts(text)

      // Build queue
      queueRef.current = chunks.map((chunkText, idx) => ({
        messageId,
        text: chunkText,
        chunkIndex: idx,
        totalChunks: chunks.length,
        lang: detectedLang,
      }))

      await playNextChunk()
    },
    [isPlaying, detectLanguage, playNextChunk],
  )

  // Stop playback
  const stop = useCallback(() => {
    if (audioRef.current) {
      audioRef.current.pause()
      audioRef.current.currentTime = 0
      audioRef.current.onended = null
    }
    setIsPlaying(false)
    queueRef.current = []
    setCurrentMessageId(null)
    setCurrentChunkIndex(0)
    setTotalChunks(0)
    revokeUrls()
  }, [revokeUrls])

  // Pause playback
  const pause = useCallback(() => {
    if (audioRef.current) {
      audioRef.current.pause()
    }
    setIsPlaying(false)
  }, [])

  // Resume playback
  const resume = useCallback(() => {
    if (audioRef.current && audioRef.current.src) {
      audioRef.current.play()
      setIsPlaying(true)
    }
  }, [])

  return {
    isPlaying,
    isLoading,
    currentMessageId,
    currentChunkIndex,
    totalChunks,
    play,
    stop,
    pause,
    resume,
    setPlaybackRate,
    playbackRate,
    queueLength: queueRef.current.length,
  }
}
