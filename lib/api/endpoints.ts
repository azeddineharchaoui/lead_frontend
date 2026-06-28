/** Path constants — see docs-01-api-reference.md at repo root */

export const API = {
  health: "/health",
  root: "/",
  leads: {
    list: "/api/v1/leads",
    pending: "/api/v1/leads/pending",
    detail: (id: string) => `/api/v1/leads/${id}`,
    status: (id: string) => `/api/v1/leads/${id}/status`,
    history: (id: string) => `/api/v1/leads/${id}/history`,
    assign: (id: string) => `/api/v1/leads/${id}/assign`,
    sessions: (leadId: string) => `/api/v1/leads/${leadId}/sessions`,
    session: (leadId: string, sessionId: string) =>
      `/api/v1/leads/${leadId}/sessions/${sessionId}`,
  },
  chat: {
    webhook: "/webhook/chat",
    audio:   "/webhook/chat/audio",
    tts:     "/webhook/chat/tts",
  },
  targets: {
    list: "/api/v1/targets",
    statsOverview: "/api/v1/targets/stats/overview",
    detail: (id: string) => `/api/v1/targets/${id}`,
    toggle: (id: string) => `/api/v1/targets/${id}/toggle`,
    scrapeNow: (id: string) => `/api/v1/targets/${id}/scrape-now`,
    leads: (id: string) => `/api/v1/targets/${id}/leads`,
  },
} as const;
