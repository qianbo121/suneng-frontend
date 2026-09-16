import type { Metadata } from 'next';
import { ServicePageView } from '@/components/service-pages/ServicePages';
import { getServiceMetadata } from '@/components/service-pages/service-metadata';
import Image from 'next/image';
import Link from 'next/link';

import { Breadcrumb } from '@/components/layout/Breadcrumb';
import { JsonLd } from '@/components/JsonLd';
import { getBreadcrumbJsonLd, getWebPageJsonLd } from '@/lib/seo/jsonld';
import { PageBanner } from '@/components/layout/PageBanner';
import { buildMetadata } from '@/lib/seo/metadata';
import { SERVICE_SEO } from '@/lib/seo/page-data';
import { ENGLISH_STATIC_PAGE_METADATA } from '@/lib/seo/static-page-metadata-en';
import { siteSettings } from '@/mock/siteSettings';
import { Locale } from '@/types/site';

type ServicePageProps = {
  params: Promise<{
    locale: string;
  }>;
};

const heroImage = '/images/service/after-sales-hero.png';
const phoneIcon = '/images/service/service-phone-icon.png';

const serviceSeoCopy = {
  zh: SERVICE_SEO,
  en: {
    ...ENGLISH_STATIC_PAGE_METADATA.service,
    keywords: [
      'industrial furnace after-sales service',
      'heat treatment furnace service',
      'industrial furnace installation',
      'industrial furnace maintenance',
      'industrial furnace technical support',
    ],
  },
} satisfies Record<
  Locale,
  {
    title: string;
    description: string;
    keywords: string[];
  }
>;

const servicePageCopy = {
  en: {
    title: 'Furnace Services & After-sales Support',
    englishTitle: 'FURNACE SERVICES',
    subtitle: 'Installation, maintenance, retrofit and restart support within the agreed equipment scope',
    breadcrumbItems: [{ label: 'Service' }],
    heading:
      'Jiangsu Suneng Industrial Furnace: quality built with care, service delivered with accountability',
    intro:
      'Jiangsu Suneng Industrial Furnace Co., Ltd. puts product quality and customer service at the center of every industrial furnace project. With strict standards and responsive support, we help industrial heat treatment operations run with reliable equipment backup.',
    hotlineTitle: 'After-sales service hotline',
    hotlineContact: `Contact: Tang Li  Phone: ${siteSettings.salesPhone}`,
    sections: [
      {
        title: '1. Quality Foundation: consistent standards from manufacturing to delivery',
        paragraphs: [
          'Industrial furnace equipment supplied by Suneng is new and unused, manufactured to the quality, specification and performance standards agreed in the contract. Under proper operation and maintenance, the equipment is designed for stable operation during the contracted service period.',
        ],
      },
      {
        title: '2. Warranty Support: contract-based and clearly executed',
        paragraphs: [
          'During the warranty period, faults caused by manufacturing quality issues or design defects are handled with free repair or replacement according to the contract.',
          'Latent defect handling: if abnormal failure during the warranty period is caused by latent defects in design, materials or manufacturing process, repair or replacement is provided according to the contract. Handling of latent defects outside the warranty period follows the contract terms.',
          'Extended service: after the warranty period, Suneng can continue to provide original spare parts and paid technical service. Fees are based on the contract or separate agreement.',
        ],
      },
      {
        title: '3. Response Speed: fast diagnosis and practical follow-up',
        paragraphs: [
          `Fault consultation: call the customer service hotline at ${siteSettings.salesPhone}. Our technical team will assist with preliminary diagnosis after receiving the request.`,
          'Response and on-site service: response times, handling plans and site visits are agreed for each project, taking account of fault severity, equipment condition, available records, site access and travel distance.',
          'Fault handling: response is based on the impact level of the issue and the service terms agreed in the contract. Specific handling plans and any production-loss matters are subject to the contract terms.',
        ],
      },
      {
        title: '4. Long-term Service: support throughout the equipment lifecycle',
        paragraphs: [
          'Training guidance: upon equipment delivery, Suneng provides operation training covering standard operation, routine maintenance and emergency handling. Additional training follows the contract or separate agreement.',
          'Regular follow-up: Suneng maintains a routine customer service mechanism and arranges inspection visits and follow-ups according to the contract schedule to understand equipment operating status.',
          'Long-term support: repair service and spare parts supply outside the warranty period are provided according to the contract or separate quotation.',
        ],
      },
      {
        title: '5. Service Scope: technical support matched to the project',
        paragraphs: [
          'Suneng provides technical consultation, installation and commissioning support, operation training, maintenance and spare-parts services within the agreed scope. Remote support and on-site work are arranged according to the equipment, fault information, site conditions and service agreement.',
        ],
      },
      {
        title: '6. Retrofit, Relocation and Restart Assessment',
        paragraphs: [
          'Repair, refractory relining, heating-system renewal and control upgrades are assessed against the existing furnace condition, process target and shutdown window. Provide the equipment identification, drawings where available, fault history, photographs and current operating records.',
          'For relocation or restart, confirm the dismantling and lifting plan, transport route, foundations, utilities, retained components and commissioning conditions. Imported or third-party equipment requires a separate review of drawings, controls and spare-parts availability.',
          'The proposal defines equipment supply, installation guidance, commissioning support and acceptance responsibilities. Civil works, environmental contracting and general construction contracting are outside Suneng’s equipment supply scope; work requiring specialist qualifications must be handled by appropriately qualified parties.',
        ],
      },
    ],
  },
} satisfies Record<
  'en',
  {
    title: string;
    englishTitle: string;
    subtitle: string;
    breadcrumbItems: { label: string }[];
    heading: string;
    intro: string;
    hotlineTitle: string;
    hotlineContact: string;
    sections: {
      title: string;
      paragraphs: string[];
    }[];
  }
