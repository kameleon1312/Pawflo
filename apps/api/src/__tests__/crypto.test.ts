import { describe, it, expect } from 'vitest';
import { hashPassword, verifyPassword } from '../lib/crypto';

describe('hashPassword / verifyPassword', () => {
  it('produces a verifiable hash', async () => {
    const password = 'Str0ng!Password';
    const hash = await hashPassword(password);
    expect(await verifyPassword(hash, password)).toBe(true);
  }, 30_000);

  it('returns false for wrong password', async () => {
    const hash = await hashPassword('correct-password1!A');
    expect(await verifyPassword(hash, 'wrong-password1!A')).toBe(false);
  }, 30_000);

  it('produces different hashes for same password (random salt)', async () => {
    const password = 'SamePassword1!';
    const hash1 = await hashPassword(password);
    const hash2 = await hashPassword(password);
    expect(hash1).not.toBe(hash2);
  }, 30_000);

  it('hash contains argon2id identifier', async () => {
    const hash = await hashPassword('TestPassword1!');
    expect(hash).toMatch(/^\$argon2id\$/);
  }, 30_000);
});
