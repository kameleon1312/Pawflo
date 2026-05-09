import { describe, it, expect } from 'vitest';
import { formatDate, formatDateShort, formatRelative, dogAge } from '../date';

describe('formatDate', () => {
  it('formats ISO date in Polish long form', () => {
    expect(formatDate('2024-03-15T00:00:00.000Z')).toMatch(/15/);
    expect(formatDate('2024-03-15T00:00:00.000Z')).toMatch(/2024/);
  });
});

describe('formatDateShort', () => {
  it('returns DD.MM.YYYY format', () => {
    expect(formatDateShort('2024-03-05T00:00:00.000Z')).toMatch(/\d{2}\.\d{2}\.\d{4}/);
  });
});

describe('formatRelative', () => {
  it('returns "teraz" for very recent timestamps', () => {
    expect(formatRelative(new Date().toISOString())).toBe('teraz');
  });

  it('returns minutes for timestamps under 1 hour', () => {
    const fiveMinutesAgo = new Date(Date.now() - 5 * 60_000).toISOString();
    expect(formatRelative(fiveMinutesAgo)).toContain('min');
  });

  it('returns hours for timestamps between 1h and 24h', () => {
    const twoHoursAgo = new Date(Date.now() - 2 * 3_600_000).toISOString();
    expect(formatRelative(twoHoursAgo)).toContain('godz.');
  });

  it('returns days for timestamps between 1 and 7 days', () => {
    const threeDaysAgo = new Date(Date.now() - 3 * 86_400_000).toISOString();
    expect(formatRelative(threeDaysAgo)).toContain('dni');
  });
});

describe('dogAge', () => {
  it('returns "poniżej miesiąca" for newborns', () => {
    const yesterday = new Date(Date.now() - 86_400_000).toISOString();
    expect(dogAge(yesterday)).toBe('poniżej miesiąca');
  });

  it('returns months for dogs under 1 year', () => {
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);
    expect(dogAge(sixMonthsAgo.toISOString())).toContain('mies.');
  });

  it('returns years for adult dogs', () => {
    const threeYearsAgo = new Date();
    threeYearsAgo.setFullYear(threeYearsAgo.getFullYear() - 3);
    expect(dogAge(threeYearsAgo.toISOString())).toBe('3 l.');
  });

  it('returns years and months for dogs with partial year', () => {
    const twoYearsFourMonthsAgo = new Date();
    twoYearsFourMonthsAgo.setFullYear(twoYearsFourMonthsAgo.getFullYear() - 2);
    twoYearsFourMonthsAgo.setMonth(twoYearsFourMonthsAgo.getMonth() - 4);
    expect(dogAge(twoYearsFourMonthsAgo.toISOString())).toContain('2 l.');
    expect(dogAge(twoYearsFourMonthsAgo.toISOString())).toContain('mies.');
  });
});
