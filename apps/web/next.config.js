/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    // Enable optimized package imports for workspace packages
    optimizePackageImports: ['@pawflo/theme', '@pawflo/validation'],
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
  transpilePackages: ['@pawflo/theme', '@pawflo/validation', '@pawflo/utils'],
};

module.exports = nextConfig;
