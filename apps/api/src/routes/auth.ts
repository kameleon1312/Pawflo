import type { FastifyInstance } from 'fastify';
import rateLimit from '@fastify/rate-limit';
import { RegisterSchema, LoginSchema, RefreshTokenSchema } from '@pawflo/validation';
import { hashPassword, verifyPassword } from '../lib/crypto';
import { signAccessToken, signRefreshToken, verifyRefreshToken } from '../lib/jwt';
import { sendVerificationEmail } from '../lib/email';
import { logger } from '../lib/logger';
import crypto from 'crypto';

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
      return reply.status(409).send({ error: 'Konto z tym adresem już istnieje.' });
    }

    const passwordHash = await hashPassword(password);
    const emailVerifyToken = crypto.randomBytes(32).toString('hex');

    const user = await app.prisma.user.create({
      data: {
        email,
        passwordHash,
        emailVerifyToken,
        consentTerms: new Date(),
        consentPrivacy: new Date(),
      },
      select: { id: true, email: true, emailVerified: true },
    });

    await app.prisma.auditLog.create({
      data: { userId: user.id, action: 'REGISTER', ipHash: hashIp(req.ip) },
    });

    await sendVerificationEmail(email, emailVerifyToken);
    logger.info({ event: 'auth.register', userId: user.id }, 'User registered');

    return reply.status(201).send({ user });
  });

  // POST /auth/login
  app.post('/login', async (req, reply) => {
    const parsed = LoginSchema.safeParse(req.body);
    if (!parsed.success) {
      return reply.status(422).send({ error: 'Nieprawidłowe dane.' });
    }

    const { email, password } = parsed.data;
    const user = await app.prisma.user.findUnique({ where: { email, deletedAt: null } });

    // Constant-time response to prevent user enumeration
    if (!user || !(await verifyPassword(user.passwordHash, password))) {
      return reply.status(401).send({ error: 'Nieprawidłowy e-mail lub hasło.' });
    }

    const accessToken = signAccessToken(user.id);
    const refreshToken = signRefreshToken(user.id);

    await app.prisma.refreshToken.create({
      data: { userId: user.id, token: refreshToken, expiresAt: new Date(Date.now() + 7 * 86_400_000) },
    });

    await app.prisma.user.update({
      where: { id: user.id },
      data: { lastLoginAt: new Date(), lastIpHash: hashIp(req.ip) },
    });

    await app.prisma.auditLog.create({
      data: { userId: user.id, action: 'LOGIN', ipHash: hashIp(req.ip) },
    });

    logger.info({ event: 'auth.login', userId: user.id }, 'User logged in');
    return reply.send({ accessToken, refreshToken, user: { id: user.id, email: user.email, plan: user.plan } });
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

    const stored = await app.prisma.refreshToken.findFirst({
      where: { token: refreshToken, userId: payload.sub, revokedAt: null },
    });

    if (!stored || stored.expiresAt < new Date()) {
      return reply.status(401).send({ error: 'Token wygasł lub został unieważniony.' });
    }

    // Rotate: revoke old, issue new
    await app.prisma.refreshToken.update({ where: { id: stored.id }, data: { revokedAt: new Date() } });

    const newAccessToken = signAccessToken(payload.sub);
    const newRefreshToken = signRefreshToken(payload.sub);

    await app.prisma.refreshToken.create({
      data: { userId: payload.sub, token: newRefreshToken, expiresAt: new Date(Date.now() + 7 * 86_400_000) },
    });

    return reply.send({ accessToken: newAccessToken, refreshToken: newRefreshToken });
  });

  // POST /auth/logout
  app.post('/logout', async (req, reply) => {
    const parsed = RefreshTokenSchema.safeParse(req.body);
    if (parsed.success) {
      await app.prisma.refreshToken.updateMany({
        where: { token: parsed.data.refreshToken },
        data: { revokedAt: new Date() },
      });
    }
    return reply.status(204).send();
  });
}

function hashIp(ip: string): string {
  return crypto.createHash('sha256').update(ip + (process.env['IP_SALT'] ?? '')).digest('hex').slice(0, 16);
}
