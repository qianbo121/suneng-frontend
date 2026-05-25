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
    minimumCacheTTL: 2592000,
    deviceSizes: [360, 414, 640, 768, 1024, 1280, 1440, 1920],
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
  async redirects() {
    return [
      { source: '/zh/about/profile', destination: '/zh/about', permanent: true },
      { source: '/zh/about/chairman', destination: '/zh/about', permanent: true },
      { source: '/zh/about/timeline', destination: '/zh/about', permanent: true },
      { source: '/zh/about/culture', destination: '/zh/about', permanent: true },
      { source: '/en/about/profile', destination: '/en/about', permanent: true },
      { source: '/en/about/chairman', destination: '/en/about', permanent: true },
      { source: '/en/about/timeline', destination: '/en/about', permanent: true },
      { source: '/en/about/culture', destination: '/en/about', permanent: true },
    ];
  },
};

export default withNextIntl(nextConfig);
