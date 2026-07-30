import type { MetadataRoute } from 'next';

import { publicPathExists } from '@/lib/seo/config';
import { absoluteUrl } from '@/lib/seo/metadata';
import { getNewsList } from '@/lib/api/news';
import { STATIC_PRODUCTS } from '@/constants/static-products';
import {
  HENAN_ANNEALING_SOLUTION_CASE_SEO,
  FURNACE_RENOVATION_RISK_CYCLE_GUIDE_SEO,
  FURNACE_RENOVATION_OVERHAUL_SEO,
  INDUSTRIAL_FURNACE_QUOTE_PARAMS_SEO,
  JINING_SUPPORT_ROLLER_CASE_SEO,
  OLD_HEAT_TREATMENT_FURNACE_REPAIR_OR_REPLACE_SEO,
  PRODUCT_DETAIL_SEO,
  TEMPERATURE_UNIFORMITY_REMEDIATION_SEO,
  CONTINUOUS_HEAT_TREATMENT_LINE_SEO,
  TSINGSHAN_1250_CASE_SEO,
} from '@/lib/seo/page-data';
import { Locale } from '@/types/site';

const sitemapLocales: Locale[] = ['zh', 'en'];
const zhOnlyLocales: Locale[] = ['zh'];
const englishStaticPaths = new Set(['/', '/products', '/service', '/news', '/about', '/contact']);
const HOME_CONTENT_MODIFIED_TIME = '2026-07-30';

type SitemapEntry = MetadataRoute.Sitemap[number];

// Regenerate hourly; the underlying news fetch is itself cached (revalidate),
// so this no longer refetches 100 news items on every request.
export const revalidate = 3600;

function localizedPath(locale: Locale, path: string) {
  if (path === '/') return `/${locale}`;
  return `/${locale}${path.startsWith('/') ? path : `/${path}`}`;
}

function languageCode(locale: Locale) {
  return locale === 'en' ? 'en-US' : 'zh-CN';
}

function routeAlternates(path: string, locales: Locale[]) {
  return {
    languages: {
      ...Object.fromEntries(locales.map((locale) => [languageCode(locale), absoluteUrl(localizedPath(locale, path))])),
      'x-default': absoluteUrl(localizedPath('zh', path)),
    },
  };
}

function safeLastModified(value?: string | Date) {
  if (!value) return undefined;

  const date = new Date(value);
  const now = new Date();

  if (Number.isNaN(date.getTime()) || date > now) return undefined;
  return date;
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
    lastModified?: string;
    lastModifiedLocales?: Locale[];
  }> = [
    {
      path: '/',
      changeFrequency: 'weekly',
      priority: 1,
      lastModified: HOME_CONTENT_MODIFIED_TIME,
      lastModifiedLocales: ['zh'],
    },
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

  for (const item of staticPaths) {
    const locales = englishStaticPaths.has(item.path) ? sitemapLocales : zhOnlyLocales;
    for (const locale of locales) {
      routes.push(
        route(localizedPath(locale, item.path), {
          ...(item.lastModified && item.lastModifiedLocales?.includes(locale)
            ? { lastModified: new Date(item.lastModified) }
            : {}),
          changeFrequency: item.changeFrequency,
          priority: item.priority,
          alternates: routeAlternates(item.path, locales),
        }),
      );
    }
  }

  const zhOnlyStaticPaths: Array<{
    path: string;
    changeFrequency: SitemapEntry['changeFrequency'];
    priority: number;
    lastModified?: string;
  }> = [
    {
      path: '/service/furnace-renovation-overhaul',
      changeFrequency: 'monthly',
      priority: 0.72,
      lastModified: FURNACE_RENOVATION_OVERHAUL_SEO.modifiedTime,
    },
    {
      path: '/articles/gongye-lu-baojia-canshu',
      changeFrequency: 'monthly',
      priority: 0.64,
      lastModified: INDUSTRIAL_FURNACE_QUOTE_PARAMS_SEO.modifiedTime,
    },
    {
      path: '/articles/laojiu-rechuli-lu-daxiu-haishi-maixin',
      changeFrequency: 'monthly',
      priority: 0.64,
      lastModified: OLD_HEAT_TREATMENT_FURNACE_REPAIR_OR_REPLACE_SEO.modifiedTime,
    },
    {
      path: '/solutions/rechuli-lu-wendu-bujun-zhenggai',
      changeFrequency: 'monthly',
      priority: 0.7,
      lastModified: TEMPERATURE_UNIFORMITY_REMEDIATION_SEO.modifiedTime,
    },
    {
      path: '/solutions/rechuli-lu-gaizao-fengxian-zhouqi',
      changeFrequency: 'monthly',
      priority: 0.7,
      lastModified: FURNACE_RENOVATION_RISK_CYCLE_GUIDE_SEO.modifiedTime,
    },
    { path: '/solutions/rechuli-lu-changjia', changeFrequency: 'monthly', priority: 0.78 },
    { path: '/solutions/jiangsu-gongye-lu-changjia', changeFrequency: 'monthly', priority: 0.76 },
    {
      path: '/solutions/continuous-heat-treatment-line',
      changeFrequency: 'monthly',
      priority: 0.86,
      lastModified: CONTINUOUS_HEAT_TREATMENT_LINE_SEO.modifiedTime,
    },
    {
      path: '/case/anonymous-tsingshan-1250-renovation',
      changeFrequency: 'monthly',
      priority: 0.68,
      lastModified: TSINGSHAN_1250_CASE_SEO.modifiedTime,
    },
    {
      path: '/case/jining-support-roller-heat-treatment-line',
      changeFrequency: 'monthly',
      priority: 0.72,
      lastModified: JINING_SUPPORT_ROLLER_CASE_SEO.modifiedTime,
    },
    {
      path: '/case/henan-annealing-solution-line',
      changeFrequency: 'monthly',
      priority: 0.72,
      lastModified: HENAN_ANNEALING_SOLUTION_CASE_SEO.modifiedTime,
    },
  ];

  for (const item of zhOnlyStaticPaths) {
    routes.push(
      route(localizedPath('zh', item.path), {
        ...(item.lastModified ? { lastModified: new Date(item.lastModified) } : {}),
        changeFrequency: item.changeFrequency,
        priority: item.priority,
        alternates: routeAlternates(item.path, zhOnlyLocales),
      }),
    );
  }

  return routes;
}

function collectProductRoutes(): MetadataRoute.Sitemap {
  return sitemapLocales.flatMap((locale) =>
    STATIC_PRODUCTS.map((product) => {
      const modifiedTime = PRODUCT_DETAIL_SEO[product.slug]?.modifiedTime;

      return route(localizedPath(locale, `/products/detail/${product.slug}`), {
        ...(modifiedTime ? { lastModified: new Date(modifiedTime) } : {}),
        changeFrequency: 'monthly',
        priority: 0.8,
        images: publicPathExists(product.image) ? [absoluteUrl(product.image)] : undefined,
        alternates: routeAlternates(`/products/detail/${product.slug}`, sitemapLocales),
      });
    }),
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
      alternates: routeAlternates(`/news/${article.slug}`, zhOnlyLocales),
    }),
  );
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  return [...collectStaticRoutes(), ...collectProductRoutes(), ...(await collectNewsRoutes())];
}
