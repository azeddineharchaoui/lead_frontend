'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Checkbox } from '@/components/ui/checkbox'
import { Label } from '@/components/ui/label'
import { useApi } from '@/lib/api-context'
import { toast } from 'sonner'
import { Loader2 } from 'lucide-react'

interface PrechatFormProps {
  onSubmit: (leadId: string) => void
}

export function PrechatForm({ onSubmit }: PrechatFormProps) {
  const api = useApi()
  const [isLoading, setIsLoading] = useState(false)
  const [phone, setPhone] = useState('')
  const [company, setCompany] = useState('')
  const [name, setName] = useState('')
  const [gdprConsent, setGdprConsent] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})

  const validateForm = () => {
    const newErrors: Record<string, string> = {}

    // Phone validation - Moroccan format
    if (!phone.trim()) {
      newErrors.phone = 'Le numéro de téléphone est requis'
    } else if (!/^(\+212|0)[1-9]\d{8}$/.test(phone.replace(/\s/g, ''))) {
      newErrors.phone = 'Numéro invalide (ex: +212612345678 ou 0612345678)'
    }

    if (!gdprConsent) {
      newErrors.gdpr = 'Vous devez accepter les conditions'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!validateForm()) return

    setIsLoading(true)

    try {
      const response = await fetch(`${api.baseUrl}/api/v1/leads`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(api.apiKey && { 'X-API-Key': api.apiKey }),
        },
        body: JSON.stringify({
          phone_number: phone.replace(/\s/g, ''),
          company_name: company || undefined,
          name: name || undefined,
          source_url: typeof window !== 'undefined' ? window.location.href : undefined,
          notes: gdprConsent
            ? 'Widget: Lead consent RGPD accordé via prechat form'
            : undefined,
        }),
      })

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`)
      }

      const data = await response.json()
      const leadId = data.id || data.lead_id

      if (!leadId) {
        throw new Error('Pas de lead ID dans la réponse')
      }

      toast.success('Profil créé avec succès')
      onSubmit(leadId)
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Erreur lors de la création'
      toast.error(message)
      console.error('[v0] Prechat form error:', err)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="flex-1 overflow-y-auto p-4 flex flex-col">
      <div className="flex-1 flex flex-col justify-center">
        <h2 className="text-lg font-semibold text-slate-900 dark:text-white mb-2">
          Démarrez la conversation
        </h2>
        <p className="text-sm text-slate-600 dark:text-slate-400 mb-6">
          Pour vous répondre au mieux, nous avons besoin de quelques informations.
        </p>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Phone */}
          <div className="space-y-2">
            <Label htmlFor="phone" className="text-sm font-medium">
              Téléphone <span className="text-red-500">*</span>
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

          {/* Name */}
          <div className="space-y-2">
            <Label htmlFor="name" className="text-sm font-medium">
              Nom
            </Label>
            <Input
              id="name"
              type="text"
              placeholder="Jean Dupont"
              value={name}
              onChange={(e) => setName(e.target.value)}
              disabled={isLoading}
              className="text-sm"
            />
          </div>

          {/* Company */}
          <div className="space-y-2">
            <Label htmlFor="company" className="text-sm font-medium">
              Entreprise
            </Label>
            <Input
              id="company"
              type="text"
              placeholder="Acme Inc."
              value={company}
              onChange={(e) => setCompany(e.target.value)}
              disabled={isLoading}
              className="text-sm"
            />
          </div>

          {/* GDPR Consent */}
          <div className="space-y-3">
            <div className="flex items-start gap-2">
              <Checkbox
                id="gdpr"
                checked={gdprConsent}
                onCheckedChange={(checked) => setGdprConsent(checked as boolean)}
                disabled={isLoading}
              />
              <Label htmlFor="gdpr" className="text-xs text-slate-600 dark:text-slate-400 leading-snug cursor-pointer">
                J&apos;accepte que mes données soient traitées selon notre{' '}
                <a href="#" className="underline text-indigo-600 dark:text-indigo-400 hover:text-indigo-700">
                  politique de confidentialité
                </a>
                <span className="text-red-500 ml-1">*</span>
              </Label>
            </div>
            {errors.gdpr && <p className="text-xs text-red-500">{errors.gdpr}</p>}
          </div>

          {/* Submit */}
          <Button
            type="submit"
            disabled={isLoading}
            className="w-full mt-6 bg-indigo-600 hover:bg-indigo-700 text-white"
          >
            {isLoading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
            {isLoading ? 'Création en cours...' : 'Commencer le chat'}
          </Button>
        </form>
      </div>
    </div>
  )
}
