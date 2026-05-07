const LOCALE = 'pl-PL';
const TZ = 'Europe/Warsaw';

export function formatDate(iso: string): string {
  return new Intl.DateTimeFormat(LOCALE, {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    timeZone: TZ,
  }).format(new Date(iso));
}

export function formatDateShort(iso: string): string {
  return new Intl.DateTimeFormat(LOCALE, {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    timeZone: TZ,
  }).format(new Date(iso));
}

export function formatRelative(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  const minutes = Math.floor(diff / 60_000);
  const hours = Math.floor(diff / 3_600_000);
  const days = Math.floor(diff / 86_400_000);

  if (minutes < 1) return 'teraz';
  if (minutes < 60) return `${minutes} min temu`;
  if (hours < 24) return `${hours} godz. temu`;
  if (days < 7) return `${days} dni temu`;
  return formatDateShort(iso);
}

export function dogAge(birthDateIso: string): string {
  const birth = new Date(birthDateIso);
  const now = new Date();
  const months =
    (now.getFullYear() - birth.getFullYear()) * 12 +
    (now.getMonth() - birth.getMonth());

  if (months < 1) return 'poniżej miesiąca';
  if (months < 12) return `${months} mies.`;
  const years = Math.floor(months / 12);
  const rem = months % 12;
  return rem === 0 ? `${years} l.` : `${years} l. ${rem} mies.`;
}
