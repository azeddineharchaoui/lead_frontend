'use client'

import { Suspense } from 'react'
import Link from 'next/link'
import { useAuth } from '@/hooks/useAuth'
import { useDashboardData } from '@/hooks/useDashboardData'
import { PageHeader } from '@/components/page-header'
import { MetricCard } from '@/components/metric-card'
import { HealthWidget } from '@/components/health-widget'
import { ScrapingOverview } from '@/components/scraping-overview'
import { RecentLeadsTable } from '@/components/recent-leads-table'
import { AgentQuickActions } from '@/components/dashboard/agent-quick-actions'
import { LeadStatusChart } from '@/components/dashboard/lead-status-chart'
import { TopTargetsChart } from '@/components/dashboard/top-targets-chart'
import { Button } from '@/components/ui/button'
import { Users, UserPlus, CheckCircle, TrendingUp, Zap } from 'lucide-react'

function DashboardSkeleton() {
  return (
    <div className="space-y-6">
      <div className="h-12 bg-slate-200 dark:bg-slate-800 rounded-lg animate-pulse" />
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="h-32 bg-slate-200 dark:bg-slate-800 rounded-xl animate-pulse" />
        ))}
      </div>
    </div>
  )
}

function DashboardContent() {
  const { user } = useAuth()
  const { health, stats, recentLeads, pendingCount, loading, error } = useDashboardData()

  const isAgent = user?.role === 'agent'
  const isAdmin = user?.role === 'admin'
  const isOwner = user?.role === 'owner'

  if (loading) {
    return <DashboardSkeleton />
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <PageHeader
        title="Tableau de bord"
        description={`Bienvenue, ${user?.full_name}. Aperçu en temps réel de votre activité`}
      />

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard
          label="Leads totaux"
          value={stats?.leads.total ?? 0}
          icon={Users}
          iconColor="text-indigo-600"
          trend={12}
        />
        <MetricCard
          label="Nouveaux"
          value={stats?.leads.by_status.nouveau ?? 0}
          icon={UserPlus}
          iconColor="text-blue-600"
        />
        <MetricCard
          label="Qualifiés"
          value={stats?.leads.by_status.qualifie ?? 0}
          icon={CheckCircle}
          iconColor="text-emerald-600"
        />
        <MetricCard
          label="Taux conversion"
          value={`${stats?.leads.conversion_rate ?? 0}%`}
          icon={TrendingUp}
          iconColor="text-violet-600"
        />
      </div>

      {/* Charts row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <LeadStatusChart stats={stats} />
        <TopTargetsChart stats={stats} />
      </div>

      {/* Main grid: Health + Agent actions (if applicable) */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <HealthWidget />
        {isAgent && <AgentQuickActions pendingCount={pendingCount} />}
        {(isAdmin || isOwner) && <ScrapingOverview overview={stats} />}
      </div>

      {/* Scraping overview (full width for non-agent) */}
      {!isAgent && (isAdmin || isOwner) && (
        <div className="lg:hidden">
          <ScrapingOverview overview={stats} />
        </div>
      )}

      {/* Quick actions for admin/owner */}
      {(isAdmin || isOwner) && (
        <div className="flex flex-wrap gap-3">
          <Button asChild variant="outline" className="gap-2">
            <Link href="/leads?create=1">
              <UserPlus className="w-4 h-4" />
              Nouveau lead
            </Link>
          </Button>
          <Button asChild variant="outline" className="gap-2">
            <Link href="/targets">
              <Zap className="w-4 h-4" />
              Scraper une cible
            </Link>
          </Button>
          <Button asChild variant="outline" className="gap-2">
            <Link href="/chat-ops">
              Opérations chat
            </Link>
          </Button>
        </div>
      )}

      {/* Recent leads table */}
      <RecentLeadsTable />

      {/* Error state */}
      {error && (
        <div className="bg-rose-50 dark:bg-rose-950/20 border border-rose-200 dark:border-rose-800 rounded-lg p-4">
          <p className="text-sm text-rose-700 dark:text-rose-200">
            Erreur lors du chargement du tableau de bord: {error}
          </p>
        </div>
      )}
    </div>
  )
}

export default function DashboardPage() {
  return (
    <Suspense fallback={<DashboardSkeleton />}>
      <DashboardContent />
    </Suspense>
  )
}
