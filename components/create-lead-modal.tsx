'use client'

import { useState } from 'react'
import { useApi } from '@/lib/api-context'
import { createLead } from '@/lib/api'
import { showApiError } from '@/lib/api-errors'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Card } from '@/components/ui/card'
import { Alert, AlertDescription } from '@/components/ui/alert'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { X, Loader2, AlertCircle } from 'lucide-react'
import { toast } from 'sonner'
import type { LeadStatus } from '@/lib/types'

interface CreateLeadModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onLeadCreated: () => void
}

interface FormErrors {
  phone_number?: string
  company_name?: string
  source_url?: string
  notes?: string
  general?: string
}

export function CreateLeadModal({
  open,
  onOpenChange,
  onLeadCreated,
}: CreateLeadModalProps) {
  const api = useApi()
  const [formData, setFormData] = useState({
    phone_number: '',
    company_name: '',
    source_url: '',
    status: 'nouveau' as LeadStatus,
    notes: '',
  })
  const [formErrors, setFormErrors] = useState<FormErrors>({})
  const [isLoading, setIsLoading] = useState(false)

  const validateForm = (): boolean => {
    const errors: FormErrors = {}

    if (!formData.phone_number.trim()) {
      errors.phone_number = 'Le numéro est requis'
    } else if (!/^[\d\s\+\-\(\)\.]{8,20}$/.test(formData.phone_number)) {
      errors.phone_number = 'Format invalide (8-20 caractères, chiffres acceptés)'
    }

    if (formData.source_url.trim() && formData.source_url.length > 2048) {
      errors.source_url = 'URL trop longue (max 2048 caractères)'
    }

    if (formData.company_name.trim() && formData.company_name.length > 255) {
      errors.company_name = 'Nom trop long (max 255 caractères)'
    }

    if (formData.notes.trim() && formData.notes.length > 5000) {
      errors.notes = 'Notes trop longues (max 5000 caractères)'
    }

    setFormErrors(errors)
    return Object.keys(errors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!validateForm()) {
      return
    }

    setIsLoading(true)
    setFormErrors({})

    try {
      await createLead(api, {
        phone_number: formData.phone_number.trim(),
        company_name: formData.company_name.trim() || null,
        source_url: formData.source_url.trim() || null,
        status: formData.status,
        notes: formData.notes.trim() || null,
      })
      toast.success('Lead créé avec succès')
      setFormData({
        phone_number: '',
        company_name: '',
        source_url: '',
        status: 'nouveau',
        notes: '',
      })
      onOpenChange(false)
      onLeadCreated()
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Erreur lors de la création du lead'
      
      // Handle duplicate phone number
      if (errorMsg.includes('duplicate') || errorMsg.includes('existe')) {
        setFormErrors({ phone_number: 'Ce numéro existe déjà dans votre organisation' })
        toast.error('Ce numéro existe déjà')
      } else {
        setFormErrors({ general: errorMsg })
        showApiError(err, 'Erreur lors de la création du lead')
      }
    } finally {
      setIsLoading(false)
    }
  }

  const handleClose = () => {
    if (!isLoading) {
      setFormData({
        phone_number: '',
        company_name: '',
        source_url: '',
        status: 'nouveau',
        notes: '',
      })
      setFormErrors({})
      onOpenChange(false)
    }
  }

  if (!open) return null

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-md max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center p-6 border-b border-slate-200 dark:border-slate-800 sticky top-0 bg-white dark:bg-slate-900">
          <h2 className="text-lg font-semibold text-slate-900 dark:text-white">Créer un lead</h2>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleClose}
            disabled={isLoading}
            className="h-8 w-8 p-0"
          >
            <X className="w-4 h-4" />
          </Button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {formErrors.general && (
            <Alert variant="destructive">
              <AlertCircle className="w-4 h-4" />
              <AlertDescription>{formErrors.general}</AlertDescription>
            </Alert>
          )}

          <div className="space-y-2">
            <Label htmlFor="phone" className="font-medium">
              Téléphone <span className="text-rose-600">*</span>
            </Label>
            <Input
              id="phone"
              placeholder="+212 6 12 34 56 78 ou 06 12 34 56 78"
              value={formData.phone_number}
              onChange={(e) => {
                setFormData((prev) => ({ ...prev, phone_number: e.target.value }))
                if (formErrors.phone_number) setFormErrors((prev) => ({ ...prev, phone_number: undefined }))
              }}
              disabled={isLoading}
              className={formErrors.phone_number ? 'border-rose-500' : ''}
            />
            {formErrors.phone_number && (
              <p className="text-xs text-rose-600">{formErrors.phone_number}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="company">Entreprise</Label>
            <Input
              id="company"
              placeholder="Nom de l'entreprise"
              value={formData.company_name}
              onChange={(e) => {
                setFormData((prev) => ({ ...prev, company_name: e.target.value }))
                if (formErrors.company_name) setFormErrors((prev) => ({ ...prev, company_name: undefined }))
              }}
              disabled={isLoading}
            />
            {formErrors.company_name && (
              <p className="text-xs text-rose-600">{formErrors.company_name}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="source">URL source</Label>
            <Input
              id="source"
              placeholder="https://example.ma"
              value={formData.source_url}
              onChange={(e) => {
                setFormData((prev) => ({ ...prev, source_url: e.target.value }))
                if (formErrors.source_url) setFormErrors((prev) => ({ ...prev, source_url: undefined }))
              }}
              disabled={isLoading}
            />
            {formErrors.source_url && (
              <p className="text-xs text-rose-600">{formErrors.source_url}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="status" className="font-medium">
              Statut initial
            </Label>
            <Select
              value={formData.status}
              onValueChange={(value) =>
                setFormData((prev) => ({ ...prev, status: value as LeadStatus }))
              }
              disabled={isLoading}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="nouveau">Nouveau</SelectItem>
                <SelectItem value="en_cours">En cours</SelectItem>
                <SelectItem value="qualifie">Qualifié</SelectItem>
                <SelectItem value="rejete">Rejeté</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="notes">Notes</Label>
            <Textarea
              id="notes"
              placeholder="Ajoutez des notes supplémentaires..."
              value={formData.notes}
              onChange={(e) => {
                setFormData((prev) => ({ ...prev, notes: e.target.value }))
                if (formErrors.notes) setFormErrors((prev) => ({ ...prev, notes: undefined }))
              }}
              disabled={isLoading}
              className="resize-none"
              rows={3}
            />
            {formErrors.notes && (
              <p className="text-xs text-rose-600">{formErrors.notes}</p>
            )}
            <p className="text-xs text-slate-500 dark:text-slate-400">
              {formData.notes.length}/5000
            </p>
          </div>

          <div className="flex gap-2 justify-end pt-4 border-t border-slate-200 dark:border-slate-800 mt-6">
            <Button
              type="button"
              variant="outline"
              onClick={handleClose}
              disabled={isLoading}
            >
              Annuler
            </Button>
            <Button type="submit" disabled={isLoading || Object.keys(formErrors).length > 0}>
              {isLoading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
              Créer le lead
            </Button>
          </div>
        </form>
      </Card>
    </div>
  )
}
