'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Loader2 } from 'lucide-react'

export interface PrechatStartPayload {
  phone_number?: string
  company_name?: string
}

interface PrechatFormProps {
  onStart: (payload: PrechatStartPayload) => Promise<void>
  onSkip: () => Promise<void>
  isLoading?: boolean
}

function normalizePhone(value: string): string {
  return value.replace(/\s/g, '')
}

function isValidMoroccanPhone(phone: string): boolean {
  return /^(\+212|0)[1-9]\d{8}$/.test(normalizePhone(phone))
}

export function PrechatForm({ onStart, onSkip, isLoading = false }: PrechatFormProps) {
  const [phone, setPhone] = useState('')
  const [company, setCompany] = useState('')
  const [errors, setErrors] = useState<Record<string, string>>({})

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    const trimmedPhone = phone.trim()

    if (trimmedPhone && !isValidMoroccanPhone(trimmedPhone)) {
      setErrors({ phone: 'Numéro invalide (ex: +212612345678 ou 0612345678)' })
      return
    }

    setErrors({})
    await onStart({
      phone_number: trimmedPhone ? normalizePhone(trimmedPhone) : undefined,
      company_name: company.trim() || undefined,
    })
  }

  const handleSkip = async () => {
    setErrors({})
    await onSkip()
  }

  return (
    <div className="flex-1 overflow-y-auto p-4 flex flex-col">
      <div className="flex-1 flex flex-col justify-center">
        <h2 className="text-lg font-semibold text-slate-900 dark:text-white mb-2">
          Démarrez la conversation
        </h2>
        <p className="text-sm text-slate-600 dark:text-slate-400 mb-6">
          Partagez vos coordonnées pour un rappel, ou commencez directement le chat.
        </p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="phone" className="text-sm font-medium">
              Téléphone <span className="text-slate-400 font-normal">(optionnel)</span>
            </Label>
            <Input
              id="phone"
              type="tel"
              placeholder="+212 612 345 678"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              disabled={isLoading}
              className="text-sm"
            />
            {errors.phone && <p className="text-xs text-red-500">{errors.phone}</p>}
          </div>

          <div className="space-y-2">
            <Label htmlFor="company" className="text-sm font-medium">
              Entreprise <span className="text-slate-400 font-normal">(optionnel)</span>
            </Label>
            <Input
              id="company"
              type="text"
              placeholder="ABC SARL"
              value={company}
              onChange={(e) => setCompany(e.target.value)}
              disabled={isLoading}
              className="text-sm"
            />
          </div>

          <div className="flex flex-col gap-2 pt-2">
            <Button
              type="submit"
              disabled={isLoading}
              className="w-full bg-indigo-600 hover:bg-indigo-700 text-white"
            >
              {isLoading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
              {isLoading ? 'Démarrage...' : 'Commencer'}
            </Button>
            <Button
              type="button"
              variant="ghost"
              disabled={isLoading}
              onClick={handleSkip}
              className="w-full text-slate-600 dark:text-slate-400"
            >
              Passer
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}
