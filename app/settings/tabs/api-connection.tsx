'use client'

import { useState } from 'react'
import { useApi } from '@/lib/api-context'
import { fetchHealth } from '@/lib/api/health'
import { listLeads } from '@/lib/api/leads'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Loader2, Plug, CheckCircle2, AlertCircle } from 'lucide-react'
import { toast } from 'sonner'

export default function ApiConnectionTab() {
  const { baseUrl, apiKey, setBaseUrl, setApiKey } = useApi()
  const [urlInput, setUrlInput] = useState(baseUrl)
  const [keyInput, setKeyInput] = useState(apiKey)
  const [testing, setTesting] = useState(false)
  const [testResult, setTestResult] = useState<'success' | 'error' | null>(null)

  const handleSave = () => {
    setBaseUrl(urlInput.trim())
    setApiKey(keyInput.trim())
    toast.success('Configuration API enregistrée')
    setTestResult(null)
  }

  const handleTest = async () => {
    const testUrl = urlInput.trim()
    const testKey = keyInput.trim()
    if (!testUrl || !testKey) {
      toast.error('URL et clé API requises')
      return
    }

    setTesting(true)
    setTestResult(null)
    try {
      const client = { baseUrl: testUrl, apiKey: testKey }
      const health = await fetchHealth(client)
      if (health.status !== 'healthy' && health.status !== 'degraded') {
        throw new Error('Health check failed')
      }
      await listLeads(client, { page: 1, page_size: 1 })
      setTestResult('success')
      toast.success('Connexion API réussie')
    } catch (err) {
      setTestResult('error')
      toast.error(err instanceof Error ? err.message : 'Échec de la connexion')
    } finally {
      setTesting(false)
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Plug className="w-5 h-5" />
          Connexion API backend
        </CardTitle>
        <CardDescription>
          Configurez l&apos;URL du backend et la clé API (`CALL_CENTER_API_KEY` dans le fichier
          `.env` du serveur).
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="api-url">URL du backend</Label>
          <Input
            id="api-url"
            value={urlInput}
            onChange={(e) => setUrlInput(e.target.value)}
            placeholder="http://localhost:8000"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="api-key">Clé API (X-API-Key)</Label>
          <Input
            id="api-key"
            type="password"
            value={keyInput}
            onChange={(e) => setKeyInput(e.target.value)}
            placeholder="dev-local-api-key"
          />
          <p className="text-xs text-slate-500">
            En dev local : identique à <code className="text-xs">CALL_CENTER_API_KEY</code> dans
            `.env` (pas <code className="text-xs">SECRET_KEY</code>).
          </p>
        </div>

        <div className="flex gap-2">
          <Button onClick={handleSave} variant="default">
            Enregistrer
          </Button>
          <Button onClick={handleTest} variant="outline" disabled={testing}>
            {testing ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
            Tester la connexion
          </Button>
        </div>

        {testResult === 'success' && (
          <Alert className="border-green-200 bg-green-50 dark:bg-green-950/20">
            <CheckCircle2 className="h-4 w-4 text-green-600" />
            <AlertDescription>Backend accessible et authentification OK.</AlertDescription>
          </Alert>
        )}
        {testResult === 'error' && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              Impossible de joindre le backend. Vérifiez qu&apos;uvicorn tourne sur le port 8000.
            </AlertDescription>
          </Alert>
        )}
      </CardContent>
    </Card>
  )
}
