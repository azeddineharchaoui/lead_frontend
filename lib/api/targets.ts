import { apiRequest } from "@/lib/api-client";
import type {
  Lead,
  PaginatedResponse,
  ScrapingTarget,
  ScrapingTargetCreate,
  ScrapingTargetUpdate,
  ScrapingStatus,
  StatsOverviewResponse,
  SuccessResponse,
} from "@/lib/types";
import { API } from "./endpoints";
import { toClientOptions, type ApiOptions } from "./client-options";

const ADMIN = true;

export interface ListTargetsParams {
  page?: number;
  page_size?: number;
  is_active?: boolean;
  last_status?: ScrapingStatus;
}

function buildQuery(params: Record<string, string | number | boolean | undefined>): string {
  const search = new URLSearchParams();
  for (const [key, value] of Object.entries(params)) {
    if (value !== undefined && value !== "") {
      search.set(key, String(value));
    }
  }
  const q = search.toString();
  return q ? `?${q}` : "";
}

export async function getStatsOverview(
  ctx: ApiOptions,
): Promise<StatsOverviewResponse> {
  return apiRequest<StatsOverviewResponse>(
    toClientOptions(ctx),
    API.targets.statsOverview,
    {},
    ADMIN,
  );
}

export async function listTargets(
  ctx: ApiOptions,
  params: ListTargetsParams = {},
): Promise<PaginatedResponse<ScrapingTarget>> {
  return apiRequest<PaginatedResponse<ScrapingTarget>>(
    toClientOptions(ctx),
    `${API.targets.list}${buildQuery(params as Record<string, string | number | boolean | undefined>)}`,
    {},
    ADMIN,
  );
}

export async function getTarget(
  ctx: ApiOptions,
  targetId: string,
): Promise<ScrapingTarget> {
  return apiRequest<ScrapingTarget>(
    toClientOptions(ctx),
    API.targets.detail(targetId),
    {},
    ADMIN,
  );
}

export async function createTarget(
  ctx: ApiOptions,
  payload: ScrapingTargetCreate,
): Promise<ScrapingTarget> {
  return apiRequest<ScrapingTarget>(
    toClientOptions(ctx),
    API.targets.list,
    { method: "POST", body: JSON.stringify(payload) },
    ADMIN,
  );
}

export async function updateTarget(
  ctx: ApiOptions,
  targetId: string,
  payload: ScrapingTargetUpdate,
): Promise<ScrapingTarget> {
  return apiRequest<ScrapingTarget>(
    toClientOptions(ctx),
    API.targets.detail(targetId),
    { method: "PATCH", body: JSON.stringify(payload) },
    ADMIN,
  );
}

export async function toggleTarget(
  ctx: ApiOptions,
  targetId: string,
): Promise<ScrapingTarget> {
  return apiRequest<ScrapingTarget>(
    toClientOptions(ctx),
    API.targets.toggle(targetId),
    { method: "PATCH" },
    ADMIN,
  );
}

export async function scrapeTargetNow(
  ctx: ApiOptions,
  targetId: string,
): Promise<SuccessResponse> {
  return apiRequest<SuccessResponse>(
    toClientOptions(ctx),
    API.targets.scrapeNow(targetId),
    { method: "POST" },
    ADMIN,
  );
}

export async function deleteTarget(
  ctx: ApiOptions,
  targetId: string,
): Promise<void> {
  await apiRequest<void>(
    toClientOptions(ctx),
    API.targets.detail(targetId),
    { method: "DELETE" },
    ADMIN,
  );
}

export async function listTargetLeads(
  ctx: ApiOptions,
  targetId: string,
  page = 1,
  page_size = 20,
): Promise<PaginatedResponse<Lead>> {
  return apiRequest<PaginatedResponse<Lead>>(
    toClientOptions(ctx),
    `${API.targets.leads(targetId)}${buildQuery({ page, page_size })}`,
    {},
    ADMIN,
  );
}
