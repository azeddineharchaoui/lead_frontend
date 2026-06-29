'use client'

import { Button } from '@/components/ui/button'
import { Volume2, Loader2, Pause, Play } from 'lucide-react'
import { cn } from '@/lib/utils'

interface TtsPlayButtonProps {
  messageId: string
  text: string
  isPlaying?: boolean
  isLoading?: boolean
  onPlay: (messageId: string, text: string) => void
  onStop: () => void
  onPause: () => void
  onResume: () => void
  compact?: boolean
}

export function TtsPlayButton({
  messageId,
  text,
  isPlaying = false,
  isLoading = false,
  onPlay,
  onStop,
  onPause,
  onResume,
  compact = false,
}: TtsPlayButtonProps) {
  const isCurrentMessage = isPlaying || isLoading
  const isEmpty = !text || text.trim().length === 0

  if (isEmpty) {
    return null
  }

  const handleClick = () => {
    if (isCurrentMessage && isPlaying) {
      onPause()
    } else if (isCurrentMessage && !isPlaying) {
      onResume()
    } else if (isCurrentMessage && isLoading) {
      // Do nothing while loading
    } else {
      onPlay(messageId, text)
    }
  }

  return (
    <Button
      type="button"
      variant="ghost"
      size={compact ? 'sm' : 'icon'}
      onClick={handleClick}
      disabled={isLoading}
      className={cn(
        'text-slate-600 dark:text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400',
        'transition-colors opacity-0 group-hover:opacity-100 lg:opacity-100',
        isCurrentMessage && 'opacity-100 text-indigo-600 dark:text-indigo-400',
      )}
      aria-label="Écouter la réponse"
      title={isLoading ? 'Chargement...' : isCurrentMessage && isPlaying ? 'Pause' : 'Écouter'}
    >
      {isLoading ? (
        <Loader2 className="w-4 h-4 animate-spin" />
      ) : isCurrentMessage && isPlaying ? (
        <Pause className="w-4 h-4" />
      ) : isCurrentMessage && !isPlaying ? (
        <Play className="w-4 h-4" />
      ) : (
        <Volume2 className="w-4 h-4" />
      )}
    </Button>
  )
}
