import { API } from '@/lib/api/endpoints'
import { apiRequest, buildQuery } from '@/lib/api-client'
import { toClientOptions } from '@/lib/api/client-options'
import type { ApiOptions } from '@/lib/api-client'
import type { AuditLogEntry, PaginatedResponse, AuditEntityType, AuditAction, BulkStatusPayload, BulkStatusResponse } from '@/lib/types'

export interface AuditListParams {
  page?: number
  page_size?: number
  action?: AuditAction
  entity_type?: AuditEntityType
  date_from?: string
  date_to?: string
  entity_id?: string
}

export async function listAuditLogs(
  ctx: ApiOptions,
  params: AuditListParams = {},
): Promise<PaginatedResponse<AuditLogEntry>> {
  return apiRequest<PaginatedResponse<AuditLogEntry>>(
    toClientOptions(ctx),
    `${API.audit.list}${buildQuery(params as Record<string, string | number | undefined>)}`,
  )
}

export async function exportAuditCsv(
  ctx: ApiOptions,
  params: AuditListParams = {},
): Promise<Blob> {
  const response = await fetch(
    `${toClientOptions(ctx).baseUrl}${API.audit.export}${buildQuery(params as Record<string, string | number | undefined>)}`,
    {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${toClientOptions(ctx).apiKey}`,
      },
    },
  )

  if (!response.ok) {
    throw new Error(`Failed to export audit logs: ${response.statusText}`)
  }

  return response.blob()
}

export async function bulkUpdateStatus(
  ctx: ApiOptions,
  payload: BulkStatusPayload,
): Promise<BulkStatusResponse> {
  return apiRequest<BulkStatusResponse>(
    toClientOptions(ctx),
    API.leads.bulkStatus,
    {
      method: 'POST',
      body: JSON.stringify(payload),
    },
  )
}
