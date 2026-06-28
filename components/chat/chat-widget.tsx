'use client'

import { useState } from 'react'
import { X, MessageCircle } from 'lucide-react'
import { LeadChatPanel } from './lead-chat-panel'

interface ChatWidgetProps {
  leadId: string
  organizationName?: string
}

export function ChatWidget({ leadId, organizationName = 'Lead.ma' }: ChatWidgetProps) {
  const [isOpen, setIsOpen] = useState(false)

  return (
    <>
      {/* Floating bubble */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="fixed bottom-6 right-6 z-50 flex items-center justify-center w-14 h-14 rounded-full bg-indigo-600 hover:bg-indigo-700 text-white shadow-xl hover:shadow-2xl transition-all duration-200 hover:scale-110"
          title="Ouvrir le chat"
        >
          <MessageCircle className="w-6 h-6" />
        </button>
      )}

      {/* Chat window */}
      {isOpen && (
        <div className="fixed bottom-6 right-6 z-50 w-96 h-[520px] flex flex-col bg-white dark:bg-slate-950 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden animate-in fade-in slide-in-from-bottom-4 duration-300">
          {/* Header */}
          <div className="px-4 py-3 bg-indigo-600 text-white flex items-center justify-between">
            <div>
              <h3 className="font-semibold">Assistant {organizationName}</h3>
              <p className="text-xs text-indigo-200">En ligne</p>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="hover:bg-indigo-700 p-1 rounded transition-colors"
              title="Fermer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Chat panel */}
          <LeadChatPanel leadId={leadId} />
        </div>
      )}

      {/* Embed code snippet */}
      {isOpen && (
        <div className="fixed inset-0 z-40 bg-black/20" onClick={() => setIsOpen(false)} />
      )}
    </>
  )
}
