import type { FastifyInstance } from 'fastify';
import rateLimit from '@fastify/rate-limit';
import { RegisterSchema, LoginSchema, RefreshTokenSchema, VerifyEmailSchema, ForgotPasswordSchema, ResetPasswordSchema } from '@pawflo/validation';
import { hashPassword, verifyPassword } from '../lib/crypto';
import { signAccessToken, signRefreshToken, verifyRefreshToken, hashToken, IP_SALT } from '../lib/jwt';
import { sendVerificationEmail, sendPasswordResetEmail } from '../lib/email';
import { logger } from '../lib/logger';
import crypto from 'crypto';

// Computed once on first login attempt — guarantees constant-time response
// when the requested email does not exist (prevents timing-based enumeration).
let timingProtectionHash: Promise<string> | undefined;
function getTimingHash(): Promise<string> {
  if (!timingProtectionHash) {
    timingProtectionHash = hashPassword('__timing_protection_dummy__');
  }
  return timingProtectionHash;
}

export async function authRoutes(app: FastifyInstance): Promise<void> {
  // Strict rate limit on auth endpoints: 5 attempts per 15 min per IP
  await app.register(rateLimit, {
    max: 5,
    timeWindow: '15 minutes',
    keyGenerator: (req) => `auth:${req.ip}`,
  });

  // POST /auth/register
  app.post('/register', async (req, reply) => {
    const parsed = RegisterSchema.safeParse(req.body);
    if (!parsed.success) {
      return reply.status(422).send({ error: 'Nieprawidłowe dane.', details: parsed.error.flatten() });
    }

    const { email, password } = parsed.data;
    const existing = await app.prisma.user.findUnique({ where: { email } });

    if (existing) {
      // Silent: don't reveal whether this email is registered (anti-enumeration)
      logger.warn({ event: 'auth.register.duplicate', userId: existing.id }, 'Duplicate register attempt');
      return reply.status(201).send({ ok: true });
    }

    const passwordHash = await hashPassword(password);
    const rawToken = crypto.randomBytes(32).toString('hex');
    const emailVerifyTokenHash = hashToken(rawToken);

    const user = await app.prisma.user.create({
      data: {
        email,
        passwordHash,
        emailVerifyTokenHash,
        consentTerms: new Date(),
        consentPrivacy: new Date(),
      },
      select: { id: true },
    });

    await app.prisma.auditLog.create({
      data: { userId: user.id, action: 'REGISTER', ipHash: hashIp(req.ip) },
    });

    await sendVerificationEmail(email, rawToken);
    logger.info({ event: 'auth.register', userId: user.id }, 'User registered');

    return reply.status(201).send({ ok: true });
  });

  // POST /auth/login
  app.post('/login', async (req, reply) => {
    const parsed = LoginSchema.safeParse(req.body);
    if (!parsed.success) {
      return reply.status(422).send({ error: 'Nieprawidłowe dane.' });
    }

    const { email, password } = parsed.data;
    const user = await app.prisma.user.findUnique({ where: { email, deletedAt: null } });

    // Always run Argon2 — short-circuiting on !user would create a timing oracle
    // that reveals whether an email exists (~1ms vs ~100ms difference).
    const hashToVerify = user?.passwordHash ?? (await getTimingHash());
    const passwordValid = await verifyPassword(hashToVerify, password);

    if (!user || !passwordValid) {
      return reply.status(401).send({ error: 'Nieprawidłowy e-mail lub hasło.' });
    }

    if (!user.emailVerified) {
      return reply.status(403).send({ error: 'Potwierdź adres e-mail przed zalogowaniem.', code: 'EMAIL_NOT_VERIFIED' });
    }

    const accessToken = signAccessToken(user.id);
    const rawRefreshToken = signRefreshToken(user.id);

    // Store only the hash of the refresh token — raw JWT never written to DB.
    await app.prisma.refreshToken.create({
      data: {
        userId: user.id,
        token: hashToken(rawRefreshToken),
        expiresAt: new Date(Date.now() + 7 * 86_400_000),
      },
    });

    await app.prisma.user.update({
      where: { id: user.id },
      data: { lastLoginAt: new Date(), lastIpHash: hashIp(req.ip) },
    });

    await app.prisma.auditLog.create({
      data: { userId: user.id, action: 'LOGIN', ipHash: hashIp(req.ip) },
    });

    const dogCount = await app.prisma.dog.count({ where: { ownerId: user.id, deletedAt: null } });

    logger.info({ event: 'auth.login', userId: user.id }, 'User logged in');
    return reply.send({ accessToken, refreshToken: rawRefreshToken, user: { id: user.id, email: user.email, emailVerified: user.emailVerified, plan: user.plan }, hasDog: dogCount > 0 });
  });

  // POST /auth/refresh
  app.post('/refresh', async (req, reply) => {
    const parsed = RefreshTokenSchema.safeParse(req.body);
    if (!parsed.success) return reply.status(422).send({ error: 'Nieprawidłowe dane.' });

    const { refreshToken } = parsed.data;

    let payload: { sub: string };
    try {
      payload = verifyRefreshToken(refreshToken);
    } catch {
      return reply.status(401).send({ error: 'Token nieprawidłowy lub wygasły.' });
    }

    const tokenHash = hashToken(refreshToken);
    const stored = await app.prisma.refreshToken.findFirst({
      where: { token: tokenHash, userId: payload.sub, revokedAt: null },
    });

    if (!stored || stored.expiresAt < new Date()) {
      return reply.status(401).send({ error: 'Token wygasł lub został unieważniony.' });
    }

    // Rotate: revoke old, issue new
    await app.prisma.refreshToken.update({ where: { id: stored.id }, data: { revokedAt: new Date() } });

    const newAccessToken = signAccessToken(payload.sub);
    const newRawRefreshToken = signRefreshToken(payload.sub);

    await app.prisma.refreshToken.create({
      data: {
        userId: payload.sub,
        token: hashToken(newRawRefreshToken),
        expiresAt: new Date(Date.now() + 7 * 86_400_000),
      },
    });

    return reply.send({ accessToken: newAccessToken, refreshToken: newRawRefreshToken });
  });

  // POST /auth/verify-email
  app.post('/verify-email', async (req, reply) => {
    const parsed = VerifyEmailSchema.safeParse(req.body);
    if (!parsed.success) {
      return reply.status(422).send({ error: 'Nieprawidłowe dane.' });
    }

    const tokenHash = hashToken(parsed.data.token);

    const user = await app.prisma.user.findFirst({
      where: { emailVerifyTokenHash: tokenHash },
      select: { id: true, emailVerified: true },
    });

    if (!user) {
      return reply.status(400).send({ error: 'Link weryfikacyjny wygasł lub jest nieprawidłowy.' });
    }

    if (user.emailVerified) {
      return reply.send({ ok: true });
    }

    await app.prisma.user.update({
      where: { id: user.id },
      data: { emailVerified: true, emailVerifyTokenHash: null },
    });

    logger.info({ event: 'auth.verify_email', userId: user.id }, 'Email verified');
    return reply.send({ ok: true });
  });

  // POST /auth/forgot-password
  app.post('/forgot-password', async (req, reply) => {
    const parsed = ForgotPasswordSchema.safeParse(req.body);
    if (!parsed.success) return reply.status(422).send({ error: 'Nieprawidłowe dane.' });

    const { email } = parsed.data;
    const user = await app.prisma.user.findUnique({ where: { email, deletedAt: null } });

    // Always return ok — never reveal whether email is registered.
    if (user) {
      const rawToken = crypto.randomBytes(32).toString('hex');
      await app.prisma.user.update({
        where: { id: user.id },
        data: {
          resetTokenHash: hashToken(rawToken),
          resetTokenExp: new Date(Date.now() + 60 * 60 * 1000), // 1 hour
        },
      });
      await sendPasswordResetEmail(email, rawToken);
      logger.info({ event: 'auth.forgot_password', userId: user.id }, 'Password reset email sent');
    }

    return reply.send({ ok: true });
  });

  // POST /auth/reset-password
  app.post('/reset-password', async (req, reply) => {
    const parsed = ResetPasswordSchema.safeParse(req.body);
    if (!parsed.success) {
      return reply.status(422).send({ error: 'Nieprawidłowe dane.', details: parsed.error.flatten() });
    }

    const { token, password } = parsed.data;
    const tokenHash = hashToken(token);

    const user = await app.prisma.user.findFirst({
      where: { resetTokenHash: tokenHash },
      select: { id: true, resetTokenExp: true },
    });

    if (!user || !user.resetTokenExp || user.resetTokenExp < new Date()) {
      return reply.status(400).send({ error: 'Link do resetu hasła wygasł lub jest nieprawidłowy.' });
    }

    const passwordHash = await hashPassword(password);

    await app.prisma.$transaction([
      app.prisma.user.update({
        where: { id: user.id },
        data: { passwordHash, resetTokenHash: null, resetTokenExp: null },
      }),
      // Revoke all active sessions — new password means fresh login required.
      app.prisma.refreshToken.updateMany({
        where: { userId: user.id, revokedAt: null },
        data: { revokedAt: new Date() },
      }),
      app.prisma.auditLog.create({
        data: { userId: user.id, action: 'PASSWORD_CHANGE', ipHash: hashIp(req.ip) },
      }),
    ]);

    logger.info({ event: 'auth.reset_password', userId: user.id }, 'Password reset successful');
    return reply.send({ ok: true });
  });

  // POST /auth/logout
  app.post('/logout', async (req, reply) => {
    const parsed = RefreshTokenSchema.safeParse(req.body);
    if (parsed.success) {
      await app.prisma.refreshToken.updateMany({
        where: { token: hashToken(parsed.data.refreshToken) },
        data: { revokedAt: new Date() },
      });
    }
    return reply.status(204).send();
  });
}

function hashIp(ip: string): string {
  return crypto.createHash('sha256').update(ip + IP_SALT).digest('hex').slice(0, 16);
}
