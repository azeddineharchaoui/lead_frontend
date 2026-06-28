'use client'

import { useEffect, useState } from 'react'
import { Button } from '@/components/ui/button'
import { Volume2 } from 'lucide-react'
import { cn } from '@/lib/utils'

interface AutoReadToggleProps {
  enabled: boolean
  onToggle: (enabled: boolean) => void
}

const STORAGE_KEY = 'lead_chat_auto_read'

export function AutoReadToggle({ enabled, onToggle }: AutoReadToggleProps) {
  const [isHydrated, setIsHydrated] = useState(false)

  // Load preference from localStorage on mount
  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY)
    if (saved === 'true') {
      onToggle(true)
    }
    setIsHydrated(true)
  }, [onToggle])

  const handleToggle = () => {
    const newState = !enabled
    localStorage.setItem(STORAGE_KEY, String(newState))
    onToggle(newState)
  }

  if (!isHydrated) {
    return null
  }

  return (
    <div className="flex items-center gap-2">
      <Button
        type="button"
        variant={enabled ? 'default' : 'outline'}
        size="sm"
        onClick={handleToggle}
        className={cn(
          'gap-2 text-xs transition-all',
          enabled && 'bg-indigo-600 hover:bg-indigo-700 ring-2 ring-indigo-500/20',
        )}
      >
        <Volume2 className="w-4 h-4" />
        Lecture auto
      </Button>
    </div>
  )
}
