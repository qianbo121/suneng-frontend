import { isWithdrawnTechnicalPath } from '@/lib/publication-scope';
import { getEnglishCases } from '@/lib/cases/english';
import { englishSolutions } from '@/lib/english-solutions';
import { unstable_cache } from 'next/cache';
import { getPublicCases } from '@/lib/cases/server';
import { CASE_PAGE_SIZE } from '@/lib/cases/types';
import type { MetadataRoute } from 'next';

import { publicPathExists } from '@/lib/seo/config';
import { absoluteUrl } from '@/lib/seo/metadata';
import { getAllNewsForDecisionCenter } from '@/lib/api/news';
import { getNewsContentModifiedTime } from '@/lib/news-dates';
import { filterCanonicalNewsItems, hasPublishableEnglishNews } from '@/lib/news-routing';
import { STATIC_PRODUCTS } from '@/constants/static-products';
import { heatTreatmentLines } from '@/lib/heat-treatment-lines';
import { additionalFurnaces } from '@/lib/additional-furnaces';
import {
  FURNACE_ENERGY_CONVERSION_HEAT_RECOVERY_SEO,
  FURNACE_CONTROL_SYSTEM_UPGRADE_SEO,
  FURNACE_LINING_RENOVATION_GUIDE_SEO,
  FURNACE_RESTART_RELOCATION_REMANUFACTURING_SEO,
  FURNACE_RENOVATION_RISK_CYCLE_GUIDE_SEO,
  FURNACE_RENOVATION_OVERHAUL_SEO,
  INDUSTRIAL_FURNACE_QUOTE_PARAMS_SEO,
  OLD_HEAT_TREATMENT_FURNACE_REPAIR_OR_REPLACE_SEO,
  PRODUCT_DETAIL_SEO,
  TEMPERATURE_UNIFORMITY_REMEDIATION_SEO,
  CONTINUOUS_HEAT_TREATMENT_LINE_SEO,
} from '@/lib/seo/page-data';
import { Locale } from '@/types/site';

const sitemapLocales: Locale[] = ['zh', 'en'];
const zhOnlyLocales: Locale[] = ['zh'];
const englishStaticPaths = new Set([
  '/case',
  '/',
  '/solutions',
  '/products',
  '/service',
  '/news',
  '/about',
  '/contact',
  '/strength/honors',
]);

type SitemapEntry = MetadataRoute.Sitemap[number];

