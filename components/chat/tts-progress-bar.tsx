'use client'

import { useRef, useEffect, useState } from 'react'

interface TtsProgressBarProps {
  isPlaying: boolean
  duration?: number
}

export function TtsProgressBar({ isPlaying, duration = 0 }: TtsProgressBarProps) {
  const audioRef = useRef<HTMLAudioElement | null>(null)
  const [progress, setProgress] = useState(0)

  // Get audio element from global context if available
  useEffect(() => {
    if (!isPlaying) {
      setProgress(0)
      return
    }

    const updateProgress = () => {
      if (audioRef.current) {
        const current = audioRef.current.currentTime
        const total = audioRef.current.duration || duration
        if (total > 0) {
          setProgress((current / total) * 100)
        }
      }
    }

    const interval = setInterval(updateProgress, 100)
    return () => clearInterval(interval)
  }, [isPlaying, duration])

  if (!isPlaying || progress === 0) {
    return null
  }

  return (
    <div className="h-0.5 bg-gradient-to-r from-indigo-400 via-indigo-500 to-indigo-600 rounded-full overflow-hidden">
      <div
        className="h-full transition-all duration-100"
        style={{ width: `${progress}%` }}
      />
    </div>
  )
}
