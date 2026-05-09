import type { FastifyInstance } from 'fastify';
import { SwipeSchema } from '@pawflo/validation';
import { requireAuth } from '../middleware/requireAuth';
import { logger } from '../lib/logger';
import { sendMatchPush } from '../lib/push';

export async function swipeRoutes(app: FastifyInstance): Promise<void> {
  app.addHook('preHandler', requireAuth);

  // GET /api/swipes/candidates — dogs to swipe on (not yet seen by current user's dog)
  app.get('/candidates', async (req, reply) => {
    const myDog = await app.prisma.dog.findFirst({
      where: { ownerId: req.userId!, deletedAt: null },
      select: { id: true },
    });
    if (!myDog) return reply.status(404).send({ error: 'Nie masz psa w profilu.' });

    const swiped = await app.prisma.swipe.findMany({
      where: { swiperId: myDog.id },
      select: { swipeeId: true },
    });
    const swipedIds = swiped.map((s) => s.swipeeId);

    const candidates = await app.prisma.dog.findMany({
      where: {
        id: { notIn: [myDog.id, ...swipedIds] },
        deletedAt: null,
        ownerId: { not: req.userId! },
      },
      include: {
        photos: { orderBy: { order: 'asc' }, take: 3 },
        owner: { select: { locationCity: true } },
      },
      take: 20,
      orderBy: { createdAt: 'desc' },
    });

    return reply.send({ candidates });
  });

  // POST /api/swipes — record a swipe; returns { matched, matchId }
  app.post('/', async (req, reply) => {
    const parsed = SwipeSchema.safeParse(req.body);
    if (!parsed.success) {
      return reply.status(422).send({ error: 'Nieprawidłowe dane.', details: parsed.error.flatten() });
    }

    const { swipeeId, direction } = parsed.data;

    const myDog = await app.prisma.dog.findFirst({
      where: { ownerId: req.userId!, deletedAt: null },
      select: { id: true, name: true },
    });
    if (!myDog) return reply.status(404).send({ error: 'Nie masz psa w profilu.' });

    if (myDog.id === swipeeId) {
      return reply.status(400).send({ error: 'Nie możesz polubić własnego psa.' });
    }

    await app.prisma.swipe.upsert({
      where: { swiperId_swipeeId: { swiperId: myDog.id, swipeeId } },
      create: { swiperId: myDog.id, swipeeId, direction },
      update: { direction },
    });

    let matched = false;
    let matchId: string | undefined;

    if (direction === 'LIKE') {
      const reverse = await app.prisma.swipe.findUnique({
        where: { swiperId_swipeeId: { swiperId: swipeeId, swipeeId: myDog.id } },
      });

      if (reverse?.direction === 'LIKE') {
        // Sort IDs to guarantee consistent (dogAId, dogBId) ordering for the unique constraint
        const ids = [myDog.id, swipeeId].sort();
        const dogAId = ids[0]!;
        const dogBId = ids[1]!;

        const match = await app.prisma.match.upsert({
          where: { dogAId_dogBId: { dogAId, dogBId } },
          create: { dogAId, dogBId, status: 'MATCHED' },
          update: { status: 'MATCHED' },
        });
        matched = true;
        matchId = match.id;
        logger.info({ event: 'match.create', matchId: match.id }, 'New match created');

        // Notify the other dog's owner — they LIKE'd first and don't know it's a match yet
        const otherDog = await app.prisma.dog.findUnique({
          where: { id: swipeeId },
          select: { owner: { select: { pushToken: true } } },
        });
        void sendMatchPush(otherDog?.owner.pushToken, myDog.name);
      }
    }

    return reply.status(201).send({ matched, matchId });
  });
}
