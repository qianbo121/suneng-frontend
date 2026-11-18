import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { InfographicDetail } from '@/components/infographics/InfographicDetail';
import { getInfographic } from '@/lib/infographics';

type Props = { params: Promise<{ locale: string; slug: string }> };

async function resolveResource(params: Props['params']) {
  const { locale, slug } = await params;
  const resource = locale === 'zh' ? getInfographic(slug) : undefined;
  if (!resource) notFound();
  return resource;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const resource = await resolveResource(params);
  return {
    title: `${resource.title} | 图文资料`,
    description: resource.summary,
    // Keep these pages out of search indexing while the content is Chinese only.
    robots: { index: false, follow: true },
  };
}

export default async function InfographicPage({ params }: Props) {
  return <InfographicDetail resource={await resolveResource(params)} />;
}
