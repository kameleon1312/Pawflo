import { defineConfig } from 'vitest/config';
import path from 'path';

export default defineConfig({
  resolve: {
    alias: {
      // Mirror the @/ alias defined in babel-plugin-module-resolver
      '@': path.resolve(__dirname, 'src'),
    },
  },
  test: {
    // Pure TS logic tests only — no React Native rendering environment needed
    environment: 'node',
  },
});
