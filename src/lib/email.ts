const EMAIL_RE = /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i;

export function isValidEmail(value: string) {
  const email = value.trim();
  return EMAIL_RE.test(email);
}
