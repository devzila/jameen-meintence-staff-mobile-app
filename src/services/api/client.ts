import { apiBaseUrl } from '@/constants/config';
import { accessTokenNeedsRefresh } from '@/lib/jwt';
import { useAuth } from '@/store/auth';
import { useOrg } from '@/store/org';
import { useUi } from '@/store/ui';
import {
  ApiError,
  errorMessageFromPayload,
  isNetworkFailure,
  NETWORK_FAILURE_MESSAGE,
} from '@/utils/errors';

export type QueryValue = string | number | boolean | undefined | (string | number)[];

type FetchOptions = {
  method?: string;
  body?: unknown;
  query?: Record<string, QueryValue>;
  headers?: Record<string, string>;
  companySlug?: string;
  skipCompanySlug?: boolean;
  skipRefresh?: boolean;
  accept?: string;
  signal?: AbortSignal;
};

let refreshInFlight: Promise<void> | null = null;

function ensureRefreshedOnce() {
  if (!refreshInFlight) {
    refreshInFlight = useAuth
      .getState()
      .refreshAccessToken()
      .finally(() => {
        refreshInFlight = null;
      });
  }
  return refreshInFlight;
}

async function ensureFreshAccessToken() {
  const { accessToken, refreshToken } = useAuth.getState();
  if (!refreshToken || !accessToken) return;
  if (!accessTokenNeedsRefresh(accessToken)) return;
  await ensureRefreshedOnce();
}

function buildHeaders(options: FetchOptions = {}): Record<string, string> {
  const { accessToken } = useAuth.getState();
  const { slug } = useOrg.getState();
  const headers: Record<string, string> = {
    Accept: options.accept || 'application/json',
    'X-Client-Source': 'mobile',
    ...(options.headers || {}),
  };

  const companySlug = options.companySlug || slug;
  if (companySlug) headers['company-slug'] = companySlug;
  if (accessToken) headers.Authorization = `Bearer ${accessToken}`;
  return headers;
}

function buildUrl(path: string, query?: FetchOptions['query']): string {
  const url = new URL(`${apiBaseUrl}${path}`);
  if (query) {
    for (const [key, value] of Object.entries(query)) {
      if (value === undefined) continue;
      // Rack parses repeated `key[]` params into an array, which is what Ransack
      // predicates like `q[status_in][]` expect.
      if (Array.isArray(value)) {
        for (const item of value) url.searchParams.append(key, String(item));
      } else {
        url.searchParams.set(key, String(value));
      }
    }
  }
  return url.toString();
}

async function parseJsonBody<T>(res: Response): Promise<T | undefined> {
  if (res.status === 204) return undefined;
  const text = await res.text();
  if (!text) return undefined;
  return JSON.parse(text) as T;
}

export async function apiFetch<T>(path: string, options: FetchOptions = {}): Promise<T> {
  if (!apiBaseUrl) throw new Error('EXPO_PUBLIC_API_URL is not set');

  const { slug } = useOrg.getState();
  if (!options.skipCompanySlug && !(options.companySlug || slug)) {
    throw new Error('Company slug is missing (sign in again)');
  }

  if (!options.skipRefresh) {
    await ensureFreshAccessToken();
  }

  const url = buildUrl(path, options.query);
  const method = options.method || 'GET';
  const isFormData = typeof FormData !== 'undefined' && options.body instanceof FormData;
  let headers = buildHeaders(options);

  let body: string | FormData | undefined;
  if (options.body !== undefined) {
    if (isFormData) {
      body = options.body as FormData;
    } else {
      headers['Content-Type'] = 'application/json';
      body = JSON.stringify(options.body);
    }
  }

  async function send(): Promise<Response> {
    try {
      return await fetch(url, { method, headers, body, signal: options.signal });
    } catch (error) {
      if (error instanceof Error && error.name === 'AbortError') throw error;
      if (isNetworkFailure(error)) useUi.getState().setOnline(false);
      throw new ApiError(
        isNetworkFailure(error)
          ? NETWORK_FAILURE_MESSAGE
          : error instanceof Error
            ? error.message
            : 'Network request failed',
        0,
      );
    }
  }

  let res = await send();

  if (res.status === 401 && !options.skipRefresh && useAuth.getState().refreshToken) {
    try {
      await ensureRefreshedOnce();
    } catch (err) {
      if (err instanceof Error && err.name === 'AbortError') throw err;
      await useAuth.getState().clearSession();
      throw err instanceof Error ? err : new Error('Session expired');
    }

    const newToken = useAuth.getState().accessToken;
    if (!newToken) {
      await useAuth.getState().clearSession();
      throw new Error('Session expired');
    }

    headers = { ...headers, Authorization: `Bearer ${newToken}` };
    res = await send();
    if (res.status === 401) {
      await useAuth.getState().clearSession();
    }
  }

  if (!res.ok) {
    const payload = await res.json().catch(() => ({}));
    throw new ApiError(errorMessageFromPayload(payload, res.status), res.status);
  }

  return (await parseJsonBody<T>(res)) as T;
}

export function getApiBaseUrl(): string {
  return apiBaseUrl;
}
