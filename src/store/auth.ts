import { create } from 'zustand';
import { Platform } from 'react-native';
import { apiBaseUrl, deviceName, PORTAL } from '@/constants/config';
import { clearTokens, getAccessToken, getRefreshToken, saveTokens } from '@/services/secureStorage';
import { useOrg } from '@/store/org';
import {
  ApiError,
  errorMessageFromPayload,
  isNetworkFailure,
  NETWORK_FAILURE_MESSAGE,
} from '@/utils/errors';
import type { AuthPayload, Staff } from '@/types/api';

type AuthState = {
  accessToken: string | null;
  refreshToken: string | null;
  email: string | null;
  staff: Staff | null;
  sessionId: string | null;
  accessExpiresAt: string | null;
  isAuthenticated: boolean;
  hydrated: boolean;
  hydrate: () => Promise<void>;
  applyAuthPayload: (payload: AuthPayload, email?: string) => Promise<void>;
  login: (email: string, password: string, companySlug: string) => Promise<AuthPayload>;
  refreshAccessToken: () => Promise<void>;
  logout: () => Promise<void>;
  clearSession: () => Promise<void>;
  setStaff: (staff: Staff | null) => void;
};

function abortAfter(ms: number) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), ms);
  return {
    signal: controller.signal,
    cancel: () => clearTimeout(timer),
  };
}

function pickStaff(payload: AuthPayload): Staff | null {
  const object = payload?.object;
  if (object && typeof object === 'object' && typeof object.id === 'number') {
    return object;
  }
  if (payload?.staff && typeof payload.staff === 'object' && typeof payload.staff.id === 'number') {
    return payload.staff;
  }
  return null;
}

function extractTokens(payload: AuthPayload, previousRefresh?: string | null) {
  const accessToken = payload.access_token || payload.token;
  const refreshToken = payload.refresh_token || previousRefresh || null;
  if (!accessToken) throw new Error('Auth response missing access token');
  if (!refreshToken) throw new Error('Auth response missing refresh token');
  return { accessToken, refreshToken };
}

function authErrorMessage(status: number, payload: Record<string, unknown>, fallback: string) {
  if (status === 401) return 'Invalid credentials';
  if (status === 403) {
    return (payload?.message as string) || 'Company is missing, unknown, or inactive';
  }
  if (status === 429) return 'Too many attempts, try later';
  return errorMessageFromPayload(payload, status) || fallback;
}

