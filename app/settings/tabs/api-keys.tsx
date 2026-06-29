'use client'

import { useState, useEffect } from 'react'
import { useOrg } from '@/hooks/useOrg'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Checkbox } from '@/components/ui/checkbox'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { Loader2, Plus, Trash2, Copy, Eye, EyeOff } from 'lucide-react'
import { toast } from 'sonner'

const SCOPES = [
  { id: 'leads.read', label: 'Lire les leads', category: 'Leads' },
  { id: 'leads.write', label: 'Créer/modifier les leads', category: 'Leads' },
  { id: 'leads.delete', label: 'Supprimer les leads', category: 'Leads' },
  { id: 'targets.read', label: 'Lire les cibles', category: 'Targets' },
  { id: 'targets.write', label: 'Créer/modifier les cibles', category: 'Targets' },
  { id: 'org.read', label: 'Lire la config org', category: 'Organisation' },
  { id: 'org.write', label: 'Modifier la config org', category: 'Organisation' },
]

export default function ApiKeysTab() {
  const { apiKeys, loading, fetchApiKeys, generateApiKey, deleteApiKey } = useOrg()

  const [dialogOpen, setDialogOpen] = useState(false)
  const [keyName, setKeyName] = useState('')
  const [selectedScopes, setSelectedScopes] = useState<string[]>(['leads.read'])
  const [creating, setCreating] = useState(false)
  const [showRawKey, setShowRawKey] = useState<string | null>(null)

  useEffect(() => {
    fetchApiKeys()
  }, [fetchApiKeys])

  const handleCreateKey = async () => {
    if (!keyName.trim()) {
      toast.error('Veuillez entrer un nom')
      return
    }

    if (selectedScopes.length === 0) {
      toast.error('Sélectionnez au moins une permission')
      return
    }

    setCreating(true)
    try {
      const result = await generateApiKey({
        name: keyName,
        scopes: selectedScopes,
      })

      if (result?.raw_key) {
        setShowRawKey(result.raw_key)
      }

      setKeyName('')
      setSelectedScopes(['leads.read'])
    } finally {
      setCreating(false)
    }
  }

  const handleRevoke = async (keyId: string) => {
    if (confirm('Êtes-vous sûr de vouloir révoquer cette clé ?')) {
      await deleteApiKey(keyId)
      if (showRawKey) setShowRawKey(null)
    }
  }

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
    toast.success('Copié!')
  }

  const groupedScopes = SCOPES.reduce(
    (acc, scope) => {
      const cat = acc.find((g) => g.category === scope.category)
      if (cat) {
        cat.scopes.push(scope)
      } else {
        acc.push({ category: scope.category, scopes: [scope] })
      }
      return acc
    },
    [] as Array<{ category: string; scopes: typeof SCOPES }>,
  )

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-indigo-600" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {showRawKey && (
        <Card className="border-green-200 dark:border-green-900 bg-green-50 dark:bg-green-950/20">
          <CardHeader>
            <CardTitle className="text-green-900 dark:text-green-100">Clé créée avec succès</CardTitle>
            <CardDescription className="text-green-800 dark:text-green-200">
              Copiez votre clé maintenant. Vous ne pourrez pas la voir à nouveau.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="bg-slate-900 rounded p-3 font-mono text-sm text-white break-all">
              {showRawKey}
            </div>
            <div className="flex gap-2">
              <Button
                variant="outline"
                className="flex-1"
                onClick={() => copyToClipboard(showRawKey)}
              >
                <Copy className="w-4 h-4 mr-2" />
                Copier
              </Button>
              <Button
                variant="outline"
                className="flex-1"
                onClick={() => setShowRawKey(null)}
              >
                Fermer
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader className="flex items-center justify-between flex-row">
          <div>
            <CardTitle>Clés API</CardTitle>
            <CardDescription>Gérez les clés pour l&apos;accès API</CardDescription>
          </div>
          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger asChild>
              <Button className="flex items-center gap-2">
                <Plus className="w-4 h-4" />
                Créer une clé
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[500px]">
              <DialogHeader>
                <DialogTitle>Créer une nouvelle clé API</DialogTitle>
                <DialogDescription>Créez une clé pour accéder à l&apos;API</DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="key-name">Nom</Label>
                  <Input
                    id="key-name"
                    placeholder="Mon application"
                    value={keyName}
                    onChange={(e) => setKeyName(e.target.value)}
                    disabled={creating}
                  />
                </div>

                <div className="space-y-3">
                  <Label>Permissions</Label>
                  {groupedScopes.map((group) => (
                    <div key={group.category}>
                      <h4 className="text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">
                        {group.category}
                      </h4>
                      <div className="space-y-2 pl-2">
                        {group.scopes.map((scope) => (
                          <div key={scope.id} className="flex items-center space-x-2">
                            <Checkbox
                              id={scope.id}
                              checked={selectedScopes.includes(scope.id)}
                              onCheckedChange={(checked) => {
                                if (checked) {
                                  setSelectedScopes([...selectedScopes, scope.id])
                                } else {
                                  setSelectedScopes(selectedScopes.filter((s) => s !== scope.id))
                                }
                              }}
                              disabled={creating}
                            />
                            <label
                              htmlFor={scope.id}
                              className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
                            >
                              {scope.label}
                            </label>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>

                <Button onClick={handleCreateKey} disabled={creating} className="w-full">
                  {creating ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Création...
                    </>
                  ) : (
                    'Créer la clé'
                  )}
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </CardHeader>
        <CardContent>
          <div className="border rounded-lg overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow className="bg-slate-50 dark:bg-slate-900">
                  <TableHead>Nom</TableHead>
                  <TableHead>Permissions</TableHead>
                  <TableHead>Créée</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {apiKeys.map((key) => (
                  <TableRow key={key.id}>
                    <TableCell className="font-medium">{key.name}</TableCell>
                    <TableCell>
                      <div className="flex flex-wrap gap-1">
                        {key.scopes.slice(0, 2).map((scope) => (
                          <Badge key={scope} variant="secondary" className="text-xs">
                            {scope}
                          </Badge>
                        ))}
                        {key.scopes.length > 2 && (
                          <Badge variant="secondary" className="text-xs">
                            +{key.scopes.length - 2}
                          </Badge>
                        )}
                      </div>
                    </TableCell>
                    <TableCell className="text-sm text-slate-500">
                      {new Date(key.created_at).toLocaleDateString('fr-FR')}
                    </TableCell>
                    <TableCell className="text-right">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleRevoke(key.id)}
                        className="text-rose-600 hover:text-rose-700 hover:bg-rose-50 dark:hover:bg-rose-950/30"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
            {apiKeys.length === 0 && (
              <div className="text-center py-8">
                <p className="text-slate-500 dark:text-slate-400">Aucune clé API pour le moment</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
