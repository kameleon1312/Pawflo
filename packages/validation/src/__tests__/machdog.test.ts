import { describe, it, expect } from 'vitest';
import { SwipeSchema, SendMessageSchema } from '../machdog';

// ── SwipeSchema ──────────────────────────────────────────────────────────────

describe('SwipeSchema', () => {
  it('accepts LIKE direction', () => {
    expect(SwipeSchema.safeParse({ swipeeId: 'dog-1', direction: 'LIKE' }).success).toBe(true);
  });

  it('accepts PASS direction', () => {
    expect(SwipeSchema.safeParse({ swipeeId: 'dog-1', direction: 'PASS' }).success).toBe(true);
  });

  it('rejects invalid direction', () => {
    expect(SwipeSchema.safeParse({ swipeeId: 'dog-1', direction: 'MAYBE' }).success).toBe(false);
  });

  it('rejects empty swipeeId', () => {
    expect(SwipeSchema.safeParse({ swipeeId: '', direction: 'LIKE' }).success).toBe(false);
  });

  it('rejects missing swipeeId', () => {
    expect(SwipeSchema.safeParse({ direction: 'LIKE' }).success).toBe(false);
  });

  it('rejects missing direction', () => {
    expect(SwipeSchema.safeParse({ swipeeId: 'dog-1' }).success).toBe(false);
  });
});

// ── SendMessageSchema ────────────────────────────────────────────────────────

describe('SendMessageSchema', () => {
  it('accepts a normal message', () => {
    expect(SendMessageSchema.safeParse({ text: 'Hej!' }).success).toBe(true);
  });

  it('trims surrounding whitespace', () => {
    const result = SendMessageSchema.safeParse({ text: '  hello  ' });
    expect(result.success).toBe(true);
    if (result.success) expect(result.data.text).toBe('hello');
  });

  it('rejects an empty string', () => {
    expect(SendMessageSchema.safeParse({ text: '' }).success).toBe(false);
  });

  it('rejects a whitespace-only string (after trim)', () => {
    expect(SendMessageSchema.safeParse({ text: '   ' }).success).toBe(false);
  });

  it('accepts a message exactly 2000 chars long', () => {
    expect(SendMessageSchema.safeParse({ text: 'a'.repeat(2000) }).success).toBe(true);
  });

  it('rejects a message longer than 2000 chars', () => {
    expect(SendMessageSchema.safeParse({ text: 'a'.repeat(2001) }).success).toBe(false);
  });
});
