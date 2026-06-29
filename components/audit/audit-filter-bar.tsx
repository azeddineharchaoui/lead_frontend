'use client'

import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Input } from '@/components/ui/input'

interface AuditFilterBarProps {
  action: string
  onActionChange: (value: string) => void
  entityType: string
  onEntityTypeChange: (value: string) => void
  dateFrom: string
  onDateFromChange: (value: string) => void
  dateTo: string
  onDateToChange: (value: string) => void
  isLoading?: boolean
}

export function AuditFilterBar({
  action,
  onActionChange,
  entityType,
  onEntityTypeChange,
  dateFrom,
  onDateFromChange,
  dateTo,
  onDateToChange,
  isLoading = false,
}: AuditFilterBarProps) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
      <div>
        <Label className="text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wider">
          Action
        </Label>
        <Select value={action} onValueChange={onActionChange} disabled={isLoading}>
          <SelectTrigger className="mt-2">
            <SelectValue placeholder="Tous" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="">Tous</SelectItem>
            <SelectItem value="create">Créé</SelectItem>
            <SelectItem value="update">Mis à jour</SelectItem>
            <SelectItem value="delete">Supprimé</SelectItem>
            <SelectItem value="status_change">Changement de statut</SelectItem>
            <SelectItem value="crm_push">Envoi CRM</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div>
        <Label className="text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wider">
          Type
        </Label>
        <Select value={entityType} onValueChange={onEntityTypeChange} disabled={isLoading}>
          <SelectTrigger className="mt-2">
            <SelectValue placeholder="Tous" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="">Tous</SelectItem>
            <SelectItem value="lead">Lead</SelectItem>
            <SelectItem value="target">Cible</SelectItem>
            <SelectItem value="session">Session</SelectItem>
            <SelectItem value="user">Utilisateur</SelectItem>
            <SelectItem value="api_key">Clé API</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div>
        <Label className="text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wider">
          Du
        </Label>
        <Input
          type="date"
          value={dateFrom}
          onChange={(e) => onDateFromChange(e.target.value)}
          disabled={isLoading}
          className="mt-2"
        />
      </div>

      <div>
        <Label className="text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wider">
          Au
        </Label>
        <Input
          type="date"
          value={dateTo}
          onChange={(e) => onDateToChange(e.target.value)}
          disabled={isLoading}
          className="mt-2"
        />
      </div>

      <div>
        <Label className="text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wider">
          Ressource ID
        </Label>
        <Input
          type="text"
          placeholder="UUID..."
          value={dateFrom}
          disabled={isLoading}
          className="mt-2 text-xs"
        />
      </div>
    </div>
  )
}
