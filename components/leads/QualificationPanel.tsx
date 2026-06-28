'use client'

import { useCallback, useEffect, useState } from 'react'
import { useApi } from '@/lib/api-context'
import { updateLeadStatus } from '@/lib/api'
import { showApiError } from '@/lib/api-errors'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { CheckCircle, Loader2, TrendingUp, MessageSquare, Clock } from 'lucide-react'
import { toast } from 'sonner'
import type { LeadDetailResponse, LeadStatus } from '@/lib/types'

interface QualificationPanelProps {
  lead: LeadDetailResponse
  onLeadUpdate?: (updated: Partial<LeadDetailResponse>) => void
}

const INTENT_LABELS: Record<string, { label: string; color: string }> = {
  interet_achat:     { label: 'Intérêt achat',    color: 'bg-green-100 text-green-800' },
  question_technique:{ label: 'Question technique', color: 'bg-blue-100 text-blue-800' },
  indecis:           { label: 'Indécis',           color: 'bg-yellow-100 text-yellow-800' },
  plainte:           { label: 'Plainte',           color: 'bg-orange-100 text-orange-800' },
  refus:             { label: 'Refus',             color: 'bg-red-100 text-red-800' },
  salutation:        { label: 'Salutation',        color: 'bg-gray-100 text-gray-700' },
  inconnu:           { label: 'Inconnu',           color: 'bg-gray-100 text-gray-500' },
}

/**
 * Gauge arc SVG (0-100, demi-cercle)
 * Couleur : rouge (0-39) → orange (40-69) → vert (70-100)
 */
function ScoreGauge({ score }: { score: number }) {
  const clampedScore = Math.max(0, Math.min(100, score))
  const radius = 44
  const circumference = Math.PI * radius // demi-cercle
  const dashOffset = circumference - (clampedScore / 100) * circumference

  const color =
    clampedScore >= 70 ? '#22c55e' :
    clampedScore >= 40 ? '#f59e0b' :
                         '#ef4444'

  return (
    <div className="flex flex-col items-center">
      <svg width="120" height="68" viewBox="0 0 120 68">
        {/* Fond */}
        <path
          d="M 10 60 A 50 50 0 0 1 110 60"
          fill="none"
          stroke="#e5e7eb"
          strokeWidth="12"
          strokeLinecap="round"
        />
        {/* Progression */}
        <path
          d="M 10 60 A 50 50 0 0 1 110 60"
          fill="none"
          stroke={color}
          strokeWidth="12"
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={dashOffset}
          style={{ transition: 'stroke-dashoffset 0.6s ease' }}
        />
        {/* Score */}
        <text x="60" y="58" textAnchor="middle" fontSize="18" fontWeight="bold" fill="#111827">
          {clampedScore.toFixed(0)}
        </text>
      </svg>
      <p className="text-xs text-gray-500 -mt-1">/ 100</p>
    </div>
  )
}

/**
 * Panneau de qualification numérique d'un lead.
 * Affiche le score RAG, l'intention, les sessions et les actions rapides.
 */
export function QualificationPanel({ lead, onLeadUpdate }: QualificationPanelProps) {
  const api = useApi()
  const [qualifying, setQualifying] = useState(false)

  const score = lead.qualification_score ?? null
  const sessionCount = lead.chat_sessions?.length ?? 0

  // Intention la plus récente depuis les sessions
  const latestIntent = lead.chat_sessions
    ?.slice()
    .reverse()
    .find((s) => s.intent_detected)
    ?.intent_detected ?? null

  const intentInfo = latestIntent ? INTENT_LABELS[latestIntent] : null

  const handleQualify = async () => {
    setQualifying(true)
    try {
      const updated = await updateLeadStatus(api, lead.id, { status: 'qualifie' })
      toast.success('Lead envoyé au call center')
      onLeadUpdate?.({ status: updated.status as LeadStatus })
    } catch (err) {
      showApiError(err)
    } finally {
      setQualifying(false)
    }
  }

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-4 space-y-4">
      <h3 className="font-bold text-gray-900 flex items-center gap-2">
        <TrendingUp className="w-4 h-4 text-blue-600" />
        Qualification RAG
      </h3>

      {/* Score gauge */}
      {score != null ? (
        <div className="flex flex-col items-center py-2">
          <ScoreGauge score={score} />
          <p className="text-xs text-gray-500 mt-1">
            {score >= 70 ? 'Lead qualifié 🎯' : score >= 40 ? 'Lead prometteur' : 'Lead froid'}
          </p>
        </div>
      ) : (
        <div className="text-center py-4 text-gray-400 text-sm">
          Aucun score — démarrez une conversation pour qualifier ce lead
        </div>
      )}

      {/* Intention */}
      {intentInfo && (
        <div className="flex items-center justify-between">
          <span className="text-xs text-gray-600">Dernière intention</span>
          <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${intentInfo.color}`}>
            {intentInfo.label}
          </span>
        </div>
      )}

      {/* Sessions */}
      <div className="flex items-center justify-between text-xs text-gray-600">
        <span className="flex items-center gap-1">
          <MessageSquare className="w-3 h-3" />
          Sessions de chat
        </span>
        <span className="font-semibold text-gray-900">{sessionCount}</span>
      </div>

      {/* Dernière activité */}
      {lead.chat_sessions && lead.chat_sessions.length > 0 && (
        <div className="flex items-center justify-between text-xs text-gray-600">
          <span className="flex items-center gap-1">
            <Clock className="w-3 h-3" />
            Dernière session
          </span>
          <span className="text-gray-900">
            {new Date(lead.chat_sessions[0].created_at).toLocaleDateString('fr-FR')}
          </span>
        </div>
      )}

      {/* Action : Envoyer au call center */}
      {lead.status !== 'qualifie' && lead.status !== 'rejete' && (
        <Button
          onClick={handleQualify}
          disabled={qualifying}
          size="sm"
          className="w-full gap-2 bg-green-600 hover:bg-green-700 text-white"
        >
          {qualifying ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <CheckCircle className="w-4 h-4" />
          )}
          Envoyer au call center
        </Button>
      )}

      {lead.status === 'qualifie' && (
        <div className="text-center text-xs text-green-700 bg-green-50 rounded py-2 font-medium">
          ✓ Lead déjà qualifié et envoyé au call center
        </div>
      )}
    </div>
  )
}
