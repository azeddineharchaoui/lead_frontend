import { apiRequest } from "@/lib/api-client";
import type {
  CreateLeadPayload,
  Lead,
  LeadDetailResponse,
  LeadStatus,
  LeadStatusUpdate,
  LeadUpdate,
  HistoryEntry,
  PaginatedResponse,
  CrmPushResponse,
  AssignLeadPayload,
} from "@/lib/types";
import { API } from "./endpoints";
import { toClientOptions, type ApiOptions } from "./client-options";

export interface ListLeadsParams {
  page?: number;
  page_size?: number;
  status?: LeadStatus;
  domain?: string;
  assigned_to_user_id?: string;
}

function buildQuery(params: Record<string, string | number | undefined>): string {
  const search = new URLSearchParams();
  for (const [key, value] of Object.entries(params)) {
    if (value !== undefined && value !== "") {
      search.set(key, String(value));
    }
  }
  const q = search.toString();
  return q ? `?${q}` : "";
}

export async function listLeads(
  ctx: ApiOptions,
  params: ListLeadsParams = {},
): Promise<PaginatedResponse<Lead>> {
  return apiRequest<PaginatedResponse<Lead>>(
    toClientOptions(ctx),
    `${API.leads.list}${buildQuery(params as Record<string, string | number | undefined>)}`,
  );
}

export async function getMyLeads(
  ctx: ApiOptions,
  params: Omit<ListLeadsParams, 'assigned_to_user_id'> = {},
): Promise<PaginatedResponse<Lead>> {
  // Convenience endpoint: GET /api/v1/leads/me
  return apiRequest<PaginatedResponse<Lead>>(
    toClientOptions(ctx),
    `${API.leads.list}/me${buildQuery(params as Record<string, string | number | undefined>)}`,
  );
}

export async function listPendingLeads(
  ctx: ApiOptions,
  limit = 50,
): Promise<Lead[]> {
  return apiRequest<Lead[]>(
    toClientOptions(ctx),
    `${API.leads.pending}${buildQuery({ limit })}`,
  );
}

export async function getLead(
  ctx: ApiOptions,
  leadId: string,
): Promise<LeadDetailResponse> {
  return apiRequest<LeadDetailResponse>(
    toClientOptions(ctx),
    API.leads.detail(leadId),
  );
}

export async function createLead(
  ctx: ApiOptions,
  payload: CreateLeadPayload,
): Promise<Lead> {
  return apiRequest<Lead>(
    toClientOptions(ctx),
    API.leads.list,
    { method: "POST", body: JSON.stringify(payload) },
  );
}

export async function updateLeadStatus(
  ctx: ApiOptions,
  leadId: string,
  payload: LeadStatusUpdate,
): Promise<Lead> {
  return apiRequest<Lead>(
    toClientOptions(ctx),
    API.leads.status(leadId),
    { method: "PATCH", body: JSON.stringify(payload) },
  );
}

export async function deleteLead(ctx: ApiOptions, leadId: string): Promise<void> {
  await apiRequest<void>(
    toClientOptions(ctx),
    API.leads.detail(leadId),
    { method: "DELETE" },
  );
}

export async function claimNextLead(
  ctx: ApiOptions,
  agent?: string,
): Promise<Lead> {
  const query = agent ? `?agent=${encodeURIComponent(agent)}` : '';
  return apiRequest<Lead>(
    toClientOptions(ctx),
    `${API.leads.list}/claim-next${query}`,
  );
}

export async function getLeadHistory(
  ctx: ApiOptions,
  leadId: string,
): Promise<HistoryEntry[]> {
  return apiRequest<HistoryEntry[]>(
    toClientOptions(ctx),
    API.leads.history(leadId),
  );
}

export async function updateLead(
  ctx: ApiOptions,
  leadId: string,
  data: Partial<LeadUpdate>,
): Promise<Lead> {
  return apiRequest<Lead>(
    toClientOptions(ctx),
    API.leads.detail(leadId),
    { method: "PATCH", body: JSON.stringify(data) },
  );
}

export async function assignLead(
  ctx: ApiOptions,
  leadId: string,
  payloadOrAgent: AssignLeadPayload | string,
  notes?: string,
): Promise<Lead> {
  // Support both new JSON body format and legacy query params
  if (typeof payloadOrAgent === 'string') {
    // Legacy format: assignLead(api, leadId, 'email@example.com', 'notes')
    const agent = payloadOrAgent;
    const query = new URLSearchParams({ agent });
    if (notes) query.append("notes", notes);
    return apiRequest<Lead>(
      toClientOptions(ctx),
      `${API.leads.assign(leadId)}?${query.toString()}`,
      { method: "POST" },
    );
  } else {
    // New format: assignLead(api, leadId, { agent_id: uuid, notes?: string })
    return apiRequest<Lead>(
      toClientOptions(ctx),
      API.leads.assign(leadId),
      {
        method: "POST",
        body: JSON.stringify(payloadOrAgent),
      },
    );
  }
}

export async function retryCrmPush(
  ctx: ApiOptions,
  leadId: string,
): Promise<CrmPushResponse> {
  return apiRequest<CrmPushResponse>(
    toClientOptions(ctx),
    `${API.leads.detail(leadId)}/retry-crm-push`,
    { method: "POST" },
  );
}
