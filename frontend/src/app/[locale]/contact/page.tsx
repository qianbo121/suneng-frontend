import { getIndexingRobots } from '@/lib/seo/metadata';
import type { Metadata } from 'next';

import { ContactZhContent } from '@/components/about-subpages/ContactZhContent';
import { resolveInquiryProduct } from '@/lib/inquiry-product';
import { SITE_NAME } from '@/lib/seo/config';
import { absoluteUrl, buildMetadata } from '@/lib/seo/metadata';
import { CONTACT_SEO } from '@/lib/seo/page-data';
import { ENGLISH_STATIC_PAGE_METADATA } from '@/lib/seo/static-page-metadata-en';
import { Locale } from '@/types/site';

type ContactPageProps = {
  searchParams: Promise<{ product?: string | string[] }>;
  params: Promise<{
    locale: string;
  }>;
};

const contactHero = '/images/contact/contact-hero.png';

const contactSeoCopy = {
  zh: CONTACT_SEO,
  en: {
    ...ENGLISH_STATIC_PAGE_METADATA.contact,
    keywords: [
      'Suneng Industrial Furnace contact',
      'industrial furnace manufacturer phone',
      'industrial furnace inquiry',
      'heat treatment furnace supplier',
    ],
    ogTitle: 'Contact Jiangsu Suneng Industrial Furnace | Phone, Address and Inquiry',
    ogDescription:
      'Contact Suneng Industrial Furnace for industrial furnace equipment, heat treatment furnaces, energy-saving retrofit and overhaul service.',
  },
} satisfies Record<
  Locale,
  {
    title: string;
    description: string;
    keywords: string[];
    ogTitle: string;
    ogDescription: string;
  }
>;

export const revalidate = 3600;

export async function generateMetadata({ params }: ContactPageProps): Promise<Metadata> {
  const { locale } = await params;
  const currentLocale = (locale === 'en' ? 'en' : 'zh') as Locale;
  const openGraphLocale = currentLocale === 'en' ? 'en_US' : 'zh_CN';
  const seo = contactSeoCopy[currentLocale];

  if (currentLocale === 'zh') {
    const canonical = absoluteUrl('/zh/contact');
    const image = absoluteUrl(contactHero);

    return {
      title: {
        absolute: '联系我们｜江苏苏能工业炉有限公司',
      },
      description:
        '江苏苏能工业炉有限公司设备咨询、项目沟通与来厂联系。电话 130-5298-6814，邮箱 997518512@qq.com，支持微信咨询与在线留言。',
      alternates: {
        canonical,
        languages: {
          'zh-CN': absoluteUrl('/zh/contact'),
          'en-US': absoluteUrl('/en/contact'),
          'x-default': absoluteUrl('/zh/contact'),
        },
      },
      openGraph: {
        title: CONTACT_SEO.ogTitle,
        description: CONTACT_SEO.ogDescription,
        type: 'website',
        url: canonical,
        siteName: SITE_NAME,
        locale: openGraphLocale,
        images: [{ url: image }],
      },
      twitter: {
        card: 'summary_large_image',
        title: CONTACT_SEO.ogTitle,
        description: CONTACT_SEO.ogDescription,
        images: [image],
      },
      robots: getIndexingRobots(),
    };
  }

  return buildMetadata({
    title: seo.title,
    description: seo.description,
    path: `/${currentLocale}/contact`,
    pageKey: 'contact',
    keywords: seo.keywords,
    image: contactHero,
    alternateLocales: {
      'zh-CN': '/zh/contact',
      'en-US': '/en/contact',
      'x-default': '/zh/contact',
    },
  });
}

export default async function ContactPage({ params, searchParams }: ContactPageProps) {
  const { locale } = await params;
  const currentLocale = (locale === 'en' ? 'en' : 'zh') as Locale;
  const inquiryProduct = resolveInquiryProduct((await searchParams).product, currentLocale);
  return <ContactZhContent locale={currentLocale} inquiryProduct={inquiryProduct} />;
}
