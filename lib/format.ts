/**
 * Phone number and text formatting utilities
 * Specialized for French/Moroccan format support
 */

/**
 * Format E.164 phone number for display
 * +212612345678 -> +212 6 12 34 56 78
 */
export function formatPhoneDisplay(e164: string): string {
  if (!e164) return ''
  
  // Remove all non-digits for processing
  const digits = e164.replace(/\D/g, '')
  
  // Handle Moroccan numbers (212 prefix or without it)
  if (digits.startsWith('212')) {
    // +212612345678 (12 digits) -> +212 6 12 34 56 78
    if (digits.length === 12) {
      return `+${digits.slice(0, 3)} ${digits.slice(3, 4)} ${digits.slice(4, 6)} ${digits.slice(6, 8)} ${digits.slice(8, 10)} ${digits.slice(10, 12)}`
    }
  }
  
  // Handle local format: 612345678 (9 digits) -> 06 12 34 56 78
  if (digits.length === 9 && digits.startsWith('6')) {
    return `0${digits.slice(0, 1)} ${digits.slice(1, 3)} ${digits.slice(3, 5)} ${digits.slice(5, 7)} ${digits.slice(7, 9)}`
  }
  
  // Fallback: return original
  return e164
}

/**
 * Copy text to clipboard with Promise support
 */
export async function copyToClipboard(text: string): Promise<void> {
  try {
    if (navigator.clipboard?.writeText) {
      await navigator.clipboard.writeText(text)
    } else {
      // Fallback for older browsers
      const textArea = document.createElement('textarea')
      textArea.value = text
      document.body.appendChild(textArea)
      textArea.select()
      document.execCommand('copy')
      document.body.removeChild(textArea)
    }
  } catch (err) {
    console.error('Failed to copy to clipboard:', err)
    throw new Error('Impossible de copier')
  }
}

/**
 * Format relative time (e.g., "Il y a 2 heures")
 */
export function formatRelativeTime(dateString: string): string {
  if (!dateString) return 'Jamais'
  
  const date = new Date(dateString)
  const now = new Date()
  const seconds = Math.floor((now.getTime() - date.getTime()) / 1000)
  
  if (seconds < 60) return "À l'instant"
  if (seconds < 3600) return `Il y a ${Math.floor(seconds / 60)}m`
  if (seconds < 86400) return `Il y a ${Math.floor(seconds / 3600)}h`
  if (seconds < 604800) return `Il y a ${Math.floor(seconds / 86400)}j`
  
  return date.toLocaleDateString('fr-FR')
}

/**
 * Truncate text with ellipsis
 */
export function truncate(text: string | null | undefined, length: number = 50): string {
  if (!text) return '-'
  if (text.length <= length) return text
  return `${text.slice(0, length)}…`
}
