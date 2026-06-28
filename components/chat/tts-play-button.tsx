'use client'

import { useState, useRef } from 'react'
import { Volume2, Pause, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { fetchTTS } from '@/lib/api/chat'
import { useApi } from '@/lib/api-context'
import { toast } from 'sonner'

interface TtsPlayButtonProps {
  text: string
  lang?: string
}

export function TtsPlayButton({ text, lang = 'fr' }: TtsPlayButtonProps) {
  const api = useApi()
  const [isLoading, setIsLoading] = useState(false)
  const [isPlaying, setIsPlaying] = useState(false)
  const audioRef = useRef<HTMLAudioElement>(null)

  const handlePlay = async () => {
    if (isPlaying) {
      audioRef.current?.pause()
      setIsPlaying(false)
      return
    }

    setIsLoading(true)
    try {
      const blob = await fetchTTS(api, text, lang)
      const url = URL.createObjectURL(blob)

      if (audioRef.current) {
        audioRef.current.src = url
        audioRef.current.play()
        setIsPlaying(true)

        audioRef.current.onended = () => {
          setIsPlaying(false)
          URL.revokeObjectURL(url)
        }
      }
    } catch (err) {
      toast.error('Synthèse vocale indisponible')
      console.error('[v0] TTS error:', err)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <>
      <audio ref={audioRef} />
      <Button
        variant="ghost"
        size="sm"
        onClick={handlePlay}
        disabled={isLoading}
        title="Écouter le message"
        className="h-8 w-8 p-0"
      >
        {isLoading ? (
          <Loader2 className="w-4 h-4 animate-spin" />
        ) : isPlaying ? (
          <Pause className="w-4 h-4" />
        ) : (
          <Volume2 className="w-4 h-4" />
        )}
      </Button>
    </>
  )
}
