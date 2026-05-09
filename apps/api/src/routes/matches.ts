import type { FastifyInstance } from 'fastify';
import { requireAuth } from '../middleware/requireAuth';

export async function matchRoutes(app: FastifyInstance): Promise<void> {
  app.addHook('preHandler', requireAuth);

  // GET /api/matches — all MATCHED pairs for the current user's dog
  app.get('/', async (req, reply) => {
    const myDog = await app.prisma.dog.findFirst({
      where: { ownerId: req.userId!, deletedAt: null },
      select: { id: true },
    });
    if (!myDog) return reply.send({ matches: [] });

    const matches = await app.prisma.match.findMany({
      where: {
        OR: [{ dogAId: myDog.id }, { dogBId: myDog.id }],
        status: 'MATCHED',
      },
      include: {
        messages: {
          orderBy: { createdAt: 'desc' },
          take: 1,
          select: { text: true, createdAt: true },
        },
      },
      orderBy: [{ lastMessageAt: 'desc' }, { createdAt: 'desc' }],
    });

    const otherDogIds = matches.map((m) =>
      m.dogAId === myDog.id ? m.dogBId : m.dogAId,
    );

    const otherDogs = await app.prisma.dog.findMany({
      where: { id: { in: otherDogIds }, deletedAt: null },
      include: { photos: { orderBy: { order: 'asc' }, take: 1 } },
    });

    const dogMap = new Map(otherDogs.map((d) => [d.id, d]));

    const result = matches.map((m) => {
      const otherDogId = m.dogAId === myDog.id ? m.dogBId : m.dogAId;
      const other = dogMap.get(otherDogId);
      const last = m.messages[0] ?? null;
      return {
        id: m.id,
        status: m.status,
        createdAt: m.createdAt,
        lastMessageAt: m.lastMessageAt,
        lastMessage: last
          ? { text: last.text, createdAt: last.createdAt.toISOString() }
          : null,
        otherDog: other
          ? {
              id: other.id,
              name: other.name,
              breed: other.breed,
              sex: other.sex,
              size: other.size,
              activityLevel: other.activityLevel,
              photos: other.photos,
            }
          : null,
      };
    });

    return reply.send({ matches: result });
  });

  // DELETE /api/matches/:matchId — unmatch
  app.delete('/:matchId', async (req, reply) => {
    const { matchId } = req.params as { matchId: string };

    const myDog = await app.prisma.dog.findFirst({
      where: { ownerId: req.userId!, deletedAt: null },
      select: { id: true },
    });
    if (!myDog) return reply.status(404).send({ error: 'Nie znaleziono psa.' });

    const match = await app.prisma.match.findFirst({
      where: {
        id: matchId,
        OR: [{ dogAId: myDog.id }, { dogBId: myDog.id }],
        status: 'MATCHED',
      },
      select: { id: true },
    });
    if (!match) return reply.status(404).send({ error: 'Dopasowanie nie istnieje.' });

    await app.prisma.match.update({
      where: { id: match.id },
      data: { status: 'UNMATCHED' },
    });

    return reply.status(204).send();
  });
}
