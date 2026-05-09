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
      return {
        id: m.id,
        status: m.status,
        createdAt: m.createdAt,
        lastMessageAt: m.lastMessageAt,
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
}