>;

export async function generateMetadata({ params }: ServicePageProps): Promise<Metadata> {
  const { locale } = await params;
  const currentLocale = (locale === 'en' ? 'en' : 'zh') as Locale;
  if (currentLocale === 'zh') return getServiceMetadata('overview');
  const seo = serviceSeoCopy[currentLocale];

  return buildMetadata({
    title: seo.title,
    description: seo.description,
    path: `/${currentLocale}/service`,
    pageKey: 'service',
    keywords: seo.keywords,
    image: heroImage,
    alternateLocales: {
      'en-US': '/en/service',
      'x-default': '/en/service',
    },
  });
}

export default async function ServicePage({ params }: ServicePageProps) {
  const { locale } = await params;
  const currentLocale = (locale === 'en' ? 'en' : 'zh') as Locale;
  if (currentLocale === 'zh') return <ServicePageView kind="overview" />;
  const copy = servicePageCopy[currentLocale];

  return (
    <div className="bg-[#f7f8fa]">
      <JsonLd id="english-service-jsonld" data={[
        getWebPageJsonLd({ path: '/en/service', name: copy.title, description: copy.intro, locale: 'en' }),
        getBreadcrumbJsonLd([{ name: 'Home', url: '/en' }, { name: copy.title, url: '/en/service' }]),
      ]} />
      <PageBanner
        locale={locale}
        title={copy.title}
        englishTitle={copy.englishTitle}
        subtitle={copy.subtitle}
        backgroundImage={heroImage}
        variant="compact"
      />

      <div className="border-b border-[#e5e5e5] bg-white">
        <div className="site-page-container flex min-h-[42px] items-center">
          <Breadcrumb
            locale={locale}
            currentLabel={copy.title}
            tone="dark"
            className="text-[13px]"
            items={copy.breadcrumbItems}
          />
        </div>
      </div>

      <section className="site-section site-page-container">
        <article
          id="after-sales-service"
          className="scroll-mt-[96px] bg-white px-8 py-10 shadow-[0_10px_34px_rgba(15,35,75,0.08)] md:px-14 lg:px-[84px] lg:py-[58px]"
        >
          <header className="text-center">
            <h2 className="text-[28px] font-bold leading-[1.35] tracking-[0.03em] text-[#071a3d] lg:text-[38px]">
              {copy.heading}
            </h2>
            <p className="mx-auto mt-7 max-w-[880px] text-[17px] leading-[2] text-[#1d3155] lg:text-[19px]">
              {copy.intro}
            </p>
          </header>

          <div className="mt-12 space-y-10">
            {copy.sections.map((section) => (
              <section key={section.title}>
                <h3 className="text-[22px] font-bold leading-[1.45] text-[#071a3d] lg:text-[25px]">
                  {section.title}
                </h3>
                <div className="mt-4 space-y-2 text-[16px] leading-[2] text-[#253858] lg:text-[18px]">
                  {section.paragraphs.map((paragraph) => (
                    <p key={paragraph}>{paragraph}</p>
                  ))}
                </div>
              </section>
            ))}
          </div>

          <section className="mt-11 flex flex-col items-start gap-6 rounded-md border border-[#d9dee7] bg-white px-6 py-5 sm:flex-row sm:items-center lg:px-8">
            <div className="relative h-[86px] w-[86px] shrink-0 overflow-hidden rounded-full bg-[#feecef]">
              <Image src={phoneIcon} alt="" fill sizes="86px" className="object-cover" />
            </div>
            <div className="text-[#071a3d]">
              <h3 className="text-[20px] font-normal leading-[1.45] text-[var(--color-accent)]">
                {copy.hotlineTitle}
              </h3>
              <p className="mt-2 text-[18px] font-normal leading-[1.6]">Contact: Tang Li<br /><a href={`tel:${siteSettings.salesPhone}`} className="underline underline-offset-4">{siteSettings.salesPhone}</a></p>
            </div>
          </section>
          <div className="mt-8 flex flex-col gap-4 sm:flex-row">
            <Link href="/en/contact#product-lead-form" className="inline-flex min-h-12 items-center justify-center rounded border border-[#0c4dcc] bg-[#0c4dcc] px-5 py-3 text-center font-semibold text-white">Discuss a service request</Link>
            <a href={`mailto:${siteSettings.email}`} className="inline-flex min-h-12 items-center justify-center rounded border border-[#c8d0dc] px-5 py-3 text-center font-semibold text-[#071a3d]">Email our team</a>
          </div>
        </article>
      </section>
    </div>
  );
}
