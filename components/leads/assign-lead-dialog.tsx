'use client'

import { useState } from 'react'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { UserPlus, Loader2 } from 'lucide-react'
import { toast } from 'sonner'

interface AssignLeadDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  currentAssignedTo?: string | null
  onAssign: (agent: string, notes?: string) => Promise<void>
  isLoading?: boolean
}

export function AssignLeadDialog({
  open,
  onOpenChange,
  currentAssignedTo,
  onAssign,
  isLoading = false,
}: AssignLeadDialogProps) {
  const [agent, setAgent] = useState('')
  const [notes, setNotes] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleAssign = async () => {
    if (!agent.trim()) {
      toast.error('Veuillez entrer un nom d\'agent')
      return
    }

    setIsSubmitting(true)
    try {
      await onAssign(agent, notes || undefined)
      toast.success(`Lead assigné à ${agent}`)
      setAgent('')
      setNotes('')
      onOpenChange(false)
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Erreur d\'assignation')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleOpenChange = (newOpen: boolean) => {
    if (!isSubmitting) {
      setAgent('')
      setNotes('')
      onOpenChange(newOpen)
    }
  }

  return (
    <AlertDialog open={open} onOpenChange={handleOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle className="flex items-center gap-2">
            <UserPlus className="w-5 h-5" />
            Assigner le lead
          </AlertDialogTitle>
          <AlertDialogDescription>
            {currentAssignedTo ? (
              <span>
                Ce lead est actuellement assigné à <span className="font-semibold">{currentAssignedTo}</span>. 
                Vous allez le réassigner.
              </span>
            ) : (
              'Assignez ce lead à un agent.'
            )}
          </AlertDialogDescription>
        </AlertDialogHeader>

        <div className="space-y-4 py-4">
          <div>
            <Label htmlFor="agent" className="text-sm font-medium">
              Nom de l&apos;agent
            </Label>
            <Input
              id="agent"
              placeholder="Ex: Ahmed Zaidi"
              value={agent}
              onChange={(e) => setAgent(e.target.value)}
              disabled={isSubmitting}
              autoFocus
              className="mt-2"
            />
          </div>

          <div>
            <Label htmlFor="notes" className="text-sm font-medium">
              Notes (optionnel)
            </Label>
            <Textarea
              id="notes"
              placeholder="Raison de l'assignation ou instructions..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              disabled={isSubmitting}
              className="mt-2 resize-none"
              rows={2}
            />
          </div>
        </div>

        <div className="flex gap-2 justify-end">
          <AlertDialogCancel disabled={isSubmitting}>Annuler</AlertDialogCancel>
          <AlertDialogAction
            disabled={isSubmitting || !agent.trim()}
            onClick={handleAssign}
            className="bg-blue-600 hover:bg-blue-700"
          >
            {isSubmitting && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
            Assigner
          </AlertDialogAction>
        </div>
      </AlertDialogContent>
    </AlertDialog>
  )
}
