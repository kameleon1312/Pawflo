import Fastify, { type FastifyInstance } from 'fastify';
import { prismaPlugin } from '../../plugins/prisma';
import { signAccessToken } from '../../lib/jwt';
import { hashPassword } from '../../lib/crypto';

export async function buildApp(
  routePlugin: (app: FastifyInstance) => Promise<void>,
  prefix = '/',
) {
  const app = Fastify({ logger: false });
  await app.register(prismaPlugin);
  await app.register(routePlugin, { prefix });
  await app.ready();
  return app;
}

export async function createVerifiedUser(
  app: FastifyInstance,
  email: string,
  password = 'TestPass123!',
) {
  const passwordHash = await hashPassword(password);
  const user = await app.prisma.user.create({
    data: {
      email,
      passwordHash,
      emailVerified: true,
      consentTerms: new Date(),
      consentPrivacy: new Date(),
    },
  });
  return { user, password, accessToken: signAccessToken(user.id) };
}

export async function createDog(app: FastifyInstance, ownerId: string, name = 'TestDog') {
  return app.prisma.dog.create({
    data: { ownerId, name, sex: 'MALE', size: 'MEDIUM' },
  });
}

export async function cleanupUsers(app: FastifyInstance, userIds: string[]) {
  if (userIds.length === 0) return;
  const dogs = await app.prisma.dog.findMany({
    where: { ownerId: { in: userIds } },
    select: { id: true },
  });
  const dogIds = dogs.map((d) => d.id);
  if (dogIds.length > 0) {
    await app.prisma.match.deleteMany({
      where: { OR: [{ dogAId: { in: dogIds } }, { dogBId: { in: dogIds } }] },
    });
  }
  await app.prisma.user.deleteMany({ where: { id: { in: userIds } } });
}

// Each call returns a different IP to bypass auth rate-limiting in tests
let ipCounter = 1;
export function nextIp() {
  return `10.0.${Math.floor(ipCounter / 254)}.${(ipCounter++ % 254) + 1}`;
}
