import { apiRequest } from "@/lib/api-client";
import type { HealthResponse, RootDiscoveryResponse } from "@/lib/types";
import { API } from "./endpoints";
import { toClientOptions, type ApiOptions } from "./client-options";

export async function fetchHealth(ctx: ApiOptions): Promise<HealthResponse> {
  return apiRequest<HealthResponse>(toClientOptions(ctx), API.health);
}

export async function fetchRoot(ctx: ApiOptions): Promise<RootDiscoveryResponse> {
  return apiRequest<RootDiscoveryResponse>(toClientOptions(ctx), API.root);
}
