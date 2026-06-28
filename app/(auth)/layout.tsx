/**
 * (auth)/layout.tsx
 * Clean layout for authentication pages — no sidebar, centred card.
 */
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Auth — Lead.ma CRM',
}

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Logo / brand */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-white tracking-tight">Lead.ma CRM</h1>
          <p className="text-slate-400 mt-1 text-sm">Moroccan Call-Center Lead Platform</p>
        </div>
        {children}
      </div>
    </div>
  )
}
