import fp from 'fastify-plugin';
import type { FastifyInstance } from 'fastify';
import { PrismaClient } from '@prisma/client';

declare module 'fastify' {
  interface FastifyInstance {
    prisma: PrismaClient;
  }
}

export const prismaPlugin = fp(async (app: FastifyInstance) => {
  const prisma = new PrismaClient({
    log: process.env['NODE_ENV'] === 'production' ? ['error'] : ['query', 'error'],
  });

  await prisma.$connect();
  app.decorate('prisma', prisma);
  app.addHook('onClose', async () => prisma.$disconnect());
});
