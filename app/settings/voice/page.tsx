'use client'

import { useState, useEffect } from 'react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { Volume2, Loader2, AlertCircle } from 'lucide-react'
import { fetchTtsAudio } from '@/lib/api/chat'
import { useApiClient } from '@/hooks/useApiClient'
import { toast } from 'sonner'
import { cn } from '@/lib/utils'

export default function VoiceSettingsPage() {
  const api = useApiClient()
  const [defaultLang, setDefaultLang] = useState<'fr' | 'ar'>('fr')
  const [autoRead, setAutoRead] = useState(false)
  const [playbackRate, setPlaybackRate] = useState(1.0)
  const [voiceFirstMode, setVoiceFirstMode] = useState(false)
  const [testText, setTestText] = useState(
    'Bonjour, ceci est un test de synthèse vocale. La qualité du son est excellente.',
  )
  const [isTestPlaying, setIsTestPlaying] = useState(false)
  const [isTestLoading, setIsTestLoading] = useState(false)
  const audioRef = useState<HTMLAudioElement>(
    typeof window !== 'undefined' ? new Audio() : null,
  )[0]

  // Load preferences from localStorage
  useEffect(() => {
    const saved = localStorage.getItem('voice_settings_lang')
    if (saved) setDefaultLang(saved as 'fr' | 'ar')

    const autoReadSaved = localStorage.getItem('lead_chat_auto_read')
    if (autoReadSaved) setAutoRead(autoReadSaved === 'true')

    const rateSaved = localStorage.getItem('voice_settings_playback_rate')
    if (rateSaved) setPlaybackRate(parseFloat(rateSaved))

    const voiceFirstSaved = localStorage.getItem('voice_settings_voice_first')
    if (voiceFirstSaved) setVoiceFirstMode(voiceFirstSaved === 'true')
  }, [])

  // Save preferences
  const savePreference = (key: string, value: string | boolean | number) => {
    localStorage.setItem(key, String(value))
  }

  const handleDefaultLangChange = (value: string) => {
    setDefaultLang(value as 'fr' | 'ar')
    savePreference('voice_settings_lang', value)
  }

  const handleAutoReadToggle = () => {
    const newState = !autoRead
    setAutoRead(newState)
    savePreference('lead_chat_auto_read', newState)
  }

  const handlePlaybackRateChange = (value: string) => {
    const rate = parseFloat(value)
    setPlaybackRate(rate)
    savePreference('voice_settings_playback_rate', rate)
    if (audioRef) audioRef.playbackRate = rate
  }

  const handleVoiceFirstModeToggle = () => {
    const newState = !voiceFirstMode
    setVoiceFirstMode(newState)
    savePreference('voice_settings_voice_first', newState)
  }

  const handleTestAudio = async () => {
    if (isTestPlaying) {
      audioRef?.pause()
      setIsTestPlaying(false)
      return
    }

    setIsTestLoading(true)
    try {
      const blob = await fetchTtsAudio(api, testText, defaultLang)
      const url = URL.createObjectURL(blob)

      if (audioRef) {
        audioRef.src = url
        audioRef.playbackRate = playbackRate
        audioRef.onended = () => {
          setIsTestPlaying(false)
          URL.revokeObjectURL(url)
        }
        await audioRef.play()
        setIsTestPlaying(true)
      }
    } catch (err) {
      const errorMsg =
        (err as Error).message === 'tts_unavailable'
          ? 'Synthèse vocale indisponible'
          : 'Erreur lors de la lecture du test'
      toast.error(errorMsg)
      console.error('[v0] Test audio error:', err)
    } finally {
      setIsTestLoading(false)
    }
  }

  return (
    <div className="space-y-6 max-w-2xl">
      <div>
        <h1 className="text-2xl font-bold">Paramètres voix et audio</h1>
        <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
          Configurez les préférences de synthèse vocale et de lecture automatique
        </p>
      </div>

      {/* Language Setting */}
      <Card className="p-4">
        <Label className="text-sm font-medium mb-2 block">Langue TTS par défaut</Label>
        <Select value={defaultLang} onValueChange={handleDefaultLangChange}>
          <SelectTrigger className="w-full">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="fr">Français (FR)</SelectItem>
            <SelectItem value="ar">Arabe (AR)</SelectItem>
          </SelectContent>
        </Select>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-2">
          Langue utilisée par défaut pour la synthèse vocale des messages
        </p>
      </Card>

      {/* Playback Rate */}
      <Card className="p-4">
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <Label className="text-sm font-medium">Vitesse de lecture</Label>
            <Badge variant="secondary">{playbackRate.toFixed(2)}x</Badge>
          </div>
          <input
            type="range"
            min="0.75"
            max="1.25"
            step="0.05"
            value={playbackRate}
            onChange={(e) => handlePlaybackRateChange(e.target.value)}
            className="w-full"
          />
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Ajustez la vitesse de lecture audio entre 0.75x et 1.25x
          </p>
        </div>
      </Card>

      {/* Auto-Read Toggle */}
      <Card className="p-4">
        <div className="flex items-center justify-between">
          <div>
            <Label className="text-sm font-medium block mb-1">Lecture automatique</Label>
            <p className="text-xs text-slate-600 dark:text-slate-400">
              Lire automatiquement les réponses du chatbot
            </p>
          </div>
          <button
            onClick={handleAutoReadToggle}
            className={cn(
              'relative inline-flex h-6 w-11 items-center rounded-full transition-colors',
              autoRead ? 'bg-indigo-600' : 'bg-slate-300 dark:bg-slate-600',
            )}
          >
            <span
              className={cn(
                'inline-block h-4 w-4 transform rounded-full bg-white transition-transform',
                autoRead ? 'translate-x-6' : 'translate-x-1',
              )}
            />
          </button>
        </div>
      </Card>

      {/* Voice-First Mode Toggle */}
      <Card className="p-4">
        <div className="flex items-center justify-between">
          <div>
            <Label className="text-sm font-medium block mb-1">Mode mains libres</Label>
            <p className="text-xs text-slate-600 dark:text-slate-400">
              Conversation par voix bidirectionnelle (entrée + sortie audio)
            </p>
          </div>
          <button
            onClick={handleVoiceFirstModeToggle}
            className={cn(
              'relative inline-flex h-6 w-11 items-center rounded-full transition-colors',
              voiceFirstMode ? 'bg-indigo-600' : 'bg-slate-300 dark:bg-slate-600',
            )}
          >
            <span
              className={cn(
                'inline-block h-4 w-4 transform rounded-full bg-white transition-transform',
                voiceFirstMode ? 'translate-x-6' : 'translate-x-1',
              )}
            />
          </button>
        </div>
      </Card>

      {/* Test Panel */}
      <Card className="p-4 border-indigo-200 dark:border-indigo-800 bg-indigo-50 dark:bg-indigo-950">
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <Volume2 className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
            <h3 className="font-medium text-sm">Test de synthèse vocale</h3>
          </div>

          <Textarea
            value={testText}
            onChange={(e) => setTestText(e.target.value)}
            placeholder="Texte pour tester la synthèse vocale..."
            className="min-h-24 text-sm"
          />

          <div className="flex gap-2">
            <Button
              onClick={handleTestAudio}
              disabled={isTestLoading || !testText.trim()}
              className={cn(
                'flex-1 gap-2',
                isTestPlaying
                  ? 'bg-red-600 hover:bg-red-700'
                  : 'bg-indigo-600 hover:bg-indigo-700',
              )}
            >
              {isTestLoading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Chargement...
                </>
              ) : isTestPlaying ? (
                <>
                  <Volume2 className="w-4 h-4" />
                  Arrêter
                </>
              ) : (
                <>
                  <Volume2 className="w-4 h-4" />
                  Écouter
                </>
              )}
            </Button>
            <Select value={defaultLang} onValueChange={handleDefaultLangChange}>
              <SelectTrigger className="w-32">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="fr">Français</SelectItem>
                <SelectItem value="ar">Arabe</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <p className="text-xs text-slate-600 dark:text-slate-400">
            Testez la synthèse vocale avec différentes langues et vitesses de lecture
          </p>
        </div>
      </Card>

      {/* Info Panel */}
      <Card className="p-4 border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900">
        <div className="flex gap-3">
          <AlertCircle className="w-5 h-5 text-slate-600 dark:text-slate-400 shrink-0 mt-0.5" />
          <div className="space-y-2 text-sm">
            <p className="font-medium text-slate-900 dark:text-slate-100">À propos de TTS</p>
            <ul className="list-disc list-inside text-slate-600 dark:text-slate-400 space-y-1 text-xs">
              <li>Synthèse vocale gTTS haute qualité pour français et arabe</li>
              <li>Messages longs divisés automatiquement en plusieurs chunks</li>
              <li>Préférences sauvegardées localement dans votre navigateur</li>
              <li>Compatible avec tous les navigateurs modernes</li>
            </ul>
          </div>
        </div>
      </Card>
    </div>
  )
}
