'use client'

import { useRef, useState } from 'react'
import { Button } from '@/components/ui/button'
import { Loader2, Send, Mic } from 'lucide-react'
import { cn } from '@/lib/utils'

interface ChatComposerProps {
  onSendMessage: (text: string) => void
  isSending?: boolean
  disabled?: boolean
  showVoiceButton?: boolean
  onVoiceClick?: () => void
}

export function ChatComposer({
  onSendMessage,
  isSending = false,
  disabled = false,
  showVoiceButton = true,
  onVoiceClick,
}: ChatComposerProps) {
  const [text, setText] = useState('')
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  const charCount = text.length
  const isOverLimit = charCount > 4500
  const maxChars = 5000

  // Auto-resize textarea
  const handleTextChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setText(e.target.value)
    // Reset height and recalculate
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto'
      textareaRef.current.style.height = Math.min(textareaRef.current.scrollHeight, 120) + 'px'
    }
  }

  const handleSend = () => {
    if (!text.trim() || isSending || disabled) return
    onSendMessage(text)
    setText('')
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto'
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  return (
    <div className="space-y-2">
      {/* Character counter */}
      {charCount > 4500 && (
        <div className={cn(
          'text-xs',
          isOverLimit ? 'text-red-600' : 'text-slate-500'
        )}>
          {charCount} / {maxChars} caractères
        </div>
      )}

      {/* Composer */}
      <div className="flex gap-2 items-end">
        {showVoiceButton && (
          <Button
            type="button"
            variant="ghost"
            size="icon"
            onClick={onVoiceClick}
            disabled={disabled || isSending}
            className="shrink-0 h-10 w-10"
            title="Enregistrer un message vocal"
          >
            <Mic className="w-5 h-5" />
          </Button>
        )}

        <div className="flex-1 relative bg-slate-100 dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 overflow-hidden">
          <textarea
            ref={textareaRef}
            value={text}
            onChange={handleTextChange}
            onKeyDown={handleKeyDown}
            placeholder="Écrivez votre message... (Shift+Enter pour nouvelle ligne)"
            disabled={disabled || isSending}
            maxLength={maxChars}
            rows={1}
            className={cn(
              'w-full px-4 py-3 bg-transparent text-sm resize-none outline-none',
              'placeholder:text-slate-500 dark:placeholder:text-slate-400',
              'disabled:opacity-50 disabled:cursor-not-allowed'
            )}
          />
        </div>

        <Button
          onClick={handleSend}
          disabled={!text.trim() || isSending || disabled || isOverLimit}
          className="shrink-0 gap-2"
        >
          {isSending && <Loader2 className="w-4 h-4 animate-spin" />}
          {isSending ? 'Envoi...' : 'Envoyer'}
        </Button>
      </div>

      {/* Validation hints */}
      {!text.trim() && (
        <p className="text-xs text-slate-500 dark:text-slate-400">
          Appuyez sur Entrée pour envoyer, Shift+Entrée pour nouvelle ligne
        </p>
      )}
    </div>
  )
}
