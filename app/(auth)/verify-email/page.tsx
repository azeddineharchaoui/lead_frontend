'use client'

import Link from 'next/link'
import { useSearchParams } from 'next/navigation'
import { useEffect, useState, Suspense } from 'react'
import { verifyEmail } from '@/lib/api/auth'
import { CheckCircle2, XCircle, Loader2 } from 'lucide-react'

function VerifyEmailForm() {
  const params = useSearchParams()
  const token = params.get('token') || ''
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading')
  const [message, setMessage] = useState('')

  useEffect(() => {
    if (!token) {
      setStatus('error')
      setMessage('Aucun token de vérification trouvé')
      return
    }
    verifyEmail(token)
      .then(() => setStatus('success'))
      .catch((err) => {
        setStatus('error')
        setMessage(err.message || 'Vérification échouée')
      })
  }, [token])

  return (
    <div className="space-y-6 text-center">
      {status === 'loading' && (
        <div className="space-y-4">
          <div className="flex justify-center">
            <Loader2 className="w-12 h-12 text-indigo-600 dark:text-indigo-400 animate-spin" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Vérification en cours…</h2>
            <p className="text-slate-500 dark:text-slate-400 text-sm mt-2">Veuillez patienter</p>
          </div>
        </div>
      )}

      {status === 'success' && (
        <div className="space-y-4">
          <div className="flex justify-center">
            <CheckCircle2 className="w-16 h-16 text-emerald-600 dark:text-emerald-400" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Email vérifié!</h2>
            <p className="text-slate-500 dark:text-slate-400 text-sm mt-2">
              Votre compte est maintenant actif et vous pouvez vous connecter
            </p>
          </div>
          <Link
            href="/login"
            className="inline-block bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-2.5 rounded-lg text-sm font-semibold transition-colors"
          >
            Se connecter
          </Link>
        </div>
      )}

      {status === 'error' && (
        <div className="space-y-4">
          <div className="flex justify-center">
            <XCircle className="w-16 h-16 text-rose-600 dark:text-rose-400" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Vérification échouée</h2>
            <p className="text-slate-500 dark:text-slate-400 text-sm mt-2">{message}</p>
          </div>
          <Link
            href="/login"
            className="inline-block text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 dark:hover:text-indigo-300 text-sm font-semibold transition-colors"
          >
            Retourner à la connexion
          </Link>
        </div>
      )}
    </div>
  )
}

export default function VerifyEmailPage() {
  return (
    <Suspense fallback={<div className="text-center text-slate-500">Chargement...</div>}>
      <VerifyEmailForm />
    </Suspense>
  )
}
