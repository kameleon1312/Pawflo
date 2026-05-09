import { describe, it, expect, beforeAll } from 'vitest';
import { encrypt, decrypt } from '../encryption';

const TEST_KEY = Buffer.alloc(32, 0xab).toString('base64');

beforeAll(() => {
  process.env['ENCRYPTION_KEY'] = TEST_KEY;
});

describe('encrypt / decrypt', () => {
  it('round-trips a plain string', () => {
    const plain = 'test@example.com';
    expect(decrypt(encrypt(plain))).toBe(plain);
  });

  it('round-trips a chip number', () => {
    const chip = '985141004123456';
    expect(decrypt(encrypt(chip))).toBe(chip);
  });

  it('round-trips a string with special characters', () => {
    const special = 'Ząbek & Łódź 123!@#';
    expect(decrypt(encrypt(special))).toBe(special);
  });

  it('produces different ciphertext each call (random IV)', () => {
    const plain = 'same input';
    expect(encrypt(plain)).not.toBe(encrypt(plain));
  });

  it('decrypt throws on tampered ciphertext', () => {
    const ciphertext = encrypt('sensitive');
    const buf = Buffer.from(ciphertext, 'base64');
    buf[30] ^= 0xff; // flip bits in encrypted body
    expect(() => decrypt(buf.toString('base64'))).toThrow();
  });

  it('throws when ENCRYPTION_KEY is not set', () => {
    const orig = process.env['ENCRYPTION_KEY'];
    delete process.env['ENCRYPTION_KEY'];
    expect(() => encrypt('x')).toThrow('ENCRYPTION_KEY is not set');
    process.env['ENCRYPTION_KEY'] = orig;
  });

  it('throws when ENCRYPTION_KEY has wrong length', () => {
    process.env['ENCRYPTION_KEY'] = Buffer.alloc(16).toString('base64'); // 16 bytes, not 32
    expect(() => encrypt('x')).toThrow('32 bytes');
    process.env['ENCRYPTION_KEY'] = TEST_KEY;
  });
});
