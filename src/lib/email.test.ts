import { isValidEmail } from '@/lib/email';

describe('email', () => {
  it('accepts a normal address and rejects incomplete ones', () => {
    expect(isValidEmail('guard@acme.com')).toBe(true);
    expect(isValidEmail('  Guard@Acme.com  ')).toBe(true);
    expect(isValidEmail('guard@')).toBe(false);
    expect(isValidEmail('not-an-email')).toBe(false);
    expect(isValidEmail('')).toBe(false);
  });
});
