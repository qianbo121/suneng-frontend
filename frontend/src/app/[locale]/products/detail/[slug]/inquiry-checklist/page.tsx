import type { Metadata } from 'next';
import translations from '@/lib/copper-wire-checklist-translations-en.json';
import { notFound } from 'next/navigation';

import { JsonLd } from '@/components/JsonLd';
import { CopperWireInquiryChecklist } from '@/components/products/CopperWireInquiryChecklist';
import {
  copperWireChecklistPath,
  copperWireChecklistTitle,
  copperWireDetailPath,
} from '@/lib/copper-wire-inquiry-checklist';
import { buildMetadata } from '@/lib/seo/metadata';
import { getBreadcrumbJsonLd } from '@/lib/seo/jsonld';

type Props = { params: Promise<{ locale: string; slug: string }> };

export const dynamicParams = false;

export function generateStaticParams() {
  return ['zh', 'en'].map(locale => ({ locale, slug: 'copper-wire-annealing-line' }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale, slug } = await params;
  if (!['zh', 'en'].includes(locale) || slug !== 'copper-wire-annealing-line') notFound();
  return buildMetadata({
    title: locale === 'en' ? translations[copperWireChecklistTitle] : copperWireChecklistTitle,
    description: locale === 'en' ? translations['铜丝连续退火生产线询价资料准备清单：整理材料、规格、性能、产量、设备范围及现场条件。资料不全可留空，支持打印与下载，不作为最终选型、报价或验收依据。'] :
      '铜丝连续退火生产线询价资料准备清单：整理材料、规格、性能、产量、设备范围及现场条件。资料不全可留空，支持打印与下载，不作为最终选型、报价或验收依据。',
    path: copperWireChecklistPath.replace('/zh/', `/${locale}/`),
    alternateLocales: { 'zh-CN': copperWireChecklistPath, 'en-US': copperWireChecklistPath.replace('/zh/', '/en/'), 'x-default': copperWireChecklistPath },
  });
}

export default async function InquiryChecklistPage({ params }: Props) {
  const { locale, slug } = await params;
  if (!['zh', 'en'].includes(locale) || slug !== 'copper-wire-annealing-line') notFound();
  const isEnglish = locale === 'en';
  return <>
    <CopperWireInquiryChecklist locale={isEnglish ? 'en' : 'zh'} translations={isEnglish ? translations : undefined} />
    <JsonLd id="copper-wire-checklist-breadcrumb-jsonld" data={getBreadcrumbJsonLd([
      { name: isEnglish ? 'Home' : '首页', url: `/${locale}` },
      { name: isEnglish ? translations['产品中心'] : '产品中心', url: `/${locale}/products` },
      { name: isEnglish ? translations['铜丝连续退火生产线'] : '铜丝连续退火生产线', url: copperWireDetailPath.replace('/zh/', `/${locale}/`) },
      { name: isEnglish ? translations['询价资料准备清单'] : '询价资料准备清单', url: copperWireChecklistPath.replace('/zh/', `/${locale}/`) },
    ])} />
  </>;
}
