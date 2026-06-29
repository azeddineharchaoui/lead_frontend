'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useState } from 'react'
import { useAuth } from '@/hooks/useAuth'
import { AlertCircle, CheckCircle2, Loader2, XCircle } from 'lucide-react'
import { toast } from 'sonner'

export default function RegisterPage() {
  const router = useRouter()
  const { register, isLoading } = useAuth()

  const [form, setForm] = useState({
    full_name: '',
    email: '',
    password: '',
    organisation_name: '',
  })
  const [agreedToTerms, setAgreedToTerms] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!agreedToTerms) {
      setError('Vous devez accepter les conditions')
      return
    }
    setError(null)
    setSubmitting(true)
    try {
      await register(form)
      toast.success('Compte créé avec succès!')
      router.push('/')
    } catch (err: any) {
      const message = err.message || 'Erreur lors de la création du compte'
      setError(message)
      toast.error(message)
    } finally {
      setSubmitting(false)
    }
  }

  const passwordStrength = {
    length: form.password.length >= 8,
    lowercase: /[a-z]/.test(form.password),
    uppercase: /[A-Z]/.test(form.password),
    number: /[0-9]/.test(form.password),
  }
  const strength = Object.values(passwordStrength).filter(Boolean).length
  const isStrongPassword = strength === 4

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Créer un compte</h2>
        <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">
          Commencez votre essai gratuit — aucune carte bancaire requise
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Full name */}
        <div>
          <label htmlFor="full_name" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
            Nom complet
          </label>
          <input
            id="full_name"
            type="text"
            name="full_name"
            required
            value={form.full_name}
            onChange={handleChange}
            placeholder="Mohamed Alami"
            className="w-full px-4 py-2.5 border border-slate-300 dark:border-slate-600 rounded-lg text-sm bg-white dark:bg-slate-900 text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
          />
        </div>

        {/* Email */}
        <div>
          <label htmlFor="email" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
            Adresse email
          </label>
          <input
            id="email"
            type="email"
            name="email"
            required
            autoComplete="email"
            value={form.email}
            onChange={handleChange}
            placeholder="vous@entreprise.ma"
            className="w-full px-4 py-2.5 border border-slate-300 dark:border-slate-600 rounded-lg text-sm bg-white dark:bg-slate-900 text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
          />
        </div>

        {/* Password with strength meter */}
        <div>
          <label htmlFor="password" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
            Mot de passe
          </label>
          <input
            id="password"
            type="password"
            name="password"
            required
            autoComplete="new-password"
            value={form.password}
            onChange={handleChange}
            placeholder="Min. 8 caractères"
            className="w-full px-4 py-2.5 border border-slate-300 dark:border-slate-600 rounded-lg text-sm bg-white dark:bg-slate-900 text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
          />
          
          {/* Password strength checklist */}
          {form.password && (
            <div className="mt-3 space-y-2">
              <div className={`flex items-center gap-2 text-xs ${passwordStrength.length ? 'text-emerald-600 dark:text-emerald-400' : 'text-slate-400'}`}>
                {passwordStrength.length ? <CheckCircle2 className="w-4 h-4" /> : <XCircle className="w-4 h-4" />}
                Au moins 8 caractères
              </div>
              <div className={`flex items-center gap-2 text-xs ${passwordStrength.uppercase ? 'text-emerald-600 dark:text-emerald-400' : 'text-slate-400'}`}>
                {passwordStrength.uppercase ? <CheckCircle2 className="w-4 h-4" /> : <XCircle className="w-4 h-4" />}
                Une lettre majuscule
              </div>
              <div className={`flex items-center gap-2 text-xs ${passwordStrength.lowercase ? 'text-emerald-600 dark:text-emerald-400' : 'text-slate-400'}`}>
                {passwordStrength.lowercase ? <CheckCircle2 className="w-4 h-4" /> : <XCircle className="w-4 h-4" />}
                Une lettre minuscule
              </div>
              <div className={`flex items-center gap-2 text-xs ${passwordStrength.number ? 'text-emerald-600 dark:text-emerald-400' : 'text-slate-400'}`}>
                {passwordStrength.number ? <CheckCircle2 className="w-4 h-4" /> : <XCircle className="w-4 h-4" />}
                Un chiffre
              </div>
            </div>
          )}
        </div>

        {/* Organisation name */}
        <div>
          <label htmlFor="organisation_name" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
            Nom de l&apos;organisation
          </label>
          <input
            id="organisation_name"
            type="text"
            name="organisation_name"
            required
            value={form.organisation_name}
            onChange={handleChange}
            placeholder="Acme SARL"
            className="w-full px-4 py-2.5 border border-slate-300 dark:border-slate-600 rounded-lg text-sm bg-white dark:bg-slate-900 text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
          />
        </div>

        {/* Terms checkbox */}
        <label className="flex items-start gap-3 cursor-pointer">
          <input
            type="checkbox"
            checked={agreedToTerms}
            onChange={(e) => setAgreedToTerms(e.target.checked)}
            className="w-4 h-4 rounded border-slate-300 dark:border-slate-600 text-indigo-600 focus:ring-indigo-500 mt-1"
          />
          <span className="text-xs text-slate-600 dark:text-slate-400">
            J&apos;accepte les{' '}
            <a href="/terms" className="text-indigo-600 dark:text-indigo-400 hover:underline">
              conditions d&apos;utilisation
            </a>
            {' '}et la{' '}
            <a href="/privacy" className="text-indigo-600 dark:text-indigo-400 hover:underline">
              politique de confidentialité
            </a>
          </span>
        </label>

        {/* Error message */}
        {error && (
          <div className="bg-rose-50 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-800 rounded-lg p-3 flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-rose-600 dark:text-rose-400 flex-shrink-0 mt-0.5" />
            <p className="text-sm text-rose-700 dark:text-rose-200">{error}</p>
          </div>
        )}

        {/* Submit button */}
        <button
          type="submit"
          disabled={submitting || isLoading || !agreedToTerms || !isStrongPassword}
          className="w-full bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-400 disabled:cursor-not-allowed text-white font-semibold py-2.5 px-4 rounded-lg transition-colors duration-200 flex items-center justify-center gap-2 text-sm"
        >
          {submitting ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              Création en cours…
            </>
          ) : (
            'Créer un compte'
          )}
        </button>
      </form>

      {/* Sign in link */}
      <div className="text-center text-sm text-slate-600 dark:text-slate-400">
        Vous avez déjà un compte?{' '}
        <Link
          href="/login"
          className="text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 dark:hover:text-indigo-300 font-semibold transition-colors"
        >
          Se connecter
        </Link>
      </div>
    </div>
  )
}
