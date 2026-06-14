import type { MetadataRoute } from 'next';

import { publicPathExists } from '@/lib/seo/config';
import { absoluteUrl } from '@/lib/seo/metadata';
import { getNewsList } from '@/lib/api/news';
import { STATIC_PRODUCTS } from '@/constants/static-products';
import { Locale } from '@/types/site';

const sitemapLocales: Locale[] = ['zh'];

type SitemapEntry = MetadataRoute.Sitemap[number];

// Regenerate hourly; the underlying news fetch is itself cached (revalidate),
// so this no longer refetches 100 news items on every request.
export const revalidate = 3600;

function localizedPath(locale: Locale, path: string) {
  if (path === '/') return `/${locale}`;
  return `/${locale}${path.startsWith('/') ? path : `/${path}`}`;
}

function safeLastModified(value?: string | Date) {
  const date = value ? new Date(value) : new Date();
  const now = new Date();

  if (Number.isNaN(date.getTime())) return now;
  return date > now ? now : date;
}

function route(url: string, options: Omit<SitemapEntry, 'url'>): SitemapEntry {
  return {
    url: absoluteUrl(url),
    ...options,
  };
}

function collectStaticRoutes(): MetadataRoute.Sitemap {
  // The bare root '/' 307-redirects to '/zh', so listing it alongside '/zh'
  // is a redirect-source duplicate that search engines drop. '/zh' (emitted by
  // the staticPaths loop below from path '/') is the canonical home.
  const routes: MetadataRoute.Sitemap = [];

  const staticPaths: Array<{
    path: string;
    changeFrequency: SitemapEntry['changeFrequency'];
    priority: number;
  }> = [
    { path: '/', changeFrequency: 'weekly', priority: 1 },
    { path: '/products', changeFrequency: 'weekly', priority: 0.9 },
    { path: '/service', changeFrequency: 'monthly', priority: 0.75 },
    { path: '/news', changeFrequency: 'weekly', priority: 0.7 },
    { path: '/about', changeFrequency: 'monthly', priority: 0.6 },
    { path: '/partner', changeFrequency: 'monthly', priority: 0.65 },
    { path: '/strength', changeFrequency: 'monthly', priority: 0.65 },
    { path: '/strength/honors', changeFrequency: 'monthly', priority: 0.55 },
    { path: '/strength/certificates', changeFrequency: 'monthly', priority: 0.55 },
    { path: '/contact', changeFrequency: 'monthly', priority: 0.7 },
  ];

  for (const locale of sitemapLocales) {
    for (const item of staticPaths) {
      routes.push(
        route(localizedPath(locale, item.path), {
          lastModified: new Date(),
          changeFrequency: item.changeFrequency,
          priority: item.priority,
        }),
      );
    }
  }

  const zhOnlyStaticPaths: Array<{
    path: string;
    changeFrequency: SitemapEntry['changeFrequency'];
    priority: number;
  }> = [
    { path: '/about/suneng-profile', changeFrequency: 'monthly', priority: 0.66 },
    { path: '/service/furnace-renovation-overhaul', changeFrequency: 'monthly', priority: 0.72 },
    { path: '/articles/gongye-lu-baojia-canshu', changeFrequency: 'monthly', priority: 0.64 },
    { path: '/articles/laojiu-rechuli-lu-daxiu-haishi-maixin', changeFrequency: 'monthly', priority: 0.64 },
    { path: '/solutions/rechuli-lu-changjia', changeFrequency: 'monthly', priority: 0.78 },
    { path: '/solutions/jiangsu-gongye-lu-changjia', changeFrequency: 'monthly', priority: 0.76 },
    { path: '/solutions/continuous-heat-treatment-line', changeFrequency: 'monthly', priority: 0.86 },
    { path: '/case/anonymous-tsingshan-1250-renovation', changeFrequency: 'monthly', priority: 0.68 },
  ];

  for (const item of zhOnlyStaticPaths) {
    routes.push(
      route(localizedPath('zh', item.path), {
        lastModified: new Date(),
        changeFrequency: item.changeFrequency,
        priority: item.priority,
      }),
    );
  }

  return routes;
}

function collectProductRoutes(): MetadataRoute.Sitemap {
  return sitemapLocales.flatMap((locale) =>
    STATIC_PRODUCTS.map((product) =>
      route(localizedPath(locale, `/products/detail/${product.slug}`), {
        lastModified: new Date(),
        changeFrequency: 'monthly',
        priority: 0.8,
        images: publicPathExists(product.image) ? [absoluteUrl(product.image)] : undefined,
      }),
    ),
  );
}

async function collectNewsRoutes(): Promise<MetadataRoute.Sitemap> {
  const newsResult = await getNewsList({ page: 1, pageSize: 100, timeoutMs: 10000 });

  if (newsResult.error) {
    return [];
  }

  const items = (newsResult.data?.items ?? []).filter((article) => {
    const status = 'status' in article ? article.status : undefined;
    const isPublished = 'isPublished' in article ? article.isPublished : undefined;

    return article.slug && status === 'published' && isPublished === true;
  });

  return items.map((article) =>
    route(localizedPath('zh', `/news/${article.slug}`), {
      lastModified: safeLastModified(article.publishDate),
      changeFrequency: 'monthly',
      priority: 0.6,
      images: article.coverImage && publicPathExists(article.coverImage) ? [absoluteUrl(article.coverImage)] : undefined,
    }),
  );
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  return [...collectStaticRoutes(), ...collectProductRoutes(), ...(await collectNewsRoutes())];
}
