import dynamic from 'next/dynamic';

import { JsonLd } from '@/components/JsonLd';
import { getHomePageData } from '@/lib/home';
import { getHomePageJsonLd } from '@/lib/seo/jsonld';
import { buildMetadata } from '@/lib/seo/metadata';
import { HOME_SEO } from '@/lib/seo/page-data';
import { Locale } from '@/types/site';

const HeroBanner = dynamic(() => import('@/components/home/HeroBanner').then((module) => ({ default: module.HeroBanner })));
const ProductCenterSection = dynamic(() =>
  import('@/components/home/ProductCenterSection').then((module) => ({ default: module.ProductCenterSection })),
);
const HeatTreatmentLines = dynamic(() =>
  import('@/components/home/HeatTreatmentLines').then((module) => ({ default: module.HeatTreatmentLines })),
);
const HotProducts = dynamic(() => import('@/components/home/HotProducts').then((module) => ({ default: module.HotProducts })));
const NewsSection = dynamic(() => import('@/components/home/NewsSection').then((module) => ({ default: module.NewsSection })));

type LocaleHomePageProps = {
  params: Promise<{
    locale: string;
  }>;
};

export const revalidate = 3600;

export async function generateMetadata({ params }: LocaleHomePageProps) {
  const { locale } = await params;
  const currentLocale = (locale === 'en' ? 'en' : 'zh') as Locale;

  return buildMetadata({
    title: HOME_SEO.title,
    description: HOME_SEO.description,
    path: `/${currentLocale}`,
    keywords: HOME_SEO.keywords,
    alternateLocales: {
      'zh-CN': '/zh',
      'en-US': '/en',
      'x-default': '/zh',
    },
  });
}

export default async function LocaleHomePage({ params }: LocaleHomePageProps) {
  const { locale } = await params;
  const currentLocale = (locale === 'en' ? 'en' : 'zh') as Locale;
  const homeData = await getHomePageData();

  return (
    <div className="pb-0">
      <JsonLd id={`homepage-jsonld-${currentLocale}`} data={getHomePageJsonLd(`/${currentLocale}`)} />
      <HeroBanner locale={currentLocale} items={homeData.heroBanners} partners={homeData.partners} />
      <HeatTreatmentLines locale={currentLocale} />
      <ProductCenterSection locale={currentLocale} />
      <HotProducts locale={currentLocale} items={homeData.hotProducts} />
      <NewsSection locale={currentLocale} items={homeData.news} />
    </div>
  );
}
