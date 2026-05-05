import { createAboutPageMetadata, getAboutBannerImage, getAboutPageCopy, getAboutPageSource, getChairmanMessage, localizeAboutText } from '@/lib/about';
import { AboutChairmanSection } from '@/components/about/AboutChairmanSection';
import { AboutShell } from '@/components/about/AboutShell';
import { Locale } from '@/types/site';

type AboutChairmanPageProps = {
  params: Promise<{
    locale: string;
  }>;
};

export const revalidate = 3600;

export async function generateMetadata({ params }: AboutChairmanPageProps) {
  const { locale } = await params;
  const currentLocale = (locale === 'en' ? 'en' : 'zh') as Locale;

  return createAboutPageMetadata('chairman', currentLocale);
}

export default async function AboutChairmanPage({ params }: AboutChairmanPageProps) {
  const { locale } = await params;
  const currentLocale = (locale === 'en' ? 'en' : 'zh') as Locale;
  const { data, error, sidebarItems, sidebarTitle } = await getAboutPageSource(currentLocale);
  const pageCopy = getAboutPageCopy('chairman', currentLocale);
  const chairman = getChairmanMessage(data);

  return (
    <AboutShell
      locale={locale}
      title={pageCopy.title}
      englishTitle={pageCopy.englishTitle}
      subtitle={pageCopy.subtitle}
      bannerImage={getAboutBannerImage('chairman', data)}
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
      <AboutChairmanSection
        locale={currentLocale}
        title={localizeAboutText(currentLocale, chairman, 'title', pageCopy.title)}
        content={localizeAboutText(currentLocale, chairman, 'content', pageCopy.subtitle)}
        image={chairman?.imageUrl || chairman?.ogImage || '/images/about/about_img_company_building_01.png'}
      />
    </AboutShell>
  );
}
