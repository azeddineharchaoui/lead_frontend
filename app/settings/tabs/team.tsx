'use client'

import { useState, useEffect } from 'react'
import { useOrg } from '@/hooks/useOrg'
import { useAuth } from '@/hooks/useAuth'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { Loader2, Plus, Trash2 } from 'lucide-react'
import { toast } from 'sonner'
import type { UserRole } from '@/lib/types'

export default function TeamTab() {
  const { user } = useAuth()
  const { members, loading, fetchMembers, addMember, deleteMember, changeMemberRole } = useOrg()

  const [dialogOpen, setDialogOpen] = useState(false)
  const [email, setEmail] = useState('')
  const [fullName, setFullName] = useState('')
  const [role, setRole] = useState<UserRole>('agent')
  const [inviting, setInviting] = useState(false)

  useEffect(() => {
    fetchMembers()
  }, [fetchMembers])

  const handleInvite = async () => {
    if (!email.trim() || !fullName.trim()) {
      toast.error('Veuillez remplir tous les champs')
      return
    }

    setInviting(true)
    try {
      await addMember({ email, full_name: fullName, role })
      setEmail('')
      setFullName('')
      setRole('agent')
      setDialogOpen(false)
    } finally {
      setInviting(false)
    }
  }

  const handleRemove = async (memberId: string) => {
    if (confirm('Êtes-vous sûr de vouloir supprimer ce membre ?')) {
      await deleteMember(memberId)
    }
  }

  const handleRoleChange = async (memberId: string, newRole: UserRole) => {
    await changeMemberRole(memberId, newRole)
  }

  const getRoleBadgeVariant = (role: UserRole) => {
    switch (role) {
      case 'owner':
        return 'default'
      case 'admin':
        return 'secondary'
      case 'agent':
        return 'outline'
      default:
        return 'outline'
    }
  }

  const getRoleLabel = (role: UserRole) => {
    const labels: Record<UserRole, string> = {
      owner: 'Propriétaire',
      admin: 'Administrateur',
      agent: 'Agent',
      visitor: 'Visiteur',
    }
    return labels[role] || role
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-indigo-600" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader className="flex items-center justify-between flex-row">
          <div>
            <CardTitle>Gestion de l&apos;équipe</CardTitle>
            <CardDescription>Gérez les membres de votre organisation</CardDescription>
          </div>
          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger asChild>
              <Button className="flex items-center gap-2">
                <Plus className="w-4 h-4" />
                Ajouter un membre
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
              <DialogHeader>
                <DialogTitle>Inviter un membre</DialogTitle>
                <DialogDescription>Envoyez une invitation à un nouveau membre</DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="invite-email">Email</Label>
                  <Input
                    id="invite-email"
                    type="email"
                    placeholder="membre@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    disabled={inviting}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="invite-name">Nom complet</Label>
                  <Input
                    id="invite-name"
                    placeholder="Jean Dupont"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    disabled={inviting}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="invite-role">Rôle</Label>
                  <Select value={role} onValueChange={(v) => setRole(v as UserRole)}>
                    <SelectTrigger id="invite-role">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="agent">Agent</SelectItem>
                      <SelectItem value="admin">Administrateur</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <Button onClick={handleInvite} disabled={inviting} className="w-full">
                  {inviting ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Envoi...
                    </>
                  ) : (
                    'Envoyer l\'invitation'
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
                  <TableHead>Email</TableHead>
                  <TableHead>Rôle</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {members.map((member) => (
                  <TableRow key={member.id}>
                    <TableCell className="font-medium">{member.full_name}</TableCell>
                    <TableCell>{member.email}</TableCell>
                    <TableCell>
                      {user?.id === member.id ? (
                        <Badge variant={getRoleBadgeVariant(member.role)}>
                          {getRoleLabel(member.role)}
                        </Badge>
                      ) : (
                        <Select
                          value={member.role}
                          onValueChange={(newRole) => handleRoleChange(member.id, newRole as UserRole)}
                        >
                          <SelectTrigger className="w-40">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="agent">Agent</SelectItem>
                            <SelectItem value="admin">Administrateur</SelectItem>
                          </SelectContent>
                        </Select>
                      )}
                    </TableCell>
                    <TableCell className="text-right">
                      {user?.id !== member.id && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleRemove(member.id)}
                          className="text-rose-600 hover:text-rose-700 hover:bg-rose-50 dark:hover:bg-rose-950/30"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
            {members.length === 0 && (
              <div className="text-center py-8">
                <p className="text-slate-500 dark:text-slate-400">Aucun membre pour le moment</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
