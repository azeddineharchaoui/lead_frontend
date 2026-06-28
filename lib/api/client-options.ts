import type { ApiContextType } from "@/lib/types";

export type ApiOptions = Pick<ApiContextType, "baseUrl" | "apiKey">;

export function toClientOptions(ctx: ApiOptions) {
  return {
    baseUrl: ctx.baseUrl.replace(/\/$/, ""),
    apiKey: ctx.apiKey || undefined,
  };
}
