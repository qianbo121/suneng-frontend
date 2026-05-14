import { JsonLd } from '@/components/JsonLd';
import { AboutProfileSection } from '@/components/about/AboutProfileSection';
import { AboutShell } from '@/components/about/AboutShell';
import { getAboutBannerImage, getAboutPageCopy, getAboutPageSource, getProfileSection, localizeAboutText } from '@/lib/about';
import { getBreadcrumbJsonLd } from '@/lib/seo/jsonld';
import { buildMetadata } from '@/lib/seo/metadata';
import { ABOUT_SEO } from '@/lib/seo/page-data';
import { Locale } from '@/types/site';

type AboutPageProps = {
  params: Promise<{
    locale: string;
  }>;
};

export const revalidate = 3600;

export async function generateMetadata({ params }: AboutPageProps) {
  const { locale } = await params;
  const currentLocale = (locale === 'en' ? 'en' : 'zh') as Locale;

  return buildMetadata({
    title: ABOUT_SEO.title,
    description: ABOUT_SEO.description,
    path: `/${currentLocale}/about`,
    pageKey: 'about',
    keywords: ABOUT_SEO.keywords,
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
          { name: '首页', url: `/${currentLocale}` },
          { name: '关于我们', url: `/${currentLocale}/about` },
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
