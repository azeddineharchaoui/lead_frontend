/**
 * Split long text into chunks suitable for gTTS (~500 chars recommended)
 * Attempts to split on sentence boundaries for natural playback
 */
export function chunkTextForTts(text: string, maxChunkLength = 500): string[] {
  if (text.length <= maxChunkLength) {
    return [text]
  }

  const chunks: string[] = []
  let currentChunk = ""

  // Split on sentence boundaries: ". " or "? " or "! "
  const sentences = text.match(/[^.!?]+[.!?]+/g) || [text]

  for (const sentence of sentences) {
    const trimmed = sentence.trim()
    if (!trimmed) continue

    // If adding this sentence would exceed limit and chunk has content, save chunk
    if (currentChunk.length + trimmed.length > maxChunkLength && currentChunk.length > 0) {
      chunks.push(currentChunk.trim())
      currentChunk = trimmed
    } else {
      if (currentChunk) currentChunk += " "
      currentChunk += trimmed
    }
  }

  // Add remaining chunk
  if (currentChunk.trim()) {
    chunks.push(currentChunk.trim())
  }

  return chunks.length > 0 ? chunks : [text.slice(0, maxChunkLength)]
}

/**
 * Get formatted chunk label for UI display
 * @example "Partie 2/3" when playing chunk 2 of 3 total
 */
export function getChunkLabel(currentIndex: number, totalChunks: number): string {
  if (totalChunks <= 1) return ""
  return `Partie ${currentIndex + 1}/${totalChunks}`
}
