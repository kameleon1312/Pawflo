import './lib/sentry'; // must be first — instruments Node.js before other modules load
import path from 'path';
import Fastify from 'fastify';
import { createSocketServer } from './lib/socket';
import multipart from '@fastify/multipart';
import staticFiles from '@fastify/static';
import * as Sentry from '@sentry/node';
import { logger, pinoOptions } from './lib/logger';
import { UPLOADS_DIR } from './lib/storage';
import { registerSecurity } from './plugins/security';
import { prismaPlugin } from './plugins/prisma';
import { authRoutes } from './routes/auth';
import { userRoutes } from './routes/users';
import { dogRoutes } from './routes/dogs';
import { swipeRoutes } from './routes/swipes';
import { matchRoutes } from './routes/matches';
import { healthRoutes } from './routes/health';
import { chatRoutes } from './routes/chat';
import { placeRoutes } from './routes/places';
import { waitlistRoutes } from './routes/waitlist';

const app = Fastify({
  logger: pinoOptions,   // pass config object — Fastify creates its own pino instance
  bodyLimit: 1_048_576,  // 1 MB — prevents payload flooding
  trustProxy: true,      // correct client IP behind reverse proxy / load balancer
});

// Prevent internal error details from leaking to clients in production.
// Fastify's default handler exposes error.message which can include Prisma schema details.
app.setErrorHandler((error, req, reply) => {
  req.log.error({ err: error, url: req.url, method: req.method }, 'Unhandled error');

  const statusCode = error.statusCode ?? 500;
  const isServerError = statusCode >= 500;

  if (isServerError) {
    Sentry.captureException(error, { extra: { url: req.url, method: req.method } });
  }

  if (process.env['NODE_ENV'] === 'production' && isServerError) {
    return reply.status(statusCode).send({ error: 'Błąd serwera. Spróbuj ponownie później.' });
  }

  return reply.status(statusCode).send({
    error: error.message,
    ...(error.validation && { details: error.validation }),
  });
});

function validateEnv(): void {
  const key = process.env['ENCRYPTION_KEY'];
  if (!key) throw new Error('ENCRYPTION_KEY must be set');
  if (Buffer.from(key, 'base64').length !== 32) throw new Error('ENCRYPTION_KEY must be 32 bytes (base64-encoded)');
}

async function bootstrap(): Promise<void> {
  validateEnv();
  await registerSecurity(app);

  await app.register(multipart, { limits: { fileSize: 5 * 1024 * 1024, files: 1 } });

  // Serve locally-uploaded files in dev (when S3 is not configured).
  await app.register(staticFiles, { root: UPLOADS_DIR, prefix: '/uploads/' });
  await app.register(prismaPlugin);

  await app.register(authRoutes, { prefix: '/api/auth' });
  await app.register(userRoutes, { prefix: '/api/users' });
  await app.register(dogRoutes, { prefix: '/api/dogs' });
  await app.register(swipeRoutes, { prefix: '/api/swipes' });
  await app.register(matchRoutes, { prefix: '/api/matches' });
  await app.register(healthRoutes, { prefix: '/api/health' });
  await app.register(chatRoutes,   { prefix: '/api/matches' });
  await app.register(placeRoutes,  { prefix: '/api/places' });
  await app.register(waitlistRoutes, { prefix: '/api' });

  app.get('/health', async () => ({ status: 'ok', timestamp: new Date().toISOString() }));

  const port = Number(process.env['PORT'] ?? 3001);
  await app.listen({ port, host: '0.0.0.0' });

  // Attach Socket.io to the underlying Node.js http.Server after Fastify binds the port
  createSocketServer(app.server);
}

bootstrap().catch((err) => {
  logger.error(err, 'Failed to start server');
  process.exit(1);
});
