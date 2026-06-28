'use client'

import { useEffect, useState } from 'react'
import { useApi } from '@/lib/api-context'
import { fetchHealth, fetchRoot } from '@/lib/api'
import { isApiHealthy, isDatabaseHealthy } from '@/lib/types'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { toast } from 'sonner'
import { Server, Lock, ExternalLink, Loader2 } from 'lucide-react'
import type { HealthResponse, RootDiscoveryResponse } from '@/lib/types'

export default function SettingsPage() {
  const { baseUrl, apiKey, setBaseUrl, setApiKey } = useApi()
  const [formBaseUrl, setFormBaseUrl] = useState(baseUrl)
  const [formApiKey, setFormApiKey] = useState(apiKey)
  const [health, setHealth] = useState<HealthResponse | null>(null)
  const [root, setRoot] = useState<RootDiscoveryResponse | null>(null)
  const [healthLoading, setHealthLoading] = useState(false)

  const handleSaveGeneral = () => {
    setBaseUrl(formBaseUrl)
    setApiKey(formApiKey)
    toast.success('Paramètres enregistrés')
  }

  const checkHealth = async () => {
    setHealthLoading(true)
    try {
      const ctx = { baseUrl: formBaseUrl, apiKey: formApiKey }
      const [healthData, rootData] = await Promise.all([
        fetchHealth(ctx),
        fetchRoot(ctx).catch(() => null),
      ])
      setHealth(healthData)
      setRoot(rootData)
      toast.success('Connexion backend OK')
    } catch {
      setHealth(null)
      setRoot(null)
      toast.error('Impossible de joindre le backend')
    } finally {
      setHealthLoading(false)
    }
  }

  useEffect(() => {
    checkHealth()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const metricsUrl = `${formBaseUrl.replace(/\/$/, '')}/metrics`

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">Paramètres</h1>
        <p className="text-gray-600 mt-2">Configuration API et connexion backend</p>
      </div>

      <Tabs defaultValue="general" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="general">Général</TabsTrigger>
          <TabsTrigger value="system">Système</TabsTrigger>
        </TabsList>

        <TabsContent value="general" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Configuration de l&apos;API</CardTitle>
              <CardDescription>
                URL de base et clé API (requise pour /api/v1/targets*)
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="baseUrl">URL de base de l&apos;API</Label>
                <Input
                  id="baseUrl"
                  placeholder="http://localhost:8000"
                  value={formBaseUrl}
                  onChange={(e) => setFormBaseUrl(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="apiKey">Clé API Administrateur</Label>
                <Input
                  id="apiKey"
                  type="password"
                  placeholder="X-API-Key pour les cibles de scraping"
                  value={formApiKey}
                  onChange={(e) => setFormApiKey(e.target.value)}
                />
                <p className="text-xs text-gray-500">
                  {formApiKey ? 'Clé configurée — accès targets activé' : 'Sans clé: leads et chat uniquement'}
                </p>
              </div>
              <Button onClick={handleSaveGeneral} className="w-full">
                Sauvegarder
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="system" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Server className="w-5 h-5" />
                  État du système
                </CardTitle>
                <CardDescription>GET /health en direct</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <Button onClick={checkHealth} disabled={healthLoading} variant="outline" className="w-full gap-2">
                  {healthLoading && <Loader2 className="w-4 h-4 animate-spin" />}
                  Vérifier la connexion
                </Button>
                {health ? (
                  <>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">API</span>
                      <Badge className={isApiHealthy(health) ? 'bg-green-600' : 'bg-yellow-600'}>
                        {health.status} v{health.version}
                      </Badge>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">Base de données</span>
                      <Badge variant="outline" className={isDatabaseHealthy(health) ? 'bg-green-50 text-green-700' : ''}>
                        {health.components.database}
                      </Badge>
                    </div>
                    <p className="text-xs text-gray-500">Environnement: {health.environment}</p>
                  </>
                ) : (
                  <Alert>
                    <AlertDescription>Cliquez sur vérifier pour tester GET /health</AlertDescription>
                  </Alert>
                )}
                {root && (
                  <div className="text-xs text-gray-600 border-t pt-3">
                    <p className="font-medium mb-1">GET / — {root.name} v{root.version}</p>
                    {root.docs && (
                      <a href={root.docs} className="text-blue-600 hover:underline">
                        Documentation API
                      </a>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Lock className="w-5 h-5" />
                  Métriques Prometheus
                </CardTitle>
                <CardDescription>Endpoint ops-only (non intégré au CRM)</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-gray-600 mb-4">
                  Consultez les métriques directement sur le backend:
                </p>
                <a
                  href={metricsUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 text-blue-600 hover:underline text-sm"
                >
                  {metricsUrl}
                  <ExternalLink className="w-4 h-4" />
                </a>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}
