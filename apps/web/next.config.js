/** @type {import('next').NextConfig} */

const securityHeaders = [
  // Prevent MIME-type sniffing
  { key: 'X-Content-Type-Options', value: 'nosniff' },
  // Block framing from other origins (clickjacking protection)
  { key: 'X-Frame-Options', value: 'SAMEORIGIN' },
  // Minimal referrer leak
  { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
  // Restrict browser features
  { key: 'Permissions-Policy', value: 'camera=(), microphone=(), geolocation=(self)' },
  // DNS prefetch for performance + privacy balance
  { key: 'X-DNS-Prefetch-Control', value: 'on' },
  // CSP — Next.js App Router requires 'unsafe-inline' for styles; tighten with nonces in Phase 2
  {
    key: 'Content-Security-Policy',
    value: [
      "default-src 'self'",
      "script-src 'self' 'unsafe-inline' 'unsafe-eval'",
      "style-src 'self' 'unsafe-inline'",
      "img-src 'self' data: https:",
      "font-src 'self' https://fonts.gstatic.com",
      "connect-src 'self'",
      "frame-ancestors 'none'",
    ].join('; '),
  },
];

const nextConfig = {
  experimental: {
    optimizePackageImports: ['@pawflo/theme', '@pawflo/validation'],
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

module.exports = nextConfig;
