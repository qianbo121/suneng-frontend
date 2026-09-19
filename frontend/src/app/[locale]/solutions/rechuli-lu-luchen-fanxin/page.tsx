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
import { FURNACE_LINING_RENOVATION_GUIDE_SEO as seo } from '@/lib/seo/page-data';
import { LiningContent } from '@/components/geo-pages/reviewed/LiningContent';
import faqs from '@/components/geo-pages/reviewed/lining-faqs.json';

type PageProps = { params: Promise<{ locale: string }> };

const pagePath = '/zh/solutions/rechuli-lu-luchen-fanxin';

const servicePath = '/zh/service/furnace-renovation-overhaul';

const organizationJsonLd = {
  ...getOrganizationJsonLd('zh'),
  '@type': 'Organization',
};

const jsonLd = [
  getArticleJsonLd({
    slug: 'rechuli-lu-luchen-fanxin',
    path: pagePath,
    headline: seo.title,
    description: seo.description,
    image: seo.ogImage,
    datePublished: seo.publishedTime,
    dateModified: seo.modifiedTime,
    reviewerName: '王工',
  }),
  getBreadcrumbJsonLd([
    { name: '首页', url: '/zh' },
    { name: '工业炉改造服务', url: servicePath },
    { name: '炉衬翻新与保温', url: pagePath },
  ]),
  organizationJsonLd,
  getFaqJsonLd(faqs),
];

export const dynamicParams = false;

export async function generateStaticParams() {
  return [{ locale: 'zh' }, { locale: 'en' }];
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { locale } = await params;
  if (!isPublishedGuide(locale, pagePath)) notFound();
  if (locale === 'en') return englishSolutionMetadata('rechuli-lu-luchen-fanxin');
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

export default async function FurnaceLiningRenovationPage({ params }: PageProps) {
  const { locale } = await params;
  if (!isPublishedGuide(locale, pagePath)) notFound();
  if (locale === 'en') return <EnglishSolutionPage slug="rechuli-lu-luchen-fanxin" />;
  if (locale !== 'zh') notFound();
  return (
    <>
      <JsonLd data={jsonLd} />
      <LiningContent />
    </>
  );
}
