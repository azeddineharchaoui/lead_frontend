'use client'

import { useEffect, useRef } from 'react'
import { ChatMessage } from '@/lib/types'
import { MessageBubble } from './message-bubble'
import { Loader2 } from 'lucide-react'

interface MessageListProps {
  messages: ChatMessage[]
  isLoading?: boolean
  isSending?: boolean
}

export function MessageList({ messages, isLoading, isSending }: MessageListProps) {
  const endRef = useRef<HTMLDivElement>(null)

  // Auto-scroll to bottom on new messages
  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  // Group messages by date
  const groupedMessages: { date: string; messages: ChatMessage[] }[] = []
  let currentDate = ''

  messages.forEach((msg) => {
    const msgDate = new Date(msg.timestamp).toLocaleDateString('fr-FR')
    if (msgDate !== currentDate) {
      currentDate = msgDate
      groupedMessages.push({ date: msgDate, messages: [msg] })
    } else if (groupedMessages.length > 0) {
      groupedMessages[groupedMessages.length - 1].messages.push(msg)
    }
  })

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-6 h-6 animate-spin text-slate-400" />
      </div>
    )
  }

  if (messages.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center">
        <div className="w-12 h-12 rounded-full bg-indigo-100 dark:bg-indigo-900 flex items-center justify-center mb-4">
          <span className="text-xl">💬</span>
        </div>
        <h3 className="font-medium text-slate-900 dark:text-slate-100">Bonjour !</h3>
        <p className="text-sm text-slate-600 dark:text-slate-400 mt-2">
          Comment puis-je vous aider ?
        </p>
      </div>
    )
  }

  return (
    <div className="flex flex-col space-y-1">
      {groupedMessages.map((group, idx) => (
        <div key={idx}>
          {/* Date separator */}
          {idx > 0 && (
            <div className="flex justify-center py-3">
              <span className="text-xs text-slate-500 dark:text-slate-400">
                {group.date}
              </span>
            </div>
          )}

          {/* Messages for this date */}
          {group.messages.map((msg, msgIdx) => (
            <div key={msgIdx} aria-live={msg.role === 'assistant' ? 'polite' : undefined}>
              <MessageBubble message={msg} isUser={msg.role === 'user'} />
            </div>
          ))}
        </div>
      ))}

      {/* Typing indicator */}
      {isSending && (
        <div className="flex gap-2 mb-3">
          <div className="bg-slate-100 dark:bg-slate-800 px-4 py-2 rounded-2xl rounded-bl-md">
            <div className="flex gap-1">
              <div className="w-2 h-2 rounded-full bg-slate-400 animate-bounce" />
              <div className="w-2 h-2 rounded-full bg-slate-400 animate-bounce" style={{ animationDelay: '0.2s' }} />
              <div className="w-2 h-2 rounded-full bg-slate-400 animate-bounce" style={{ animationDelay: '0.4s' }} />
            </div>
          </div>
        </div>
      )}

      {/* Scroll anchor */}
      <div ref={endRef} />
    </div>
  )
}
