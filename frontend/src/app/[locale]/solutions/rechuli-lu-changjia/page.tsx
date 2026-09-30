import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { isPublishedGuide } from '@/lib/publication-scope';
import { ManufacturerContent } from '@/components/manufacturer-pages/ManufacturerContent';
import faqs from '@/components/manufacturer-pages/manufacturer-faqs.json';
import { JsonLd } from '@/components/JsonLd';
import { cleanObject, getBreadcrumbJsonLd, getFaqJsonLd, getWebPageJsonLd } from '@/lib/seo/jsonld';
import { buildMetadata } from '@/lib/seo/metadata';
import { HEAT_TREATMENT_FURNACE_MANUFACTURER_SEO } from '@/lib/seo/page-data';

type PageProps = { params: Promise<{ locale: string }> };
const pagePath = '/zh/solutions/rechuli-lu-changjia';
export const dynamicParams = false;
const pageJsonLd = cleanObject([
  getWebPageJsonLd({
    path: pagePath,
    name: HEAT_TREATMENT_FURNACE_MANUFACTURER_SEO.ogTitle,
    description: HEAT_TREATMENT_FURNACE_MANUFACTURER_SEO.description,
    mainEntityId: 'https://www.jssngyl.cn/#organization',
  }),
  getBreadcrumbJsonLd([
    { name: '首页', url: '/zh' },
    { name: '选型与改造指南', url: '/zh/service/selection-retrofit-guide' },
    { name: '热处理炉厂家', url: pagePath },
  ]),
]);
const faqJsonLd = getFaqJsonLd(faqs);

export function generateStaticParams() {
  return [{ locale: 'zh' }, { locale: 'en' }];
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { locale } = await params;
  if (!isPublishedGuide(locale, pagePath)) notFound();

  return buildMetadata({
    title: HEAT_TREATMENT_FURNACE_MANUFACTURER_SEO.title,
    description: HEAT_TREATMENT_FURNACE_MANUFACTURER_SEO.description,
    path: pagePath,
    pageKey: 'solutions',
    keywords: HEAT_TREATMENT_FURNACE_MANUFACTURER_SEO.keywords,
    image: HEAT_TREATMENT_FURNACE_MANUFACTURER_SEO.ogImage,
    type: 'website',
    alternateLocales: { 'zh-CN': pagePath, 'x-default': pagePath },
  });
}

export default async function HeatTreatmentFurnaceManufacturerPage({ params }: PageProps) {
  const { locale } = await params;
  if (!isPublishedGuide(locale, pagePath)) notFound();
  return (
    <>
      <ManufacturerContent />
      <JsonLd id="heat-treatment-furnace-manufacturer-page-jsonld" data={pageJsonLd} />
      <JsonLd id="heat-treatment-furnace-manufacturer-faq-jsonld" data={faqJsonLd} />
    </>
  );
}
