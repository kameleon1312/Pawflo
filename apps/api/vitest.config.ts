import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    env: {
      JWT_ACCESS_SECRET:  'test-access-secret-minimum-32-chars!!',
      JWT_REFRESH_SECRET: 'test-refresh-secret-minimum-32-chars!',
      IP_SALT:            'test-ip-salt-16ch',
      ENCRYPTION_KEY:     Buffer.alloc(32, 0xab).toString('base64'),
    },
  },
});
