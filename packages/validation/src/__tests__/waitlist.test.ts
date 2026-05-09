import { describe, it, expect } from 'vitest';
import { WaitlistSchema } from '../waitlist';

describe('WaitlistSchema', () => {
  it('accepts a minimal valid input', () => {
    expect(WaitlistSchema.safeParse({ email: 'jan@example.com' }).success).toBe(true);
  });

  it('accepts full input with city and acceptMarketing', () => {
    const result = WaitlistSchema.safeParse({
      email: '  Jan@Example.COM  ',
      city: 'Warszawa',
      acceptMarketing: true,
    });
    expect(result.success).toBe(true);
    if (result.success) {
      // email should be lowercased and trimmed
      expect(result.data.email).toBe('jan@example.com');
    }
  });

  it('defaults acceptMarketing to false when omitted', () => {
    const result = WaitlistSchema.safeParse({ email: 'test@example.com' });
    expect(result.success).toBe(true);
    if (result.success) expect(result.data.acceptMarketing).toBe(false);
  });

  it('rejects an invalid email', () => {
    expect(WaitlistSchema.safeParse({ email: 'not-an-email' }).success).toBe(false);
  });

  it('rejects an email longer than 255 chars', () => {
    const long = `${'a'.repeat(250)}@x.com`;
    expect(WaitlistSchema.safeParse({ email: long }).success).toBe(false);
  });

  it('rejects a city longer than 100 chars', () => {
    expect(WaitlistSchema.safeParse({ email: 'a@b.com', city: 'x'.repeat(101) }).success).toBe(false);
  });

  it('accepts missing city (optional field)', () => {
    expect(WaitlistSchema.safeParse({ email: 'a@b.com' }).success).toBe(true);
  });
});
