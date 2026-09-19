import { TECHNICAL_CONTENT_PUBLISHED } from '@/lib/publication-scope';
import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { JsonLd } from '@/components/JsonLd';
import { cleanObject, getArticleJsonLd, getBreadcrumbJsonLd, getFaqJsonLd } from '@/lib/seo/jsonld';
import { buildMetadata } from '@/lib/seo/metadata';
import { OLD_HEAT_TREATMENT_FURNACE_REPAIR_OR_REPLACE_SEO } from '@/lib/seo/page-data';
import { DecisionContent } from '@/components/geo-pages/reviewed/DecisionContent';
import faqs from '@/components/geo-pages/reviewed/decision-faqs.json';

type PageProps = {
  params: Promise<{
    locale: string;
  }>;
};

const pagePath = '/zh/articles/laojiu-rechuli-lu-daxiu-haishi-maixin';

const servicePath = '/zh/service';

export const dynamicParams = false;

const faqJsonLd = getFaqJsonLd(faqs);

const pageJsonLd = cleanObject([
  getArticleJsonLd({
    slug: 'laojiu-rechuli-lu-daxiu-haishi-maixin',
    path: pagePath,
    headline: OLD_HEAT_TREATMENT_FURNACE_REPAIR_OR_REPLACE_SEO.title,
    description: OLD_HEAT_TREATMENT_FURNACE_REPAIR_OR_REPLACE_SEO.description,
    image: OLD_HEAT_TREATMENT_FURNACE_REPAIR_OR_REPLACE_SEO.ogImage,
    datePublished: OLD_HEAT_TREATMENT_FURNACE_REPAIR_OR_REPLACE_SEO.publishedTime,
    dateModified: OLD_HEAT_TREATMENT_FURNACE_REPAIR_OR_REPLACE_SEO.modifiedTime,
  }),
  getBreadcrumbJsonLd([
    { name: '首页', url: '/zh' },
    { name: '服务支持', url: servicePath },
    { name: '老旧热处理炉是大修还是买新的', url: pagePath },
  ]),
]);

export function generateStaticParams() {
  return [{ locale: 'zh' }];
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  if (!TECHNICAL_CONTENT_PUBLISHED) notFound();
  const { locale } = await params;

  if (locale !== 'zh') {
    notFound();
  }

  return buildMetadata({
    title: OLD_HEAT_TREATMENT_FURNACE_REPAIR_OR_REPLACE_SEO.title,
    description: OLD_HEAT_TREATMENT_FURNACE_REPAIR_OR_REPLACE_SEO.description,
    path: pagePath,
    pageKey: 'article',
    keywords: OLD_HEAT_TREATMENT_FURNACE_REPAIR_OR_REPLACE_SEO.keywords,
    image: OLD_HEAT_TREATMENT_FURNACE_REPAIR_OR_REPLACE_SEO.ogImage,
    type: 'article',
    publishedTime: OLD_HEAT_TREATMENT_FURNACE_REPAIR_OR_REPLACE_SEO.publishedTime,
    modifiedTime: OLD_HEAT_TREATMENT_FURNACE_REPAIR_OR_REPLACE_SEO.modifiedTime,
    alternateLocales: {
      'zh-CN': pagePath,
      'x-default': pagePath,
    },
  });
}

export default async function OldHeatTreatmentFurnaceDecisionPage({ params }: PageProps) {
  if (!TECHNICAL_CONTENT_PUBLISHED) notFound();
  const { locale } = await params;
  if (locale !== 'zh') {
    notFound();
  }
  return (
    <>
      <JsonLd id="old-heat-treatment-furnace-decision-page-jsonld" data={pageJsonLd} />
      <JsonLd id="old-heat-treatment-furnace-decision-faq-jsonld" data={faqJsonLd} />
      <DecisionContent />
    </>
  );
}
