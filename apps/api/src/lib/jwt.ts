import jwt from 'jsonwebtoken';

const ACCESS_SECRET = process.env['JWT_ACCESS_SECRET']!;
const REFRESH_SECRET = process.env['JWT_REFRESH_SECRET']!;

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
  return jwt.verify(token, ACCESS_SECRET, JWT_OPTIONS) as { sub: string };
}

export function verifyRefreshToken(token: string): { sub: string } {
  return jwt.verify(token, REFRESH_SECRET, JWT_OPTIONS) as { sub: string };
}
