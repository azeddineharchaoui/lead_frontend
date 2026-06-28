'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { useApi } from '@/lib/api-context'
import { listPendingLeads, claimNextLead } from '@/lib/api'
import type { Lead } from '@/lib/types'
import { PageHeader } from '@/components/page-header'
import { Button } from '@/components/ui/button'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Card } from '@/components/ui/card'
import { AlertCircle, Loader2, Phone, Building2, Inbox, ArrowRight } from 'lucide-react'
import { toast } from 'sonner'
import { formatPhoneDisplay, formatRelativeTime } from '@/lib/format'

export default function PendingLeadsPage() {
  const api = useApi()
  const router = useRouter()
  const [leads, setLeads] = useState<Lead[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [claimingId, setClaimingId] = useState<string | null>(null)

  useEffect(() => {
    const loadPendingLeads = async () => {
      try {
        setLoading(true)
        setError(null)
        const data = await listPendingLeads(api, 50)
        setLeads(data)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Erreur de chargement')
      } finally {
        setLoading(false)
      }
    }

    loadPendingLeads()
  }, [api])

  const handleClaimLead = async (leadId: string) => {
    setClaimingId(leadId)
    try {
      await claimNextLead(api, undefined)
      toast.success('Lead réclamé avec succès')
      router.push(`/leads/${leadId}`)
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Erreur')
      setClaimingId(null)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="w-8 h-8 animate-spin text-slate-400" />
      </div>
    )
  }

  if (error) {
    return (
      <div className="space-y-4">
        <PageHeader title="File d'attente" description="Leads en attente de traitement" />
        <Alert variant="destructive">
          <AlertCircle className="w-4 h-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="File d'attente"
        description={leads.length === 0 ? 'Aucun lead en attente' : `${leads.length} lead(s) en attente`}
      />

      {leads.length === 0 ? (
        <Card className="p-12 text-center">
          <Inbox className="w-12 h-12 text-slate-300 dark:text-slate-700 mx-auto mb-3" />
          <h3 className="font-semibold text-slate-900 dark:text-white mb-1">File d'attente vide</h3>
          <p className="text-sm text-slate-600 dark:text-slate-400 mb-6">
            Bravo ! Aucun lead en attente de traitement pour le moment.
          </p>
          <Link href="/leads">
            <Button variant="outline">Retour à la liste</Button>
          </Link>
        </Card>
      ) : (
        <div className="space-y-3">
          {leads.map((lead) => (
            <Card key={lead.id} className="p-4 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
              <div className="flex items-center justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-2">
                    <Phone className="w-4 h-4 text-slate-400" />
                    <span className="font-mono font-semibold text-slate-900 dark:text-white">
                      {formatPhoneDisplay(lead.phone_number)}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    {lead.company_name ? (
                      <>
                        <Building2 className="w-4 h-4 text-slate-400" />
                        <span className="text-slate-700 dark:text-slate-300">{lead.company_name}</span>
                        {lead.website_domain && (
                          <>
                            <span className="text-slate-400">•</span>
                            <span className="text-slate-600 dark:text-slate-400">{lead.website_domain}</span>
                          </>
                        )}
                      </>
                    ) : lead.website_domain ? (
                      <>
                        <Building2 className="w-4 h-4 text-slate-400" />
                        <span className="text-slate-600 dark:text-slate-400">{lead.website_domain}</span>
                      </>
                    ) : (
                      <span className="text-slate-500 dark:text-slate-400">Pas d'informations</span>
                    )}
                  </div>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                    Créé {formatRelativeTime(lead.created_at)}
                  </p>
                </div>

                <Button
                  onClick={() => handleClaimLead(lead.id)}
                  disabled={claimingId === lead.id}
                  className="gap-2 whitespace-nowrap"
                >
                  {claimingId === lead.id && <Loader2 className="w-4 h-4 animate-spin" />}
                  Prendre
                  <ArrowRight className="w-4 h-4" />
                </Button>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
