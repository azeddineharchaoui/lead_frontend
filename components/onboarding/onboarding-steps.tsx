'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { CheckCircle2, AlertCircle, Loader2 } from 'lucide-react'
import { toast } from 'sonner'
import type { AuthOrganisation } from '@/lib/types'

interface OnboardingStepsProps {
  organisation: AuthOrganisation
  onComplete: () => Promise<void>
}

const TIMEZONES = [
  { value: 'Africa/Casablanca', label: 'Maroc (UTC+1)' },
  { value: 'Europe/Paris', label: 'Europe/Paris (UTC+1)' },
  { value: 'UTC', label: 'UTC' },
  { value: 'America/New_York', label: 'America/New_York (UTC-5)' },
  { value: 'Asia/Dubai', label: 'Asia/Dubai (UTC+4)' },
]

export function OnboardingSteps({ organisation, onComplete }: OnboardingStepsProps) {
  const router = useRouter()
  const [step, setStep] = useState(1)
  const [loading, setLoading] = useState(false)

  // Step 1: Organisation
  const [orgName, setOrgName] = useState(organisation.name || '')
  const [timezone, setTimezone] = useState('Africa/Casablanca')

  // Step 2: Team
  const [inviteEmail, setInviteEmail] = useState('')
  const [inviteName, setInviteName] = useState('')

  // Step 3: API Connection
  const [apiUrl, setApiUrl] = useState(process.env.NEXT_PUBLIC_API_URL || '')
  const [apiKey, setApiKey] = useState('')
  const [testLoading, setTestLoading] = useState(false)
  const [testPassed, setTestPassed] = useState(false)

  const handleStep1Continue = async () => {
    setLoading(true)
    try {
      const response = await fetch('/api/org', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: orgName,
          settings: { timezone },
        }),
      })

      if (!response.ok) throw new Error('Failed to update organisation')
      setStep(2)
      toast.success('Organisation mise à jour')
    } catch (error) {
      toast.error((error as Error).message || 'Erreur')
    } finally {
      setLoading(false)
    }
  }

  const handleStep2Skip = () => {
    setStep(3)
  }

  const handleStep2Invite = async () => {
    if (!inviteEmail) {
      toast.error('Veuillez entrer un email')
      return
    }
    setLoading(true)
    try {
      const response = await fetch('/api/org/invite', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: inviteEmail, full_name: inviteName }),
      })

      if (!response.ok) throw new Error('Invitation failed')
      toast.success('Invitation envoyée')
      setInviteEmail('')
      setInviteName('')
    } catch (error) {
      toast.error((error as Error).message || 'Erreur')
    } finally {
      setLoading(false)
    }
  }

  const handleStep3Test = async () => {
    setTestLoading(true)
    try {
      const response = await fetch(`${apiUrl}/health`)
      if (!response.ok) throw new Error('Health check failed')
      setTestPassed(true)
      toast.success('Connexion API testée avec succès')
    } catch (error) {
      toast.error('Test de connexion échoué')
    } finally {
      setTestLoading(false)
    }
  }

  const handleStep3Complete = async () => {
    if (!testPassed) {
      toast.error('Veuillez tester la connexion API')
      return
    }
    setLoading(true)
    try {
      await fetch('/api/org', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          settings: { onboarding_complete: true },
        }),
      })
      await onComplete()
      router.push('/')
    } catch (error) {
      toast.error((error as Error).message || 'Erreur')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="max-w-2xl mx-auto space-y-8">
      {/* Progress */}
      <div className="flex justify-between">
        {[1, 2, 3].map((s) => (
          <div
            key={s}
            className={`flex items-center gap-2 ${
              s <= step ? 'text-indigo-600' : 'text-slate-400'
            }`}
          >
            {s < step ? (
              <CheckCircle2 className="w-6 h-6" />
            ) : (
              <div
                className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${
                  s === step ? 'border-indigo-600 bg-indigo-50' : 'border-slate-300'
                }`}
              >
                <span className="text-xs font-semibold">{s}</span>
              </div>
            )}
            <span className="text-sm font-medium">
              {s === 1 ? 'Organisation' : s === 2 ? 'Équipe' : 'API'}
            </span>
          </div>
        ))}
      </div>

      {/* Step 1: Organisation */}
      {step === 1 && (
        <Card>
          <CardHeader>
            <CardTitle>Organisation</CardTitle>
            <CardDescription>Configurez les paramètres de base</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="text-sm font-medium">Nom de l&apos;organisation</label>
              <Input
                value={orgName}
                onChange={(e) => setOrgName(e.target.value)}
                placeholder="Ex: Acme SARL"
                className="mt-2"
              />
            </div>
            <div>
              <label className="text-sm font-medium">Fuseau horaire</label>
              <Select value={timezone} onValueChange={setTimezone as any}>
                <SelectTrigger className="mt-2">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {TIMEZONES.map((tz) => (
                    <SelectItem key={tz.value} value={tz.value}>
                      {tz.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <Button onClick={handleStep1Continue} disabled={loading} className="w-full">
              {loading ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : null}
              Continuer
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Step 2: Team */}
      {step === 2 && (
        <Card>
          <CardHeader>
            <CardTitle>Équipe</CardTitle>
            <CardDescription>Invitez vos collègues (optionnel)</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="text-sm font-medium">Email</label>
              <Input
                type="email"
                value={inviteEmail}
                onChange={(e) => setInviteEmail(e.target.value)}
                placeholder="collègue@acme.ma"
                className="mt-2"
              />
            </div>
            <div>
              <label className="text-sm font-medium">Nom (optionnel)</label>
              <Input
                value={inviteName}
                onChange={(e) => setInviteName(e.target.value)}
                placeholder="Prénom Nom"
                className="mt-2"
              />
            </div>
            <Button
              onClick={handleStep2Invite}
              disabled={loading}
              variant="outline"
              className="w-full"
            >
              {loading ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : null}
              Envoyer invitation
            </Button>
            <Button onClick={handleStep2Skip} disabled={loading} className="w-full">
              Passer cette étape
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Step 3: API Connection */}
      {step === 3 && (
        <Card>
          <CardHeader>
            <CardTitle>Connexion API</CardTitle>
            <CardDescription>Configurez votre clé API</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="text-sm font-medium">URL de l&apos;API</label>
              <Input
                value={apiUrl}
                onChange={(e) => setApiUrl(e.target.value)}
                placeholder="http://localhost:8000"
                className="mt-2"
              />
            </div>
            <div>
              <label className="text-sm font-medium">Clé API</label>
              <Input
                type="password"
                value={apiKey}
                onChange={(e) => setApiKey(e.target.value)}
                placeholder="Votre clé API"
                className="mt-2"
              />
            </div>

            {testPassed && (
              <Alert className="border-green-200 bg-green-50">
                <CheckCircle2 className="h-4 w-4 text-green-600" />
                <AlertDescription className="text-green-800">
                  Connexion API testée avec succès
                </AlertDescription>
              </Alert>
            )}

            <Button
              onClick={handleStep3Test}
              disabled={!apiUrl || testLoading}
              variant="outline"
              className="w-full"
            >
              {testLoading ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : null}
              Tester la connexion
            </Button>

            <Button
              onClick={handleStep3Complete}
              disabled={!testPassed || loading}
              className="w-full"
            >
              {loading ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : null}
              Terminer l&apos;installation
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
