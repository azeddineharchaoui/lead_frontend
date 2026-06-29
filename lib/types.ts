/** API contract aligned with docs-01-api-reference.md */

export type LeadStatus = "nouveau" | "en_cours" | "qualifie" | "rejete";

export type ChatChannel = "web_chat" | "whatsapp" | "sms" | "email";

export type ScrapingStatus = "success" | "failed" | "pending";

export type TaskState = "pending" | "started" | "success" | "failure";

export interface TaskStatusResponse {
  state: TaskState;
  ready: boolean;
  result: string | Record<string, unknown> | null;
  progress?: {
    current: number;
    total: number;
  } | null;
}

export interface ApiContextType {
  baseUrl: string;
  apiKey: string;
  setBaseUrl: (url: string) => void;
  setApiKey: (key: string) => void;
}

export interface Lead {
  id: string;
  phone_number: string;
  source_url: string | null;
  company_name: string | null;
  notes: string | null;
  status: LeadStatus;
  website_domain: string | null;
  scraping_target_id: string | null;
  call_attempts: number;
  last_called_at: string | null;
  assigned_to?: string | null;
  assigned_to_user_id?: string | null;
  qualification_score?: number | null;
  crm_pushed_at?: string | null;
  crm_push_attempts?: number;
  crm_last_error?: string | null;
  created_at: string;
  updated_at: string;
}

export interface AssignLeadPayload {
  agent_id: string;
  notes?: string;
}

export interface HistoryEntry {
  id: string;
  from_status: string | null;
  to_status: string;
  changed_by: string | null;
  reason: string | null;
  extra_data: Record<string, unknown> | null;
  created_at: string;
}

export interface LeadStatusUpdate {
  status: LeadStatus;
  notes?: string | null;
}

export interface LeadUpdate {
  notes?: string | null;
  company_name?: string | null;
  assigned_to?: string | null;
}

export interface LeadSessionSummary {
  id: string;
  intent_detected: string | null;
  message_count: number;
  channel: string;
  is_active: boolean;
  created_at: string;
}

export interface LeadDetailResponse extends Lead {
  chat_sessions: LeadSessionSummary[];
}

export interface CrmPushResponse {
  task_id: string;
  message: string;
}

export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  page_size: number;
  total_pages: number;
  has_next: boolean;
  has_prev: boolean;
}

export interface HealthResponse {
  status: "healthy" | "degraded";
  version: string;
  environment: string;
  components: {
    database: "ok" | "error";
    api: "ok" | "error";
  };
}

export interface RootDiscoveryResponse {
  name: string;
  version: string;
  docs: string | null;
  health: string;
}

export interface ChatMessage {
  role: "user" | "assistant" | "system";
  content: string;
  timestamp: string;
}

export interface ChatSession {
  id: string;
  lead_id: string;
  chat_history: ChatMessage[];
  intent_detected: string | null;
  intent_confidence: number | null;
  channel: string;
  is_active: boolean;
  session_summary: string | null;
  created_at: string;
  updated_at: string;
}

export interface IncomingChatMessage {
  lead_id: string;
  message: string;
  channel?: ChatChannel;
  session_id?: string | null;
}

export interface ChatbotResponse {
  session_id: string;
  response_text: string;
  intent_detected: string;
  intent_confidence: number;
  lead_status_changed: boolean;
  new_lead_status: LeadStatus | null;
  suggested_actions: string[];
  qualification_score?: number | null;
}

export interface AudioChatResponse extends ChatbotResponse {
  transcript: string;
}

export type CaptureStatus = "need_phone" | "need_confirm" | "complete";

export interface VisitorStartRequest {
  phone_number?: string;
  company_name?: string;
  source_url?: string;
  channel?: ChatChannel;
  initial_message?: string;
}

export interface VisitorMessageRequest {
  visitor_token: string;
  message: string;
}

export interface VisitorChatResponse extends ChatbotResponse {
  session_id: string | null;
  visitor_token: string | null;
  lead_id: string | null;
  lead_created: boolean;
  capture_status: CaptureStatus;
  missing_fields: string[];
  extracted?: {
    phone?: string;
    company_name?: string;
    contact_name?: string;
  } | null;
}

export interface ScrapingTarget {
  id: string;
  domain: string;
  name: string | null;
  is_active: boolean;
  scraping_frequency_hours: number;
  last_scraped_at: string | null;
  last_scraping_status: ScrapingStatus | null;
  leads_count: number;
  error_count: number;
  custom_selectors: Record<string, string> | null;
  created_at: string;
  updated_at: string;
}

export interface ScrapingTargetCreate {
  domain: string;
  name?: string | null;
  is_active?: boolean;
  scraping_frequency_hours?: number;
  custom_selectors?: Record<string, string> | null;
}

export interface ScrapingTargetUpdate {
  name?: string | null;
  is_active?: boolean;
  scraping_frequency_hours?: number;
  custom_selectors?: Record<string, string> | null;
}

export interface CreateLeadPayload {
  phone_number: string;
  company_name?: string | null;
  source_url?: string | null;
  status?: LeadStatus;
  notes?: string | null;
}

export interface LeadStatusUpdate {
  status: LeadStatus;
  notes?: string | null;
}

export interface SuccessResponse {
  success: boolean;
  message: string;
}

export interface StatsOverviewResponse {
  targets: {
    total: number;
    active: number;
    inactive: number;
  };
  leads: {
    total: number;
    by_status: Record<LeadStatus, number>;
    conversion_rate: number;
  };
  scraping: {
    last_activity: string | null;
    top_targets: Array<{
      domain: string;
      leads_count: number;
      is_active: boolean;
      last_scraped: string | null;
    }>;
  };
}

export function isApiHealthy(health: HealthResponse | null): boolean {
  return health?.status === "healthy" && health.components.api === "ok";
}

export function isDatabaseHealthy(health: HealthResponse | null): boolean {
  return health?.components.database === "ok";
}

// =============================================================================
// Auth types
// =============================================================================

export type UserRole = "owner" | "admin" | "agent" | "viewer";

export interface AuthUser {
  id: string;
  email: string;
  full_name: string;
  role: UserRole;
  is_active: boolean;
  is_verified: boolean;
  organisation_id: string;
  avatar_url: string | null;
  last_login_at: string | null;
  created_at: string;
}

export interface AuthOrganisation {
  id: string;
  name: string;
  slug: string;
  is_active: boolean;
  trial_ends_at: string | null;
  settings: Record<string, unknown>;
  created_at: string;
}

export interface AuthState {
  user: AuthUser | null;
  organisation: AuthOrganisation | null;
  accessToken: string | null;
  isLoading: boolean;
  isAuthenticated: boolean;
}

export interface LoginPayload {
  email: string;
  password: string;
}

export interface RegisterPayload {
  email: string;
  password: string;
  full_name: string;
  organisation_name: string;
}

export interface TokenResponse {
  access_token: string;
  token_type: string;
}

export interface MeResponse {
  user: AuthUser;
  organisation: AuthOrganisation;
}

export interface ApiKeyResponse {
  id: string;
  name: string;
  prefix: string;
  scopes: string[];
  expires_at: string | null;
  last_used_at: string | null;
  created_at: string;
}

export interface ApiKeyCreatedResponse extends ApiKeyResponse {
  raw_key: string;
}

export interface PlanResponse {
  id: string;
  name: string;
  max_leads: number;
  max_targets: number;
  max_agents: number;
  price_monthly_usd: string;
  created_at: string;
}
