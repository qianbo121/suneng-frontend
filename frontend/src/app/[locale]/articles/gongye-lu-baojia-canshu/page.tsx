import englishFaqs from '@/components/geo-pages/reviewed/quote-faqs-en.json';
import { isPublishedGuide } from '@/lib/publication-scope';
import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { JsonLd } from '@/components/JsonLd';
import { getArticleJsonLd, getBreadcrumbJsonLd, getFaqJsonLd } from '@/lib/seo/jsonld';
import { buildMetadata } from '@/lib/seo/metadata';
import { INDUSTRIAL_FURNACE_QUOTE_PARAMS_SEO } from '@/lib/seo/page-data';
import { QuoteContent } from '@/components/geo-pages/reviewed/QuoteContent';
import faqs from '@/components/geo-pages/reviewed/quote-faqs.json';

type PageProps = {
  params: Promise<{
    locale: string;
  }>;
};

const pagePath = '/zh/articles/gongye-lu-baojia-canshu';

const enPath = pagePath.replace('/zh/', '/en/');
const englishTitle = "What information do you need for an industrial furnace quotation?";
const englishDescription = "Prepare workpiece, loading, temperature, process and site data. Compare furnace types, check the scope of supply and copy the 17-item inquiry checklist.";
const servicePath = '/zh/service';

export const dynamicParams = false;

const faqJsonLd = getFaqJsonLd(faqs);

const breadcrumbJsonLd = getBreadcrumbJsonLd([
  { name: '首页', url: '/zh' },
  { name: '服务支持', url: servicePath },
  { name: '工业炉报价需要哪些参数', url: pagePath },
]);

const articleJsonLd = getArticleJsonLd({
  slug: 'gongye-lu-baojia-canshu',
  path: pagePath,
  headline: INDUSTRIAL_FURNACE_QUOTE_PARAMS_SEO.title,
  description: INDUSTRIAL_FURNACE_QUOTE_PARAMS_SEO.description,
  image: INDUSTRIAL_FURNACE_QUOTE_PARAMS_SEO.ogImage,
  datePublished: INDUSTRIAL_FURNACE_QUOTE_PARAMS_SEO.publishedTime,
  dateModified: INDUSTRIAL_FURNACE_QUOTE_PARAMS_SEO.modifiedTime,
});

export function generateStaticParams() {
  return [{ locale: 'zh' }, { locale: 'en' }];
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { locale } = await params;
  if (!isPublishedGuide(locale, pagePath)) notFound();
  if (locale === 'en') return buildMetadata({
    locale, title: englishTitle, description: englishDescription, path: enPath, type: 'article',
    image: INDUSTRIAL_FURNACE_QUOTE_PARAMS_SEO.ogImage, alternateLocales: { 'zh-CN': pagePath, 'en-US': enPath, 'x-default': pagePath },
  });

  if (locale !== 'zh') {
    notFound();
  }

  return buildMetadata({
    title: INDUSTRIAL_FURNACE_QUOTE_PARAMS_SEO.title,
    description: INDUSTRIAL_FURNACE_QUOTE_PARAMS_SEO.description,
    path: pagePath,
    pageKey: 'article',
    keywords: INDUSTRIAL_FURNACE_QUOTE_PARAMS_SEO.keywords,
    image: INDUSTRIAL_FURNACE_QUOTE_PARAMS_SEO.ogImage,
    type: 'article',
    publishedTime: INDUSTRIAL_FURNACE_QUOTE_PARAMS_SEO.publishedTime,
    modifiedTime: INDUSTRIAL_FURNACE_QUOTE_PARAMS_SEO.modifiedTime,
    alternateLocales: {
      'zh-CN': pagePath,
      'en-US': enPath,
      'x-default': pagePath,
    },
  });
}

export default async function IndustrialFurnaceQuoteParamsPage({ params }: PageProps) {
  const { locale } = await params;
  if (!isPublishedGuide(locale, pagePath)) notFound();
  if (locale === 'en') return <>
    <JsonLd id="english-guide" data={[
      getArticleJsonLd({slug: 'gongye-lu-baojia-canshu', path: enPath, headline: englishTitle, description: englishDescription, image: INDUSTRIAL_FURNACE_QUOTE_PARAMS_SEO.ogImage, datePublished: INDUSTRIAL_FURNACE_QUOTE_PARAMS_SEO.publishedTime}, 'en'),
      getBreadcrumbJsonLd([{ name: 'Home', url: '/en' }, { name: 'Service and support', url: '/en/service' }, { name: englishTitle, url: enPath }]),
      getFaqJsonLd(englishFaqs),
    ]} />
    <QuoteContent locale="en" />
  </>;
  if (locale !== 'zh') {
    notFound();
  }
  return (
    <>
      <JsonLd id="industrial-furnace-quote-params-article-jsonld" data={articleJsonLd} />
      <JsonLd id="industrial-furnace-quote-params-breadcrumb-jsonld" data={breadcrumbJsonLd} />
      <JsonLd id="industrial-furnace-quote-params-faq-jsonld" data={faqJsonLd} />
      <QuoteContent />
    </>
  );
}
