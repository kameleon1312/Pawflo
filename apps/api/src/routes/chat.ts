import type { FastifyInstance } from 'fastify';
import { SendMessageSchema } from '@pawflo/validation';
import { requireAuth } from '../middleware/requireAuth';

async function getMatchForUser(
  app: FastifyInstance,
  matchId: string,
  userId: string,
) {
  const myDog = await app.prisma.dog.findFirst({
    where: { ownerId: userId, deletedAt: null },
    select: { id: true },
  });
  if (!myDog) return null;

  const match = await app.prisma.match.findFirst({
    where: {
      id: matchId,
      OR: [{ dogAId: myDog.id }, { dogBId: myDog.id }],
      status: 'MATCHED',
    },
  });
  return match ? { myDogId: myDog.id, match } : null;
}

export async function chatRoutes(app: FastifyInstance): Promise<void> {
  app.addHook('preHandler', requireAuth);

  // GET /api/matches/:matchId/messages — load last 60 messages (oldest → newest)
  app.get('/:matchId/messages', async (req, reply) => {
    const { matchId } = req.params as { matchId: string };

    const ctx = await getMatchForUser(app, matchId, req.userId!);
    if (!ctx) return reply.status(404).send({ error: 'Rozmowa nie znaleziona.' });

    const messages = await app.prisma.message.findMany({
      where: { matchId },
      orderBy: { createdAt: 'asc' },
      take: 60,
    });

    return reply.send({ messages });
  });

  // POST /api/matches/:matchId/messages — send a message
  app.post('/:matchId/messages', async (req, reply) => {
    const { matchId } = req.params as { matchId: string };

    const ctx = await getMatchForUser(app, matchId, req.userId!);
    if (!ctx) return reply.status(404).send({ error: 'Rozmowa nie znaleziona.' });

    const parsed = SendMessageSchema.safeParse(req.body);
    if (!parsed.success) {
      return reply.status(422).send({ error: 'Wiadomość nie może być pusta.' });
    }

    const [message] = await app.prisma.$transaction([
      app.prisma.message.create({
        data: {
          matchId,
          senderId: req.userId!,
          text: parsed.data.text,
        },
      }),
      app.prisma.match.update({
        where: { id: matchId },
        data: { lastMessageAt: new Date() },
      }),
    ]);

    return reply.status(201).send({ message });
  });
}
