import { isBlankOrTenDigitPhone, isTenDigitPhone, phoneDigits } from '@/lib/phone';

describe('staff phone numbers', () => {
  it('keeps only the first 10 digits while typing', () => {
    expect(phoneDigits('98 765-43210')).toBe('9876543210');
    expect(phoneDigits('9876543210123')).toBe('9876543210');
    expect(phoneDigits('+91 98765 43210')).toBe('9876543210');
    expect(phoneDigits('09876543210')).toBe('9876543210');
  });

  it('accepts only a complete 10-digit number', () => {
    expect(isTenDigitPhone('9876543210')).toBe(true);
    expect(isTenDigitPhone('98765')).toBe(false);
    expect(isTenDigitPhone('98765432101')).toBe(false);
    expect(isTenDigitPhone('')).toBe(false);
    expect(isTenDigitPhone('abcdefghij')).toBe(false);
  });

  it('allows a blank optional phone', () => {
    expect(isBlankOrTenDigitPhone('')).toBe(true);
    expect(isBlankOrTenDigitPhone('98765')).toBe(false);
    expect(isBlankOrTenDigitPhone('9876543210')).toBe(true);
  });
});
