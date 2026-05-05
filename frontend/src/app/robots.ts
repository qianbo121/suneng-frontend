import type { MetadataRoute } from 'next';

import { SITE_URL } from '@/lib/seo/config';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: ['/admin/', '/dashboard/', '/api/'],
      },
      {
        userAgent: 'Baiduspider',
        allow: '/',
      },
      {
        userAgent: 'Sogou web spider',
        allow: '/',
      },
      {
        userAgent: '360Spider',
        allow: '/',
      },
      {
        userAgent: 'Bytespider',
        allow: '/',
      },
      {
        userAgent: 'YisouSpider',
        allow: '/',
      },
    ],
    sitemap: `${SITE_URL}/sitemap.xml`,
    host: SITE_URL,
  };
}
