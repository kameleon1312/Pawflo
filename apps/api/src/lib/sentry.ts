import { config } from 'dotenv';
config({ path: '.env.local' }); // load before anything else touches process.env

import * as Sentry from '@sentry/node';

// Must be called before any other imports that should be instrumented.
// nodeProfilingIntegration is optional — add @sentry/profiling-node if needed later.
Sentry.init({
  dsn: process.env['SENTRY_DSN'],
  environment: process.env['NODE_ENV'] ?? 'development',
  // Capture 10% of traces in production
  tracesSampleRate: process.env['NODE_ENV'] === 'production' ? 0.1 : 1.0,
  // Don't send events in development unless DSN is explicitly set
  enabled: Boolean(process.env['SENTRY_DSN']),
});

export { Sentry };
