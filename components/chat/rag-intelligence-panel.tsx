'use client'

import { ChatbotResponse, ChatChannel } from '@/lib/types'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Card } from '@/components/ui/card'
import { intentLabel, intentColor, scoreTier, scoreTierLabel, scoreTierColor } from '@/lib/chat-utils'
import { Copy, Zap } from 'lucide-react'
import { toast } from 'sonner'
import { cn } from '@/lib/utils'

interface RagIntelligencePanelProps {
  response: ChatbotResponse | null
  channel?: ChatChannel
  isOpen?: boolean
  onDismiss?: () => void
}

export function RagIntelligencePanel({
  response,
  channel = 'web_chat',
  isOpen = true,
}: RagIntelligencePanelProps) {
  if (!response) {
    return (
      <div className="h-full flex flex-col items-center justify-center text-center p-4">
        <Zap className="w-8 h-8 text-slate-300 dark:text-slate-600 mb-3" />
        <p className="text-sm text-slate-500 dark:text-slate-400">
          Les analyses du chatbot apparaîtront ici après le premier message
        </p>
      </div>
    )
  }

  const score = response.qualification_score ?? 0
  const tier = scoreTier(score)
  const tierLabel = scoreTierLabel(tier)
  const tierColor = scoreTierColor(tier)

  const channelBadges: Record<string, string> = {
    web_chat: 'Web Chat',
    whatsapp: 'WhatsApp',
    sms: 'SMS',
    email: 'Email',
  }

  const handleCopyAction = (action: string) => {
    navigator.clipboard.writeText(action)
    toast.success('Action copiée')
  }

  return (
    <div className="h-full overflow-y-auto space-y-4 p-4">
      {/* Score de qualification */}
      <div className="space-y-2">
        <h3 className="font-semibold text-sm text-slate-900 dark:text-slate-100">
          Score de qualification
        </h3>
        <div className="flex items-center gap-4">
          {/* Radial gauge representation */}
          <div className="relative w-20 h-20 rounded-full border-4 flex items-center justify-center" 
               style={{
                 borderColor: tier === 'high' ? 'rgb(16 185 129)' : tier === 'mid' ? 'rgb(217 119 6)' : 'rgb(220 38 38)'
               }}>
            <span className={cn('text-2xl font-bold', tierColor)}>
              {score}
            </span>
          </div>
          <div className="flex-1 space-y-1">
            <p className={cn('text-sm font-medium', tierColor)}>
              {tierLabel}
            </p>
            <Progress
              value={score}
              className="h-2"
            />
            <p className="text-xs text-slate-500 dark:text-slate-400">
              0–100
            </p>
          </div>
        </div>
      </div>

      {/* Intention détectée */}
      {response.intent_detected && (
        <div className="space-y-2">
          <h3 className="font-semibold text-sm text-slate-900 dark:text-slate-100">
            Intention détectée
          </h3>
          <div className="space-y-2">
            <Badge
              variant="secondary"
              className={cn(
                'text-xs',
                intentColor(response.intent_detected) === 'emerald' && 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900 dark:text-emerald-100',
                intentColor(response.intent_detected) === 'blue' && 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-100',
                intentColor(response.intent_detected) === 'rose' && 'bg-rose-100 text-rose-800 dark:bg-rose-900 dark:text-rose-100',
                intentColor(response.intent_detected) === 'amber' && 'bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-100',
                intentColor(response.intent_detected) === 'orange' && 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-100',
              )}
            >
              {intentLabel(response.intent_detected)}
            </Badge>

            {response.intent_confidence && (
              <div className="space-y-1">
                <div className="flex justify-between text-xs">
                  <span className="text-slate-600 dark:text-slate-400">Confiance</span>
                  <span className="font-medium text-slate-900 dark:text-slate-100">
                    {Math.round(response.intent_confidence * 100)}%
                  </span>
                </div>
                <Progress value={response.intent_confidence * 100} className="h-1.5" />
              </div>
            )}
          </div>
        </div>
      )}

      {/* Actions suggérées */}
      {response.suggested_actions.length > 0 && (
        <div className="space-y-2">
          <h3 className="font-semibold text-sm text-slate-900 dark:text-slate-100">
            Actions suggérées
          </h3>
          <div className="space-y-1.5">
            {response.suggested_actions.map((action, idx) => (
              <button
                key={idx}
                onClick={() => handleCopyAction(action)}
                className="block w-full text-left p-2 rounded border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors group"
              >
                <div className="flex items-start gap-2">
                  <Copy className="w-3.5 h-3.5 text-slate-400 group-hover:text-slate-600 dark:group-hover:text-slate-300 shrink-0 mt-0.5" />
                  <span className="text-xs text-slate-700 dark:text-slate-300 line-clamp-2">
                    {action}
                  </span>
                </div>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Context RAG */}
      <Card className="bg-indigo-50 dark:bg-indigo-950 border-indigo-200 dark:border-indigo-800 p-3">
        <div className="flex gap-2">
          <Zap className="w-4 h-4 text-indigo-600 dark:text-indigo-400 shrink-0 mt-0.5" />
          <div className="text-xs text-indigo-900 dark:text-indigo-100 leading-relaxed">
            <p className="font-medium mb-1">Enrichissement RAG</p>
            <p>Réponse basée sur des conversations similaires passées (pgvector + Gemini Flash)</p>
          </div>
        </div>
      </Card>

      {/* Canal */}
      {channel && (
        <div className="space-y-2 pt-2 border-t border-slate-200 dark:border-slate-700">
          <h3 className="font-semibold text-sm text-slate-900 dark:text-slate-100">
            Canal
          </h3>
          <Badge variant="outline" className="text-xs">
            {channelBadges[channel] || channel}
          </Badge>
        </div>
      )}
    </div>
  )
}
