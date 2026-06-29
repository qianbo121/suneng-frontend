import type { Metadata } from 'next';
import Image from 'next/image';

import { JsonLd } from '@/components/JsonLd';
import { Breadcrumb } from '@/components/layout/Breadcrumb';
import { PageBanner } from '@/components/layout/PageBanner';
import { SITE_NAME } from '@/lib/seo/config';
import { getContactPageJsonLd } from '@/lib/seo/jsonld';
import { absoluteUrl, buildMetadata } from '@/lib/seo/metadata';
import { CONTACT_SEO } from '@/lib/seo/page-data';
import { siteSettings } from '@/mock/siteSettings';
import { Locale } from '@/types/site';

type ContactPageProps = {
  params: Promise<{
    locale: string;
  }>;
};

const contactHero = '/images/contact/contact-hero.png';

const contactSeoCopy = {
  zh: CONTACT_SEO,
  en: {
    title: 'Contact Us | Jiangsu Suneng Industrial Furnace Co., Ltd.',
    description:
      'Contact Jiangsu Suneng Industrial Furnace Co., Ltd. for industrial furnace equipment, heat treatment furnaces, energy-saving retrofit and overhaul service. Phone / WeChat: +86-130-5298-6814.',
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
} satisfies Record<Locale, {
  title: string;
  description: string;
  keywords: string[];
  ogTitle: string;
  ogDescription: string;
}>;

const contactPageCopy = {
  zh: {
    title: '联系我们',
    englishTitle: 'Contact Us',
    subtitle: '专注工业炉研发制造与系统集成解决方案',
    heading: '联系方式',
    company: '江苏苏能工业炉有限公司',
    separator: '：',
    items: [
      {
        label: '联系电话',
        value: siteSettings.salesPhone,
        icon: '/images/contact/icon-phone.png',
      },
      {
        label: '企业邮箱',
        value: siteSettings.email,
        icon: '/images/contact/icon-email.png',
      },
      {
        label: '公司地址',
        value: '江苏省泰州市姜堰区张甸蔡官工业区',
        icon: '/images/contact/icon-location.png',
      },
    ],
  },
  en: {
    title: 'Contact Us',
    englishTitle: 'CONTACT US',
    subtitle: 'Industrial furnace engineering, manufacturing and system integration support',
    heading: 'Contact Information',
    company: 'Jiangsu Suneng Industrial Furnace Co., Ltd.',
    separator: ': ',
    items: [
      {
        label: 'Phone',
        value: siteSettings.salesPhone,
        icon: '/images/contact/icon-phone.png',
      },
      {
        label: 'Email',
        value: siteSettings.email,
        icon: '/images/contact/icon-email.png',
      },
      {
        label: 'Address',
        value: 'Cai Guan Industrial Zone, Zhangdian, Jiangyan District, Taizhou, Jiangsu',
        icon: '/images/contact/icon-location.png',
      },
    ],
  },
} satisfies Record<Locale, {
  title: string;
  englishTitle: string;
  subtitle: string;
  heading: string;
  company: string;
  separator: string;
  items: {
    label: string;
    value: string;
    icon: string;
  }[];
}>;

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
        absolute: CONTACT_SEO.title,
      },
      description: CONTACT_SEO.description,
      keywords: CONTACT_SEO.keywords,
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
      robots: {
        index: true,
        follow: true,
      },
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

export default async function ContactPage({ params }: ContactPageProps) {
  const { locale } = await params;
  const currentLocale = (locale === 'en' ? 'en' : 'zh') as Locale;
  const copy = contactPageCopy[currentLocale];

  return (
    <div className="bg-[#f5f7fa]">
      <JsonLd id={`contact-jsonld-${locale}`} data={getContactPageJsonLd(`/${locale}/contact`, currentLocale)} />
      <PageBanner
        locale={locale}
        title={copy.title}
        englishTitle={copy.englishTitle}
        subtitle={copy.subtitle}
        backgroundImage={contactHero}
        variant="about"
      />

      <div className="border-b border-[#e5e5e5] bg-white">
        <div className="mx-auto flex min-h-[54px] max-w-[1660px] items-center px-6 lg:px-[86px]">
          <Breadcrumb locale={locale} currentLabel={copy.title} tone="dark" className="text-[13px]" />
        </div>
      </div>

      <main className="mx-auto max-w-[1660px] px-6 pb-8 pt-8 lg:px-[86px] lg:pb-10 lg:pt-[48px]">
        <section className="relative overflow-hidden rounded-[8px] bg-white px-6 py-8 shadow-[0_18px_54px_rgba(12,34,69,0.08)] md:px-10 lg:min-h-[455px] lg:px-[52px] lg:py-[55px]">
          <div className="relative z-10 max-w-[640px]">
            <h2 className="text-[32px] font-semibold leading-none tracking-[0.02em] text-[#111111] lg:text-[42px]">
              {copy.heading}
            </h2>
            <p className="mt-6 text-[20px] font-normal leading-none text-[var(--color-accent)] lg:text-[25px]">
              {copy.company}
            </p>
            <div className="mt-6 h-[3px] w-[52px] bg-[var(--color-accent)]" />

            <div className="mt-8 divide-y divide-[#dfe3ea]">
              {copy.items.map((item) => {
                const isPhone = item.label === '联系电话' || item.label === 'Phone';
                const isEmail = item.label === '企业邮箱' || item.label === 'Email';
                const contactHref = isPhone ? `tel:${item.value.replace(/\\s+/g, '')}` : isEmail ? `mailto:${item.value}` : null;

                return (
                  <div
                    key={item.label}
                    className="grid grid-cols-[70px_minmax(0,1fr)] items-center gap-[10px] py-5 first:pt-0 last:pb-0"
                  >
                    <div className="relative h-[70px] w-[70px] shrink-0 overflow-hidden rounded-full">
                      <Image src={item.icon} alt="" fill sizes="70px" className="object-cover" />
                    </div>
                    <div className="flex min-w-0 flex-wrap items-baseline gap-x-0 gap-y-2 text-[18px] leading-[1.5] lg:text-[21px]">
                      <span className="shrink-0 font-normal text-[#333333]">{item.label}{copy.separator}</span>
                      {contactHref ? (
                        <a href={contactHref} className="break-words font-normal text-[#333333] hover:text-[#c51624]">
                          {item.value}
                        </a>
                      ) : (
                        <span className="break-words font-normal text-[#333333]">{item.value}</span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="pointer-events-none absolute right-0 top-1/2 hidden h-[364px] w-[490px] -translate-y-1/2 opacity-95 lg:block">
            <Image src="/images/contact/map-decoration.png" alt="" fill sizes="490px" className="object-contain object-right" />
          </div>
        </section>
      </main>
    </div>
  );
}
