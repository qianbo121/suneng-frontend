import createNextIntlPlugin from 'next-intl/plugin';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const withNextIntl = createNextIntlPlugin('./src/i18n/request.ts');
const __dirname = path.dirname(fileURLToPath(import.meta.url));
const distDir = process.env.NEXT_DIST_DIR || (process.env.NODE_ENV === 'development' ? '.next-dev' : '.next');

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  distDir,
  // Keep each environment's generated route checks out of the other's program.
  // Source-only tsc uses tsconfig.json; Next still checks freshly generated types.
  typescript: {
    tsconfigPath: process.env.NODE_ENV === 'development'
      ? 'tsconfig.next-dev.json'
      : 'tsconfig.next-build.json',
  },
  // Keep frequently visited routes ready during local UI work instead of
  // rebuilding them after every short pause. These options only affect dev.
  onDemandEntries: {
    maxInactiveAge: 10 * 60 * 1000,
    pagesBufferLength: 12,
  },
  // isomorphic-dompurify pulls in jsdom for server-side sanitization; keep it
  // external so webpack does not bundle jsdom (which then fails to resolve its
  // own CSS resources during the server build).
  serverExternalPackages: ['isomorphic-dompurify'],
  output: 'standalone',
  outputFileTracingRoot: path.join(__dirname, '..'),
  outputFileTracingIncludes: {
    '/*': ['./content/cases/**/*', './content/cases-en/**/*'],
  },
  images: {
    dangerouslyAllowSVG: true,
    contentDispositionType: 'inline',
    contentSecurityPolicy: "default-src 'self'; script-src 'none'; sandbox;",
    formats: ['image/avif', 'image/webp'],
    minimumCacheTTL: 2592000,
    deviceSizes: [360, 414, 640, 768, 1024, 1280, 1440, 1920, 2560, 2880, 3840],
    imageSizes: [48, 64, 96, 128, 160, 220, 320, 480, 640],
    qualities: [75, 85, 100],
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'omo-oss-image.thefastimg.com',
      },
      {
        protocol: 'https',
        hostname: 'www.jssngyl.cn',
        pathname: '/uploads/**',
      },
      {
        protocol: 'http',
        hostname: 'localhost',
        pathname: '/uploads/**',
      },
      {
        protocol: 'http',
        hostname: '127.0.0.1',
        pathname: '/uploads/**',
      },
    ],
  },
  async headers() {
    return [
      // These paths are not content-hashed. Revalidate daily so replacement
      // media updates promptly; do not label them immutable.
      ...['/videos/:path*', '/partner-map/:path*', '/maps/:path*', '/downloads/:path*', '/favicon-32x32.png', '/favicon-48x48.png', '/apple-touch-icon.png'].map((source) => ({
        source,
        headers: [{ key: 'Cache-Control', value: 'public, max-age=86400, must-revalidate' }],
      })),
      {
        source: '/downloads/:path*',
        headers: [{ key: 'X-Robots-Tag', value: 'noindex, follow' }],
      },
      ...(process.env.SITE_NOINDEX === 'true'
        ? [{ source: '/:path*', headers: [{ key: 'X-Robots-Tag', value: 'noindex, nofollow' }] }]
        : []),
    ];
  },
  async redirects() {
    return [
      { source: '/zh/about/profile', destination: '/zh/about', permanent: true },
      { source: '/zh/about/suneng-profile', destination: '/zh/about', permanent: true },
      { source: '/zh/about/chairman', destination: '/zh/about', permanent: true },
      { source: '/zh/about/timeline', destination: '/zh/about', permanent: true },
      { source: '/zh/about/culture', destination: '/zh/about', permanent: true },
      { source: '/en/about/profile', destination: '/en/about', permanent: true },
      { source: '/en/about/suneng-profile', destination: '/en/about', permanent: true },
      { source: '/en/about/chairman', destination: '/en/about', permanent: true },
      { source: '/en/about/timeline', destination: '/en/about', permanent: true },
      { source: '/en/about/culture', destination: '/en/about', permanent: true },
      { source: '/zh/products/detail', destination: '/zh/products', permanent: true },
      { source: '/en/products/detail', destination: '/en/products', permanent: true },
    ];
  },
};

export default withNextIntl(nextConfig);
