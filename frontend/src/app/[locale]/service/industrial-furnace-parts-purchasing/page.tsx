import englishParts from '@/lib/parts-procurement-en.json';
import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { ApprovedProcurementPage } from '@/components/procurement/ApprovedProcurementPage';
import { approvedProcurementPages } from '@/lib/approved-procurement-pages';
import { isPublishedProcurementPage } from '@/lib/publication-scope';
import { buildMetadata } from '@/lib/seo/metadata';

type PageProps = { params: Promise<{ locale: string }> };
const page = approvedProcurementPages.parts;
export const dynamicParams = false;
export function generateStaticParams() { return [{ locale: 'zh' }, { locale: 'en' }]; }

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { locale } = await params;
  if (!isPublishedProcurementPage(locale, page.path)) notFound();
  const copy = locale === 'en' ? englishParts : page;
  return buildMetadata({
    title: copy.title, description: copy.description, path: copy.path, locale: locale === 'en' ? 'en' : 'zh',
    alternateLocales: { 'zh-CN': page.path, 'en-US': englishParts.path, 'x-default': page.path },
  });
}

export default async function Page({ params }: PageProps) {
  const { locale } = await params;
  if (!isPublishedProcurementPage(locale, page.path)) notFound();
  return <ApprovedProcurementPage id="parts" locale={locale === 'en' ? 'en' : 'zh'} />;
}
