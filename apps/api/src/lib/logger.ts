import pino from 'pino';

export const pinoOptions: pino.LoggerOptions = {
  level: process.env['LOG_LEVEL'] ?? 'info',
  transport:
    process.env['NODE_ENV'] !== 'production'
      ? { target: 'pino-pretty', options: { colorize: true } }
      : undefined,
  redact: {
    paths: [
      'req.headers.authorization',
      'req.headers.cookie',
      'req.body.password',
      'req.body.passwordConfirm',
      'req.body.email',
      'req.body.token',
      'req.body.refreshToken',
      'res.body.user.email',
      'res.body.accessToken',
      'res.body.refreshToken',
      '*.phoneEncrypted',
      '*.chipNumberEncrypted',
      '*.passwordHash',
      '*.resetTokenHash',
      '*.emailVerifyTokenHash',
    ],
    censor: '[REDACTED]',
  },
};

// Standalone logger for use outside of Fastify request context (plugins, libs, etc.)
export const logger = pino(pinoOptions);
