'use client'

import { useEffect, useRef } from 'react'
import { cn } from '@/lib/utils'

interface VoiceWaveformProps {
  analyser: AnalyserNode | null
  isRecording: boolean
  barCount?: number
  className?: string
}

export function VoiceWaveform({
  analyser,
  isRecording,
  barCount = 24,
  className,
}: VoiceWaveformProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const animationRef = useRef<number | null>(null)

  useEffect(() => {
    if (!canvasRef.current || !analyser) return

    const canvas = canvasRef.current
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const width = canvas.width
    const height = canvas.height
    const barWidth = width / barCount
    const dataArray = new Uint8Array(analyser.frequencyBinCount)

    const draw = () => {
      analyser.getByteFrequencyData(dataArray)

      // Effacer le canvas
      ctx.fillStyle = isRecording ? 'rgb(240, 244, 250)' : 'rgb(241, 245, 250)'
      ctx.fillRect(0, 0, width, height)

      // Dessiner les barres
      const barCount_ = Math.min(barCount, dataArray.length)
      for (let i = 0; i < barCount_; i++) {
        const dataIndex = Math.floor((i / barCount_) * dataArray.length)
        const value = dataArray[dataIndex]
        const barHeight = (value / 255) * height

        // Gradient de couleur
        const hue = (i / barCount_) * 60 + 220 // Bleu à indigo
        const lightness = isRecording ? 45 : 60
        ctx.fillStyle = `hsl(${hue}, 100%, ${lightness}%)`

        const x = i * barWidth + 2
        const y = height - barHeight

        ctx.fillRect(x, y, barWidth - 4, barHeight)
      }

      if (isRecording) {
        animationRef.current = requestAnimationFrame(draw)
      }
    }

    if (isRecording) {
      animationRef.current = requestAnimationFrame(draw)
    } else {
      // État inactif: ligne pointillée plate
      ctx.strokeStyle = 'rgb(203, 213, 225)'
      ctx.setLineDash([5, 5])
      ctx.beginPath()
      ctx.moveTo(0, height / 2)
      ctx.lineTo(width, height / 2)
      ctx.stroke()
      ctx.setLineDash([])
    }

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current)
      }
    }
  }, [analyser, isRecording, barCount])

  return (
    <canvas
      ref={canvasRef}
      width={400}
      height={60}
      className={cn(
        'w-full h-16 bg-slate-50 dark:bg-slate-900 rounded-lg border border-slate-200 dark:border-slate-700',
        className
      )}
    />
  )
}
