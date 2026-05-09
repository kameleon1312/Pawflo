import jwt from 'jsonwebtoken';
import crypto from 'crypto';

function requireEnv(name: string, minLength = 32): string {
  const value = process.env[name];
  if (!value || value.length < minLength) {
    throw new Error(`${name} must be set and at least ${minLength} characters`);
  }
  return value;
}

// Fail fast at startup — missing or weak secrets cause a throw before any request is served.
const ACCESS_SECRET  = requireEnv('JWT_ACCESS_SECRET');
const REFRESH_SECRET = requireEnv('JWT_REFRESH_SECRET');
export const IP_SALT = requireEnv('IP_SALT', 16);

const JWT_OPTIONS = {
  issuer: 'pawflo.app',
  audience: 'pawflo-mobile',
  algorithm: 'HS256',
} as const;

export function signAccessToken(userId: string): string {
  return jwt.sign({ sub: userId, type: 'access' }, ACCESS_SECRET, {
    ...JWT_OPTIONS,
    expiresIn: '15m',
  });
}

export function signRefreshToken(userId: string): string {
  return jwt.sign({ sub: userId, type: 'refresh' }, REFRESH_SECRET, {
    ...JWT_OPTIONS,
    expiresIn: '7d',
  });
}

export function verifyAccessToken(token: string): { sub: string } {
  const payload = jwt.verify(token, ACCESS_SECRET, JWT_OPTIONS) as { sub: string; type: string };
  if (payload.type !== 'access') throw new Error('Invalid token type');
  return { sub: payload.sub };
}

export function verifyRefreshToken(token: string): { sub: string } {
  const payload = jwt.verify(token, REFRESH_SECRET, JWT_OPTIONS) as { sub: string; type: string };
  if (payload.type !== 'refresh') throw new Error('Invalid token type');
  return { sub: payload.sub };
}

// Store only a SHA-256 hash of tokens in DB — raw JWT never persisted.
export function hashToken(token: string): string {
  return crypto.createHash('sha256').update(token).digest('hex');
}