// Fetch after the backend is available, never while building the image.
// Cache only a complete article list; a failed refresh preserves the prior list.
export const dynamic = 'force-dynamic';
const getCompleteSitemapNews = unstable_cache(
  async () => {
    const result = await getAllNewsForDecisionCenter();
    if (result.error || !result.data)
      throw new Error(
        `Cannot generate a complete sitemap: ${result.error || 'empty upstream response'}`,
      );
    return result;
  },
  ['complete-sitemap-news-bilingual-v4-content-review-20260912'],
  { revalidate: 300 },
);

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
      ...Object.fromEntries(
        locales.map((locale) => [languageCode(locale), absoluteUrl(localizedPath(locale, path))]),
      ),
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
  // The bare root '/' 308-redirects to '/zh', so listing it alongside '/zh'
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
    },
    { path: '/products', changeFrequency: 'weekly', priority: 0.9 },
    { path: '/solutions', changeFrequency: 'monthly', priority: 0.84 },
    { path: '/service', changeFrequency: 'monthly', priority: 0.75 },
    { path: '/service/installation-after-sales', changeFrequency: 'monthly', priority: 0.7 },
    { path: '/service/furnace-relocation-restart', changeFrequency: 'monthly', priority: 0.7 },
    { path: '/case', changeFrequency: 'monthly', priority: 0.76 },
    { path: '/news', changeFrequency: 'weekly', priority: 0.7 },
    { path: '/inquiry', changeFrequency: 'monthly', priority: 0.55 },
    {
      path: '/about',
      changeFrequency: 'monthly',
      priority: 0.6,
    },
    { path: '/partner', changeFrequency: 'monthly', priority: 0.65 },
    { path: '/strength/honors', changeFrequency: 'monthly', priority: 0.55 },
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
          // The redesigned Chinese overview and legacy English service are not translations.
          alternates:
            item.path === '/service'
              ? {
                  languages: {
                    [languageCode(locale)]: absoluteUrl(localizedPath(locale, item.path)),
                  },
                }
              : routeAlternates(item.path, locales),
        }),
      );
    }
  }

  const guideAndZhOnlyStaticPaths: Array<{
    path: string;
    changeFrequency: SitemapEntry['changeFrequency'];
    priority: number;
    lastModified?: string;
  }> = [
    {
      path: '/products/detail/copper-wire-annealing-line/inquiry-checklist',
      changeFrequency: 'monthly',
      priority: 0.65,
    },
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
      priority: 0.7,
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
    {
      path: '/solutions/rechuli-lu-luchen-fanxin',
      changeFrequency: 'monthly',
      priority: 0.7,
      lastModified: FURNACE_LINING_RENOVATION_GUIDE_SEO.modifiedTime,
    },
    {
      path: '/solutions/rechuli-lu-dian-gai-ran-yure-huishou',
      changeFrequency: 'monthly',
      priority: 0.7,
      lastModified: FURNACE_ENERGY_CONVERSION_HEAT_RECOVERY_SEO.modifiedTime,
    },
    {
      path: '/solutions/rechuli-lu-kongzhi-xitong-shengji',
      changeFrequency: 'monthly',
      priority: 0.7,
      lastModified: FURNACE_CONTROL_SYSTEM_UPGRADE_SEO.modifiedTime,
    },
    {
      path: '/solutions/rechuli-lu-tingchan-chongqi-banqian-fuchan',
      changeFrequency: 'monthly',
      priority: 0.7,
      lastModified: FURNACE_RESTART_RELOCATION_REMANUFACTURING_SEO.modifiedTime,
    },
    { path: '/solutions/rechuli-lu-changjia', changeFrequency: 'monthly', priority: 0.78 },
    { path: '/solutions/jiangsu-gongye-lu-changjia', changeFrequency: 'monthly', priority: 0.76 },
    {
      path: '/solutions/continuous-heat-treatment-line',
      changeFrequency: 'monthly',
      priority: 0.86,
      lastModified: CONTINUOUS_HEAT_TREATMENT_LINE_SEO.modifiedTime,
    },
  ];

  const englishGuidePaths = new Set(englishSolutions.map((item) => `/solutions/${item.slug}`));
  for (const item of guideAndZhOnlyStaticPaths) {
    const locales = englishGuidePaths.has(item.path) ? sitemapLocales : zhOnlyLocales;
    for (const locale of locales) {
      // English pages are new local content; do not invent a deployed revision date.
      const modified = locale === 'en' ? undefined : item.lastModified;
      routes.push(
        route(localizedPath(locale, item.path), {
          ...(modified ? { lastModified: new Date(modified) } : {}),
          changeFrequency: item.changeFrequency,
          priority: item.priority,
          alternates: routeAlternates(item.path, locales),
        }),
      );
    }
  }

  return routes;
}

