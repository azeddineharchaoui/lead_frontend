'use client'

import { Mic } from 'lucide-react'
import { cn } from '@/lib/utils'

interface VoiceTranscriptBubbleProps {
  transcript: string
  className?: string
}

export function VoiceTranscriptBubble({
  transcript,
  className,
}: VoiceTranscriptBubbleProps) {
  return (
    <div
      className={cn(
        'flex gap-2 max-w-xs px-4 py-3 rounded-lg',
        'border-2 border-dashed border-indigo-300 dark:border-indigo-600',
        'bg-indigo-50 dark:bg-indigo-950/30',
        className
      )}
    >
      <Mic className="w-5 h-5 text-indigo-600 dark:text-indigo-400 shrink-0 mt-0.5" />
      <p className="text-sm text-slate-700 dark:text-slate-300 italic">
        "{transcript}"
      </p>
    </div>
  )
}
