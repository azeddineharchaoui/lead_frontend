'use client'

import { useState } from 'react'
import type { LeadStatus } from '@/lib/types'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { CheckCircle2, AlertTriangle, Clock, XCircle } from 'lucide-react'
import { toast } from 'sonner'

const VALID_TRANSITIONS: Record<LeadStatus, LeadStatus[]> = {
  nouveau: ['en_cours', 'rejete'],
  en_cours: ['qualifie', 'rejete', 'nouveau'],
  qualifie: ['en_cours'],
  rejete: ['nouveau'],
}

const STATUS_LABELS: Record<LeadStatus, string> = {
  nouveau: 'Nouveau',
  en_cours: 'En cours',
  qualifie: 'Qualifié',
  rejete: 'Rejeté',
}

const STATUS_ICONS: Record<LeadStatus, React.ComponentType<{ className?: string }>> = {
  nouveau: Clock,
  en_cours: Clock,
  qualifie: CheckCircle2,
  rejete: XCircle,
}

const STATUS_COLORS: Record<LeadStatus, string> = {
  nouveau: 'text-slate-600 dark:text-slate-400',
  en_cours: 'text-blue-600 dark:text-blue-400',
  qualifie: 'text-emerald-600 dark:text-emerald-400',
  rejete: 'text-rose-600 dark:text-rose-400',
}

interface StatusTransitionSelectProps {
  currentStatus: LeadStatus
  onStatusChange: (newStatus: LeadStatus, notes?: string) => Promise<void>
  isLoading?: boolean
}

export function StatusTransitionSelect({
  currentStatus,
  onStatusChange,
  isLoading = false,
}: StatusTransitionSelectProps) {
  const [showDialog, setShowDialog] = useState(false)
  const [pendingStatus, setPendingStatus] = useState<LeadStatus | null>(null)
  const [notes, setNotes] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  const validNextStates = VALID_TRANSITIONS[currentStatus]
  const CurrentIcon = STATUS_ICONS[currentStatus]

  const handleSelect = (status: LeadStatus) => {
    setPendingStatus(status)
    setShowDialog(true)
    setNotes('')
  }

  const handleConfirm = async () => {
    if (!pendingStatus) return
    setIsSubmitting(true)
    try {
      await onStatusChange(pendingStatus, notes || undefined)
      toast.success(`Statut changé en ${STATUS_LABELS[pendingStatus]}`)
      setShowDialog(false)
      setPendingStatus(null)
      setNotes('')
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Erreur'
      if (errorMsg.includes('422') || errorMsg.includes('transition')) {
        toast.error('Transition invalide: cette action n\'est pas autorisée')
      } else {
        toast.error(errorMsg)
      }
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <>
      <div className="space-y-3">
        <div className="flex items-center gap-2 pb-2 border-b border-slate-200 dark:border-slate-700">
          <CurrentIcon className={`w-5 h-5 ${STATUS_COLORS[currentStatus]}`} />
          <span className="text-sm font-medium text-slate-900 dark:text-white">
            {STATUS_LABELS[currentStatus]}
          </span>
        </div>

        <Select
          disabled={isLoading || isSubmitting || validNextStates.length === 0}
          onValueChange={(value) => handleSelect(value as LeadStatus)}
        >
          <SelectTrigger>
            <SelectValue placeholder="Changer le statut..." />
          </SelectTrigger>
          <SelectContent>
            {validNextStates.map((status) => {
              const Icon = STATUS_ICONS[status]
              return (
                <SelectItem key={status} value={status}>
                  <div className="flex items-center gap-2">
                    <Icon className={`w-4 h-4 ${STATUS_COLORS[status]}`} />
                    <span>{STATUS_LABELS[status]}</span>
                  </div>
                </SelectItem>
              )
            })}
          </SelectContent>
        </Select>

        {validNextStates.length === 0 && (
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Aucune transition disponible depuis ce statut
          </p>
        )}
      </div>

      <AlertDialog open={showDialog} onOpenChange={setShowDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-amber-600" />
              Confirmer le changement de statut
            </AlertDialogTitle>
            <AlertDialogDescription>
              Vous êtes sur le point de changer le statut de {STATUS_LABELS[currentStatus]} à{' '}
              <span className="font-semibold text-foreground">
                {pendingStatus ? STATUS_LABELS[pendingStatus] : ''}
              </span>
              .
            </AlertDialogDescription>
          </AlertDialogHeader>

          <div className="space-y-3 py-4">
            <div>
              <Label htmlFor="notes" className="text-sm font-medium">
                Notes (optionnel)
              </Label>
              <Textarea
                id="notes"
                placeholder="Ajouter une note pour expliquer ce changement..."
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                disabled={isSubmitting}
                className="mt-2 resize-none"
                rows={3}
              />
            </div>
          </div>

          <div className="flex gap-2 justify-end">
            <AlertDialogCancel disabled={isSubmitting}>Annuler</AlertDialogCancel>
            <AlertDialogAction
              disabled={isSubmitting}
              onClick={handleConfirm}
              className="bg-blue-600 hover:bg-blue-700"
            >
              Confirmer
            </AlertDialogAction>
          </div>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}