function collectProductRoutes(): MetadataRoute.Sitemap {
  const existingRoutes = sitemapLocales.flatMap((locale) =>
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
  const existingSlugs = new Set(STATIC_PRODUCTS.map((product) => product.slug));
  const newRoutes = heatTreatmentLines
    .filter((line) => !existingSlugs.has(line.slug))
    .map((line) =>
      route(localizedPath('zh', `/products/detail/${line.slug}`), {
        // Omit the date until this production line has a verified content revision date.
        changeFrequency: 'monthly',
        priority: 0.8,
        alternates: routeAlternates(`/products/detail/${line.slug}`, zhOnlyLocales),
      }),
    );
  const additionalRoutes = additionalFurnaces.flatMap((furnace) =>
    sitemapLocales.map((locale) =>
      route(localizedPath(locale, `/products/detail/${furnace.id}`), {
        changeFrequency: 'monthly',
        priority: 0.8,
        images: publicPathExists(furnace.image) ? [absoluteUrl(furnace.image)] : undefined,
        alternates: routeAlternates(`/products/detail/${furnace.id}`, sitemapLocales),
      }),
    ),
  );
  return [...existingRoutes, ...newRoutes, ...additionalRoutes];
}

async function collectNewsRoutes(): Promise<MetadataRoute.Sitemap> {
  const newsResult = await getCompleteSitemapNews();

  if (newsResult.error || !newsResult.data) {
    throw new Error(
      `Cannot generate a complete sitemap: ${newsResult.error || 'news unavailable'}`,
    );
  }

  const items = filterCanonicalNewsItems(newsResult.data ?? []).filter((article) => {
    const status = 'status' in article ? article.status : undefined;
    const isPublished = 'isPublished' in article ? article.isPublished : undefined;

    return article.slug && status === 'published' && isPublished === true;
  });

  return items.flatMap((article) => {
    const locales = hasPublishableEnglishNews(article) ? sitemapLocales : zhOnlyLocales;
    return locales.map((locale) => {
      const coverImage =
        (locale === 'en' && article.englishCoverImage) || article.coverImage;
      return route(localizedPath(locale, `/news/${article.slug}`), {
        lastModified: safeLastModified(getNewsContentModifiedTime(article, locale)),
        changeFrequency: 'monthly',
        priority: 0.6,
        images:
          coverImage && publicPathExists(coverImage)
            ? [absoluteUrl(coverImage)]
            : undefined,
        alternates: routeAlternates(`/news/${article.slug}`, locales),
      });
    });
  });
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const cases = getPublicCases();
  const englishCases = getEnglishCases();
  const englishSlugs = new Set(englishCases.map((item) => item.slug));
  const caseRoutes = cases.map((item) =>
    route(`/zh/case/${item.slug}`, {
      alternates: routeAlternates(`/case/${item.slug}`, englishSlugs.has(item.slug) ? sitemapLocales : zhOnlyLocales),
      // An editorial date alone is not evidence that a draft has been published.
      // Retain its source metadata, but advertise sitemap freshness only after
      // the first publication is recorded.
      ...(item.datePublished
        ? { lastModified: safeLastModified(item.dateModified ?? item.datePublished) }
        : {}),
      changeFrequency: 'monthly',
      priority: 0.72,
    }),
  );
  const pageRoutes = Array.from(
    { length: Math.max(0, Math.ceil(cases.length / CASE_PAGE_SIZE) - 1) },
    (_, i) => route(`/zh/case?page=${i + 2}`, { changeFrequency: 'monthly', priority: 0.5 }),
  );
  return [
    ...collectStaticRoutes(),
    ...caseRoutes,
    ...englishCases.map((item) => route(`/en/case/${item.slug}`, {
      // These records retain Chinese source dates. Neither a source publication
      // date nor a translation-completion date records publication of this
      // English page. Omit freshness until its own publication is recorded.
      changeFrequency: 'monthly', priority: 0.72,
      alternates: routeAlternates(`/case/${item.slug}`, sitemapLocales),
    })),
    ...Array.from({ length: Math.max(0, Math.ceil(englishCases.length / CASE_PAGE_SIZE) - 1) }, (_, i) =>
      route(`/en/case?page=${i + 2}`, { changeFrequency: 'monthly', priority: 0.5 })),
    ...pageRoutes,
    ...collectProductRoutes(),
    ...(await collectNewsRoutes()),
  ].filter((item) => !isWithdrawnTechnicalPath(item.url));
}
