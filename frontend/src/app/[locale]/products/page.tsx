import type { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';

import { JsonLd } from '@/components/JsonLd';
import { Breadcrumb } from '@/components/layout/Breadcrumb';
import { PageBanner } from '@/components/layout/PageBanner';
import { PRODUCT_CENTER_CATEGORIES } from '@/constants/product-categories';
import { buildProductImageAlt } from '@/lib/seo';
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
    pageKey: 'products',
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
      <PageBanner
        locale={locale}
        title={currentLocale === 'en' ? 'Product Center' : '产品中心'}
        englishTitle="Product Center"
        subtitle={
          currentLocale === 'en'
            ? 'Focus on large industrial furnace products for diverse heat treatment needs'
            : '聚焦核心产品，满足多场景热处理设备需求'
        }
        backgroundImage={PRODUCT_HERO_IMAGE}
        variant="compact"
      />

      <div className="border-b border-[#e5e5e5] bg-white">
        <div className="mx-auto flex min-h-[42px] max-w-[1660px] items-center px-6 lg:px-[86px]">
          <Breadcrumb locale={locale} currentLabel={currentLocale === 'en' ? 'Product Center' : '产品中心'} tone="dark" className="text-[13px]" />
        </div>
      </div>

      {/* Product Grid: 产品入口统一来自静态产品分类，新增产品会自动进入列表。 */}
      <section className="mx-auto max-w-[1440px] px-[52px] pb-[72px] pt-[44px] max-md:px-6 max-md:py-10">
        {currentLocale === 'zh' ? (
          <Link
            href="/zh/solutions/continuous-heat-treatment-line"
            className="mb-8 grid gap-5 rounded-[8px] border border-[#e1e7f0] bg-[#f8fafc] p-6 transition hover:border-[#e60012] md:grid-cols-[1fr_auto] md:items-center"
          >
            <div>
              <p className="text-[14px] font-semibold text-[#e60012]">系统级解决方案</p>
              <h2 className="mt-2 text-[24px] font-semibold leading-[1.35] text-[#202020]">连续热处理生产线解决方案</h2>
              <p className="mt-3 max-w-[760px] text-[15px] leading-[1.85] text-[#555f6d]">
                面向连续退火、固溶、正火、回火、淬火加热、清洗、冷却和控制系统等产线级需求，先查看系统组成、选型参数和交付边界。
              </p>
            </div>
            <span className="inline-flex min-h-[42px] items-center justify-center rounded-[4px] bg-[#e60012] px-5 text-[14px] font-semibold text-white">
              查看产线方案
            </span>
          </Link>
        ) : null}
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
                  alt={buildProductImageAlt(currentLocale, item.name[currentLocale], item.showcaseDescription[currentLocale])}
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
