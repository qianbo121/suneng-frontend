import { createAboutPageMetadata, getAboutBannerImage, getAboutPageCopy, getAboutPageSource, getCultureValues, localizeAboutText } from '@/lib/about';
import { AboutCultureSection } from '@/components/about/AboutCultureSection';
import { AboutShell } from '@/components/about/AboutShell';
import { Locale } from '@/types/site';

type AboutCulturePageProps = {
  params: Promise<{
    locale: string;
  }>;
};

export const revalidate = 3600;

export async function generateMetadata({ params }: AboutCulturePageProps) {
  const { locale } = await params;
  const currentLocale = (locale === 'en' ? 'en' : 'zh') as Locale;

  return createAboutPageMetadata('culture', currentLocale);
}

export default async function AboutCulturePage({ params }: AboutCulturePageProps) {
  const { locale } = await params;
  const currentLocale = (locale === 'en' ? 'en' : 'zh') as Locale;
  const { data, error, sidebarItems, sidebarTitle } = await getAboutPageSource(currentLocale);
  const pageCopy = getAboutPageCopy('culture', currentLocale);
  const items = getCultureValues(data).map((item) => ({
    id: item.id,
    type: item.type,
    title: localizeAboutText(currentLocale, item, 'title'),
    content: localizeAboutText(currentLocale, item, 'content'),
  }));

  return (
    <AboutShell
      locale={locale}
      title={pageCopy.title}
      englishTitle={pageCopy.englishTitle}
      subtitle={pageCopy.subtitle}
      bannerImage={getAboutBannerImage('culture', data)}
      sidebarTitle={sidebarTitle}
      sidebarItems={sidebarItems}
    >
      {error ? (
        <div className="mb-6 border border-[rgba(230,0,18,0.16)] bg-white px-5 py-4 text-sm text-neutral-700 shadow-soft">
          {currentLocale === 'en'
            ? 'The live about API is currently unavailable. The page is showing available fallback structure.'
            : '当前关于我们接口暂时不可用，页面已按可用结构进行降级显示。'}
        </div>
      ) : null}
      <AboutCultureSection locale={currentLocale} items={items} />
    </AboutShell>
  );
}
