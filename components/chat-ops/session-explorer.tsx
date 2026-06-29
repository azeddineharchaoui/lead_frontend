'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useApiClient } from '@/hooks/useApiClient'
import { listLeads, listChatSessions } from '@/lib/api'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { Loader2, MessageSquare, CheckCircle2, AlertCircle } from 'lucide-react'
import { toast } from 'sonner'
import type { Lead, ChatSession } from '@/lib/types'

interface SessionRow {
  leadId: string
  leadPhone: string
  leadCompany: string
  sessionId: string
  intent: string
  messageCount: number
  channel: string
  isActive: boolean
  created: string
}

export function SessionExplorer() {
  const api = useApiClient()
  const [sessions, setSessions] = useState<SessionRow[]>([])
  const [filteredSessions, setFilteredSessions] = useState<SessionRow[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [filterActive, setFilterActive] = useState(true)

  useEffect(() => {
    const loadSessions = async () => {
      try {
        setLoading(true)

        // Fetch recent leads
        const leadsRes = await listLeads(api as any, { page: 1, page_size: 20 })
        const leads = leadsRes?.items || []

        const allSessions: SessionRow[] = []

        // For each lead, fetch its sessions
        for (const lead of leads) {
          try {
            const leadSessions = await listChatSessions(api as any, lead.id)

            // Flatten sessions into rows
            for (const session of leadSessions) {
              allSessions.push({
                leadId: lead.id,
                leadPhone: lead.phone_number,
                leadCompany: lead.company_name || '-',
                sessionId: session.id,
                intent: session.intent_detected || 'Unknown',
                messageCount: session.chat_history?.length || 0,
                channel: session.channel,
                isActive: session.is_active,
                created: new Date(session.created_at).toLocaleDateString('fr-FR'),
              })
            }
          } catch (err) {
            console.error(`Failed to load sessions for lead ${lead.id}:`, err)
          }
        }

        setSessions(allSessions)
      } catch (err) {
        toast.error('Erreur lors du chargement des sessions')
      } finally {
        setLoading(false)
      }
    }

    loadSessions()
  }, [api])

  // Filter sessions
  useEffect(() => {
    let filtered = sessions

    if (filterActive) {
      filtered = filtered.filter((s) => s.isActive)
    }

    if (searchTerm) {
      const term = searchTerm.toLowerCase()
      filtered = filtered.filter(
        (s) =>
          s.leadPhone.toLowerCase().includes(term) ||
          s.leadCompany.toLowerCase().includes(term) ||
          s.intent.toLowerCase().includes(term)
      )
    }

    setFilteredSessions(filtered)
  }, [sessions, searchTerm, filterActive])

  const getIntentColor = (intent: string) => {
    const colors: Record<string, string> = {
      interest: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
      pricing: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
      technical: 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200',
      objection: 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200',
    }
    return colors[intent.toLowerCase()] || 'bg-slate-100 text-slate-800 dark:bg-slate-900 dark:text-slate-200'
  }

  if (loading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center h-96">
          <div className="flex items-center gap-2">
            <Loader2 className="w-5 h-5 animate-spin" />
            Chargement des sessions...
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Explorateur de sessions</CardTitle>
        <CardDescription>
          {filteredSessions.length} sessions chargées
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Filters */}
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
          <Input
            placeholder="Rechercher par téléphone, entreprise ou intention..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="flex-1"
          />
          <button
            onClick={() => setFilterActive(!filterActive)}
            className={`px-3 py-2 rounded-lg border transition-colors ${
              filterActive
                ? 'bg-indigo-100 border-indigo-300 text-indigo-800 dark:bg-indigo-900 dark:border-indigo-700 dark:text-indigo-200'
                : 'bg-slate-100 border-slate-300 text-slate-800 dark:bg-slate-900 dark:border-slate-700 dark:text-slate-200'
            }`}
          >
            {filterActive ? 'Actifs seulement' : 'Tous'}
          </button>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Téléphone</TableHead>
                <TableHead>Entreprise</TableHead>
                <TableHead>Intention</TableHead>
                <TableHead className="text-right">Messages</TableHead>
                <TableHead>Canal</TableHead>
                <TableHead>Statut</TableHead>
                <TableHead>Créé</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredSessions.length > 0 ? (
                filteredSessions.map((session) => (
                  <TableRow
                    key={`${session.leadId}-${session.sessionId}`}
                    className="cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-800/50"
                  >
                    <TableCell>
                      <Link
                        href={`/leads/${session.leadId}?tab=chat`}
                        className="text-indigo-600 hover:underline font-mono text-sm"
                      >
                        {session.leadPhone}
                      </Link>
                    </TableCell>
                    <TableCell className="text-sm">{session.leadCompany}</TableCell>
                    <TableCell>
                      <Badge className={getIntentColor(session.intent)}>
                        {session.intent}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">{session.messageCount}</TableCell>
                    <TableCell className="text-sm capitalize">{session.channel}</TableCell>
                    <TableCell>
                      {session.isActive ? (
                        <Badge variant="outline" className="bg-green-50 dark:bg-green-900/30">
                          <CheckCircle2 className="w-3 h-3 mr-1" />
                          Actif
                        </Badge>
                      ) : (
                        <Badge variant="outline">Fermé</Badge>
                      )}
                    </TableCell>
                    <TableCell className="text-sm text-slate-500">{session.created}</TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-8">
                    <AlertCircle className="w-8 h-8 text-slate-400 mx-auto mb-2" />
                    <p className="text-slate-500">Aucune session trouvée</p>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  )
}
