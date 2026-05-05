import { createAboutPageMetadata, getAboutBannerImage, getAboutPageCopy, getAboutPageSource, getProfileSection, localizeAboutText } from '@/lib/about';
import { AboutProfileSection } from '@/components/about/AboutProfileSection';
import { AboutShell } from '@/components/about/AboutShell';
import { Locale } from '@/types/site';

type AboutProfilePageProps = {
  params: Promise<{
    locale: string;
  }>;
};

export const revalidate = 3600;

export async function generateMetadata({ params }: AboutProfilePageProps) {
  const { locale } = await params;
  const currentLocale = (locale === 'en' ? 'en' : 'zh') as Locale;

  return createAboutPageMetadata('profile', currentLocale);
}

export default async function AboutProfilePage({ params }: AboutProfilePageProps) {
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
        image={profile?.imageUrl || profile?.ogImage || '/images/about/about_img_company_building_01.png'}
      />
    </AboutShell>
  );
}
