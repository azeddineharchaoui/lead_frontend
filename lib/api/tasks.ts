import { apiRequest } from "@/lib/api-client";
import type { TaskStatusResponse } from "@/lib/types";
import { API } from "./endpoints";
import { toClientOptions, type ApiOptions } from "./client-options";

const ADMIN = true;

export async function getTaskStatus(
  ctx: ApiOptions,
  taskId: string,
): Promise<TaskStatusResponse> {
  return apiRequest<TaskStatusResponse>(
    toClientOptions(ctx),
    API.tasks.status(taskId),
    {},
    ADMIN,
  );
}
