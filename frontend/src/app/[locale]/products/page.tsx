import type { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';

import { JsonLd } from '@/components/JsonLd';
import { Breadcrumb } from '@/components/layout/Breadcrumb';
import { PageBanner } from '@/components/layout/PageBanner';
import { ChineseProductsLanding } from '@/components/products/ChineseProductsLanding';
import { FurnaceProductGrid } from '@/components/products/FurnaceProductGrid';
import { heatTreatmentLines } from '@/components/home/HeatTreatmentLines';
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

const PRODUCT_HERO_IMAGE = '/images/products/product-list-hero.png';
const CHINESE_PRODUCT_HERO_IMAGE = '/images/home/heat-treatment-line-manufacturing-base-3840.webp';

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
    image: currentLocale === 'zh' ? CHINESE_PRODUCT_HERO_IMAGE : PRODUCT_HERO_IMAGE,
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

  if (currentLocale === 'zh') {
    return (
      <main className="bg-white text-[#202020]">
        <JsonLd
          id="product-collection-jsonld-zh"
          data={getProductCollectionJsonLd('/zh/products', 'zh')}
        />
        <ChineseProductsLanding />
      </main>
    );
  }

  return (
    <div className="bg-white text-[#202020]">
      <JsonLd
        id={`product-collection-jsonld-${currentLocale}`}
        data={getProductCollectionJsonLd(`/${currentLocale}/products`, currentLocale)}
      />
      <PageBanner
        locale={locale}
        title="Product Center"
        englishTitle="Product Center"
        subtitle="Custom batch furnaces and continuous heat-treatment lines, configured around your workpiece and process"
        backgroundImage={PRODUCT_HERO_IMAGE}
        variant="compact"
      />

      <div className="border-b border-[#e5e5e5] bg-white">
        <div className="site-page-container flex min-h-[42px] items-center">
          <Breadcrumb
            locale={locale}
            currentLabel="Product Center"
            tone="dark"
            className="text-[13px]"
          />
        </div>
      </div>

      <section id="continuous-lines" aria-labelledby="continuous-lines-title" className="site-section scroll-mt-28 bg-white">
        <div className="site-page-container">
          <h2 id="continuous-lines-title" className="text-3xl font-semibold leading-tight">Continuous Heat-Treatment Lines</h2>
          <p className="mt-4 max-w-3xl text-base leading-7 text-[#526277]">Compare the workpiece, treatment route and conveying method. Heating, cooling, controls and equipment interfaces are defined for each project.</p>
          <div className="mt-7 grid gap-6 lg:grid-cols-3">
            {heatTreatmentLines.map((line) => (
              <Link key={line.slug} href={`/en/products/detail/${line.slug}`} className="group overflow-hidden rounded-lg border border-[#dfe5ee] bg-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#0c4dcc]">
                <div className="relative aspect-video overflow-hidden bg-[#eef2f7]">
                  <Image src={line.image} alt={line.title.en} fill sizes="(min-width: 1024px) 420px, 100vw" className="object-cover" />
                </div>
                <div className="p-6">
                  <h3 className="text-xl font-semibold leading-snug group-hover:text-[#0c4dcc]">{line.title.en}</h3>
                  <p className="mt-3 text-sm leading-6 text-[#526277]">{line.desc.en}</p>
                  <span className="mt-5 inline-block font-semibold text-[#0c4dcc]">View line details →</span>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>
      <section className="site-section bg-[#f7f8fa]">
        <div className="site-page-container">
          <FurnaceProductGrid locale={currentLocale} />
        </div>
      </section>
    </div>
  );
}
