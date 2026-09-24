import { ServicePageView } from '@/components/service-pages/ServicePages';
import { getServiceMetadata } from '@/components/service-pages/service-metadata';

type Props = { params: Promise<{ locale: string }> };
export async function generateMetadata({ params }: Props) {
  const { locale } = await params;
  return getServiceMetadata('overview', locale === 'en' ? 'en' : 'zh');
}
export default async function ServicePage({ params }: Props) {
  const { locale } = await params;
  return <ServicePageView kind="overview" locale={locale === 'en' ? 'en' : 'zh'} />;
}
