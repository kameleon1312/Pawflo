import type { FastifyInstance } from 'fastify';
import { z } from 'zod';
import { encrypt, decrypt } from '@pawflo/utils';
import { DeleteAccountSchema } from '@pawflo/validation';
import { verifyPassword } from '../lib/crypto';
import { requireAuth } from '../middleware/requireAuth';
import { logger } from '../lib/logger';

const PushTokenSchema = z.object({
  token: z.string().regex(/^ExponentPushToken\[.+\]$/).max(300),
});

const UpdateProfileSchema = z.object({
  firstName: z.string().min(1).max(100).trim().optional(),
  lastName:  z.string().min(1).max(100).trim().optional(),
  phone:     z.string().regex(/^\+?[0-9\s\-()+]{7,20}$/).trim().nullable().optional(),
});

export async function userRoutes(app: FastifyInstance): Promise<void> {
  app.addHook('preHandler', requireAuth);

  // POST /api/users/push-token — register/refresh Expo push token after login
  app.post('/push-token', async (req, reply) => {
    const parsed = PushTokenSchema.safeParse(req.body);
    if (!parsed.success) return reply.status(422).send({ error: 'Nieprawidłowy token push.' });

    await app.prisma.user.update({
      where: { id: req.userId! },
      data: { pushToken: parsed.data.token },
    });

    return reply.status(204).send();
  });

  // GET /api/users/me — session restore on mobile app startup
  app.get('/me', async (req, reply) => {
    const user = await app.prisma.user.findFirst({
      where: { id: req.userId!, deletedAt: null },
      select: { id: true, email: true, emailVerified: true, plan: true, firstName: true, lastName: true, phoneEncrypted: true },
    });

    if (!user) return reply.status(404).send({ error: 'Użytkownik nie znaleziony.' });

    const dogCount = await app.prisma.dog.count({
      where: { ownerId: req.userId!, deletedAt: null },
    });

    const { phoneEncrypted, ...rest } = user;
    return reply.send({
      user: { ...rest, phone: phoneEncrypted ? decrypt(phoneEncrypted) : null },
      hasDog: dogCount > 0,
    });
  });

  // PATCH /api/users/me — update display name and phone
  app.patch('/me', async (req, reply) => {
    const parsed = UpdateProfileSchema.safeParse(req.body);
    if (!parsed.success) {
      return reply.status(422).send({ error: 'Nieprawidłowe dane.', details: parsed.error.flatten() });
    }

    const { phone, ...rest } = parsed.data;
    const user = await app.prisma.user.update({
      where: { id: req.userId! },
      data: {
        ...rest,
        ...(phone !== undefined ? { phoneEncrypted: phone ? encrypt(phone) : null } : {}),
      },
      select: { id: true, email: true, emailVerified: true, plan: true, firstName: true, lastName: true, phoneEncrypted: true },
    });

    const { phoneEncrypted, ...userRest } = user;
    return reply.send({ user: { ...userRest, phone: phoneEncrypted ? decrypt(phoneEncrypted) : null } });
  });

  // GET /api/users/me/export — RODO data portability
  app.get('/me/export', async (req, reply) => {
    const userId = req.userId!;

    const user = await app.prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true, email: true, emailVerified: true,
        firstName: true, lastName: true, phoneEncrypted: true,
        plan: true, planExpiresAt: true,
        locationCity: true, locationConsent: true,
        consentTerms: true, consentPrivacy: true, consentMarketing: true,
        createdAt: true, updatedAt: true, lastLoginAt: true,
        dogs: {
          where: { deletedAt: null },
          select: {
            id: true, name: true, breed: true, birthDate: true,
            sex: true, size: true, chipNumberEncrypted: true,
            bio: true, traits: true, activityLevel: true, weight: true,
            createdAt: true,
            photos:        { select: { url: true, order: true } },
            weightHistory: { select: { weightKg: true, date: true }, orderBy: { date: 'asc' } },
            vaccinations:  { select: { name: true, date: true, validUntil: true } },
            visits:        { select: { date: true, notes: true } },
            medications:   { select: { name: true, startDate: true, endDate: true, dosage: true, frequency: true } },
            allergies:     { select: { name: true, severity: true, notes: true } },
            swipesGiven:   { select: { direction: true, createdAt: true } },
          },
        },
        auditLogs: { select: { action: true, createdAt: true }, orderBy: { createdAt: 'asc' } },
      },
    });

    if (!user) return reply.status(404).send({ error: 'Użytkownik nie znaleziony.' });

    const dogIds = user.dogs.map((d) => d.id);
    const matches = await app.prisma.match.findMany({
      where: { OR: [{ dogAId: { in: dogIds } }, { dogBId: { in: dogIds } }] },
      select: {
        id: true, status: true, createdAt: true, lastMessageAt: true,
        messages: { select: { senderId: true, text: true, createdAt: true }, orderBy: { createdAt: 'asc' } },
      },
    });

    // Decrypt sensitive fields before exporting
    const { phoneEncrypted, dogs, ...userRest } = user;
    const formattedDogs = dogs.map(({ chipNumberEncrypted, ...dog }) => ({
      ...dog,
      chipNumber: chipNumberEncrypted ? decrypt(chipNumberEncrypted) : null,
    }));

    await app.prisma.auditLog.create({
      data: { userId, action: 'DATA_EXPORT' },
    });

    logger.info({ event: 'user.export', userId }, 'Data export requested');

    reply.header('Content-Disposition', `attachment; filename="pawflo-export-${userId}.json"`);
    return reply.send({
      exportedAt: new Date().toISOString(),
      user: { ...userRest, phone: phoneEncrypted ? decrypt(phoneEncrypted) : null },
      dogs: formattedDogs,
      matches,
      _note: 'Eksport danych zgodny z art. 20 RODO. Dane przechowywane przez PawFlo sp. z o.o.',
    });
  });

  // DELETE /api/users/me — RODO right to be forgotten (soft delete, 30-day window)
  app.delete('/me', async (req, reply) => {
    const parsed = DeleteAccountSchema.safeParse(req.body);
    if (!parsed.success) {
      return reply.status(422).send({ error: 'Podaj hasło, aby potwierdzić usunięcie konta.' });
    }

    const user = await app.prisma.user.findUnique({
      where: { id: req.userId! },
      select: { id: true, passwordHash: true },
    });
    if (!user) return reply.status(404).send({ error: 'Użytkownik nie znaleziony.' });

    const valid = await verifyPassword(user.passwordHash, parsed.data.password);
    if (!valid) {
      return reply.status(401).send({ error: 'Nieprawidłowe hasło.' });
    }

    await app.prisma.$transaction([
      app.prisma.user.update({
        where: { id: user.id },
        data: { deletedAt: new Date() },
      }),
      app.prisma.refreshToken.updateMany({
        where: { userId: user.id, revokedAt: null },
        data: { revokedAt: new Date() },
      }),
      app.prisma.auditLog.create({
        data: { userId: user.id, action: 'ACCOUNT_DELETE' },
      }),
    ]);

    logger.info({ event: 'user.delete', userId: user.id }, 'Account soft-deleted');
    return reply.status(204).send();
  });
}
