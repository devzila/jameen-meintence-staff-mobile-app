const REFRESH_SKEW_MS = 90_000;

export function accessTokenExpiryMs(token: string | null | undefined): number | null {
  if (!token) return null;
  const parts = token.split('.');
  if (parts.length < 2) return null;
  try {
    let padded = parts[1].replace(/-/g, '+').replace(/_/g, '/');
    while (padded.length % 4) padded += '=';
    if (typeof atob !== 'function') return null;
    const json = atob(padded);
    const payload = JSON.parse(json) as { exp?: unknown };
    return typeof payload.exp === 'number' ? payload.exp * 1000 : null;
  } catch {
    return null;
  }
}

export function accessTokenNeedsRefresh(
  token: string | null | undefined,
  now = Date.now(),
): boolean {
  const exp = accessTokenExpiryMs(token);
  if (exp == null) return false;
  return exp - now <= REFRESH_SKEW_MS;
}
