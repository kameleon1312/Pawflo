import { config } from 'dotenv';
// Load apps/api/.env so DATABASE_URL is available for route integration tests.
// override: false preserves any test-specific env vars already set by vitest.config.ts
config({ override: false });
