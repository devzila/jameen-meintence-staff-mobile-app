function normalizedDigits(value: string) {
  let digits = value.replace(/\D/g, '');
  if (digits.startsWith('91') && digits.length >= 12) {
    digits = digits.slice(2);
  } else if (digits.startsWith('0') && digits.length === 11) {
    digits = digits.slice(1);
  }
  return digits;
}

/** Staff mobiles are Indian 10-digit numbers. Non-digits are ignored while typing. */
export function phoneDigits(value: string) {
  return normalizedDigits(value).slice(0, 10);
}

export function isTenDigitPhone(value: string) {
  return /^\d{10}$/.test(normalizedDigits(value));
}

export function isBlankOrTenDigitPhone(value: string) {
  const digits = value.replace(/\D/g, '');
  return digits.length === 0 || isTenDigitPhone(value);
}
