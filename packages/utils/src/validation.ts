// Lightweight runtime helpers — heavy validation lives in @pawflow/validation (Zod).

export function isValidEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim());
}

// Polish mobile: +48 followed by 9 digits, or 9 digits starting with 4-9.
export function isValidPolishPhone(phone: string): boolean {
  const digits = phone.replace(/\D/g, '');
  if (digits.startsWith('48') && digits.length === 11) return /^[4-9]/.test(digits[2] ?? '');
  if (digits.length === 9) return /^[4-9]/.test(digits[0] ?? '');
  return false;
}

export function formatPolishPhone(phone: string): string {
  const digits = phone.replace(/\D/g, '');
  const local = digits.startsWith('48') ? digits.slice(2) : digits;
  if (local.length !== 9) return phone;
  return `+48 ${local.slice(0, 3)} ${local.slice(3, 6)} ${local.slice(6)}`;
}

export function slugify(text: string): string {
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/[^a-z0-9\s-]/g, '')
    .trim()
    .replace(/\s+/g, '-');
}
