import { notFound } from 'next/navigation';
import { ServicePageView } from '@/components/service-pages/ServicePages';
import { getServiceMetadata } from '@/components/service-pages/service-metadata';

type PageProps = { params: Promise<{ locale: string }> };

export const dynamicParams = false;

export function generateStaticParams() {
  return [{ locale: 'zh' }, { locale: 'en' }];
}

export async function generateMetadata({ params }: PageProps) {
  const { locale } = await params;
  if (locale !== 'zh' && locale !== 'en') notFound();
  return getServiceMetadata('relocation', locale);
}

export default async function FurnaceRelocationRestartPage({ params }: PageProps) {
  const { locale } = await params;
  if (locale !== 'zh' && locale !== 'en') notFound();
  return <ServicePageView kind="relocation" locale={locale} />;
}
