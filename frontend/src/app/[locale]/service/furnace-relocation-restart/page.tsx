import { notFound } from 'next/navigation';
import { ServicePageView } from '@/components/service-pages/ServicePages';
import { getServiceMetadata } from '@/components/service-pages/service-metadata';

type PageProps = { params: Promise<{ locale: string }> };

export const dynamicParams = false;

export function generateStaticParams() {
  return [{ locale: 'zh' }];
}

export async function generateMetadata({ params }: PageProps) {
  if ((await params).locale !== 'zh') notFound();
  return getServiceMetadata('relocation');
}

export default async function FurnaceRelocationRestartPage({ params }: PageProps) {
  if ((await params).locale !== 'zh') notFound();
  return <ServicePageView kind="relocation" />;
}
