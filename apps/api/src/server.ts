import Fastify from 'fastify';
import { logger, pinoOptions } from './lib/logger';
import { registerSecurity } from './plugins/security';
import { prismaPlugin } from './plugins/prisma';
import { authRoutes } from './routes/auth';
import { waitlistRoutes } from './routes/waitlist';

const app = Fastify({
  logger: pinoOptions,   // pass config object — Fastify creates its own pino instance
  bodyLimit: 1_048_576,  // 1 MB — prevents payload flooding
  trustProxy: true,      // correct client IP behind reverse proxy / load balancer
});

async function bootstrap(): Promise<void> {
  await registerSecurity(app);
  await app.register(prismaPlugin);

  await app.register(authRoutes, { prefix: '/api/auth' });
  await app.register(waitlistRoutes, { prefix: '/api' });

  app.get('/health', async () => ({ status: 'ok', timestamp: new Date().toISOString() }));

  const port = Number(process.env['PORT'] ?? 3001);
  await app.listen({ port, host: '0.0.0.0' });
}

bootstrap().catch((err) => {
  logger.error(err, 'Failed to start server');
  process.exit(1);
});
