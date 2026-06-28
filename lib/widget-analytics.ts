/**
 * Widget analytics event tracking
 * Fires custom events and GTM dataLayer pushes (if available)
 */

export type WidgetEventType =
  | 'widget_opened'
  | 'widget_closed'
  | 'message_sent'
  | 'voice_input_used'
  | 'tts_played'
  | 'lead_qualified'
  | 'prechat_submitted'
  | 'error_occurred'

export interface WidgetEventPayload {
  leadId?: string
  messageLength?: number
  qualificationScore?: number
  intent?: string
  channel?: string
  errorType?: string
  errorMessage?: string
  timestamp?: number
  sessionDuration?: number
}

/**
 * Track widget event
 */
export function trackWidgetEvent(
  eventType: WidgetEventType,
  payload: WidgetEventPayload = {},
): void {
  const event = {
    event: `lead_widget_${eventType}`,
    ...payload,
    timestamp: payload.timestamp || Date.now(),
  }

  // Console log in development
  if (process.env.NODE_ENV === 'development') {
    console.log('[v0] Widget event:', eventType, event)
  }

  // Push to GTM dataLayer if available
  if (typeof window !== 'undefined' && (window as any).dataLayer) {
    ;(window as any).dataLayer.push(event)
  }

  // Dispatch custom event for integration
  if (typeof window !== 'undefined') {
    const customEvent = new CustomEvent('leadWidgetEvent', { detail: event })
    window.dispatchEvent(customEvent)
  }
}

/**
 * Batch track events with session context
 */
export class WidgetAnalytics {
  private leadId: string | null = null
  private sessionStartTime: number = Date.now()

  setLeadId(leadId: string): void {
    this.leadId = leadId
  }

  trackOpened(): void {
    trackWidgetEvent('widget_opened', {
      leadId: this.leadId || undefined,
    })
  }

  trackClosed(): void {
    trackWidgetEvent('widget_closed', {
      leadId: this.leadId || undefined,
      sessionDuration: Date.now() - this.sessionStartTime,
    })
  }

  trackMessageSent(messageLength: number): void {
    trackWidgetEvent('message_sent', {
      leadId: this.leadId || undefined,
      messageLength,
    })
  }

  trackVoiceUsed(): void {
    trackWidgetEvent('voice_input_used', {
      leadId: this.leadId || undefined,
    })
  }

  trackTtsPlayed(textLength: number): void {
    trackWidgetEvent('tts_played', {
      leadId: this.leadId || undefined,
      messageLength: textLength,
    })
  }

  trackQualified(score: number, intent?: string): void {
    trackWidgetEvent('lead_qualified', {
      leadId: this.leadId || undefined,
      qualificationScore: score,
      intent,
    })
  }

  trackPrechatSubmitted(): void {
    trackWidgetEvent('prechat_submitted', {
      leadId: this.leadId || undefined,
    })
  }

  trackError(errorType: string, errorMessage: string): void {
    trackWidgetEvent('error_occurred', {
      leadId: this.leadId || undefined,
      errorType,
      errorMessage,
    })
  }
}

// Global analytics instance
export const widgetAnalytics = new WidgetAnalytics()
