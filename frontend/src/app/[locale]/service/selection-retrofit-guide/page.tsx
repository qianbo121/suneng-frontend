import { serviceHref, serviceText } from '@/components/service-pages/service-localization';
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
  if (locale !== 'zh' && locale !== 'en') notFound();
  return buildMetadata({
    title: locale === 'en' ? 'Furnace Selection & Retrofit Guide | Suneng' : '选型与改造指南｜工业炉选型、故障判断与搬迁复产',
    description: locale === 'en' ? 'Review furnace selection, repair, retrofit, relocation, restart and inquiry preparation by workpiece, process, output and equipment condition.' : '从工件、工艺、产量和设备现状出发，了解工业炉选型、维修改造、搬迁复产及咨询前需要准备的资料。',
    path: serviceHref(serviceRoutes.guides, locale),
    locale,
    pageKey: 'service',
    image: heroImage,
    alternateLocales: { 'zh-CN': serviceRoutes.guides, 'en-US': serviceHref(serviceRoutes.guides, 'en'), 'x-default': serviceRoutes.guides },
  });
}

export default async function ServiceSelectionGuidePage({ params }: PageProps) {
  const { locale } = await params;
  if (locale !== 'zh' && locale !== 'en') notFound();
  const t = (text: string) => serviceText(text, locale);
  return <>
    <JsonLd id="service-selection-guide-breadcrumb" data={getBreadcrumbJsonLd([
      { name: t('首页'), url: `/${locale}` },
      { name: t('改造与服务'), url: serviceHref(serviceRoutes.overview, locale) },
      { name: t('选型与改造指南'), url: serviceHref(serviceRoutes.guides, locale) },
    ])} />
    <SelectionGuidePage heroImage={heroImage} locale={locale} />
  </>;
}
