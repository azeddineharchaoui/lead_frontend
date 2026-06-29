'use client'

import { useCallback, useEffect, useState } from 'react'
import { useApiClient } from '@/hooks/useApiClient'
import { listTargets } from '@/lib/api/targets'
import { showApiError } from '@/lib/api-errors'
import type { ScrapingTarget, ScrapingStatus } from '@/lib/types'
import { PageHeader } from '@/components/page-header'
import { AddTargetDialog } from '@/components/targets/add-target-dialog'
import { TargetCard } from '@/components/targets/target-card'
import { TargetDetailSheet } from '@/components/target-detail-sheet'
import { TargetStatusBadge } from '@/components/targets/target-status-badge'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { AlertCircle, Plus, Grid, Table, Loader2 } from 'lucide-react'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { toast } from 'sonner'

export default function TargetsPage() {
  const api = useApiClient()
  const [targets, setTargets] = useState<ScrapingTarget[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
  const [selectedTarget, setSelectedTarget] = useState<ScrapingTarget | null>(null)
  const [isDetailSheetOpen, setIsDetailSheetOpen] = useState(false)
  const [viewMode, setViewMode] = useState<'card' | 'table'>('card')
  const [search, setSearch] = useState('')
  const [filterActive, setFilterActive] = useState<string>('all')
  const [filterStatus, setFilterStatus] = useState<string>('all')

  const loadTargets = useCallback(async () => {
    if (!api.apiKey) return
    try {
      setLoading(true)
      setError(null)
      const data = await listTargets(api, { page: 1, page_size: 100 })
      setTargets(data.items)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur de chargement')
      showApiError(err)
    } finally {
      setLoading(false)
    }
  }, [api])

  useEffect(() => {
    loadTargets()
  }, [loadTargets])

  if (!api.apiKey) {
    return (
      <div className="space-y-4">
        <PageHeader title="Cibles de scraping" description="Gérez les sources de leads" />
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            <p className="font-semibold">Clé API admin requise</p>
            <p className="text-sm mt-2">
              Configurez votre clé API dans les paramètres pour accéder aux cibles de scraping.
            </p>
            <Button
              variant="outline"
              size="sm"
              className="mt-4"
              onClick={() => (window.location.href = '/settings')}
            >
              Aller aux Paramètres
            </Button>
          </AlertDescription>
        </Alert>
      </div>
    )
  }

  // Filter targets
  const filteredTargets = targets.filter((target) => {
    const matchesSearch =
      target.domain.toLowerCase().includes(search.toLowerCase()) ||
      target.name?.toLowerCase().includes(search.toLowerCase())

    const matchesActive =
      filterActive === 'all' ||
      (filterActive === 'active' && target.is_active) ||
      (filterActive === 'inactive' && !target.is_active)

    const matchesStatus =
      filterStatus === 'all' ||
      filterStatus === target.last_scraping_status ||
      (filterStatus === 'never' && !target.last_scraping_status)

    return matchesSearch && matchesActive && matchesStatus
  })

  const activeCount = targets.filter((t) => t.is_active).length

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <PageHeader
          title="Cibles de scraping"
          description={`${activeCount} active${activeCount !== 1 ? 's' : ''} / ${targets.length} total`}
        />
        <Button onClick={() => setIsAddDialogOpen(true)} className="gap-2">
          <Plus className="w-4 h-4" />
          Ajouter
        </Button>
      </div>

      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* Filters */}
      <Card className="p-4 space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {/* Search */}
          <Input
            placeholder="Rechercher domaine ou nom..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="text-sm"
          />

          {/* Active filter */}
          <Select value={filterActive} onValueChange={setFilterActive}>
            <SelectTrigger className="text-sm">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tous</SelectItem>
              <SelectItem value="active">Actives</SelectItem>
              <SelectItem value="inactive">Inactives</SelectItem>
            </SelectContent>
          </Select>

          {/* Status filter */}
          <Select value={filterStatus} onValueChange={setFilterStatus}>
            <SelectTrigger className="text-sm">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tous les statuts</SelectItem>
              <SelectItem value="success">Succès</SelectItem>
              <SelectItem value="failed">Erreur</SelectItem>
              <SelectItem value="never">Jamais scrappé</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* View toggle */}
        <div className="flex gap-2">
          <Button
            variant={viewMode === 'card' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setViewMode('card')}
            className="gap-2"
          >
            <Grid className="w-4 h-4" />
            Grille
          </Button>
          <Button
            variant={viewMode === 'table' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setViewMode('table')}
            className="gap-2"
          >
            <Table className="w-4 h-4" />
            Tableau
          </Button>
        </div>
      </Card>

      {/* Content */}
      {loading ? (
        <div className="flex justify-center py-20">
          <Loader2 className="w-8 h-8 animate-spin text-slate-400" />
        </div>
      ) : filteredTargets.length === 0 ? (
        <Card className="p-12 text-center">
          <p className="text-slate-600 dark:text-slate-400 mb-4">
            {targets.length === 0 ? 'Aucune cible configurée' : 'Aucune cible ne correspond aux filtres'}
          </p>
          {targets.length === 0 && (
            <Button onClick={() => setIsAddDialogOpen(true)} className="gap-2">
              <Plus className="w-4 h-4" />
              Créer une cible
            </Button>
          )}
        </Card>
      ) : viewMode === 'card' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredTargets.map((target) => (
            <TargetCard
              key={target.id}
              target={target}
              onEdit={(t) => {
                setSelectedTarget(t)
                setIsDetailSheetOpen(true)
              }}
              onDelete={(id) => setTargets((prev) => prev.filter((t) => t.id !== id))}
              onScrapingComplete={() => loadTargets()}
            />
          ))}
        </div>
      ) : (
        <Card className="overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-slate-100 dark:bg-slate-800 border-b">
                <tr>
                  <th className="px-4 py-3 text-left font-medium">Domaine</th>
                  <th className="px-4 py-3 text-left font-medium">Statut</th>
                  <th className="px-4 py-3 text-center font-medium">Leads</th>
                  <th className="px-4 py-3 text-center font-medium">Erreurs</th>
                  <th className="px-4 py-3 text-left font-medium">Fréquence</th>
                  <th className="px-4 py-3 text-right font-medium">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {filteredTargets.map((target) => (
                  <tr
                    key={target.id}
                    className="hover:bg-slate-50 dark:hover:bg-slate-800/50 cursor-pointer"
                    onClick={() => {
                      setSelectedTarget(target)
                      setIsDetailSheetOpen(true)
                    }}
                  >
                    <td className="px-4 py-3">
                      <a
                        href={target.domain}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="font-medium text-indigo-600 hover:underline"
                        onClick={(e) => e.stopPropagation()}
                      >
                        {target.name || target.domain}
                      </a>
                    </td>
                    <td className="px-4 py-3" onClick={(e) => e.stopPropagation()}>
                      <TargetStatusBadge
                        status={target.last_scraping_status}
                        errorCount={target.error_count}
                      />
                    </td>
                    <td className="px-4 py-3 text-center">{target.leads_count}</td>
                    <td className="px-4 py-3 text-center">
                      {target.error_count > 0 && (
                        <span className="text-red-600 font-medium">{target.error_count}</span>
                      )}
                    </td>
                    <td className="px-4 py-3">{target.scraping_frequency_hours}h</td>
                    <td className="px-4 py-3 text-right" onClick={(e) => e.stopPropagation()}>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          setSelectedTarget(target)
                          setIsDetailSheetOpen(true)
                        }}
                      >
                        Éditer
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}

      {/* Dialogs */}
      <AddTargetDialog
        open={isAddDialogOpen}
        onOpenChange={setIsAddDialogOpen}
        onTargetCreated={(target) => {
          setTargets((prev) => [target, ...prev])
          toast.success('Cible créée avec succès')
        }}
      />

      <TargetDetailSheet
        target={selectedTarget}
        open={isDetailSheetOpen}
        onOpenChange={setIsDetailSheetOpen}
        onUpdate={(updatedTarget) => {
          setTargets((prev) => prev.map((t) => (t.id === updatedTarget.id ? updatedTarget : t)))
          setSelectedTarget(updatedTarget)
        }}
        onDelete={(id) => {
          setTargets((prev) => prev.filter((t) => t.id !== id))
          setIsDetailSheetOpen(false)
        }}
      />
    </div>
  )
}
