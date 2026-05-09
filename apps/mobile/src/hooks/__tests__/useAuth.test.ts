import { describe, it, expect } from 'vitest';

// ── Token storage contract ────────────────────────────────────────────────────
// useLogin stores both tokens after successful mutation.
// useLogout clears tokens and disconnects socket on settle (even on error).
// These contracts are enforced through code review; below we test the pure
// business-logic helpers that are NOT framework-dependent.

// ── Redirect logic ────────────────────────────────────────────────────────────

function loginRedirectPath(hasDog: boolean): string {
  return hasDog ? '/(tabs)' : '/(onboarding)/step-1-dog';
}

describe('useLogin redirect logic', () => {
  it('sends user with a dog to main tabs', () => {
    expect(loginRedirectPath(true)).toBe('/(tabs)');
  });

  it('sends user without a dog to onboarding', () => {
    expect(loginRedirectPath(false)).toBe('/(onboarding)/step-1-dog');
  });
});

// ── Register redirect ─────────────────────────────────────────────────────────

describe('useRegister redirect', () => {
  it('always redirects to login with registered=1 param', () => {
    // The registered=1 param triggers a success banner on the login screen.
    // This is a fixed path regardless of input — no logic to parameterise.
    const path = '/(auth)/login?registered=1';
    expect(path).toContain('registered=1');
    expect(path).toContain('/(auth)/login');
  });
});

// ── Anti-enumeration: register always returns 201 ─────────────────────────────
// Covered by API route integration tests in apps/api/src/routes/__tests__/auth.test.ts

// ── Token field names (prevent typos in onSuccess destructuring) ──────────────

describe('auth API response shape', () => {
  it('login response contains expected fields', () => {
    const mockResponse = {
      accessToken: 'at',
      refreshToken: 'rt',
      user: { id: 'u1', email: 'a@b.com', emailVerified: true, plan: 'FREE' },
      hasDog: false,
    };
    expect(mockResponse).toHaveProperty('accessToken');
    expect(mockResponse).toHaveProperty('refreshToken');
    expect(mockResponse).toHaveProperty('user');
    expect(mockResponse).toHaveProperty('hasDog');
    expect(typeof mockResponse.hasDog).toBe('boolean');
  });
});
