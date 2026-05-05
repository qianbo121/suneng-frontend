import { createStrengthMetadata, getStrengthPageData } from '@/lib/strength';
import { StrengthGalleryGrid } from '@/components/strength/StrengthGalleryGrid';
import { StrengthPaginationNav } from '@/components/strength/StrengthPaginationNav';
import { StrengthShell } from '@/components/strength/StrengthShell';
import { Locale } from '@/types/site';

type StrengthPageProps = {
  params: Promise<{
    locale: string;
  }>;
  searchParams: Promise<{
    page?: string;
  }>;
};

export const revalidate = 3600;

export async function generateMetadata({ params }: StrengthPageProps) {
  const { locale } = await params;
  const currentLocale = (locale === 'en' ? 'en' : 'zh') as Locale;

  return createStrengthMetadata(currentLocale);
}

export default async function StrengthPage({ params, searchParams }: StrengthPageProps) {
  const { locale } = await params;
  const { page } = await searchParams;
  const currentLocale = (locale === 'en' ? 'en' : 'zh') as Locale;
  const currentPage = Number(page || 1) > 0 ? Number(page || 1) : 1;
  const { currentCategory, cards, page: resultPage, pageSize, total, error, sidebarItems, displayMode } =
    await getStrengthPageData(currentLocale, {
      page: currentPage,
      pageSize: 12,
    });

  return (
    <StrengthShell
      locale={locale}
      title={currentCategory ? (currentLocale === 'en' ? currentCategory.nameEn || currentCategory.nameZh : currentCategory.nameZh) : currentLocale === 'en' ? 'Strength' : '实力展示'}
      englishTitle="Strength"
      subtitle={
        currentLocale === 'en'
          ? 'Explore technical teams, honors, certificates and production equipment capability.'
          : '展示企业技术团队、荣誉资质、证书体系与生产设备能力。'
      }
      bannerImage={currentCategory?.ogImage || '/images/about/about_img_hero_factory_01.png'}
      sidebarTitle={currentLocale === 'en' ? 'Strength Categories' : '实力分类'}
      sidebarItems={sidebarItems}
    >
      {error ? (
        <div className="mb-6 border border-[rgba(230,0,18,0.16)] bg-white px-5 py-4 text-sm text-neutral-700 shadow-soft">
          {currentLocale === 'en'
            ? 'The live strength API is currently unavailable. The page is showing the available fallback structure.'
            : '当前实力展示接口暂时不可用，页面已按可用结构进行降级显示。'}
        </div>
      ) : null}
      <div className="space-y-8">
        <StrengthGalleryGrid locale={currentLocale} items={cards} displayMode={displayMode} />
        {total > pageSize ? (
          <div className="flex justify-center">
            <StrengthPaginationNav page={resultPage} pageSize={pageSize} total={total} />
          </div>
        ) : null}
      </div>
    </StrengthShell>
  );
}
