'use client'

import { useState } from 'react'
import { useApiClient } from '@/hooks/useApiClient'
import { bulkUpdateStatus } from '@/lib/api/audit'
import type { Lead, LeadStatus, BulkStatusResponse } from '@/lib/types'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { AlertCircle, Loader2 } from 'lucide-react'
import { toast } from 'sonner'

interface BulkStatusDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  selectedLeads: Lead[]
  onSuccess?: (response: BulkStatusResponse) => void
}

export function BulkStatusDialog({
  open,
  onOpenChange,
  selectedLeads,
  onSuccess,
}: BulkStatusDialogProps) {
  const api = useApiClient()
  const [status, setStatus] = useState<LeadStatus>('qualifie')
  const [notes, setNotes] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [errors, setErrors] = useState<Array<{ lead_id: string; error: string }>>([])

  // Count leads by current status
  const statusCount = selectedLeads.reduce(
    (acc, lead) => {
      acc[lead.status] = (acc[lead.status] || 0) + 1
      return acc
    },
    {} as Record<LeadStatus, number>,
  )

  const handleSubmit = async () => {
    if (selectedLeads.length === 0) return

    try {
      setIsSubmitting(true)
      setErrors([])

      const response = await bulkUpdateStatus(api, {
        lead_ids: selectedLeads.map((lead) => lead.id),
        status,
        notes: notes || undefined,
      })

      if (response.errors && response.errors.length > 0) {
        setErrors(response.errors)
        toast.warning(
          `${response.updated} mis à jour, ${response.failed} échec${response.failed > 1 ? 's' : ''}`,
        )
      } else {
        toast.success(`${response.updated} lead${response.updated > 1 ? 's' : ''} mis à jour`)
        onOpenChange(false)
      }

      onSuccess?.(response)
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Erreur lors de la mise à jour')
      console.error('[v0] Bulk status error:', err)
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleOpenChange = (newOpen: boolean) => {
    if (!isSubmitting) {
      setStatus('qualifie')
      setNotes('')
      setErrors([])
      onOpenChange(newOpen)
    }
  }

  return (
    <AlertDialog open={open} onOpenChange={handleOpenChange}>
      <AlertDialogContent className="max-w-md">
        <AlertDialogHeader>
          <AlertDialogTitle>Changer le statut ({selectedLeads.length} leads)</AlertDialogTitle>
          <AlertDialogDescription>
            {selectedLeads.length > 50 && (
              <div className="mt-2 p-3 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded">
                <p className="text-xs font-medium text-amber-800 dark:text-amber-300">
                  ⚠️ Vous allez mettre à jour {selectedLeads.length} leads. Veuillez vérifier votre action.
                </p>
              </div>
            )}
          </AlertDialogDescription>
        </AlertDialogHeader>

        <div className="space-y-4 py-4">
          <div className="bg-slate-50 dark:bg-slate-800/50 rounded-lg p-3 text-xs text-slate-600 dark:text-slate-400 space-y-1">
            <p className="font-medium">Répartition actuelle:</p>
            {Object.entries(statusCount).map(([s, count]) => (
              <p key={s}>
                • {s}: {count}
              </p>
            ))}
          </div>

          <div>
            <Label htmlFor="status" className="text-sm font-medium">
              Nouveau statut
            </Label>
            <Select value={status} onValueChange={(value) => setStatus(value as LeadStatus)} disabled={isSubmitting}>
              <SelectTrigger id="status" className="mt-2">
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
            <Label htmlFor="notes" className="text-sm font-medium">
              Notes (optionnel)
            </Label>
            <Textarea
              id="notes"
              placeholder="Raison de la mise à jour..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              disabled={isSubmitting}
              className="mt-2 resize-none"
              rows={3}
            />
          </div>

          {errors.length > 0 && (
            <Alert variant="destructive" className="text-xs">
              <AlertCircle className="w-4 h-4" />
              <AlertDescription className="space-y-1">
                <p className="font-medium">{errors.length} erreur{errors.length > 1 ? 's' : '}</p>
                <ul className="space-y-0.5">
                  {errors.slice(0, 3).map((err) => (
                    <li key={err.lead_id} className="text-xs">
                      {err.error}
                    </li>
                  ))}
                  {errors.length > 3 && <li className="text-xs">... et {errors.length - 3} autres</li>}
                </ul>
              </AlertDescription>
            </Alert>
          )}
        </div>

        <div className="flex gap-2 justify-end">
          <AlertDialogCancel disabled={isSubmitting}>Annuler</AlertDialogCancel>
          <AlertDialogAction
            disabled={isSubmitting}
            onClick={handleSubmit}
            className="bg-indigo-600 hover:bg-indigo-700"
          >
            {isSubmitting && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
            Mettre à jour
          </AlertDialogAction>
        </div>
      </AlertDialogContent>
    </AlertDialog>
  )
}
