'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useState } from 'react'
import { useAuth } from '@/hooks/useAuth'

export default function RegisterPage() {
  const router = useRouter()
  const { register, isLoading } = useAuth()

  const [form, setForm] = useState({
    email: '',
    password: '',
    full_name: '',
    organisation_name: '',
  })
  const [error, setError] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setSubmitting(true)
    try {
      await register(form)
      router.push('/')
    } catch (err: any) {
      setError(err.message || 'Registration failed')
    } finally {
      setSubmitting(false)
    }
  }

  const fields = [
    { name: 'full_name', label: 'Full name', type: 'text', placeholder: 'Mohamed Alami' },
    { name: 'email', label: 'Email address', type: 'email', placeholder: 'you@company.ma' },
    { name: 'password', label: 'Password', type: 'password', placeholder: '8+ characters' },
    { name: 'organisation_name', label: 'Organisation name', type: 'text', placeholder: 'Acme SARL' },
  ]

  return (
    <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-2xl p-8">
      <h2 className="text-2xl font-semibold text-slate-900 dark:text-white mb-2">Create your account</h2>
      <p className="text-sm text-slate-500 dark:text-slate-400 mb-6">
        Start your free trial — no credit card required.
      </p>

      <form onSubmit={handleSubmit} className="space-y-4">
        {fields.map((f) => (
          <div key={f.name}>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
              {f.label}
            </label>
            <input
              type={f.type}
              name={f.name}
              required
              value={form[f.name as keyof typeof form]}
              onChange={handleChange}
              placeholder={f.placeholder}
              minLength={f.name === 'password' ? 8 : 1}
              className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg text-sm bg-white dark:bg-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        ))}

        {error && (
          <div className="bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-800 rounded-lg px-4 py-3 text-sm text-red-700 dark:text-red-300">
            {error}
          </div>
        )}

        <button
          type="submit"
          disabled={submitting || isLoading}
          className="w-full bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white font-medium py-2.5 px-4 rounded-lg transition-colors text-sm"
        >
          {submitting ? 'Creating account…' : 'Create account'}
        </button>
      </form>

      <p className="mt-4 text-center text-sm text-slate-500 dark:text-slate-400">
        Already have an account?{' '}
        <Link href="/login" className="text-blue-600 dark:text-blue-400 hover:underline">
          Sign in
        </Link>
      </p>
    </div>
  )
}
