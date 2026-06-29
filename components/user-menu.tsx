'use client'

import Link from 'next/link'
import { useAuth } from '@/hooks/useAuth'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet'
import { LogOut, Settings, User } from 'lucide-react'

function getRoleLabel(role?: string): string {
  switch (role) {
    case 'owner':
      return 'Propriétaire'
    case 'admin':
      return 'Admin'
    case 'agent':
      return 'Agent'
    default:
      return role || 'User'
  }
}

export function UserMenu() {
  const { user, organisation, signOut } = useAuth()

  if (!user) return null

  const initials = user.full_name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()

  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button variant="ghost" size="icon" className="rounded-full">
          <div className="w-8 h-8 rounded-full bg-indigo-600 flex items-center justify-center text-white text-sm font-bold">
            {initials}
          </div>
        </Button>
      </SheetTrigger>
      <SheetContent side="right" className="w-80">
        <SheetHeader>
          <SheetTitle>Mon compte</SheetTitle>
        </SheetHeader>

        <div className="space-y-6 mt-6">
          {/* User Info */}
          <div className="space-y-3">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-full bg-indigo-600 flex items-center justify-center text-white font-bold text-lg">
                {initials}
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-foreground truncate">{user.full_name}</p>
                <p className="text-sm text-muted-foreground truncate">{user.email}</p>
              </div>
            </div>

            {/* Role Badge */}
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Rôle</span>
              <Badge variant="secondary" className="capitalize">
                {getRoleLabel(user.role)}
              </Badge>
            </div>

            {/* Organisation */}
            {organisation && (
              <div className="flex items-center justify-between pt-2 border-t border-border">
                <span className="text-sm text-muted-foreground">Organisation</span>
                <span className="text-sm font-medium text-foreground">{organisation.name}</span>
              </div>
            )}
          </div>

          {/* Menu Items */}
          <div className="space-y-2 pt-4 border-t border-border">
            <Link href="/settings?tab=profile" className="block">
              <Button variant="ghost" className="w-full justify-start text-foreground">
                <User className="w-4 h-4 mr-2" />
                Profil
              </Button>
            </Link>

            <Link href="/settings" className="block">
              <Button variant="ghost" className="w-full justify-start text-foreground">
                <Settings className="w-4 h-4 mr-2" />
                Paramètres
              </Button>
            </Link>
          </div>

          {/* Logout */}
          <Button
            onClick={signOut}
            variant="outline"
            className="w-full justify-start text-destructive hover:text-destructive"
          >
            <LogOut className="w-4 h-4 mr-2" />
            Déconnexion
          </Button>
        </div>
      </SheetContent>
    </Sheet>
  )
}
