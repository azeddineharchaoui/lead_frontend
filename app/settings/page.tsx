'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '@/hooks/useAuth'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { AlertCircle, User, Building2, Users, KeyRound, Shield, Plug } from 'lucide-react'
import { toast } from 'sonner'
import ProfileTab from './tabs/profile'
import OrganisationTab from './tabs/organisation'
import ApiConnectionTab from './tabs/api-connection'
import { RoleGuard } from '@/components/auth/RoleGuard'

export default function SettingsPage() {
  const { user } = useAuth()
  const [activeTab, setActiveTab] = useState('profile')

  useEffect(() => {
    const stored = sessionStorage.getItem('settings_default_tab')
    if (stored) {
      sessionStorage.removeItem('settings_default_tab')
      setActiveTab(stored)
    }
  }, [])

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-slate-900 dark:text-white">Paramètres</h1>
        <p className="text-slate-500 dark:text-slate-400 mt-1">
          Gérez votre profil, votre organisation et vos préférences
        </p>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid grid-cols-3 lg:grid-cols-6 w-full border-b border-slate-200 dark:border-slate-800 rounded-none bg-transparent p-0">
          <TabsTrigger
            value="profile"
            className="flex items-center gap-2 rounded-none border-b-2 border-transparent data-[state=active]:border-indigo-600 dark:data-[state=active]:border-indigo-400 px-4 py-3"
          >
            <User className="w-4 h-4 hidden sm:block" />
            <span className="text-sm font-medium">Profil</span>
          </TabsTrigger>

          <TabsTrigger
            value="organisation"
            className="flex items-center gap-2 rounded-none border-b-2 border-transparent data-[state=active]:border-indigo-600 dark:data-[state=active]:border-indigo-400 px-4 py-3"
          >
            <Building2 className="w-4 h-4 hidden sm:block" />
            <span className="text-sm font-medium">Org</span>
          </TabsTrigger>

          <RoleGuard roles={['owner', 'admin']} fallback={null}>
            <TabsTrigger
              value="team"
              className="flex items-center gap-2 rounded-none border-b-2 border-transparent data-[state=active]:border-indigo-600 dark:data-[state=active]:border-indigo-400 px-4 py-3"
            >
              <Users className="w-4 h-4 hidden sm:block" />
              <span className="text-sm font-medium">Équipe</span>
            </TabsTrigger>
          </RoleGuard>

          <RoleGuard roles={['owner', 'admin']} fallback={null}>
            <TabsTrigger
              value="api-keys"
              className="flex items-center gap-2 rounded-none border-b-2 border-transparent data-[state=active]:border-indigo-600 dark:data-[state=active]:border-indigo-400 px-4 py-3"
            >
              <KeyRound className="w-4 h-4 hidden sm:block" />
              <span className="text-sm font-medium">Clés API</span>
            </TabsTrigger>
          </RoleGuard>

          <TabsTrigger
            value="api"
            className="flex items-center gap-2 rounded-none border-b-2 border-transparent data-[state=active]:border-indigo-600 dark:data-[state=active]:border-indigo-400 px-4 py-3"
          >
            <Plug className="w-4 h-4 hidden sm:block" />
            <span className="text-sm font-medium">API</span>
          </TabsTrigger>

          <TabsTrigger
            value="security"
            className="flex items-center gap-2 rounded-none border-b-2 border-transparent data-[state=active]:border-indigo-600 dark:data-[state=active]:border-indigo-400 px-4 py-3"
          >
            <Shield className="w-4 h-4 hidden sm:block" />
            <span className="text-sm font-medium">Sécurité</span>
          </TabsTrigger>
        </TabsList>

        {/* Profile tab */}
        <TabsContent value="profile" className="mt-6 space-y-6">
          <ProfileTab />
        </TabsContent>

        {/* Organisation tab */}
        <TabsContent value="organisation" className="mt-6 space-y-6">
          <OrganisationTab />
        </TabsContent>

        {/* Team tab */}
        <RoleGuard roles={['owner', 'admin']}>
          <TabsContent value="team" className="mt-6 space-y-6">
            <div className="bg-slate-100 dark:bg-slate-800 rounded-lg p-8 text-center">
              <Users className="w-12 h-12 text-slate-400 dark:text-slate-600 mx-auto mb-3" />
              <h3 className="text-lg font-semibold text-slate-600 dark:text-slate-300">Team management coming soon</h3>
            </div>
          </TabsContent>
        </RoleGuard>

        {/* API Keys tab */}
        <RoleGuard roles={['owner', 'admin']}>
          <TabsContent value="api-keys" className="mt-6 space-y-6">
            <div className="bg-slate-100 dark:bg-slate-800 rounded-lg p-8 text-center">
              <KeyRound className="w-12 h-12 text-slate-400 dark:text-slate-600 mx-auto mb-3" />
              <h3 className="text-lg font-semibold text-slate-600 dark:text-slate-300">API keys management coming soon</h3>
            </div>
          </TabsContent>
        </RoleGuard>

        <TabsContent value="api" className="mt-6 space-y-6">
          <ApiConnectionTab />
        </TabsContent>

        {/* Security tab */}
        <TabsContent value="security" className="mt-6 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="w-5 h-5" />
                Sécurité du compte
              </CardTitle>
              <CardDescription>Gérez votre connexion et vos mots de passe</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="bg-indigo-50 dark:bg-indigo-950/30 border border-indigo-200 dark:border-indigo-800 rounded-lg p-4 flex items-start gap-3">
                <AlertCircle className="w-5 h-5 text-indigo-600 dark:text-indigo-400 flex-shrink-0 mt-0.5" />
                <div className="text-sm text-indigo-700 dark:text-indigo-200">
                  <p className="font-semibold">Authentification à deux facteurs</p>
                  <p className="mt-1">La 2FA sera bientôt disponible pour plus de sécurité</p>
                </div>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Dernière connexion le {user?.last_login_at ? new Date(user.last_login_at).toLocaleDateString('fr-FR') : 'Jamais'}
              </p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
