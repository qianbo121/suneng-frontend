import dynamic from 'next/dynamic';
import { Suspense } from 'react';
import LocalePageLoading from '@/components/layout/LocalePageLoading';

import { JsonLd } from '@/components/JsonLd';
import { HomepageV2 } from '@/components/home/HomepageV2';
import { getHomePageJsonLd } from '@/lib/seo/jsonld';
import { buildMetadata } from '@/lib/seo/metadata';
import { HOME_SEO } from '@/lib/seo/page-data';
import { ENGLISH_STATIC_PAGE_METADATA } from '@/lib/seo/static-page-metadata-en';
import { Locale } from '@/types/site';

const HeroBanner = dynamic(() =>
  import('@/components/home/HeroBanner').then((module) => ({ default: module.HeroBanner })),
);

type LocaleHomePageProps = {
  params: Promise<{
    locale: string;
  }>;
};

const homeSeoCopy = {
  zh: HOME_SEO,
  en: {
    ...ENGLISH_STATIC_PAGE_METADATA.home,
    keywords: [
      'industrial furnace',
      'heat treatment furnace',
      'custom industrial furnace',
      'heat-treatment furnace manufacturer',
      'continuous heat-treatment line',
      'annealing furnace',
      'furnace retrofit',
    ],
  },
} satisfies Record<
  Locale,
  {
    title: string;
    description: string;
    keywords: string[];
  }
>;

export const revalidate = 3600;

export async function generateMetadata({ params }: LocaleHomePageProps) {
  const { locale } = await params;
  const currentLocale = (locale === 'en' ? 'en' : 'zh') as Locale;
  const seo = homeSeoCopy[currentLocale];

  return buildMetadata({
    title: seo.title,
    description: seo.description,
    path: `/${currentLocale}`,
    pageKey: 'home',
    keywords: seo.keywords,
    alternateLocales: {
      'zh-CN': '/zh',
      'en-US': '/en',
      'x-default': '/zh',
    },
  });
}

export default function LocaleHomePage(props: LocaleHomePageProps) {
  return (
    <Suspense fallback={<LocalePageLoading />}>
      <LocaleHomeContent {...props} />
    </Suspense>
  );
}

async function LocaleHomeContent({ params }: LocaleHomePageProps) {
  const { locale } = await params;
  const currentLocale = (locale === 'en' ? 'en' : 'zh') as Locale;

  return (
    <div className="home-page-scope bg-white pb-0">
      <JsonLd id={`homepage-jsonld-${currentLocale}`} data={getHomePageJsonLd(`/${currentLocale}`, currentLocale)} />
      <HeroBanner locale={currentLocale} />
      <HomepageV2 locale={currentLocale} />
    </div>
  );
}
