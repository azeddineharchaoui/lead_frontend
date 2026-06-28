'use client'

import Link from 'next/link'
import { useSearchParams } from 'next/navigation'
import { useEffect, useState } from 'react'
import { verifyEmail } from '@/lib/api/auth'

export default function VerifyEmailPage() {
  const params = useSearchParams()
  const token = params.get('token') || ''
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading')
  const [message, setMessage] = useState('')

  useEffect(() => {
    if (!token) { setStatus('error'); setMessage('No verification token found.'); return }
    verifyEmail(token)
      .then(() => setStatus('success'))
      .catch((err) => { setStatus('error'); setMessage(err.message || 'Verification failed') })
  }, [token])

  return (
    <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-2xl p-8 text-center">
      {status === 'loading' && (
        <p className="text-slate-500 dark:text-slate-400">Verifying your email…</p>
      )}
      {status === 'success' && (
        <>
          <div className="text-5xl mb-4">✅</div>
          <h2 className="text-xl font-semibold text-slate-900 dark:text-white mb-2">Email verified!</h2>
          <p className="text-slate-500 dark:text-slate-400 mb-6 text-sm">Your account is now active.</p>
          <Link href="/login" className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg text-sm font-medium">
            Sign in
          </Link>
        </>
      )}
      {status === 'error' && (
        <>
          <div className="text-5xl mb-4">❌</div>
          <h2 className="text-xl font-semibold text-red-600 dark:text-red-400 mb-2">Verification failed</h2>
          <p className="text-slate-500 dark:text-slate-400 mb-6 text-sm">{message}</p>
          <Link href="/login" className="text-blue-600 dark:text-blue-400 hover:underline text-sm">Back to sign in</Link>
        </>
      )}
    </div>
  )
}
