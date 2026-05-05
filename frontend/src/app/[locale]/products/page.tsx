import type { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';

import { JsonLd } from '@/components/JsonLd';
import { Breadcrumb } from '@/components/layout/Breadcrumb';
import { PageBanner } from '@/components/layout/PageBanner';
import { PRODUCT_CENTER_CATEGORIES } from '@/constants/product-categories';
import { getProductCollectionJsonLd } from '@/lib/seo/jsonld';
import { buildMetadata } from '@/lib/seo/metadata';
import { PRODUCT_COLLECTION_SEO } from '@/lib/seo/page-data';
import { Locale } from '@/types/site';

type ProductsPageProps = {
  params: Promise<{
    locale: string;
  }>;
};

const PRODUCT_HERO_IMAGE = '/images/products/product-list-hero.png';

export const revalidate = 3600;

export async function generateMetadata({ params }: ProductsPageProps): Promise<Metadata> {
  const { locale } = await params;
  const currentLocale = (locale === 'en' ? 'en' : 'zh') as Locale;

  return buildMetadata({
    title: PRODUCT_COLLECTION_SEO.title,
    description: PRODUCT_COLLECTION_SEO.description,
    path: `/${currentLocale}/products`,
    keywords: PRODUCT_COLLECTION_SEO.keywords,
    image: PRODUCT_HERO_IMAGE,
    alternateLocales: {
      'zh-CN': '/zh/products',
      'en-US': '/en/products',
      'x-default': '/zh/products',
    },
  });
}

export default async function ProductsPage({ params }: ProductsPageProps) {
  const { locale } = await params;
  const currentLocale = (locale === 'en' ? 'en' : 'zh') as Locale;

  return (
    <main className="bg-white text-[#202020]">
      <JsonLd id={`product-collection-jsonld-${currentLocale}`} data={getProductCollectionJsonLd(`/${currentLocale}/products`)} />
      {/* Hero: 复用合作伙伴/关于我们同款 banner 规范，保证背景尺寸、蒙版和标题颜色一致。 */}
      <PageBanner
        locale={locale}
        title={currentLocale === 'en' ? 'Product Center' : '产品中心'}
        englishTitle="Product Center"
        subtitle={
          currentLocale === 'en'
            ? 'Focus on large industrial furnace products for diverse heat treatment needs'
            : '聚焦八大型产品，满足多场景热处理设备需求'
        }
        backgroundImage={PRODUCT_HERO_IMAGE}
        variant="about"
      />

      {/* Breadcrumb: 复用关于我们同款容器和 Breadcrumb 组件。 */}
      <div className="border-b border-[#e5e5e5] bg-white">
        <div className="mx-auto flex min-h-[54px] max-w-[1660px] items-center px-6 lg:px-[86px]">
          <Breadcrumb locale={locale} currentLabel={currentLocale === 'en' ? 'Product Center' : '产品中心'} tone="dark" className="text-[13px]" />
        </div>
      </div>

      {/* Product Grid: 8 个炉型，图片与首页产品中心保持一致。 */}
      <section className="mx-auto max-w-[1440px] px-[52px] pb-[72px] pt-[44px] max-md:px-6 max-md:py-10">
        <div className="grid gap-[26px] sm:grid-cols-2 lg:grid-cols-4">
          {PRODUCT_CENTER_CATEGORIES.map((item) => (
            <Link
              key={item.id}
              href={`/${locale}/products/detail/${item.slug}`}
              className="group flex min-h-[356px] flex-col overflow-hidden rounded-[6px] border border-[#e4e8ee] bg-white px-6 pb-8 pt-8 text-center transition-all duration-300 hover:-translate-y-1 hover:border-[#e60012] hover:shadow-[0_12px_28px_rgba(15,23,42,0.08)]"
            >
              <div className="relative flex h-[204px] items-center justify-center">
                <Image
                  src={item.image}
                  alt={`${item.name[currentLocale]}产品图`}
                  fill
                  className="object-contain transition-transform duration-500 group-hover:scale-[1.04]"
                  sizes="(min-width: 1024px) 25vw, (min-width: 640px) 50vw, 100vw"
                />
              </div>
              <h3 className="mt-8 text-[24px] font-medium leading-[1.35] text-[#202020]">
                {item.name[currentLocale]}
              </h3>
              <p className="mx-auto mt-4 max-w-[190px] text-[15px] leading-[1.85] text-[#555f6d]">
                {item.showcaseDescription[currentLocale]}
              </p>
            </Link>
          ))}
        </div>
      </section>
    </main>
  );
}
