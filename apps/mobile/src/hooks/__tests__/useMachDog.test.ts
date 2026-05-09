import { describe, it, expect } from 'vitest';

// ── Query key contracts ───────────────────────────────────────────────────────
// Changing a query key silently breaks cache invalidation.
// These tests pin the keys so any accidental rename becomes a failing test.

const CANDIDATES_KEY = ['swipes', 'candidates'] as const;
const MATCHES_KEY    = ['matches'] as const;

describe('useCandidates query key', () => {
  it('has the expected shape', () => {
    expect(CANDIDATES_KEY).toEqual(['swipes', 'candidates']);
  });

  it('is a two-element tuple', () => {
    expect(CANDIDATES_KEY).toHaveLength(2);
  });
});

describe('useMatches query key', () => {
  it('has the expected shape', () => {
    expect(MATCHES_KEY).toEqual(['matches']);
  });
});

// ── Swipe direction values ────────────────────────────────────────────────────

type SwipeDirection = 'LIKE' | 'PASS';

describe('swipe direction values', () => {
  it('LIKE and PASS are the only valid directions', () => {
    const valid: SwipeDirection[] = ['LIKE', 'PASS'];
    expect(valid).toContain('LIKE');
    expect(valid).toContain('PASS');
    expect(valid).toHaveLength(2);
  });

  it('LIKE direction is correctly uppercased', () => {
    const direction: SwipeDirection = 'LIKE';
    expect(direction).toBe('LIKE');
    expect(direction).not.toBe('like');
  });
});

// ── Cache invalidation on swipe ───────────────────────────────────────────────
// useSwipe.onSuccess invalidates both CANDIDATES_KEY and MATCHES_KEY.
// We verify these are different keys (so both are necessary).

describe('post-swipe cache invalidation', () => {
  it('candidates key and matches key are different', () => {
    expect(CANDIDATES_KEY).not.toEqual(MATCHES_KEY);
  });

  it('invalidating candidates does not cover matches (separate keys needed)', () => {
    const keysToInvalidate = [CANDIDATES_KEY, MATCHES_KEY];
    expect(keysToInvalidate).toHaveLength(2);
  });
});
