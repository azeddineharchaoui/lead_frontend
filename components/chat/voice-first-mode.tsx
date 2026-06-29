'use client'

import { useState, useEffect } from 'react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Volume2, Mic, Loader2, AlertCircle } from 'lucide-react'
import { cn } from '@/lib/utils'
import { TtsProgressBar } from './tts-progress-bar'

interface VoiceFirstModeProps {
  enabled: boolean
  onToggle: (enabled: boolean) => void
  lastBotMessage?: string
  isRecording?: boolean
  isPlayingAudio?: boolean
  isLoadingAudio?: boolean
  onRecordToggle?: (recording: boolean) => void
  recordingTime?: number
  error?: string | null
}

export function VoiceFirstMode({
  enabled,
  onToggle,
  lastBotMessage,
  isRecording = false,
  isPlayingAudio = false,
  isLoadingAudio = false,
  onRecordToggle,
  recordingTime = 0,
  error,
}: VoiceFirstModeProps) {
  const [minimized, setMinimized] = useState(!enabled)

  useEffect(() => {
    setMinimized(!enabled)
  }, [enabled])

  if (minimized) {
    return (
      <Button
        variant="outline"
        size="sm"
        onClick={() => {
          onToggle(true)
          setMinimized(false)
        }}
        className="gap-2 text-xs"
      >
        <Mic className="w-4 h-4" />
        Mode mains libres
      </Button>
    )
  }

  return (
    <Card className="p-4 bg-gradient-to-b from-indigo-50 to-white dark:from-indigo-950 dark:to-slate-900 border-indigo-200 dark:border-indigo-800">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Volume2 className={cn('w-4 h-4', isPlayingAudio && 'text-indigo-600 animate-pulse')} />
          <span className="text-sm font-medium">Mode mains libres</span>
        </div>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => {
            onToggle(false)
            setMinimized(true)
          }}
          className="text-xs"
        >
          Réduire
        </Button>
      </div>

      {/* Error display */}
      {error && (
        <div className="mb-3 p-2 bg-red-50 dark:bg-red-950 border border-red-200 dark:border-red-800 rounded flex gap-2">
          <AlertCircle className="w-4 h-4 text-red-600 dark:text-red-400 shrink-0 mt-0.5" />
          <p className="text-xs text-red-700 dark:text-red-200">{error}</p>
        </div>
      )}

      {/* Last bot message preview */}
      {lastBotMessage && (
        <div className="mb-3 p-2 bg-slate-100 dark:bg-slate-800 rounded text-xs text-slate-700 dark:text-slate-300 line-clamp-2">
          {lastBotMessage}
        </div>
      )}

      {/* Progress bar */}
      {isPlayingAudio && (
        <div className="mb-3">
          <TtsProgressBar isPlaying={isPlayingAudio} />
        </div>
      )}

      {/* Loading/Recording state */}
      {isLoadingAudio && (
        <div className="mb-3 flex items-center gap-2 text-xs text-slate-600 dark:text-slate-400">
          <Loader2 className="w-3 h-3 animate-spin" />
          Synthèse vocale en cours...
        </div>
      )}

      {isRecording && (
        <div className="mb-3 flex items-center gap-2 text-xs text-red-600 dark:text-red-400 font-medium">
          <div className="w-2 h-2 bg-red-600 dark:bg-red-400 rounded-full animate-pulse" />
          Enregistrement {recordingTime}s
        </div>
      )}

      {/* Voice input button */}
      <div className="flex flex-col items-center">
        <Button
          type="button"
          size="lg"
          onClick={() => onRecordToggle?.(!isRecording)}
          disabled={isLoadingAudio}
          className={cn(
            'rounded-full w-16 h-16 transition-all',
            isRecording
              ? 'bg-red-600 hover:bg-red-700 ring-4 ring-red-200 dark:ring-red-900'
              : 'bg-indigo-600 hover:bg-indigo-700',
          )}
        >
          <Mic className="w-6 h-6 text-white" />
        </Button>
        <p className="mt-2 text-xs text-slate-600 dark:text-slate-400 text-center">
          {isRecording ? 'Relâchez pour arrêter' : 'Tenez pour parler'}
        </p>
      </div>
    </Card>
  )
}
