import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { JsonLd } from '@/components/JsonLd';
import { SelectionGuidePage } from '@/components/service-pages/SelectionGuidePage';
import { serviceRoutes } from '@/components/service-pages/service-content';
import { getBreadcrumbJsonLd } from '@/lib/seo/jsonld';
import { buildMetadata } from '@/lib/seo/metadata';

type PageProps = { params: Promise<{ locale: string }> };
const heroImage = '/images/services/selection-guide/hero-engineers.png';

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { locale } = await params;
  if (locale !== 'zh') notFound();
  return buildMetadata({
    title: '选型与改造指南｜工业炉选型、故障判断与搬迁复产',
    description: '从工件、工艺、产量和设备现状出发，了解工业炉选型、维修改造、搬迁复产及咨询前需要准备的资料。',
    path: serviceRoutes.guides,
    pageKey: 'service',
    image: heroImage,
    alternateLocales: { 'zh-CN': serviceRoutes.guides, 'x-default': serviceRoutes.guides },
  });
}

export default async function ServiceSelectionGuidePage({ params }: PageProps) {
  const { locale } = await params;
  if (locale !== 'zh') notFound();
  return <>
    <JsonLd id="service-selection-guide-breadcrumb" data={getBreadcrumbJsonLd([
      { name: '首页', url: '/zh' },
      { name: '改造与服务', url: serviceRoutes.overview },
      { name: '选型与改造指南', url: serviceRoutes.guides },
    ])} />
    <SelectionGuidePage heroImage={heroImage} />
  </>;
}
