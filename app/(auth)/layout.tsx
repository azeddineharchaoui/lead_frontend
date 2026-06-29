/**
 * (auth)/layout.tsx
 * Split-screen auth layout: gradient panel (left/hidden mobile) + white card (right)
 */
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Authentification — Lead.ma CRM',
}

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen flex bg-white dark:bg-slate-950">
      {/* Left panel — gradient + messaging (hidden on mobile) */}
      <div className="hidden lg:flex flex-1 bg-gradient-to-br from-indigo-600 via-indigo-700 to-violet-800 items-center justify-center p-12">
        <div className="max-w-md text-center">
          <h1 className="text-4xl font-bold text-white mb-6">Lead.ma CRM</h1>
          <p className="text-indigo-100 text-lg mb-8 leading-relaxed">
            Platform moderne pour gérer vos leads et automatiser le suivi des prospects. Qualifiez vos clients en temps réel.
          </p>
          <div className="bg-white/10 backdrop-blur border border-white/20 rounded-lg p-6 text-left">
            <p className="text-white text-sm italic">
              "Ce CRM nous a permis d'augmenter notre taux de conversion de 40% en trois mois. Vraiment révolutionnaire pour un call-center."
            </p>
            <p className="text-indigo-100 text-xs mt-3 font-medium">
              — Mohamed Sabil, Lead.ma Maroc
            </p>
          </div>
        </div>
      </div>

      {/* Right panel — form card */}
      <div className="flex-1 flex items-center justify-center p-4 lg:p-12">
        <div className="w-full max-w-md">
          <div className="lg:hidden mb-8 text-center">
            <h1 className="text-3xl font-bold text-slate-900 dark:text-white">Lead.ma</h1>
            <p className="text-slate-500 dark:text-slate-400 mt-1 text-sm">CRM moderne pour leads</p>
          </div>
          {children}
        </div>
      </div>
    </div>
  )
}
