/**
 * Chat utilities for intent labels, score tiers, and formatting
 */

export const INTENT_MAP: Record<string, { label: string; color: string }> = {
  interet_achat: { label: 'Intérêt d\'achat', color: 'emerald' },
  question_technique: { label: 'Question technique', color: 'blue' },
  refus: { label: 'Refus', color: 'rose' },
  indecis: { label: 'Indécis', color: 'amber' },
  plainte: { label: 'Plainte / réclamation', color: 'orange' },
  salutation: { label: 'Salutation', color: 'slate' },
  inconnu: { label: 'Non classifié', color: 'gray' },
}

export function intentLabel(intent: string | null): string {
  if (!intent) return 'Non classifié'
  return INTENT_MAP[intent]?.label ?? intent
}

export function intentColor(intent: string | null): string {
  if (!intent) return 'gray'
  return INTENT_MAP[intent]?.color ?? 'gray'
}

export type ScoreTier = 'low' | 'mid' | 'high' | 'unknown'

export function scoreTier(score: number | null | undefined): ScoreTier {
  if (score === null || score === undefined) return 'unknown'
  if (score < 40) return 'low'
  if (score < 71) return 'mid'
  return 'high'
}

export function scoreTierLabel(tier: ScoreTier): string {
  switch (tier) {
    case 'low':
      return 'Peu qualifié'
    case 'mid':
      return 'En qualification'
    case 'high':
      return 'Fortement qualifié'
    default:
      return 'Inconnu'
  }
}

export function scoreTierColor(tier: ScoreTier): string {
  switch (tier) {
    case 'low':
      return 'text-red-600 dark:text-red-400'
    case 'mid':
      return 'text-amber-600 dark:text-amber-400'
    case 'high':
      return 'text-emerald-600 dark:text-emerald-400'
    default:
      return 'text-slate-600 dark:text-slate-400'
  }
}

export function formatSessionLabel(
  createdAt: string,
  intent: string | null,
  messageCount: number
): string {
  const date = new Date(createdAt)
  const dateStr = date.toLocaleDateString('fr-FR', {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
  const intentStr = intentLabel(intent)
  return `${dateStr} — ${intentStr} — ${messageCount} msgs`
}

export function truncateMessage(text: string, maxChars: number = 800): string {
  if (text.length <= maxChars) return text
  return text.substring(0, maxChars).trimEnd()
}

export function isMessageTruncated(text: string, maxChars: number = 800): boolean {
  return text.length > maxChars
}
