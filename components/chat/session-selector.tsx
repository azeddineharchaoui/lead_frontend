'use client'

import { useEffect, useState } from 'react'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Button } from '@/components/ui/button'
import { Plus } from 'lucide-react'
import { listChatSessions } from '@/lib/api/chat'
import { useApi } from '@/lib/api-context'
import type { ChatSession } from '@/lib/types'

interface SessionSelectorProps {
  leadId: string
  onLoadSession?: (sessionId: string) => void
  onNewSession?: () => void
}

export function SessionSelector({
  leadId,
  onLoadSession,
  onNewSession,
}: SessionSelectorProps) {
  const api = useApi()
  const [sessions, setSessions] = useState<ChatSession[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const loadSessions = async () => {
      try {
        setIsLoading(true)
        const data = await listChatSessions(api, leadId)
        setSessions(data)
      } catch (err) {
        console.error('[v0] Failed to load sessions:', err)
      } finally {
        setIsLoading(false)
      }
    }

    loadSessions()
  }, [api, leadId])

  const formatSessionLabel = (session: ChatSession) => {
    const date = new Date(session.created_at).toLocaleDateString('fr-FR', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })
    const intent = session.intent_detected || 'Sans intention'
    const msgCount = session.chat_history?.length || 0

    return `${date} — ${intent} — ${msgCount} msg`
  }

  return (
    <div className="flex gap-2">
      <Select
        onValueChange={(value) => {
          onLoadSession?.(value)
        }}
        disabled={isLoading || sessions.length === 0}
      >
        <SelectTrigger className="flex-1">
          <SelectValue
            placeholder={isLoading ? 'Chargement...' : 'Sélectionner une session'}
          />
        </SelectTrigger>
        <SelectContent>
          {sessions.map((session) => (
            <SelectItem key={session.id} value={session.id}>
              <div className="flex items-center gap-2">
                {session.is_active && (
                  <div className="w-2 h-2 rounded-full bg-green-500" />
                )}
                {formatSessionLabel(session)}
              </div>
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <Button
        variant="outline"
        size="icon"
        onClick={onNewSession}
        title="Nouvelle session"
        className="flex-shrink-0"
      >
        <Plus className="w-4 h-4" />
      </Button>
    </div>
  )
}
