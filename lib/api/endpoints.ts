/** Path constants — see docs-01-api-reference.md at repo root */

export const API = {
  health: "/health",
  root: "/",
  auth: {
    register: "/auth/register",
    login: "/auth/login",
    refresh: "/auth/refresh",
    logout: "/auth/logout",
    me: "/auth/me",
    verifyEmail: "/auth/verify-email",
    requestReset: "/auth/request-reset",
    resetPassword: "/auth/reset-password",
    mePassword: "/auth/me/password",
  },
  leads: {
    list: "/api/v1/leads",
    claimNext: "/api/v1/leads/claim-next",
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
    visitorStart: "/webhook/chat/visitor/start",
    visitorMessage: "/webhook/chat/visitor/message",
  },
  targets: {
    list: "/api/v1/targets",
    statsOverview: "/api/v1/targets/stats/overview",
    detail: (id: string) => `/api/v1/targets/${id}`,
    toggle: (id: string) => `/api/v1/targets/${id}/toggle`,
    scrapeNow: (id: string) => `/api/v1/targets/${id}/scrape-now`,
    leads: (id: string) => `/api/v1/targets/${id}/leads`,
  },
  org: {
    root: "/api/v1/org",
    members: "/api/v1/org/members",
    member: (id: string) => `/api/v1/org/members/${id}`,
    memberRole: (id: string) => `/api/v1/org/members/${id}/role`,
    invite: "/api/v1/org/invite",
    apiKeys: "/api/v1/org/api-keys",
    apiKey: (id: string) => `/api/v1/org/api-keys/${id}`,
  },
  tasks: {
    status: (id: string) => `/api/v1/tasks/${id}`,
  },
} as const;
