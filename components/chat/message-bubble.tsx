'use client'

import { ChatMessage } from '@/lib/types'
import { cn } from '@/lib/utils'

interface MessageBubbleProps {
  message: ChatMessage
  isUser: boolean
}

export function MessageBubble({ message, isUser }: MessageBubbleProps) {
  const timestamp = new Date(message.timestamp).toLocaleTimeString('fr-FR', {
    hour: '2-digit',
    minute: '2-digit',
  })

  if (message.role === 'system') {
    return (
      <div className="flex justify-center py-2">
        <span className="text-xs px-3 py-1 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 rounded-full">
          {message.content}
        </span>
      </div>
    )
  }

  return (
    <div className={cn('flex gap-2 mb-3', isUser && 'flex-row-reverse')}>
      <div
        className={cn(
          'max-w-xs lg:max-w-md px-4 py-2 rounded-2xl',
          isUser
            ? 'bg-indigo-600 text-white rounded-br-md'
            : 'bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-slate-100 rounded-bl-md'
        )}
      >
        <p className="text-sm leading-relaxed break-words">{message.content}</p>
        <p
          className={cn(
            'text-[10px] mt-1',
            isUser
              ? 'text-indigo-100'
              : 'text-slate-500 dark:text-slate-400'
          )}
        >
          {timestamp}
        </p>
      </div>
    </div>
  )
}
