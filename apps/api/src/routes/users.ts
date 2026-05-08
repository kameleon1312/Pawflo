import type { FastifyInstance } from 'fastify';
import { requireAuth } from '../middleware/requireAuth';

export async function userRoutes(app: FastifyInstance): Promise<void> {
  app.addHook('preHandler', requireAuth);

  // GET /api/users/me — used for session restore on mobile app startup
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
}
