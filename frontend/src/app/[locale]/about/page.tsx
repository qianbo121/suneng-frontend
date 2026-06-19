import type { Metadata } from 'next';

import { JsonLd } from '@/components/JsonLd';
import { AboutProfileSection } from '@/components/about/AboutProfileSection';
import { AboutShell } from '@/components/about/AboutShell';
import { ABOUT_ZH_SEO, AboutZhContent } from '@/components/about/AboutZhContent';
import {
  getAboutBannerImage,
  getAboutPageCopy,
  getAboutPageSource,
  getProfileSection,
  localizeAboutText,
} from '@/lib/about';
import { getBreadcrumbJsonLd } from '@/lib/seo/jsonld';
import { absoluteUrl, buildMetadata } from '@/lib/seo/metadata';
import { ABOUT_SEO } from '@/lib/seo/page-data';
import { SITE_NAME } from '@/lib/seo/config';
import { Locale } from '@/types/site';

type AboutPageProps = {
  params: Promise<{
    locale: string;
  }>;
};

const aboutSeoCopy = {
  zh: ABOUT_SEO,
  en: {
    title: 'About Suneng Industrial Furnace | Jiangsu Heat-Treatment Furnace Manufacturer',
    description:
      'Jiangsu Suneng Industrial Furnace — founded 2006 in Taizhou, Jiangsu, a National High-Tech Enterprise specializing in heat-treatment furnace design and manufacturing, with a 14,700 m² production base.',
    keywords: [
      'Suneng Industrial Furnace',
      'Jiangsu furnace manufacturer',
      'heat-treatment furnace manufacturer',
      'custom industrial furnace',
    ],
  },
} satisfies Record<Locale, {
  title: string;
  description: string;
  keywords: string[];
}>;

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
      keywords: ABOUT_ZH_SEO.keywords,
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
      robots: {
        index: true,
        follow: true,
      },
    };
  }

  const seo = aboutSeoCopy.en;

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

  if (currentLocale === 'zh') {
    return <AboutZhContent />;
  }

  const { data, error, sidebarItems, sidebarTitle } = await getAboutPageSource(currentLocale);
  const pageCopy = getAboutPageCopy('profile', currentLocale);
  const profile = getProfileSection(data);

  return (
    <AboutShell
      locale={locale}
      title={pageCopy.title}
      englishTitle={pageCopy.englishTitle}
      subtitle={pageCopy.subtitle}
      bannerTitle={pageCopy.title}
      bannerImage={getAboutBannerImage('profile', data)}
      sidebarTitle={sidebarTitle}
      sidebarItems={sidebarItems}
    >
      <JsonLd
        id={`about-breadcrumb-jsonld-${currentLocale}`}
        data={getBreadcrumbJsonLd([
          { name: currentLocale === 'en' ? 'Home' : '首页', url: `/${currentLocale}` },
          { name: currentLocale === 'en' ? 'About' : '关于我们', url: `/${currentLocale}/about` },
        ])}
      />
      {error ? (
        <div className="hidden mb-6 border border-[rgba(230,0,18,0.16)] bg-white px-5 py-4 text-sm text-neutral-700 shadow-soft">
          {currentLocale === 'en'
            ? 'The live about API is currently unavailable. The page is showing available fallback structure.'
            : '当前关于我们接口暂时不可用，页面已按可用结构进行降级显示。'}
        </div>
      ) : null}
      <AboutProfileSection
        locale={currentLocale}
        title={localizeAboutText(currentLocale, profile, 'title', pageCopy.title)}
        content={localizeAboutText(currentLocale, profile, 'content')}
      />
    </AboutShell>
  );
}
