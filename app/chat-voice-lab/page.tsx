'use client'

import { useState, useRef } from 'react'
import { useVoiceRecorder } from '@/hooks/useVoiceRecorder'
import { sendAudioMessage, fetchTtsAudio } from '@/lib/api/chat'
import { useApiClient } from '@/hooks/useApiClient'
import { VoiceWaveform } from '@/components/chat/voice-waveform'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Mic, Upload, Play, Download, Loader2 } from 'lucide-react'
import { toast } from 'sonner'
import type { AudioChatResponse } from '@/lib/types'

export default function VoiceLabPage() {
  const api = useApiClient()
  const { state, start, stop, audioBlob, error: recordError, analyser, duration } = useVoiceRecorder()
  const fileInputRef = useRef<HTMLInputElement>(null)

  // STT Panel
  const [sttLang, setSTTLang] = useState('fr')
  const [sttTranscript, setSTTTranscript] = useState('')
  const [sttLoading, setSTTLoading] = useState(false)

  // TTS Panel
  const [ttsText, setTTSText] = useState('')
  const [ttsLang, setTTSLang] = useState('fr')
  const [ttsLoading, setTTSLoading] = useState(false)
  const [ttsUrl, setTTSUrl] = useState<string | null>(null)

  // Pipeline test
  const [pipelineLeadId, setPipelineLeadId] = useState('')
  const [pipelineRunning, setPipelineRunning] = useState(false)
  const [pipelineResult, setPipelineResult] = useState<AudioChatResponse | null>(null)

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  // STT: Upload and transcribe
  const handleUploadAudio = async (file: File) => {
    setSTTLoading(true)
    try {
      const formData = new FormData()
      formData.append('audio', file, file.name)
      formData.append('channel', 'web_chat')

      const response = await sendAudioMessage(api, formData)
      setSTTTranscript(response.transcript)
      toast.success('Transcription réussie')
    } catch (err) {
      toast.error(`Erreur: ${err instanceof Error ? err.message : 'Impossible de transcrire'}`)
    } finally {
      setSTTLoading(false)
    }
  }

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.currentTarget.files?.[0]
    if (file) {
      handleUploadAudio(file)
    }
  }

  // TTS: Synthesize and play
  const handleTTS = async () => {
    if (!ttsText.trim()) {
      toast.error('Veuillez entrer du texte')
      return
    }

    setTTSLoading(true)
    try {
      const blob = await fetchTtsAudio(api, ttsText, ttsLang as 'fr' | 'ar')
      const url = URL.createObjectURL(blob)
      setTTSUrl(url)

      // Auto-play
      const audio = new Audio(url)
      await audio.play()
      toast.success('Synthèse vocale jouée')
    } catch (err) {
      toast.error(`Erreur TTS: ${err instanceof Error ? err.message : 'Impossible de générer'}`)
    } finally {
      setTTSLoading(false)
    }
  }

  // Full pipeline: Record -> STT -> TTS
  const handlePipelineTest = async () => {
    if (!pipelineLeadId.trim()) {
      toast.error('Veuillez entrer un ID lead')
      return
    }

    if (!audioBlob) {
      toast.error('Veuillez enregistrer un audio d\'abord')
      return
    }

    setPipelineRunning(true)
    try {
      const formData = new FormData()
      formData.append('audio', audioBlob, 'recording.webm')
      formData.append('lead_id', pipelineLeadId)
      formData.append('channel', 'web_chat')

      const response = await sendAudioMessage(api, formData)
      setPipelineResult(response)

      // Auto-play TTS response
      if (response.response_text) {
        const blob = await fetchTtsAudio(api, response.response_text, sttLang as 'fr' | 'ar')
        const url = URL.createObjectURL(blob)
        const audio = new Audio(url)
        await audio.play()
      }

      toast.success('Pipeline exécuté avec succès')
    } catch (err) {
      toast.error(`Erreur: ${err instanceof Error ? err.message : 'Pipeline échoué'}`)
    } finally {
      setPipelineRunning(false)
    }
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900 p-6">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold text-slate-900 dark:text-white">Lab Vocal</h1>
          <p className="text-slate-600 dark:text-slate-400 mt-1">
            Test STT, TTS, et le pipeline complet
          </p>
        </div>

        <div className="grid lg:grid-cols-2 gap-6">
          {/* Left: STT Test */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Mic className="w-5 h-5" />
                Transcription (STT)
              </CardTitle>
              <CardDescription>Enregistrez ou téléchargez un fichier audio</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Language select */}
              <div>
                <label className="text-sm font-medium mb-2 block">Langue</label>
                <Select value={sttLang} onValueChange={setSTTLang}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="fr">Français</SelectItem>
                    <SelectItem value="ar">Arabe</SelectItem>
                    <SelectItem value="en">Anglais</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Record button */}
              <div>
                <Button
                  onClick={state === 'idle' ? start : stop}
                  disabled={sttLoading}
                  variant={state === 'recording' ? 'destructive' : 'default'}
                  className="w-full gap-2"
                >
                  <Mic className="w-4 h-4" />
                  {state === 'recording' ? 'Arrêter' : 'Enregistrer'}
                  {duration > 0 && ` (${formatDuration(duration)})`}
                </Button>
              </div>

              {/* Waveform */}
              {(state === 'recording' || audioBlob) && (
                <VoiceWaveform
                  analyser={analyser}
                  isRecording={state === 'recording'}
                />
              )}

              {/* Error */}
              {recordError && (
                <div className="p-3 bg-red-50 dark:bg-red-950 border border-red-200 dark:border-red-800 rounded text-sm text-red-700 dark:text-red-200">
                  {recordError}
                </div>
              )}

              {/* Upload */}
              <div>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="audio/*"
                  onChange={handleFileSelect}
                  className="hidden"
                />
                <Button
                  onClick={() => fileInputRef.current?.click()}
                  variant="outline"
                  className="w-full gap-2"
                  disabled={sttLoading}
                >
                  <Upload className="w-4 h-4" />
                  Télécharger fichier
                </Button>
              </div>

              {/* Transcript display */}
              {sttTranscript && (
                <div className="p-3 bg-blue-50 dark:bg-blue-950 border border-blue-200 dark:border-blue-800 rounded">
                  <p className="text-xs font-medium text-blue-900 dark:text-blue-300 mb-1">
                    Transcription:
                  </p>
                  <p className="text-sm text-blue-800 dark:text-blue-200">
                    "{sttTranscript}"
                  </p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Right: TTS Test */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Play className="w-5 h-5" />
                Synthèse vocale (TTS)
              </CardTitle>
              <CardDescription>Générez et jouez l&apos;audio</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Language select */}
              <div>
                <label className="text-sm font-medium mb-2 block">Langue</label>
                <Select value={ttsLang} onValueChange={setTTSLang}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="fr">Français</SelectItem>
                    <SelectItem value="ar">Arabe</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Text input */}
              <div>
                <label className="text-sm font-medium mb-2 block">Texte</label>
                <Textarea
                  value={ttsText}
                  onChange={(e) => setTTSText(e.target.value)}
                  placeholder="Entrez le texte à synthétiser..."
                  disabled={ttsLoading}
                  rows={6}
                />
              </div>

              {/* Controls */}
              <div className="flex gap-2">
                <Button
                  onClick={handleTTS}
                  disabled={ttsLoading || !ttsText.trim()}
                  className="flex-1 gap-2"
                >
                  {ttsLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Play className="w-4 h-4" />}
                  Jouer
                </Button>
                {ttsUrl && (
                  <Button
                    variant="outline"
                    asChild
                    className="gap-2"
                  >
                    <a href={ttsUrl} download="audio.mp3">
                      <Download className="w-4 h-4" />
                      Télécharger
                    </a>
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Bottom: Full Pipeline Test */}
        <Card>
          <CardHeader>
            <CardTitle>Test du pipeline complet</CardTitle>
            <CardDescription>
              Enregistrement → Transcription → Réponse chatbot → Synthèse vocale
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid lg:grid-cols-2 gap-4">
              {/* Lead ID input */}
              <div>
                <label className="text-sm font-medium mb-2 block">ID Lead (UUID)</label>
                <input
                  type="text"
                  value={pipelineLeadId}
                  onChange={(e) => setPipelineLeadId(e.target.value)}
                  placeholder="ex: 550e8400-e29b-41d4-a716-446655440000"
                  className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 text-sm"
                  disabled={pipelineRunning}
                />
              </div>

              {/* Language select */}
              <div>
                <label className="text-sm font-medium mb-2 block">Langue</label>
                <Select value={sttLang} onValueChange={setSTTLang}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="fr">Français</SelectItem>
                    <SelectItem value="ar">Arabe</SelectItem>
                    <SelectItem value="en">Anglais</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <Button
              onClick={handlePipelineTest}
              disabled={pipelineRunning || !pipelineLeadId.trim() || !audioBlob}
              className="w-full gap-2"
            >
              {pipelineRunning ? <Loader2 className="w-4 h-4 animate-spin" /> : <Mic className="w-4 h-4" />}
              Exécuter le pipeline
            </Button>

            {/* Results */}
            {pipelineResult && (
              <div className="space-y-3 p-4 bg-green-50 dark:bg-green-950 border border-green-200 dark:border-green-800 rounded-lg">
                <div>
                  <p className="text-xs font-medium text-green-900 dark:text-green-300">Transcription:</p>
                  <p className="text-sm text-green-800 dark:text-green-200">"{pipelineResult.transcript}"</p>
                </div>
                <div>
                  <p className="text-xs font-medium text-green-900 dark:text-green-300">Réponse:</p>
                  <p className="text-sm text-green-800 dark:text-green-200">"{pipelineResult.response_text}"</p>
                </div>
                <div>
                  <p className="text-xs font-medium text-green-900 dark:text-green-300">Intent:</p>
                  <p className="text-sm text-green-800 dark:text-green-200">
                    {pipelineResult.intent_detected || 'N/A'} ({pipelineResult.intent_confidence?.toFixed(2) ?? 'N/A'})
                  </p>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
