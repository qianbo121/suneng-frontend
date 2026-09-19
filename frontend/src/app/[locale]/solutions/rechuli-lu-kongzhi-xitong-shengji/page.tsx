import { TECHNICAL_CONTENT_PUBLISHED } from '@/lib/publication-scope';
import {
  EnglishSolutionPage,
  englishSolutionMetadata,
} from '@/components/engineering/EnglishSolutionsPage';
import { solutionAlternates } from '@/lib/english-solutions';
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
import { FURNACE_CONTROL_SYSTEM_UPGRADE_SEO as seo } from '@/lib/seo/page-data';
import { ControlContent } from '@/components/geo-pages/reviewed/ControlContent';
import faqs from '@/components/geo-pages/reviewed/control-faqs.json';

type PageProps = { params: Promise<{ locale: string }> };

const pagePath = '/zh/solutions/rechuli-lu-kongzhi-xitong-shengji';

const servicePath = '/zh/service/furnace-renovation-overhaul';

const organizationJsonLd = {
  ...getOrganizationJsonLd('zh'),
  '@type': 'Organization',
};

const jsonLd = [
  getArticleJsonLd({
    slug: 'rechuli-lu-kongzhi-xitong-shengji',
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
    { name: '控制系统升级', url: pagePath },
  ]),
  organizationJsonLd,
  getFaqJsonLd(faqs),
];

export const dynamicParams = false;

export async function generateStaticParams() {
  return [{ locale: 'zh' }, { locale: 'en' }];
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  if (!TECHNICAL_CONTENT_PUBLISHED) notFound();
  const { locale } = await params;
  if (locale === 'en') return englishSolutionMetadata('rechuli-lu-kongzhi-xitong-shengji');
  if (locale !== 'zh') notFound();
  return buildMetadata({
    locale: 'zh',
    path: pagePath,
    alternateLocales: solutionAlternates('rechuli-lu-kongzhi-xitong-shengji'),
    title: seo.title,
    description: seo.description,
    keywords: seo.keywords,
    image: seo.ogImage,
    type: 'article',
    publishedTime: seo.publishedTime,
    modifiedTime: seo.modifiedTime,
  });
}

export default async function FurnaceControlSystemUpgradePage({ params }: PageProps) {
  if (!TECHNICAL_CONTENT_PUBLISHED) notFound();
  const { locale } = await params;
  if (locale === 'en') return <EnglishSolutionPage slug="rechuli-lu-kongzhi-xitong-shengji" />;
  if (locale !== 'zh') notFound();
  return (
    <>
      <JsonLd data={jsonLd} />
      <ControlContent />
    </>
  );
}