export const useAuth = create<AuthState>((set, get) => ({
  accessToken: null,
  refreshToken: null,
  email: null,
  staff: null,
  sessionId: null,
  accessExpiresAt: null,
  isAuthenticated: false,
  hydrated: false,

  setStaff: (staff) => set({ staff }),

  clearSession: async () => {
    await clearTokens();
    set({
      accessToken: null,
      refreshToken: null,
      email: null,
      staff: null,
      sessionId: null,
      accessExpiresAt: null,
      isAuthenticated: false,
    });
  },

  applyAuthPayload: async (payload, email) => {
    const { accessToken, refreshToken } = extractTokens(payload, get().refreshToken);
    await saveTokens(accessToken, refreshToken);
    set({
      accessToken,
      refreshToken,
      email: email ?? get().email,
      staff: pickStaff(payload) ?? get().staff,
      sessionId: payload.session_id ?? get().sessionId,
      accessExpiresAt: payload.access_expires_at || (payload.exp ? String(payload.exp) : null),
      isAuthenticated: true,
    });
  },

  hydrate: async () => {
    try {
      const [accessToken, refreshToken] = await Promise.all([getAccessToken(), getRefreshToken()]);
      if (accessToken && refreshToken) {
        set({ accessToken, refreshToken, isAuthenticated: true, hydrated: true });
        return;
      }
      set({
        accessToken: null,
        refreshToken: null,
        isAuthenticated: false,
        hydrated: true,
      });
    } catch {
      set({ hydrated: true, isAuthenticated: false });
    }
  },

  login: async (email, password, companySlug) => {
    if (!apiBaseUrl) throw new Error('EXPO_PUBLIC_API_URL is not set');
    if (!companySlug) throw new Error('Select your company first');

    const timeout = abortAfter(20_000);
    let res: Response;
    try {
      res = await fetch(`${apiBaseUrl}/v1/${PORTAL}/auth/session`, {
        method: 'POST',
        headers: {
          Accept: 'application/json',
          'Content-Type': 'application/json',
          'company-slug': companySlug,
          'X-Client-Source': 'mobile',
        },
        body: JSON.stringify({
          email: email.trim().toLowerCase(),
          password,
          device_name: `${deviceName}/${Platform.OS}`,
        }),
        signal: timeout.signal,
      });
    } catch (err) {
      if (err instanceof Error && err.name === 'AbortError') {
        throw new Error('Login timed out. Check your connection and try again.');
      }
      if (isNetworkFailure(err)) throw new ApiError(NETWORK_FAILURE_MESSAGE, 0);
      throw err;
    } finally {
      timeout.cancel();
    }

    const payload = (await res.json().catch(() => ({}))) as AuthPayload & Record<string, unknown>;
    if (!res.ok) {
      throw new ApiError(authErrorMessage(res.status, payload, 'Login failed'), res.status);
    }

    await get().applyAuthPayload(payload, email.trim().toLowerCase());
    return payload;
  },

  refreshAccessToken: async () => {
    const { refreshToken, clearSession } = get();
    const companySlug = useOrg.getState().slug;
    if (!apiBaseUrl) throw new Error('EXPO_PUBLIC_API_URL is not set');
    if (!companySlug) throw new Error('Company slug is missing');
    if (!refreshToken) throw new Error('Missing refresh token');

    const timeout = abortAfter(20_000);
    let res: Response;
    try {
      res = await fetch(`${apiBaseUrl}/v1/${PORTAL}/auth/session/refresh`, {
        method: 'POST',
        headers: {
          Accept: 'application/json',
          'Content-Type': 'application/json',
          'company-slug': companySlug,
          'X-Client-Source': 'mobile',
        },
        body: JSON.stringify({ refresh_token: refreshToken }),
        signal: timeout.signal,
      });
    } catch (err) {
      if (err instanceof Error && err.name === 'AbortError') {
        throw new Error('Session refresh timed out. Check your connection and try again.');
      }
      if (isNetworkFailure(err)) throw new ApiError(NETWORK_FAILURE_MESSAGE, 0);
      throw err;
    } finally {
      timeout.cancel();
    }

    const payload = (await res.json().catch(() => ({}))) as AuthPayload;
    if (!res.ok) {
      if (res.status === 401 || res.status === 403) {
        await clearSession();
        throw new ApiError('Session expired', res.status);
      }
      throw new ApiError(
        errorMessageFromPayload(payload as Record<string, unknown>, res.status) ||
          'Token refresh failed',
        res.status,
      );
    }

    try {
      await get().applyAuthPayload(payload);
    } catch (err) {
      await clearSession();
      throw err;
    }
  },

  logout: async () => {
    const { accessToken, clearSession } = get();
    const companySlug = useOrg.getState().slug;

    if (apiBaseUrl && accessToken && companySlug) {
      const timeout = abortAfter(4_000);
      try {
        await fetch(`${apiBaseUrl}/v1/${PORTAL}/auth/session`, {
          method: 'DELETE',
          headers: {
            Accept: 'application/json',
            Authorization: `Bearer ${accessToken}`,
            'company-slug': companySlug,
            'X-Client-Source': 'mobile',
          },
          signal: timeout.signal,
        });
      } catch {
        /* still clear locally */
      } finally {
        timeout.cancel();
      }
    }

    await clearSession();
  },
}));

export function pickNextRoute(): '/home' | '/login' | '/company' {
  const { isAuthenticated, accessToken, refreshToken } = useAuth.getState();
  const { slug } = useOrg.getState();
  if (isAuthenticated && accessToken && refreshToken) return '/home';
  if (slug) return '/login';
  return '/company';
}
