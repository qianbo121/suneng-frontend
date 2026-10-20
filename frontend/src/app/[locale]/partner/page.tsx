import { notFound, redirect } from 'next/navigation';
import { partnerText } from '@/lib/partner-copy';
import { buildMetadata } from '@/lib/seo/metadata';

type PartnerPageProps = { params: Promise<{ locale: string }> };
const description =
  '展示苏能工业炉部分历年客户与合作单位，按省份和行业查看名单，了解工业炉设备配套与合作范围。';
export async function generateMetadata({ params }: PartnerPageProps) {
  const { locale } = await params;
  if (locale !== 'zh' && locale !== 'en') notFound();
  const t = (text: string) => partnerText(text, locale);
  return {
    ...buildMetadata({
      title: t('客户与合作单位'),
      description: locale === 'en' ? 'Explore selected Suneng customers and partners by region and industry, with equipment applications and project scope information.' : description,
      path: `/${locale}/partner`,
      alternateLocales: { 'zh-CN': '/zh/partner', 'en-US': '/en/partner', 'x-default': '/zh/partner' },
    }),
    robots: { index: true, follow: true },
  };
}
export default async function PartnerPage({ params }: PartnerPageProps) {
  const { locale } = await params;
  if (locale !== 'zh' && locale !== 'en') notFound();
  redirect(`/${locale}/about#projects`);
}
