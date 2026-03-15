const isStaticExport = process.env.STATIC_EXPORT === 'true';

/** @type {import('next').NextConfig} */
const nextConfig = {
  transpilePackages: ['@portfolio/shared'],

  // Static export for GitHub Pages
  ...(isStaticExport && {
    output: 'export',
    images: { unoptimized: true },
  }),

  // Security headers (not supported in static export)
  ...(!isStaticExport && {
    async headers() {
      return [
        {
          source: '/(.*)',
          headers: [
            { key: 'X-Frame-Options', value: 'DENY' },
            { key: 'X-Content-Type-Options', value: 'nosniff' },
            { key: 'X-XSS-Protection', value: '1; mode=block' },
            { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
            { key: 'Permissions-Policy', value: 'camera=(), microphone=(), geolocation=()' },
            {
              key: 'Strict-Transport-Security',
              value: 'max-age=31536000; includeSubDomains; preload',
            },
            {
              key: 'Content-Security-Policy',
              value: [
                "default-src 'self'",
                "script-src 'self' 'unsafe-eval' 'unsafe-inline'",
                "style-src 'self' 'unsafe-inline'",
                "img-src 'self' data: blob:",
                `connect-src 'self' ${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'}`,
                "font-src 'self'",
                "object-src 'none'",
                "frame-src 'none'",
                "base-uri 'self'",
                "form-action 'self'",
              ].join('; '),
            },
          ],
        },
      ];
    },
  }),

  // Disable x-powered-by header
  poweredByHeader: false,
};

module.exports = nextConfig;
