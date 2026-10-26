import { accessTokenExpiryMs, accessTokenNeedsRefresh } from '@/lib/jwt';

function tokenWithExp(expSeconds: number) {
  const payload = Buffer.from(JSON.stringify({ exp: expSeconds })).toString('base64url');
  return `aaa.${payload}.sig`;
}

describe('access token expiry', () => {
  it('reads exp from a JWT payload', () => {
    expect(accessTokenExpiryMs(tokenWithExp(1_700_000_000))).toBe(1_700_000_000_000);
  });

  it('refreshes when the token is inside the skew window', () => {
    const now = 1_700_000_000_000;
    expect(accessTokenNeedsRefresh(tokenWithExp(1_700_000_040), now)).toBe(true);
    expect(accessTokenNeedsRefresh(tokenWithExp(1_700_000_400), now)).toBe(false);
  });
});
