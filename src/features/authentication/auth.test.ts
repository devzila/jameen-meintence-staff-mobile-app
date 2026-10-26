import { pickNextRoute, useAuth } from '@/store/auth';
import { useOrg } from '@/store/org';
import { saveTokens } from '@/services/secureStorage';
import * as SecureStore from 'expo-secure-store';

describe('authentication session', () => {
  const originalFetch = global.fetch;

  beforeEach(() => {
    useAuth.setState({
      accessToken: null,
      refreshToken: null,
      email: null,
      staff: null,
      sessionId: null,
      accessExpiresAt: null,
      isAuthenticated: false,
      hydrated: true,
    });
    useOrg.setState({ slug: 'suncity', company: null, hydrated: true });
    jest.clearAllMocks();
  });

  afterEach(() => {
    global.fetch = originalFetch;
  });

  it('restores a session when both tokens exist', async () => {
    (require('expo-secure-store').getItemAsync as jest.Mock).mockImplementation(
      async (key: string) => {
        if (key.includes('access')) return 'access-token';
        if (key.includes('refresh')) return 'refresh-token';
        return null;
      },
    );

    await useAuth.getState().hydrate();

    expect(useAuth.getState().isAuthenticated).toBe(true);
    expect(useAuth.getState().accessToken).toBe('access-token');
    expect(pickNextRoute()).toBe('/home');
  });

  it('clears the session on logout', async () => {
    await saveTokens('access-token', 'refresh-token');
    useAuth.setState({
      accessToken: 'access-token',
      refreshToken: 'refresh-token',
      isAuthenticated: true,
    });

    await useAuth.getState().clearSession();

    expect(useAuth.getState().isAuthenticated).toBe(false);
    expect(useAuth.getState().accessToken).toBeNull();
    expect(SecureStore.deleteItemAsync).toHaveBeenCalled();
    expect(pickNextRoute()).toBe('/login');
  });

  it('sends unauthenticated users without a company to company entry', () => {
    useOrg.setState({ slug: null });
    expect(pickNextRoute()).toBe('/company');
  });

  it('keeps the session when token refresh hits a 500', async () => {
    useAuth.setState({
      accessToken: 'access-token',
      refreshToken: 'refresh-token',
      isAuthenticated: true,
    });
    global.fetch = jest.fn().mockResolvedValue({
      ok: false,
      status: 500,
      json: async () => ({ message: 'Internal Server Error' }),
    }) as jest.Mock;

    await expect(useAuth.getState().refreshAccessToken()).rejects.toThrow('Internal Server Error');
    expect(useAuth.getState().isAuthenticated).toBe(true);
    expect(useAuth.getState().refreshToken).toBe('refresh-token');
  });

  it('clears the session only when refresh is rejected as unauthorized', async () => {
    useAuth.setState({
      accessToken: 'access-token',
      refreshToken: 'refresh-token',
      isAuthenticated: true,
    });
    global.fetch = jest.fn().mockResolvedValue({
      ok: false,
      status: 401,
      json: async () => ({ message: 'Invalid refresh token' }),
    }) as jest.Mock;

    await expect(useAuth.getState().refreshAccessToken()).rejects.toThrow('Session expired');
    expect(useAuth.getState().isAuthenticated).toBe(false);
    expect(useAuth.getState().refreshToken).toBeNull();
  });
});
