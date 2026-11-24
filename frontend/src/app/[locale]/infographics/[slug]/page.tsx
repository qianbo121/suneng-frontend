import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { InfographicDetail } from '@/components/infographics/InfographicDetail';
import { getInfographic } from '@/lib/infographics';
import { BUCKET_TEETH_INFOGRAPHIC_SLUG } from '@/lib/news-content-type';
import { buildMetadata } from '@/lib/seo/metadata';
import type { Locale } from '@/types/site';

type Props = { params: Promise<{ locale: string; slug: string }> };

async function resolveResource(params: Props['params']) {
  const { locale, slug } = await params;
  if (locale !== 'zh' && locale !== 'en') notFound();
  const language: Locale = locale;
  const resource = getInfographic(slug, language);
  if (!resource) notFound();
  return { resource, locale: language };
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { resource, locale } = await resolveResource(params);
  if (resource.slug === BUCKET_TEETH_INFOGRAPHIC_SLUG) {
    const path = '/infographics/' + resource.slug;
    return buildMetadata({
      title: resource.title, description: resource.summary, locale,
      path: '/' + locale + path, image: resource.image, type: 'article',
      alternateLocales: { 'en-US': '/en' + path, 'zh-CN': '/zh' + path, 'x-default': '/zh' + path },
    });
  }
  return {
    title: resource.title + ' | 图文资料',
    description: resource.summary,
    robots: { index: false, follow: true },
  };
}

export default async function InfographicPage({ params }: Props) {
  const { resource, locale } = await resolveResource(params);
  return <InfographicDetail resource={resource} locale={locale} />;
}
