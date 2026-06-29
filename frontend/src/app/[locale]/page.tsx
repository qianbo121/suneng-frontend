import dynamic from 'next/dynamic';

import { JsonLd } from '@/components/JsonLd';
import { getHomePageData } from '@/lib/home';
import { getHomePageJsonLd } from '@/lib/seo/jsonld';
import { buildMetadata } from '@/lib/seo/metadata';
import { HOME_SEO } from '@/lib/seo/page-data';
import { Locale } from '@/types/site';

const HeroBanner = dynamic(() => import('@/components/home/HeroBanner').then((module) => ({ default: module.HeroBanner })));
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

const homeSeoCopy = {
  zh: HOME_SEO,
  en: {
    title: 'Suneng Industrial Furnace | Custom Heat-Treatment & Industrial Furnace Manufacturer',
    description:
      'Jiangsu Suneng Industrial Furnace (founded 2006, Taizhou, Jiangsu) custom-engineers heat-treatment furnaces — box, bogie-hearth, pit, mesh-belt, roller-hearth and pusher furnaces, continuous heat-treatment lines, plus furnace energy-saving retrofit and overhaul.',
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
} satisfies Record<Locale, {
  title: string;
  description: string;
  keywords: string[];
}>;

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

export default async function LocaleHomePage({ params }: LocaleHomePageProps) {
  const { locale } = await params;
  const currentLocale = (locale === 'en' ? 'en' : 'zh') as Locale;
  const homeData = await getHomePageData();

  return (
    <div className="bg-white pb-0">
      <JsonLd id={`homepage-jsonld-${currentLocale}`} data={getHomePageJsonLd(`/${currentLocale}`, currentLocale)} />
      <HeroBanner locale={currentLocale} items={homeData.heroBanners} partners={homeData.partners} />
      <HeatTreatmentLines locale={currentLocale} categories={homeData.productCategories} />
      <HotProducts locale={currentLocale} items={homeData.hotProducts} />
      <NewsSection locale={currentLocale} items={homeData.news} />
    </div>
  );
}
