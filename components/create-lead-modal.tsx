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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { X, Loader2 } from 'lucide-react'
import { toast } from 'sonner'
import type { LeadStatus } from '@/lib/types'

interface CreateLeadModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onLeadCreated: () => void
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
  const [isLoading, setIsLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

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
      showApiError(err, 'Erreur lors de la création du lead')
    } finally {
      setIsLoading(false)
    }
  }

  if (!open) return null

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center">
      <Card className="w-full max-w-md">
        <div className="flex justify-between items-center p-6 border-b border-gray-200">
          <h2 className="text-lg font-semibold">Ajouter un lead</h2>
          <Button variant="ghost" size="sm" onClick={() => onOpenChange(false)} disabled={isLoading} className="h-8 w-8 p-0">
            <X className="w-4 h-4" />
          </Button>
        </div>
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <Label htmlFor="phone">Téléphone *</Label>
            <Input
              id="phone"
              placeholder="06 12 34 56 78"
              value={formData.phone_number}
              onChange={(e) => setFormData((prev) => ({ ...prev, phone_number: e.target.value }))}
              disabled={isLoading}
              required
              className="mt-2"
            />
          </div>
          <div>
            <Label htmlFor="company">Entreprise</Label>
            <Input
              id="company"
              value={formData.company_name}
              onChange={(e) => setFormData((prev) => ({ ...prev, company_name: e.target.value }))}
              disabled={isLoading}
              className="mt-2"
            />
          </div>
          <div>
            <Label htmlFor="source">URL source</Label>
            <Input
              id="source"
              placeholder="https://..."
              value={formData.source_url}
              onChange={(e) => setFormData((prev) => ({ ...prev, source_url: e.target.value }))}
              disabled={isLoading}
              className="mt-2"
            />
          </div>
          <div>
            <Label htmlFor="status">Statut</Label>
            <Select
              value={formData.status}
              onValueChange={(value) => setFormData((prev) => ({ ...prev, status: value as LeadStatus }))}
              disabled={isLoading}
            >
              <SelectTrigger className="mt-2">
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
          <div>
            <Label htmlFor="notes">Notes</Label>
            <Textarea
              id="notes"
              value={formData.notes}
              onChange={(e) => setFormData((prev) => ({ ...prev, notes: e.target.value }))}
              disabled={isLoading}
              className="mt-2"
            />
          </div>
          <div className="flex gap-2 justify-end pt-4 border-t border-gray-200 mt-6">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={isLoading}>
              Annuler
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
              Ajouter
            </Button>
          </div>
        </form>
      </Card>
    </div>
  )
}
