'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/hooks/useAuth'
import { useApiClient } from '@/hooks/useApiClient'
import { listPendingLeads, updateLeadStatus } from '@/lib/api/leads'
import { Phone, Clock, Loader2, AlertCircle } from 'lucide-react'
import Link from 'next/link'
import { toast } from 'sonner'

interface AgentQuickActionsProps {
  pendingCount: number
}

export function AgentQuickActions({ pendingCount }: AgentQuickActionsProps) {
  const router = useRouter()
  const { user } = useAuth()
  const api = useApiClient()
  const [claiming, setClaiming] = useState(false)

  const handleClaimNext = async () => {
    try {
      setClaiming(true)
      const pending = await listPendingLeads(api, 1)

      if (!pending || pending.length === 0) {
        toast.error('Aucun lead disponible pour le moment')
        return
      }

      const lead = pending[0]
      // Transition to en_cours with agent name
      await updateLeadStatus(api, lead.id, {
        status: 'en_cours',
        notes: `Réclamé par ${user?.full_name || 'agent'} à ${new Date().toLocaleString('fr-FR')}`,
      })

      toast.success('Lead réclamé avec succès')
      router.push(`/leads/${lead.id}`)
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Erreur lors de la réclamation du lead'
      toast.error(message)
    } finally {
      setClaiming(false)
    }
  }

  return (
    <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-6">
      <h3 className="font-semibold text-slate-900 dark:text-white mb-4">Actions rapides</h3>

      <div className="space-y-3">
        {/* Claim next lead button */}
        <button
          onClick={handleClaimNext}
          disabled={claiming || pendingCount === 0}
          className="w-full flex items-center justify-between gap-3 px-4 py-3 bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-400 disabled:cursor-not-allowed text-white font-semibold rounded-lg transition-colors duration-200 group"
        >
          <div className="flex items-center gap-2">
            {claiming ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              <Phone className="w-5 h-5 group-hover:scale-110 transition-transform" />
            )}
            <span>{claiming ? 'Réclamation...' : 'Réclamer le prochain lead'}</span>
          </div>
          {pendingCount > 0 && (
            <span className="inline-flex items-center justify-center w-6 h-6 bg-white/20 rounded-full text-xs font-bold">
              {Math.min(pendingCount, 99)}
            </span>
          )}
        </button>

        {/* Queue link */}
        <Link
          href="/leads/pending"
          className="flex items-center justify-between gap-3 px-4 py-3 border border-slate-300 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800/50 text-slate-900 dark:text-white font-semibold rounded-lg transition-colors duration-200"
        >
          <div className="flex items-center gap-2">
            <Clock className="w-5 h-5 text-slate-600 dark:text-slate-400" />
            Voir la file d&apos;attente
          </div>
          <span className="text-xs font-mono bg-slate-200 dark:bg-slate-800 px-2 py-1 rounded text-slate-700 dark:text-slate-300">
            {pendingCount}
          </span>
        </Link>

        {/* Empty state */}
        {pendingCount === 0 && (
          <div className="bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-800 rounded-lg p-3 flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-amber-600 dark:text-amber-400 flex-shrink-0 mt-0.5" />
            <p className="text-sm text-amber-800 dark:text-amber-200">
              Aucun lead en attente. Les leads seront disponibles une fois scrappés.
            </p>
          </div>
        )}
      </div>
    </div>
  )
}
