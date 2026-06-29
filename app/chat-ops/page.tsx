'use client'

import { Suspense, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/hooks/useAuth'
import { PageHeader } from '@/components/page-header'
import { SessionExplorer } from '@/components/chat-ops/session-explorer'
import { QualificationFunnel } from '@/components/chat-ops/qualification-funnel'
import { IntentDistribution } from '@/components/chat-ops/intent-distribution'
import { AlertCircle } from 'lucide-react'

function ChatOpsContent() {
  return (
    <div className="space-y-6">
      {/* Header */}
      <PageHeader
        title="Opérations chat"
        description="Analytics et exploration des sessions de chat pour la qualification des leads"
      />

      {/* Main sections */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <SessionExplorer />
        <div className="space-y-6">
          <QualificationFunnel />
        </div>
      </div>

      {/* Intent distribution */}
      <IntentDistribution />
    </div>
  )
}

export default function ChatOpsPage() {
  const { user } = useAuth()
  const router = useRouter()

  // Redirect if not admin/owner
  useEffect(() => {
    if (user && user.role !== 'admin' && user.role !== 'owner') {
      router.replace('/')
    }
  }, [user, router])

  if (user && user.role !== 'admin' && user.role !== 'owner') {
    return (
      <div className="rounded-lg bg-red-50 dark:bg-red-950/30 p-4 border border-red-200 dark:border-red-800 flex gap-3">
        <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
        <div>
          <h3 className="font-semibold text-red-800 dark:text-red-200">Accès refusé</h3>
          <p className="text-sm text-red-700 dark:text-red-300">
            Seuls les administrateurs et propriétaires peuvent accéder au centre d&apos;opérations chat
          </p>
        </div>
      </div>
    )
  }

  return (
    <Suspense fallback={<div className="animate-pulse">Chargement...</div>}>
      <ChatOpsContent />
    </Suspense>
  )
}
