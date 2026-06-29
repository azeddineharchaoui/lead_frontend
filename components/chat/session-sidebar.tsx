'use client'

import { Plus, X, AlertCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import { useState } from 'react'
import type { LeadSessionSummary } from '@/lib/types'
import { cn } from '@/lib/utils'

interface SessionSidebarProps {
  sessions: LeadSessionSummary[]
  activeId?: string
  onSelect: (sessionId: string) => void
  onNew: () => void
  onClose: (sessionId: string) => Promise<void>
  isLoading?: boolean
}

export function SessionSidebar({
  sessions,
  activeId,
  onSelect,
  onNew,
  onClose,
  isLoading = false,
}: SessionSidebarProps) {
  const [sessionToClose, setSessionToClose] = useState<string | null>(null)
  const [isClosing, setIsClosing] = useState(false)

  const handleCloseSession = async () => {
    if (!sessionToClose) return

    try {
      setIsClosing(true)
      await onClose(sessionToClose)
      setSessionToClose(null)
    } finally {
      setIsClosing(false)
    }
  }

  // Sort sessions: active first, then by created_at descending
  const sortedSessions = [...sessions].sort((a, b) => {
    if (a.is_active === b.is_active) {
      return new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
    }
    return a.is_active ? -1 : 1
  })

  return (
    <>
      <div className="w-56 border-r border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900/20 flex flex-col">
        {/* Header */}
        <div className="p-4 border-b border-slate-200 dark:border-slate-700">
          <Button onClick={onNew} size="sm" className="w-full gap-2" disabled={isLoading}>
            <Plus className="w-4 h-4" />
            Nouvelle session
          </Button>
        </div>

        {/* Sessions list */}
        <div className="flex-1 overflow-y-auto">
          <div className="p-2 space-y-1">
            {sortedSessions.length === 0 ? (
              <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400 p-3">
                <AlertCircle className="w-4 h-4 flex-shrink-0" />
                <span>Aucune session</span>
              </div>
            ) : (
              sortedSessions.map((session) => (
                <div
                  key={session.id}
                  className={cn(
                    'group flex items-center justify-between p-3 rounded-lg transition-colors cursor-pointer',
                    activeId === session.id
                      ? 'bg-white dark:bg-slate-800 border border-indigo-200 dark:border-indigo-700'
                      : 'hover:bg-white dark:hover:bg-slate-800/50'
                  )}
                  onClick={() => onSelect(session.id)}
                >
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      {session.is_active && (
                        <Badge variant="outline" className="bg-green-50 dark:bg-green-950/30 text-green-700 dark:text-green-300 border-green-200 dark:border-green-800 text-xs">
                          Active
                        </Badge>
                      )}
                    </div>
                    {session.intent_detected && (
                      <p className="text-xs font-medium text-slate-700 dark:text-slate-300 truncate">
                        {session.intent_detected}
                      </p>
                    )}
                    <p className="text-xs text-slate-500 dark:text-slate-400">
                      {session.message_count} messages
                    </p>
                    <p className="text-xs text-slate-400 dark:text-slate-500">
                      {new Date(session.created_at).toLocaleDateString('fr-FR', {
                        month: 'short',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </p>
                  </div>

                  {/* Close button */}
                  <button
                    onClick={(e) => {
                      e.stopPropagation()
                      setSessionToClose(session.id)
                    }}
                    className="opacity-0 group-hover:opacity-100 transition-opacity ml-2 flex-shrink-0"
                    title="Fermer cette session"
                  >
                    <X className="w-4 h-4 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300" />
                  </button>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Close session confirmation dialog */}
      <AlertDialog open={sessionToClose !== null} onOpenChange={(open) => !open && setSessionToClose(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Fermer cette session?</AlertDialogTitle>
            <AlertDialogDescription>
              La session sera fermée et ne recevra plus de messages. Cette action est irréversible.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogCancel>Annuler</AlertDialogCancel>
          <AlertDialogAction onClick={handleCloseSession} disabled={isClosing}>
            {isClosing ? 'Fermeture...' : 'Fermer'}
          </AlertDialogAction>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}
