export class ApiError extends Error {
  status?: number;

  constructor(message: string, status?: number) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
  }
}

const NETWORK_HINT =
  /network connection was lost|fetch failed|failed to fetch|network request failed|internet connection appears to be offline|cannot connect|timed out|timeout|econnrefused|enotfound|unknownhost|offline|socket|networkerror|load failed/i;

export const NETWORK_FAILURE_MESSAGE = 'Needs network';

export function isNetworkFailure(error: unknown): boolean {
  if (error instanceof ApiError && (error.status == null || error.status === 0)) return true;
  const message = error instanceof Error ? error.message : String(error ?? '');
  return NETWORK_HINT.test(message);
}

export function toUserMessage(error: unknown, fallback = 'Something went wrong'): string {
  if (isNetworkFailure(error)) return NETWORK_FAILURE_MESSAGE;
  if (error instanceof ApiError) return error.message;
  if (error instanceof Error && error.message) return error.message;
  return fallback;
}

export function errorMessageFromPayload(payload: unknown, status: number): string {
  if (!payload || typeof payload !== 'object') {
    return `Request failed (${status})`;
  }
  const record = payload as Record<string, unknown>;
  const fromErrors =
    record.errors && typeof record.errors === 'object'
      ? Object.values(record.errors as Record<string, string[]>)
          .flat()
          .filter(Boolean)
          .join(' ')
      : null;
  if (fromErrors) return fromErrors;
  const message = record.message || record.error;
  if (typeof message === 'string' && message) return message;
  return `Request failed (${status})`;
}
