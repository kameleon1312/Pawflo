import type { FastifyInstance } from 'fastify';
import { z } from 'zod';
import { encrypt, decrypt } from '@pawflo/utils';
import { requireAuth } from '../middleware/requireAuth';

const UpdateProfileSchema = z.object({
  firstName: z.string().min(1).max(100).trim().optional(),
  lastName:  z.string().min(1).max(100).trim().optional(),
  phone:     z.string().regex(/^\+?[0-9\s\-()+]{7,20}$/).trim().nullable().optional(),
});

export async function userRoutes(app: FastifyInstance): Promise<void> {
  app.addHook('preHandler', requireAuth);

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
}
