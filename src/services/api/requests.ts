import { PAGE_SIZE, PORTAL } from '@/constants/config';
import { apiFetch, type QueryValue } from '@/services/api/client';
import type { ApiItemResponse, ApiListResponse } from '@/types/api';
import type {
  HoldReason,
  MaintenanceRequest,
  RequestAction,
  RequestComment,
  TicketUpdate,
} from '@/types/maintenance';

const base = `/v1/${PORTAL}/maintenance/requests`;

export type RequestListQuery = Record<string, QueryValue>;

export async function fetchRequests(args: {
  page?: number;
  limit?: number;
  query?: RequestListQuery;
  signal?: AbortSignal;
}) {
  return apiFetch<ApiListResponse<MaintenanceRequest>>(base, {
    query: { page: args.page ?? 1, limit: args.limit ?? PAGE_SIZE, ...args.query },
    signal: args.signal,
  });
}

/** Total matching rows, read from pagination with a one-row page. */
export async function countRequests(query: RequestListQuery, signal?: AbortSignal) {
  const res = await fetchRequests({ page: 1, limit: 1, query, signal });
  return res.pagination?.total_entries ?? res.data?.length ?? 0;
}

export async function fetchRequest(id: number | string, signal?: AbortSignal) {
  const res = await apiFetch<ApiItemResponse<MaintenanceRequest>>(`${base}/${id}`, { signal });
  return res.data;
}

export type TransitionParams = {
  hold_reason?: HoldReason;
  actual_cost?: string;
};

export async function transitionRequest(
  id: number | string,
  action: RequestAction,
  params: TransitionParams = {},
) {
  const body = Object.fromEntries(
    Object.entries(params).filter(([, value]) => value !== undefined && value !== ''),
  );
  const res = await apiFetch<ApiItemResponse<MaintenanceRequest>>(`${base}/${id}/${action}`, {
    method: 'PUT',
    body,
  });
  return res.data;
}

export async function fetchComments(requestId: number | string, signal?: AbortSignal) {
  const res = await apiFetch<ApiListResponse<RequestComment>>(`${base}/${requestId}/comments`, {
    query: { limit: -1 },
    signal,
  });
  return res.data ?? [];
}

export async function createComment(requestId: number | string, comment: string) {
  const res = await apiFetch<ApiItemResponse<RequestComment>>(`${base}/${requestId}/comments`, {
    method: 'POST',
    body: { comment: { comment } },
  });
  return res.data;
}

export async function fetchUpdates(requestId: number | string, signal?: AbortSignal) {
  const res = await apiFetch<ApiListResponse<TicketUpdate>>(`${base}/${requestId}/updates`, {
    query: { limit: -1 },
    signal,
  });
  return res.data ?? [];
}

export async function createInternalNote(requestId: number | string, body: string) {
  const res = await apiFetch<ApiItemResponse<TicketUpdate>>(`${base}/${requestId}/updates`, {
    method: 'POST',
    body: { ticket_update: { body, update_type: 'internal_note', is_internal: true } },
  });
  return res.data;
}
