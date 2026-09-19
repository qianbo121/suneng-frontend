import { isPublishedGuide } from '@/lib/publication-scope';
import {
  EnglishSolutionPage,
  englishSolutionMetadata,
} from '@/components/engineering/EnglishSolutionsPage';
import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { JsonLd } from '@/components/JsonLd';
import {
  getArticleJsonLd,
  getBreadcrumbJsonLd,
  getFaqJsonLd,
  getOrganizationJsonLd,
} from '@/lib/seo/jsonld';
import { buildMetadata } from '@/lib/seo/metadata';
import { FURNACE_RENOVATION_RISK_CYCLE_GUIDE_SEO as seo } from '@/lib/seo/page-data';
import { RiskContent } from '@/components/geo-pages/reviewed/RiskContent';
import faqs from '@/components/geo-pages/reviewed/risk-faqs.json';

type PageProps = { params: Promise<{ locale: string }> };

const pagePath = '/zh/solutions/rechuli-lu-gaizao-fengxian-zhouqi';

const servicePath = '/zh/service/furnace-renovation-overhaul';

const organizationJsonLd = {
  ...getOrganizationJsonLd('zh'),
  '@type': 'Organization',
};

const jsonLd = [
  getArticleJsonLd({
    slug: 'rechuli-lu-gaizao-fengxian-zhouqi',
    path: pagePath,
    headline: seo.title,
    description: seo.description,
    image: seo.ogImage,
    datePublished: seo.publishedTime,
    dateModified: seo.modifiedTime,
  }),
  getBreadcrumbJsonLd([
    { name: '首页', url: '/zh' },
    { name: '工业炉改造服务', url: servicePath },
    { name: '改造风险与周期', url: pagePath },
  ]),
  organizationJsonLd,
  getFaqJsonLd(faqs),
];

const factReferences = ['SN-CASE-P1-014'];
void factReferences;

export const dynamicParams = false;

export async function generateStaticParams() {
  return [{ locale: 'zh' }, { locale: 'en' }];
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { locale } = await params;
  if (!isPublishedGuide(locale, pagePath)) notFound();
  if (locale === 'en') return englishSolutionMetadata('rechuli-lu-gaizao-fengxian-zhouqi');
  if (locale !== 'zh') notFound();
  return buildMetadata({
    locale: 'zh',
    path: pagePath,
    alternateLocales: { 'zh-CN': pagePath, 'x-default': pagePath },
    title: seo.title,
    description: seo.description,
    keywords: seo.keywords,
    image: seo.ogImage,
    type: 'article',
    publishedTime: seo.publishedTime,
    modifiedTime: seo.modifiedTime,
  });
}

export default async function FurnaceRenovationRiskCyclePage({ params }: PageProps) {
  const { locale } = await params;
  if (!isPublishedGuide(locale, pagePath)) notFound();
  if (locale === 'en') return <EnglishSolutionPage slug="rechuli-lu-gaizao-fengxian-zhouqi" />;
  if (locale !== 'zh') notFound();
  return (
    <>
      <JsonLd data={jsonLd} />
      <RiskContent />
    </>
  );
}
