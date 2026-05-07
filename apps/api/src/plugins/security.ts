import type { FastifyInstance } from 'fastify';
import helmet from '@fastify/helmet';
import cors from '@fastify/cors';
import rateLimit from '@fastify/rate-limit';

export async function registerSecurity(app: FastifyInstance): Promise<void> {
  if (process.env['NODE_ENV'] === 'production' && !process.env['CORS_ORIGIN']) {
    throw new Error('CORS_ORIGIN must be set in production');
  }

  await app.register(helmet, {
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        scriptSrc: ["'self'"],
        styleSrc: ["'self'", "'unsafe-inline'"],
        imgSrc: ["'self'", 'data:', 'https://*.r2.cloudflarestorage.com'],
      },
    },
    hsts: { maxAge: 31_536_000, includeSubDomains: true, preload: true },
  });

  await app.register(cors, {
    origin: (process.env['CORS_ORIGIN'] ?? 'http://localhost:3000').split(','),
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  });

  await app.register(rateLimit, {
    max: 100,
    timeWindow: '1 minute',
    keyGenerator: (req) => req.ip,
  });
}
