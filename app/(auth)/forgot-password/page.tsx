'use client'

import Link from 'next/link'
import { useState } from 'react'
import { requestPasswordReset } from '@/lib/api/auth'
import { AlertCircle, CheckCircle2, Loader2 } from 'lucide-react'
import { toast } from 'sonner'

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [sent, setSent] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setSubmitting(true)
    try {
      await requestPasswordReset(email)
      setSent(true)
      toast.success('Lien de réinitialisation envoyé')
    } catch (err: any) {
      const message = err.message || 'Une erreur s\'est produite'
      setError(message)
      toast.error(message)
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Réinitialiser le mot de passe</h2>
        <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">
          Entrez votre email et nous vous enverrons un lien de réinitialisation
        </p>
      </div>

      {sent ? (
        <div className="bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800 rounded-lg p-4 space-y-3">
          <div className="flex items-start gap-3">
            <CheckCircle2 className="w-5 h-5 text-emerald-600 dark:text-emerald-400 flex-shrink-0 mt-0.5" />
            <div>
              <h3 className="text-sm font-semibold text-emerald-900 dark:text-emerald-100">Email envoyé!</h3>
              <p className="text-sm text-emerald-800 dark:text-emerald-200 mt-1">
                Consultez votre boîte de réception et suivez le lien pour réinitialiser votre mot de passe
              </p>
            </div>
          </div>
          <Link
            href="/login"
            className="inline-block text-sm font-medium text-emerald-700 dark:text-emerald-300 hover:text-emerald-800 dark:hover:text-emerald-200 transition-colors"
          >
            Retourner à la connexion
          </Link>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
              Adresse email
            </label>
            <input
              id="email"
              type="email"
              required
              autoComplete="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="vous@entreprise.ma"
              className="w-full px-4 py-2.5 border border-slate-300 dark:border-slate-600 rounded-lg text-sm bg-white dark:bg-slate-900 text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
            />
          </div>

          {error && (
            <div className="bg-rose-50 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-800 rounded-lg p-3 flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-rose-600 dark:text-rose-400 flex-shrink-0 mt-0.5" />
              <p className="text-sm text-rose-700 dark:text-rose-200">{error}</p>
            </div>
          )}

          <button
            type="submit"
            disabled={submitting}
            className="w-full bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-400 disabled:cursor-not-allowed text-white font-semibold py-2.5 px-4 rounded-lg transition-colors duration-200 flex items-center justify-center gap-2 text-sm"
          >
            {submitting ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Envoi en cours…
              </>
            ) : (
              'Envoyer le lien'
            )}
          </button>
        </form>
      )}

      <div className="text-center text-sm text-slate-600 dark:text-slate-400">
        <Link
          href="/login"
          className="text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 dark:hover:text-indigo-300 font-semibold transition-colors"
        >
          Retourner à la connexion
        </Link>
      </div>
    </div>
  )
}
