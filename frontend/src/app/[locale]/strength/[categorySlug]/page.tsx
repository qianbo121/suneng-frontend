import { notFound, permanentRedirect } from 'next/navigation';
import { SUNENG_ISO_CERTIFICATES, SUNENG_PATENT_CERTIFICATES, SUNENG_QUALIFICATION_CERTIFICATES } from '@/constants/certificates';
import { CertificateGallerySections } from '@/components/strength/CertificateGallerySections';
import { buildMetadata } from '@/lib/seo/metadata';

type StrengthCategoryPageProps = { params: Promise<{ locale: string; categorySlug: string }> };
export const revalidate = 3600;

async function resolvePage(params: StrengthCategoryPageProps['params']) {
  const { locale, categorySlug } = await params;
  const currentLocale = locale === 'en' ? 'en' : 'zh';
  if (categorySlug === 'certificates') permanentRedirect(`/${currentLocale}/strength/honors#management-systems`);
  if (categorySlug !== 'honors') notFound();
  return currentLocale;
}

export async function generateMetadata({ params }: StrengthCategoryPageProps) {
  const locale = await resolvePage(params);
  return buildMetadata({
    title: locale === 'en' ? 'Qualifications & Patent Certificates | Suneng' : '荣誉资质与专利证书',
    description: locale === 'en'
      ? 'View Suneng company registration, National High-Tech Enterprise recognition, ISO 9001 quality management certification and 14 patent certificates, with original documents.'
      : '集中查阅江苏苏能工业炉有限公司营业执照、国家高新技术企业证书、ISO 9001 质量管理体系认证和全部 14 项授权专利原件。',
    path: `/${locale}/strength/honors`,
    locale,
    alternateLocales: {
      'zh-CN': '/zh/strength/honors',
      'en-US': '/en/strength/honors',
      'x-default': '/zh/strength/honors',
    },
  });
}

export default async function StrengthCategoryPage({ params }: StrengthCategoryPageProps) {
  const locale = await resolvePage(params);
  return <CertificateGallerySections locale={locale} qualifications={SUNENG_QUALIFICATION_CERTIFICATES} isoCertificates={SUNENG_ISO_CERTIFICATES} patents={SUNENG_PATENT_CERTIFICATES} />;
}
