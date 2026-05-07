import type { FastifyInstance } from 'fastify';
import rateLimit from '@fastify/rate-limit';
import { WaitlistSchema } from '@pawflo/validation';
import { logger } from '../lib/logger';

export async function waitlistRoutes(app: FastifyInstance): Promise<void> {
  // Strict limit — prevents DB spam and fake-email flooding
  await app.register(rateLimit, {
    max: 5,
    timeWindow: '1 hour',
    keyGenerator: (req) => `waitlist:${req.ip}`,
  });

  app.post('/waitlist', async (req, reply) => {
    const parsed = WaitlistSchema.safeParse(req.body);
    if (!parsed.success) {
      return reply.status(422).send({ error: 'Nieprawidłowe dane.', details: parsed.error.flatten() });
    }

    const { email, city, acceptMarketing } = parsed.data;

    const existing = await app.prisma.waitlist.findUnique({ where: { email } });
    if (existing) {
      // Silent success — don't reveal if email exists
      return reply.status(201).send({ ok: true });
    }

    await app.prisma.waitlist.create({ data: { email, city, acceptMarketing } });
    logger.info({ event: 'waitlist.signup', city }, 'New waitlist signup');

    return reply.status(201).send({ ok: true });
  });
}
