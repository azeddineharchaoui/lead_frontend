export class TtsUnavailableError extends Error {
  constructor(message = 'Synthèse vocale indisponible (gTTS)') {
    super(message)
    this.name = 'TtsUnavailableError'
  }
}

export class TtsValidationError extends Error {
  constructor(message = 'Texte trop long pour la synthèse vocale') {
    super(message)
    this.name = 'TtsValidationError'
  }
}

export class TtsNetworkError extends Error {
  constructor(message = 'Erreur réseau lors de la synthèse vocale') {
    super(message)
    this.name = 'TtsNetworkError'
  }
}
