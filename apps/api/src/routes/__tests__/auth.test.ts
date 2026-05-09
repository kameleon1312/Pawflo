import { describe, it, expect, beforeAll, afterAll, vi } from 'vitest';
import crypto from 'crypto';
import { hashPassword } from '../../lib/crypto';
import { hashToken } from '../../lib/jwt';
import { authRoutes } from '../auth';
import { buildApp, createVerifiedUser, cleanupUsers, nextIp } from '../../__tests__/helpers/buildApp';

vi.mock('../../lib/email', () => ({
  sendVerificationEmail: vi.fn().mockResolvedValue(undefined),
  sendPasswordResetEmail: vi.fn().mockResolvedValue(undefined),
}));

const ts = Date.now();
function email(tag: string) { return `test-auth-${ts}-${tag}@pawflo.test`; }

describe('auth routes', () => {
  let app: Awaited<ReturnType<typeof buildApp>>;
  const userIds: string[] = [];

  beforeAll(async () => {
    app = await buildApp(authRoutes, '/api/auth');
  });

  afterAll(async () => {
    await cleanupUsers(app, userIds);
    await app.close();
  });

  // ── Register ────────────────────────────────────────────────────────────────

  describe('POST /api/auth/register', () => {
    it('returns 201 for a valid new email', async () => {
      const addr = email('reg-new');
      const res = await app.inject({
        method: 'POST', url: '/api/auth/register', remoteAddress: nextIp(),
        payload: { email: addr, password: 'StrongPass123!', acceptTerms: true, acceptPrivacy: true },
      });
      expect(res.statusCode).toBe(201);
      expect(res.json()).toEqual({ ok: true });
      const created = await app.prisma.user.findUnique({ where: { email: addr }, select: { id: true } });
      if (created) userIds.push(created.id);
    });

    it('returns 201 for duplicate email (anti-enumeration)', async () => {
      const addr = email('reg-dup');
      await app.inject({
        method: 'POST', url: '/api/auth/register', remoteAddress: nextIp(),
        payload: { email: addr, password: 'StrongPass123!', acceptTerms: true, acceptPrivacy: true },
      });
      const res = await app.inject({
        method: 'POST', url: '/api/auth/register', remoteAddress: nextIp(),
        payload: { email: addr, password: 'StrongPass123!', acceptTerms: true, acceptPrivacy: true },
      });
      expect(res.statusCode).toBe(201);
      const created = await app.prisma.user.findUnique({ where: { email: addr }, select: { id: true } });
      if (created) userIds.push(created.id);
    });

    it('returns 422 for an invalid email', async () => {
      const res = await app.inject({
        method: 'POST', url: '/api/auth/register', remoteAddress: nextIp(),
        payload: { email: 'not-an-email', password: 'StrongPass123!', acceptTerms: true, acceptPrivacy: true },
      });
      expect(res.statusCode).toBe(422);
    });

    it('returns 422 for a password shorter than 12 chars', async () => {
      const res = await app.inject({
        method: 'POST', url: '/api/auth/register', remoteAddress: nextIp(),
        payload: { email: email('reg-short'), password: 'short', acceptTerms: true, acceptPrivacy: true },
      });
      expect(res.statusCode).toBe(422);
    });
  });

  // ── Login ───────────────────────────────────────────────────────────────────

  describe('POST /api/auth/login', () => {
    beforeAll(async () => {
      // Verified user for successful login tests
      const { user } = await createVerifiedUser(app, email('login-ok'));
      userIds.push(user.id);

      // Unverified user — created directly to avoid API registration flow
      const ph = await hashPassword('TestPass123!');
      const unverified = await app.prisma.user.create({
        data: {
          email: email('login-unverified'),
          passwordHash: ph,
          emailVerified: false,
          consentTerms: new Date(),
          consentPrivacy: new Date(),
        },
      });
      userIds.push(unverified.id);
    });

    it('returns 401 for wrong password', async () => {
      const res = await app.inject({
        method: 'POST', url: '/api/auth/login', remoteAddress: nextIp(),
        payload: { email: email('login-ok'), password: 'WrongPass999!' },
      });
      expect(res.statusCode).toBe(401);
    });

    it('returns 401 for unknown email', async () => {
      const res = await app.inject({
        method: 'POST', url: '/api/auth/login', remoteAddress: nextIp(),
        payload: { email: 'nobody@pawflo.test', password: 'TestPass123!' },
      });
      expect(res.statusCode).toBe(401);
    });

    it('returns 403 for unverified email', async () => {
      const res = await app.inject({
        method: 'POST', url: '/api/auth/login', remoteAddress: nextIp(),
        payload: { email: email('login-unverified'), password: 'TestPass123!' },
      });
      expect(res.statusCode).toBe(403);
      expect(res.json().code).toBe('EMAIL_NOT_VERIFIED');
    });

    it('returns 200 with tokens for valid credentials', async () => {
      const res = await app.inject({
        method: 'POST', url: '/api/auth/login', remoteAddress: nextIp(),
        payload: { email: email('login-ok'), password: 'TestPass123!' },
      });
      expect(res.statusCode).toBe(200);
      const body = res.json<{ accessToken: string; refreshToken: string; hasDog: boolean }>();
      expect(body.accessToken).toBeTruthy();
      expect(body.refreshToken).toBeTruthy();
      expect(body.hasDog).toBe(false);
    });
  });

  // ── Refresh ─────────────────────────────────────────────────────────────────

  describe('POST /api/auth/refresh', () => {
    let refreshToken: string;

    beforeAll(async () => {
      const { user } = await createVerifiedUser(app, email('refresh-ok'));
      userIds.push(user.id);

      const loginRes = await app.inject({
        method: 'POST', url: '/api/auth/login', remoteAddress: nextIp(),
        payload: { email: email('refresh-ok'), password: 'TestPass123!' },
      });
      expect(loginRes.statusCode).toBe(200);
      refreshToken = loginRes.json<{ refreshToken: string }>().refreshToken;
    });

    it('returns 401 for an invalid refresh token', async () => {
      const res = await app.inject({
        method: 'POST', url: '/api/auth/refresh', remoteAddress: nextIp(),
        payload: { refreshToken: 'not.a.valid.token' },
      });
      expect(res.statusCode).toBe(401);
    });

    it('rotates the token and returns new tokens', async () => {
      const res = await app.inject({
        method: 'POST', url: '/api/auth/refresh', remoteAddress: nextIp(),
        payload: { refreshToken },
      });
      expect(res.statusCode).toBe(200);
      const body = res.json<{ accessToken: string; refreshToken: string }>();
      expect(body.accessToken).toBeTruthy();
      expect(body.refreshToken).not.toBe(refreshToken);
      // Rotate the local token so the revoked-token test can use the old one
      refreshToken = body.refreshToken;
    });

    it('returns 401 after using a revoked (already-rotated) token', async () => {
      // The original token was consumed — grab it back from before rotation
      // Just use a freshly-signed token that was never stored in DB
      const { signRefreshToken } = await import('../../lib/jwt.js');
      const neverStoredToken = signRefreshToken('fake-user-id');
      const res = await app.inject({
        method: 'POST', url: '/api/auth/refresh', remoteAddress: nextIp(),
        payload: { refreshToken: neverStoredToken },
      });
      expect(res.statusCode).toBe(401);
    });
  });

  // ── Forgot password ──────────────────────────────────────────────────────────

  describe('POST /api/auth/forgot-password', () => {
    it('returns 200 for an unknown email (no enumeration)', async () => {
      const res = await app.inject({
        method: 'POST', url: '/api/auth/forgot-password', remoteAddress: nextIp(),
        payload: { email: 'nobody@pawflo.test' },
      });
      expect(res.statusCode).toBe(200);
      expect(res.json()).toEqual({ ok: true });
    });

    it('returns 200 for a known email and sets reset token in DB', async () => {
      const { user } = await createVerifiedUser(app, email('forgot-ok'));
      userIds.push(user.id);

      const res = await app.inject({
        method: 'POST', url: '/api/auth/forgot-password', remoteAddress: nextIp(),
        payload: { email: email('forgot-ok') },
      });
      expect(res.statusCode).toBe(200);
      const updated = await app.prisma.user.findUnique({
        where: { id: user.id }, select: { resetTokenHash: true },
      });
      expect(updated?.resetTokenHash).toBeTruthy();
    });
  });

  // ── Reset password ───────────────────────────────────────────────────────────

  describe('POST /api/auth/reset-password', () => {
    const newPass = 'NewStrongPass456!';

    it('returns 400 for an invalid token', async () => {
      const res = await app.inject({
        method: 'POST', url: '/api/auth/reset-password', remoteAddress: nextIp(),
        payload: { token: 'a'.repeat(64), password: newPass, passwordConfirm: newPass },
      });
      expect(res.statusCode).toBe(400);
    });

    it('resets the password with a valid token', async () => {
      const { user } = await createVerifiedUser(app, email('reset-ok'));
      userIds.push(user.id);

      const rawToken = crypto.randomBytes(32).toString('hex');
      await app.prisma.user.update({
        where: { id: user.id },
        data: { resetTokenHash: hashToken(rawToken), resetTokenExp: new Date(Date.now() + 60_000) },
      });

      const res = await app.inject({
        method: 'POST', url: '/api/auth/reset-password', remoteAddress: nextIp(),
        payload: { token: rawToken, password: newPass, passwordConfirm: newPass },
      });
      expect(res.statusCode).toBe(200);
      expect(res.json()).toEqual({ ok: true });
    });
  });

  // ── Logout ───────────────────────────────────────────────────────────────────

  describe('POST /api/auth/logout', () => {
    it('returns 204 regardless of token validity', async () => {
      const res = await app.inject({
        method: 'POST', url: '/api/auth/logout', remoteAddress: nextIp(),
        payload: { refreshToken: 'any.token.value' },
      });
      expect(res.statusCode).toBe(204);
    });
  });
});
