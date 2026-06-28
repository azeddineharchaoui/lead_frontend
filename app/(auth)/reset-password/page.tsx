'use client'

import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'
import { useState, Suspense } from 'react'
import { resetPassword } from '@/lib/api/auth'
import { AlertCircle, CheckCircle2, Loader2 } from 'lucide-react'
import { toast } from 'sonner'

function ResetPasswordForm() {
  const router = useRouter()
  const params = useSearchParams()
  const token = params.get('token') || ''

  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (password !== confirm) {
      setError('Les mots de passe ne correspondent pas')
      return
    }
    if (password.length < 8) {
      setError('Le mot de passe doit contenir au moins 8 caractères')
      return
    }
    setError(null)
    setSubmitting(true)
    try {
      await resetPassword(token, password)
      setSuccess(true)
      toast.success('Mot de passe réinitialisé avec succès')
      setTimeout(() => router.push('/login'), 3000)
    } catch (err: any) {
      const message = err.message || 'Réinitialisation échouée'
      setError(message)
      toast.error(message)
    } finally {
      setSubmitting(false)
    }
  }

  if (success) {
    return (
      <div className="space-y-6 text-center">
        <div className="space-y-4">
          <div className="flex justify-center">
            <CheckCircle2 className="w-16 h-16 text-emerald-600 dark:text-emerald-400" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Mot de passe réinitialisé!</h2>
            <p className="text-slate-500 dark:text-slate-400 text-sm mt-2">
              Vous serez redirigé vers la page de connexion...
            </p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Définir un nouveau mot de passe</h2>
        <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">
          Entrez un nouveau mot de passe sécurisé pour votre compte
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="password" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
            Nouveau mot de passe
          </label>
          <input
            id="password"
            type="password"
            required
            autoComplete="new-password"
            minLength={8}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Min. 8 caractères"
            className="w-full px-4 py-2.5 border border-slate-300 dark:border-slate-600 rounded-lg text-sm bg-white dark:bg-slate-900 text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
          />
        </div>

        <div>
          <label htmlFor="confirm" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
            Confirmer le mot de passe
          </label>
          <input
            id="confirm"
            type="password"
            required
            autoComplete="new-password"
            minLength={8}
            value={confirm}
            onChange={(e) => setConfirm(e.target.value)}
            placeholder="Répétez le mot de passe"
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
          disabled={submitting || password.length < 8}
          className="w-full bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-400 disabled:cursor-not-allowed text-white font-semibold py-2.5 px-4 rounded-lg transition-colors duration-200 flex items-center justify-center gap-2 text-sm"
        >
          {submitting ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              Sauvegarde en cours…
            </>
          ) : (
            'Sauvegarder le nouveau mot de passe'
          )}
        </button>
      </form>

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

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={<div className="text-center text-slate-500">Chargement...</div>}>
      <ResetPasswordForm />
    </Suspense>
  )
}
