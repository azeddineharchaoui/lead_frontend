import { apiRequest } from "@/lib/api-client";
import type {
  CreateLeadPayload,
  Lead,
  LeadDetailResponse,
  LeadStatus,
  LeadStatusUpdate,
  PaginatedResponse,
} from "@/lib/types";
import { API } from "./endpoints";
import { toClientOptions, type ApiOptions } from "./client-options";

export interface ListLeadsParams {
  page?: number;
  page_size?: number;
  status?: LeadStatus;
  domain?: string;
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
