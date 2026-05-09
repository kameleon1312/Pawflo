import { describe, it, expect } from 'vitest';
// env vars are injected by vitest.config.ts before module load
import {
  signAccessToken,
  signRefreshToken,
  verifyAccessToken,
  verifyRefreshToken,
  hashToken,
} from '../lib/jwt';

describe('signAccessToken / verifyAccessToken', () => {
  it('issues and verifies a valid access token', () => {
    const userId = 'user-abc-123';
    const token = signAccessToken(userId);
    const { sub } = verifyAccessToken(token);
    expect(sub).toBe(userId);
  });

  it('throws when verifying a refresh token as access token', () => {
    // Different secrets mean signature check fails before type check — both are correct rejections
    const token = signRefreshToken('user-123');
    expect(() => verifyAccessToken(token)).toThrow();
  });

  it('throws on tampered token', () => {
    const token = signAccessToken('user-123');
    expect(() => verifyAccessToken(token + 'tampered')).toThrow();
  });
});

describe('signRefreshToken / verifyRefreshToken', () => {
  it('issues and verifies a valid refresh token', () => {
    const userId = 'user-xyz-456';
    const token = signRefreshToken(userId);
    const { sub } = verifyRefreshToken(token);
    expect(sub).toBe(userId);
  });

  it('throws when verifying an access token as refresh token', () => {
    const token = signAccessToken('user-123');
    expect(() => verifyRefreshToken(token)).toThrow();
  });
});

describe('hashToken', () => {
  it('returns a 64-character hex string', () => {
    expect(hashToken('sometoken')).toMatch(/^[a-f0-9]{64}$/);
  });

  it('produces consistent output for same input', () => {
    expect(hashToken('abc')).toBe(hashToken('abc'));
  });

  it('produces different output for different inputs', () => {
    expect(hashToken('abc')).not.toBe(hashToken('xyz'));
  });
});
