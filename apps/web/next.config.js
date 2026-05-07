/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    // Enable optimized package imports for workspace packages
    optimizePackageImports: ['@pawflow/theme', '@pawflow/validation'],
  },
  images: {
    formats: ['image/avif', 'image/webp'],
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '*.r2.cloudflarestorage.com',
      },
    ],
  },
  // Transpile workspace packages (they ship as raw TS)
  transpilePackages: ['@pawflow/theme', '@pawflow/validation', '@pawflow/utils'],
};

module.exports = nextConfig;
