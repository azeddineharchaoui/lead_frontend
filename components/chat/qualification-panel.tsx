'use client'

import { MessageCircle } from 'lucide-react'
import { IntentBadge } from './intent-badge'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import type { Lead, ChatbotResponse } from '@/lib/types'

interface QualificationPanelProps {
  lead: Lead
  onOpenChat?: () => void
  lastResponse?: ChatbotResponse | null
}

export function QualificationPanel({
  lead,
  onOpenChat,
  lastResponse,
}: QualificationPanelProps) {
  const score = lead.qualification_score || 0

  const getScoreColor = (score: number) => {
    if (score < 40) return 'text-red-600 dark:text-red-400'
    if (score < 71) return 'text-amber-600 dark:text-amber-400'
    return 'text-green-600 dark:text-green-400'
  }

  const getScoreLabel = (score: number) => {
    if (score < 40) return 'Peu qualifié'
    if (score < 71) return 'En qualification'
    return 'Fortement qualifié'
  }

  const getScoreBg = (score: number) => {
    if (score < 40) return 'bg-red-100 dark:bg-red-900/20'
    if (score < 71) return 'bg-amber-100 dark:bg-amber-900/20'
    return 'bg-green-100 dark:bg-green-900/20'
  }

  return (
    <Card className="p-6 space-y-4">
      <h3 className="font-semibold text-lg">Panel de Qualification</h3>

      {/* Score gauge */}
      <div className={`${getScoreBg(score)} rounded-lg p-4 flex items-center gap-4`}>
        <div className="flex-1">
          <p className="text-sm text-slate-600 dark:text-slate-400 mb-1">Score</p>
          <p className={`text-3xl font-bold ${getScoreColor(score)}`}>
            {score}
          </p>
          <p className="text-xs text-slate-600 dark:text-slate-400 mt-1">
            {getScoreLabel(score)}
          </p>
        </div>

        {/* Circular progress */}
        <div className="relative w-20 h-20">
          <svg className="w-20 h-20 transform -rotate-90" viewBox="0 0 80 80">
            <circle
              cx="40"
              cy="40"
              r="36"
              stroke="currentColor"
              strokeWidth="2"
              fill="none"
              className="text-slate-200 dark:text-slate-700"
            />
            <circle
              cx="40"
              cy="40"
              r="36"
              stroke="currentColor"
              strokeWidth="2"
              fill="none"
              strokeDasharray={`${2.26 * score} 226`}
              className={getScoreColor(score)}
              strokeLinecap="round"
            />
          </svg>
          <div className="absolute inset-0 flex items-center justify-center">
            <span className={`text-xs font-bold ${getScoreColor(score)}`}>
              {score}%
            </span>
          </div>
        </div>
      </div>

      {/* Intent */}
      {lastResponse?.intent_detected && (
        <div className="space-y-2">
          <p className="text-sm font-medium text-slate-700 dark:text-slate-300">Intention détectée</p>
          <IntentBadge
            intent={lastResponse.intent_detected}
            confidence={lastResponse.intent_confidence}
            size="md"
          />
        </div>
      )}

      {/* Suggested actions */}
      {lastResponse?.suggested_actions && lastResponse.suggested_actions.length > 0 && (
        <div className="space-y-2">
          <p className="text-sm font-medium text-slate-700 dark:text-slate-300">Actions suggérées</p>
          <div className="flex flex-wrap gap-2">
            {lastResponse.suggested_actions.map((action, idx) => (
              <div
                key={idx}
                className="px-2.5 py-1 bg-indigo-100 text-indigo-700 dark:bg-indigo-900 dark:text-indigo-200 rounded-full text-xs font-medium"
              >
                {action}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Mini chat preview */}
      {lastResponse && (
        <div className="bg-slate-50 dark:bg-slate-900 rounded-lg p-3 space-y-2">
          <p className="text-xs font-medium text-slate-500 dark:text-slate-400">Dernier message</p>
          <p className="text-xs text-slate-700 dark:text-slate-300 line-clamp-2">
            {lastResponse.response_text}
          </p>
        </div>
      )}

      {/* Open chat button */}
      <Button
        onClick={onOpenChat}
        className="w-full gap-2 bg-indigo-600 hover:bg-indigo-700"
      >
        <MessageCircle className="w-4 h-4" />
        Ouvrir le chat
      </Button>
    </Card>
  )
}
