import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { ApprovedProcurementPage } from '@/components/procurement/ApprovedProcurementPage';
import { approvedProcurementPages } from '@/lib/approved-procurement-pages';
import { isPublishedProcurementPage } from '@/lib/publication-scope';
import { buildMetadata } from '@/lib/seo/metadata';

type PageProps = { params: Promise<{ locale: string }> };
const page = approvedProcurementPages.equipment;
export const dynamicParams = false;
export function generateStaticParams() { return [{ locale: 'zh' }]; }

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { locale } = await params;
  if (!isPublishedProcurementPage(locale, page.path)) notFound();
  return buildMetadata({
    title: page.title, description: page.description, path: page.path, locale: 'zh',
    alternateLocales: { 'zh-CN': page.path, 'x-default': page.path },
  });
}

export default async function Page({ params }: PageProps) {
  const { locale } = await params;
  if (!isPublishedProcurementPage(locale, page.path)) notFound();
  return <ApprovedProcurementPage id="equipment" />;
}
