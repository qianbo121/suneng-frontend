import { createAboutPageMetadata, getAboutBannerImage, getAboutPageCopy, getAboutPageSource, getTimelineItems, localizeAboutText } from '@/lib/about';
import { AboutShell } from '@/components/about/AboutShell';
import { AboutTimelineSection } from '@/components/about/AboutTimelineSection';
import { Locale } from '@/types/site';

type AboutTimelinePageProps = {
  params: Promise<{
    locale: string;
  }>;
};

export const revalidate = 3600;

export async function generateMetadata({ params }: AboutTimelinePageProps) {
  const { locale } = await params;
  const currentLocale = (locale === 'en' ? 'en' : 'zh') as Locale;

  return createAboutPageMetadata('timeline', currentLocale);
}

export default async function AboutTimelinePage({ params }: AboutTimelinePageProps) {
  const { locale } = await params;
  const currentLocale = (locale === 'en' ? 'en' : 'zh') as Locale;
  const { data, error, sidebarItems, sidebarTitle } = await getAboutPageSource(currentLocale);
  const pageCopy = getAboutPageCopy('timeline', currentLocale);
  const items = getTimelineItems(data).map((item) => ({
    id: item.id,
    year: item.year,
    title: localizeAboutText(currentLocale, item, 'title'),
    content: localizeAboutText(currentLocale, item, 'content'),
  }));

  return (
    <AboutShell
      locale={locale}
      title={pageCopy.title}
      englishTitle={pageCopy.englishTitle}
      subtitle={pageCopy.subtitle}
      bannerImage={getAboutBannerImage('timeline', data)}
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
      <AboutTimelineSection locale={currentLocale} items={items} />
    </AboutShell>
  );
}
