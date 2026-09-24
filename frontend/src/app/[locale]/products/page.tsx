import type { Metadata } from 'next';

import { JsonLd } from '@/components/JsonLd';
import { ChineseProductsLanding } from '@/components/products/ChineseProductsLanding';
import { getProductCollectionJsonLd } from '@/lib/seo/jsonld';
import { buildMetadata } from '@/lib/seo/metadata';
import { PRODUCT_COLLECTION_SEO } from '@/lib/seo/page-data';
import { ENGLISH_STATIC_PAGE_METADATA } from '@/lib/seo/static-page-metadata-en';
import { Locale } from '@/types/site';

type ProductsPageProps = {
  params: Promise<{
    locale: string;
  }>;
};

const PRODUCT_HERO_IMAGE = '/images/home/heat-treatment-line-manufacturing-base-3840.webp';

const productSeoCopy = {
  zh: PRODUCT_COLLECTION_SEO,
  en: {
    ...ENGLISH_STATIC_PAGE_METADATA.products,
    keywords: [
      'heat treatment furnace',
      'industrial furnace',
      'box furnace',
      'bogie-hearth furnace',
      'mesh-belt furnace',
      'continuous heat-treatment line',
    ],
  },
} satisfies Record<
  Locale,
  {
    title: string;
    description: string;
    keywords: string[];
  }
>;

export const revalidate = 3600;

export async function generateMetadata({ params }: ProductsPageProps): Promise<Metadata> {
  const { locale } = await params;
  const currentLocale = (locale === 'en' ? 'en' : 'zh') as Locale;
  const seo = productSeoCopy[currentLocale];

  return buildMetadata({
    title: seo.title,
    description: seo.description,
    path: `/${currentLocale}/products`,
    pageKey: 'products',
    keywords: seo.keywords,
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
      <JsonLd
        id={`product-collection-jsonld-${currentLocale}`}
        data={getProductCollectionJsonLd(`/${currentLocale}/products`, currentLocale)}
      />
      <ChineseProductsLanding locale={currentLocale} />
    </main>
  );
}
