const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const COUNTRY_CODE_RE = /^\+\d{1,4}$/;
const PHONE_DIGITS_RE = /^\d{6,12}$/;

export function isValidEmail(email: string): boolean {
  return EMAIL_RE.test(email.trim());
}

export function isValidCountryCode(code: string): boolean {
  return COUNTRY_CODE_RE.test(code.trim());
}

export function isValidPhoneNumber(number: string): boolean {
  return PHONE_DIGITS_RE.test(number.trim());
}
