'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/hooks/useAuth'
import { OnboardingSteps } from '@/components/onboarding/onboarding-steps'
import { Loader2 } from 'lucide-react'

export default function OnboardingPage() {
  const router = useRouter()
  const { user, organisation, isLoading, refreshUser } = useAuth()
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (isLoading) return

    // Not logged in
    if (!user || !organisation) {
      router.push('/login')
      return
    }

    // Already completed onboarding
    if (organisation.settings?.onboarding_complete) {
      router.push('/')
      return
    }
  }, [user, organisation, isLoading, router])

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="w-8 h-8 animate-spin text-indigo-600" />
      </div>
    )
  }

  if (!organisation) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <p className="text-red-600 font-semibold">Erreur de chargement</p>
          <p className="text-sm text-slate-600">Veuillez actualiser la page</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 py-12 px-4">
      <div className="max-w-2xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-3xl font-bold mb-2">Bienvenue à bord</h1>
          <p className="text-slate-600">
            Configurons votre CRM en 3 étapes simples
          </p>
        </div>

        {error && (
          <div className="mb-8 p-4 rounded-lg bg-red-50 border border-red-200">
            <p className="text-red-700 text-sm">{error}</p>
          </div>
        )}

        <OnboardingSteps
          organisation={organisation}
          onComplete={async () => {
            await refreshUser()
          }}
        />

        <div className="mt-12 text-center text-sm text-slate-600">
          <p>Plan: <span className="font-semibold">Starter</span> — Essai 14 jours</p>
        </div>
      </div>
    </div>
  )
}
