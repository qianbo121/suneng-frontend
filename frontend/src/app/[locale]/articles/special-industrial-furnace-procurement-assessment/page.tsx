import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { ApprovedProcurementPage } from '@/components/procurement/ApprovedProcurementPage';
import { approvedProcurementPages } from '@/lib/approved-procurement-pages';
import englishPage from '@/lib/equipment-procurement-en.json';
import { isPublishedProcurementPage } from '@/lib/publication-scope';
import { buildMetadata } from '@/lib/seo/metadata';

type PageProps = { params: Promise<{ locale: string }> };
const page = approvedProcurementPages.equipment;
export const dynamicParams = false;
export function generateStaticParams() { return [{ locale: 'zh' }, { locale: 'en' }]; }

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { locale } = await params;
  if (!isPublishedProcurementPage(locale, page.path)) notFound();
  const current = locale === 'en' ? englishPage : page;
  return buildMetadata({
    title: current.title, description: current.description, path: current.path, locale: locale === 'en' ? 'en' : 'zh',
    alternateLocales: { 'zh-CN': page.path, 'en-US': englishPage.path, 'x-default': page.path },
  });
}

export default async function Page({ params }: PageProps) {
  const { locale } = await params;
  if (!isPublishedProcurementPage(locale, page.path)) notFound();
  return <ApprovedProcurementPage id="equipment" locale={locale === 'en' ? 'en' : 'zh'} />;
}
