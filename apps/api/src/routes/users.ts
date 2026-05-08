import type { FastifyInstance } from 'fastify';
import { z } from 'zod';
import { requireAuth } from '../middleware/requireAuth';

const UpdateProfileSchema = z.object({
  firstName: z.string().min(1).max(100).trim().optional(),
  lastName:  z.string().min(1).max(100).trim().optional(),
});

export async function userRoutes(app: FastifyInstance): Promise<void> {
  app.addHook('preHandler', requireAuth);

  // GET /api/users/me — session restore on mobile app startup
  app.get('/me', async (req, reply) => {
    const user = await app.prisma.user.findFirst({
      where: { id: req.userId!, deletedAt: null },
      select: { id: true, email: true, plan: true, firstName: true, lastName: true },
    });

    if (!user) return reply.status(404).send({ error: 'Użytkownik nie znaleziony.' });

    const dogCount = await app.prisma.dog.count({
      where: { ownerId: req.userId!, deletedAt: null },
    });

    return reply.send({ user, hasDog: dogCount > 0 });
  });

  // PATCH /api/users/me — update display name
  app.patch('/me', async (req, reply) => {
    const parsed = UpdateProfileSchema.safeParse(req.body);
    if (!parsed.success) {
      return reply.status(422).send({ error: 'Nieprawidłowe dane.', details: parsed.error.flatten() });
    }

    const user = await app.prisma.user.update({
      where: { id: req.userId! },
      data: parsed.data,
      select: { id: true, email: true, plan: true, firstName: true, lastName: true },
    });

    return reply.send({ user });
  });
}
