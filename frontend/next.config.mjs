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
  output: 'standalone',
  outputFileTracingRoot: path.join(__dirname, '..'),
  images: {
    dangerouslyAllowSVG: true,
    contentDispositionType: 'inline',
    contentSecurityPolicy: "default-src 'self'; script-src 'none'; sandbox;",
    formats: ['image/avif', 'image/webp'],
    qualities: [75, 85, 100],
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'omo-oss-image.thefastimg.com',
      },
      {
        protocol: 'http',
        hostname: 'localhost',
      },
      {
        protocol: 'http',
        hostname: '127.0.0.1',
      },
    ],
  },
};

export default withNextIntl(nextConfig);
