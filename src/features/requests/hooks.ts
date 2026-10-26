import {
  useInfiniteQuery,
  useMutation,
  useQueries,
  useQuery,
  useQueryClient,
} from '@tanstack/react-query';
import {
  countRequests,
  createComment,
  createInternalNote,
  fetchComments,
  fetchRequest,
  fetchRequests,
  fetchUpdates,
  transitionRequest,
  type TransitionParams,
} from '@/services/api/requests';
import {
  OPEN_STATUSES,
  PRIORITY_CODES,
  STATUS_CODES,
  TODO_STATUSES,
  statusQuery,
  type StatusFilter,
} from '@/lib/requestStatus';
import { buildActivity } from '@/features/requests/activity';
import { useAuth } from '@/store/auth';
import type { MaintenanceRequest, RequestAction } from '@/types/maintenance';

export const requestKeys = {
  all: ['requests'] as const,
  lists: () => [...requestKeys.all, 'list'] as const,
  list: (filter: StatusFilter) => [...requestKeys.lists(), filter] as const,
  summary: () => [...requestKeys.all, 'summary'] as const,
  detail: (id: string) => [...requestKeys.all, 'detail', id] as const,
  comments: (id: string) => [...requestKeys.all, 'comments', id] as const,
  updates: (id: string) => [...requestKeys.all, 'updates', id] as const,
};

export function useRequestList(filter: StatusFilter) {
  return useInfiniteQuery({
    queryKey: requestKeys.list(filter),
    initialPageParam: 1,
    queryFn: ({ pageParam, signal }) =>
      fetchRequests({ page: pageParam, query: statusQuery(filter), signal }),
    getNextPageParam: (last) => last.pagination?.next_page ?? undefined,
    select: (data) => data.pages.flatMap((page) => page.data ?? []),
  });
}

const codes = (statuses: typeof OPEN_STATUSES) => statuses.map((s) => STATUS_CODES[s]);

export function useHomeSummary() {
  const results = useQueries({
    queries: [
      {
        queryKey: [...requestKeys.summary(), 'todo'],
        queryFn: ({ signal }: { signal: AbortSignal }) =>
          countRequests({ 'q[status_in][]': codes(TODO_STATUSES) }, signal),
      },
      {
        queryKey: [...requestKeys.summary(), 'in_progress'],
        queryFn: ({ signal }: { signal: AbortSignal }) =>
          countRequests({ 'q[status_eq]': STATUS_CODES.in_progress }, signal),
      },
      {
        queryKey: [...requestKeys.summary(), 'on_hold'],
        queryFn: ({ signal }: { signal: AbortSignal }) =>
          countRequests({ 'q[status_eq]': STATUS_CODES.on_hold }, signal),
      },
      {
        queryKey: [...requestKeys.summary(), 'breached'],
        queryFn: ({ signal }: { signal: AbortSignal }) =>
          countRequests(
            { 'q[status_in][]': codes(OPEN_STATUSES), 'q[sla_breached_eq]': true },
            signal,
          ),
      },
    ],
  });
  const [todo, inProgress, onHold, breached] = results;
  return {
    counts: {
      todo: todo.data,
      inProgress: inProgress.data,
      onHold: onHold.data,
      breached: breached.data,
    },
    isLoading: results.some((r) => r.isLoading),
    error: results.find((r) => r.error)?.error ?? null,
    refetch: () => Promise.all(results.map((r) => r.refetch())),
  };
}

export function usePriorityRequests() {
  return useQuery({
    queryKey: [...requestKeys.summary(), 'priority'],
    queryFn: async ({ signal }) => {
      const res = await fetchRequests({
        page: 1,
        limit: 5,
        signal,
        query: {
          'q[status_in][]': codes(OPEN_STATUSES),
          'q[priority_in][]': [PRIORITY_CODES.high, PRIORITY_CODES.urgent],
        },
      });
      return res.data ?? [];
    },
  });
}

export function useRequestDetail(id: string) {
  const queryClient = useQueryClient();
  return useQuery<MaintenanceRequest>({
    queryKey: requestKeys.detail(id),
    queryFn: ({ signal }) => fetchRequest(id, signal),
    enabled: Boolean(id),
    placeholderData: () => findInLists(queryClient, id),
  });
}

function findInLists(
  queryClient: ReturnType<typeof useQueryClient>,
  id: string,
): MaintenanceRequest | undefined {
  const lists = queryClient.getQueriesData<{ pages: { data?: MaintenanceRequest[] }[] }>({
    queryKey: requestKeys.lists(),
  });
  for (const [, data] of lists) {
    for (const page of data?.pages ?? []) {
      const match = page.data?.find((row) => String(row.id) === id);
      if (match) return match;
    }
  }
  return undefined;
}

export function useRequestActivity(id: string) {
  const staffId = useAuth((s) => s.staff?.id);
  const comments = useQuery({
    queryKey: requestKeys.comments(id),
    queryFn: ({ signal }) => fetchComments(id, signal),
    enabled: Boolean(id),
  });
  const updates = useQuery({
    queryKey: requestKeys.updates(id),
    queryFn: ({ signal }) => fetchUpdates(id, signal),
    enabled: Boolean(id),
  });
  return {
    items: buildActivity(comments.data ?? [], updates.data ?? [], staffId),
    isLoading: comments.isLoading || updates.isLoading,
    error: comments.error ?? updates.error ?? null,
    refetch: () => Promise.all([comments.refetch(), updates.refetch()]),
  };
}

export function useRequestTransition(id: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ action, params }: { action: RequestAction; params?: TransitionParams }) =>
      transitionRequest(id, action, params),
    onSuccess: (request) => {
      if (request) queryClient.setQueryData(requestKeys.detail(id), request);
      void queryClient.invalidateQueries({ queryKey: requestKeys.lists() });
      void queryClient.invalidateQueries({ queryKey: requestKeys.summary() });
      void queryClient.invalidateQueries({ queryKey: requestKeys.updates(id) });
    },
  });
}

export function useAddActivity(id: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ body, internal }: { body: string; internal: boolean }) => {
      if (internal) await createInternalNote(id, body);
      else await createComment(id, body);
    },
    onSuccess: (_data, { internal }) => {
      void queryClient.invalidateQueries({
        queryKey: internal ? requestKeys.updates(id) : requestKeys.comments(id),
      });
    },
  });
}
