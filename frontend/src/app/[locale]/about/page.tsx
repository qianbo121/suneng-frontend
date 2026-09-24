import { getIndexingRobots } from '@/lib/seo/metadata';
import type { Metadata } from 'next';
import { localizeCoreValue } from '@/lib/core-page-localization';

import { ABOUT_ZH_SEO, AboutZhContent } from '@/components/about/AboutZhContent';
import { absoluteUrl, buildMetadata } from '@/lib/seo/metadata';
import { SITE_NAME } from '@/lib/seo/config';
import { Locale } from '@/types/site';

type AboutPageProps = {
  params: Promise<{
    locale: string;
  }>;
};

export const revalidate = 3600;

export async function generateMetadata({ params }: AboutPageProps): Promise<Metadata> {
  const { locale } = await params;
  const currentLocale = (locale === 'en' ? 'en' : 'zh') as Locale;
  const openGraphLocale = currentLocale === 'en' ? 'en_US' : 'zh_CN';

  if (currentLocale === 'zh') {
    const canonical = absoluteUrl('/zh/about');
    const image = absoluteUrl('/images/about/about_img_hero_factory_01.png');

    return {
      title: {
        absolute: ABOUT_ZH_SEO.title,
      },
      description: ABOUT_ZH_SEO.description,
      alternates: {
        canonical,
        languages: {
          'zh-CN': absoluteUrl('/zh/about'),
          'en-US': absoluteUrl('/en/about'),
          'x-default': absoluteUrl('/zh/about'),
        },
      },
      openGraph: {
        title: ABOUT_ZH_SEO.ogTitle,
        description: ABOUT_ZH_SEO.ogDescription,
        type: 'website',
        url: canonical,
        siteName: SITE_NAME,
        locale: openGraphLocale,
        images: [{ url: image }],
      },
      twitter: {
        card: 'summary_large_image',
        title: ABOUT_ZH_SEO.ogTitle,
        description: ABOUT_ZH_SEO.ogDescription,
        images: [image],
      },
      robots: getIndexingRobots(),
    };
  }

  const seo = localizeCoreValue(ABOUT_ZH_SEO, 'en');

  return buildMetadata({
    title: seo.title,
    description: seo.description,
    path: `/${currentLocale}/about`,
    pageKey: 'about',
    keywords: seo.keywords,
    image: '/images/about/about_img_hero_factory_01.png',
    alternateLocales: {
      'zh-CN': '/zh/about',
      'en-US': '/en/about',
      'x-default': '/zh/about',
    },
  });
}

export default async function AboutPage({ params }: AboutPageProps) {
  const { locale } = await params;
  const currentLocale = (locale === 'en' ? 'en' : 'zh') as Locale;

  return <AboutZhContent locale={currentLocale} />;
}
