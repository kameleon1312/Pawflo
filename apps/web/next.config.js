/** @type {import('next').NextConfig} */
const { withSentryConfig } = require('@sentry/nextjs');

const securityHeaders = [
  { key: 'X-Content-Type-Options', value: 'nosniff' },
  { key: 'X-Frame-Options', value: 'SAMEORIGIN' },
  { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
  { key: 'Permissions-Policy', value: 'camera=(), microphone=(), geolocation=(self)' },
  { key: 'X-DNS-Prefetch-Control', value: 'on' },
  {
    key: 'Content-Security-Policy',
    value: [
      "default-src 'self'",
      "script-src 'self' 'unsafe-inline' 'unsafe-eval'",
      "style-src 'self' 'unsafe-inline'",
      "img-src 'self' data: https:",
      "font-src 'self' https://fonts.gstatic.com",
      // Allow Sentry error reporting endpoint
      "connect-src 'self' https://*.ingest.de.sentry.io https://*.ingest.sentry.io",
      "frame-ancestors 'none'",
      // Allow Sentry Session Replay worker
      "worker-src 'self' blob:",
    ].join('; '),
  },
];

/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    optimizePackageImports: ['@pawflo/theme', '@pawflo/validation'],
    // Required for instrumentation.ts to run in Next.js < 14.6
    instrumentationHook: true,
  },
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: securityHeaders,
      },
    ];
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
  transpilePackages: ['@pawflo/theme', '@pawflo/validation', '@pawflo/utils'],
};

module.exports = withSentryConfig(nextConfig, {
  // org + project needed only for source map uploads — fill in when SENTRY_AUTH_TOKEN is ready
  // org: process.env.SENTRY_ORG,
  // project: process.env.SENTRY_PROJECT,
  silent: !process.env.CI,
  hideSourceMaps: true,
  telemetry: false,
  disableLogger: true,
  automaticVercelMonitors: false,
});
