import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { isPublishedGuide } from '@/lib/publication-scope';
import { JiangsuManufacturerContent } from '@/components/manufacturer-pages/JiangsuManufacturerContent';
import faqs from '@/components/manufacturer-pages/jiangsu-faqs.json';
import { JsonLd } from '@/components/JsonLd';
import { cleanObject, getBreadcrumbJsonLd, getFaqJsonLd, getWebPageJsonLd } from '@/lib/seo/jsonld';
import { buildMetadata } from '@/lib/seo/metadata';
import { JIANGSU_INDUSTRIAL_FURNACE_MANUFACTURER_SEO } from '@/lib/seo/page-data';

type PageProps = { params: Promise<{ locale: string }> };
const pagePath = '/zh/solutions/jiangsu-gongye-lu-changjia';
export const dynamicParams = false;
const pageJsonLd = cleanObject([
  getWebPageJsonLd({
    path: pagePath,
    name: JIANGSU_INDUSTRIAL_FURNACE_MANUFACTURER_SEO.ogTitle,
    description: JIANGSU_INDUSTRIAL_FURNACE_MANUFACTURER_SEO.description,
    mainEntityId: 'https://www.jssngyl.cn/#organization',
  }),
  getBreadcrumbJsonLd([
    { name: '首页', url: '/zh' },
    { name: '选型与改造指南', url: '/zh/service/selection-retrofit-guide' },
    { name: '江苏工业炉厂家', url: pagePath },
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
    title: JIANGSU_INDUSTRIAL_FURNACE_MANUFACTURER_SEO.title,
    description: JIANGSU_INDUSTRIAL_FURNACE_MANUFACTURER_SEO.description,
    path: pagePath,
    pageKey: 'solutions',
    keywords: JIANGSU_INDUSTRIAL_FURNACE_MANUFACTURER_SEO.keywords,
    image: JIANGSU_INDUSTRIAL_FURNACE_MANUFACTURER_SEO.ogImage,
    type: 'website',
    alternateLocales: { 'zh-CN': pagePath, 'x-default': pagePath },
  });
}

export default async function JiangsuIndustrialFurnaceManufacturerPage({ params }: PageProps) {
  const { locale } = await params;
  if (!isPublishedGuide(locale, pagePath)) notFound();
  return (
    <>
      <JiangsuManufacturerContent />
      <JsonLd id="jiangsu-industrial-furnace-manufacturer-page-jsonld" data={pageJsonLd} />
      <JsonLd id="jiangsu-industrial-furnace-manufacturer-faq-jsonld" data={faqJsonLd} />
    </>
  );
}
