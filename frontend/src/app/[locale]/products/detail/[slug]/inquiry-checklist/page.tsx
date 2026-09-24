import type { Metadata } from 'next';
import translations from '@/lib/copper-wire-checklist-translations-en.json';
import { notFound } from 'next/navigation';

import { CopperWireInquiryChecklist } from '@/components/products/CopperWireInquiryChecklist';
import {
  copperWireChecklistPath,
  copperWireChecklistTitle,
} from '@/lib/copper-wire-inquiry-checklist';
import { buildMetadata } from '@/lib/seo/metadata';

type Props = { params: Promise<{ locale: string; slug: string }> };

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
  return <CopperWireInquiryChecklist locale={locale === 'en' ? 'en' : 'zh'} translations={locale === 'en' ? translations : undefined} />;
}
