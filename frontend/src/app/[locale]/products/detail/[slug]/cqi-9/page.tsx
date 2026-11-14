import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { Cqi9EquipmentPage } from '@/components/products/Cqi9EquipmentPage';
import { JsonLd } from '@/components/JsonLd';
import { getBreadcrumbJsonLd } from '@/lib/seo/jsonld';
import { buildMetadata } from '@/lib/seo/metadata';

type Props = { params: Promise<{ locale: string; slug: string }> };
export const dynamicParams = false;
export function generateStaticParams() {
  return ['zh', 'en'].map(locale => ({ locale, slug: 'fastener-quench-temper-line' }));
}
export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale, slug } = await params;
  if (!['zh', 'en'].includes(locale) || slug !== 'fastener-quench-temper-line') notFound();
  const path = '/products/detail/fastener-quench-temper-line/cqi-9';
  return {
    ...buildMetadata({
      title: locale === 'zh' ? 'CQI-9 审核设备配合｜网带调质线配置与记录' : 'CQI-9 Equipment Support | Mesh-Belt Quench & Temper Lines | Suneng',
      description: locale === 'zh'
        ? '准备 CQI-9 审核时，采购网带调质线要核对什么？以苏能一份紧固件项目协议为例，查看分区控温、温度记录等设备配置，以及验收条件和买方职责。'
        : 'Preparing for a CQI-9 assessment? See the mesh-belt line controls, temperature records, acceptance terms and buyer duties in a Suneng fastener project.',
      path: `/${locale}${path}`,
      alternateLocales: { 'zh-CN': `/zh${path}`, 'en-US': `/en${path}`, 'x-default': `/zh${path}` },
    }),
    ...(process.env.NODE_ENV !== 'production' || process.env.SITE_NOINDEX === 'true'
      ? { robots: { index: false, follow: false } }
      : {}),
  };
}
export default async function Cqi9Page({ params }: Props) {
  const { locale, slug } = await params;
  if (!['zh', 'en'].includes(locale) || slug !== 'fastener-quench-temper-line') notFound();
  const en = locale === 'en';
  const parent = `/${locale}/products/detail/fastener-quench-temper-line`;
  return <>
    <Cqi9EquipmentPage locale={en ? 'en' : 'zh'} />
    <JsonLd id="cqi-9-breadcrumb-jsonld" data={getBreadcrumbJsonLd([
      { name: en ? 'Home' : '首页', url: `/${locale}` },
      { name: en ? 'Equipment & Production Lines' : '设备与生产线', url: `/${locale}/products` },
      { name: en ? 'Fastener Quench & Temper Line' : '紧固件调质生产线', url: parent },
      { name: en ? 'CQI-9 equipment support' : 'CQI-9 设备配合', url: `${parent}/cqi-9` },
    ])} />
  </>;
}
