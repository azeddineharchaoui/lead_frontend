'use client'

import { useState, useEffect } from 'react'
import { useApiClient } from '@/hooks/useApiClient'
import { listMembers } from '@/lib/api/org'
import type { AuthUser } from '@/lib/types'
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
import { UserPlus, Loader2 } from 'lucide-react'
import { toast } from 'sonner'

interface AssignLeadDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  currentAssignedTo?: string | null
  onAssign: (agentId: string, notes?: string) => Promise<void>
  isLoading?: boolean
}

export function AssignLeadDialog({
  open,
  onOpenChange,
  currentAssignedTo,
  onAssign,
  isLoading = false,
}: AssignLeadDialogProps) {
  const api = useApiClient()
  const [members, setMembers] = useState<AuthUser[]>([])
  const [membersLoading, setMembersLoading] = useState(true)
  const [agentId, setAgentId] = useState('')
  const [notes, setNotes] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  // Load members on mount
  useEffect(() => {
    const loadMembers = async () => {
      try {
        setMembersLoading(true)
        const data = await listMembers(api)
        setMembers(data)
      } catch (err) {
        toast.error('Impossible de charger les agents')
        console.error('Members fetch error:', err)
      } finally {
        setMembersLoading(false)
      }
    }

    if (open && members.length === 0) {
      loadMembers()
    }
  }, [open, api, members.length])

  const handleAssign = async () => {
    if (!agentId.trim()) {
      toast.error('Veuillez sélectionner un agent')
      return
    }

    setIsSubmitting(true)
    try {
      await onAssign(agentId, notes || undefined)
      const agent = members.find(m => m.id === agentId)
      toast.success(`Lead assigné à ${agent?.full_name || 'l\'agent'}`)
      setAgentId('')
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
      setAgentId('')
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
            <Label htmlFor="agent-select" className="text-sm font-medium">
              Agent
            </Label>
            <Select value={agentId} onValueChange={setAgentId} disabled={membersLoading || isSubmitting}>
              <SelectTrigger id="agent-select" className="mt-2">
                <SelectValue placeholder="Sélectionner un agent..." />
              </SelectTrigger>
              <SelectContent>
                {members.map((member) => (
                  <SelectItem key={member.id} value={member.id}>
                    {member.full_name} ({member.email}) — {member.role}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
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
            disabled={isSubmitting || !agentId.trim() || membersLoading}
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
