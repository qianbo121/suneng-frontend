import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { HiCheckCircle } from 'react-icons/hi2';

import { HomepageLeadForm } from '@/components/home/HomepageLeadForm';
import { Breadcrumb } from '@/components/layout/Breadcrumb';
import { PageBanner } from '@/components/layout/PageBanner';
import { JsonLd } from '@/components/JsonLd';
import { getBreadcrumbJsonLd, getWebPageJsonLd } from '@/lib/seo/jsonld';
import { buildMetadata } from '@/lib/seo/metadata';
import { resolveInquiryProduct } from '@/lib/inquiry-product';

type PageProps = {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ product?: string | string[] }>;
};

const pagePath = '/zh/inquiry';
const heroImage = '/images/contact/contact-hero.png';

const preparationItems = [
  '项目方向：新建生产线、单台工业炉，或现有设备维修改造',
  '当前最主要的问题：工件、产量、工艺要求或设备故障',
  '企业或联系人，以及手机、微信或邮箱中的任意一种',
] as const;

export const dynamicParams = false;

export function generateStaticParams() {
  return [{ locale: 'zh' }];
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { locale } = await params;
  if (locale !== 'zh') notFound();

  return buildMetadata({
    title: '提交工业炉项目情况｜新建、选型、改造与维修咨询',
    description:
      '提交热处理生产线、工业炉选型、老旧工业炉改造或维修项目情况。资料不全也可先说明方向、主要问题和联系方式。',
    path: pagePath,
    pageKey: 'contact',
    keywords: ['工业炉项目咨询', '热处理炉选型咨询', '工业炉改造咨询', '热处理生产线咨询'],
    image: heroImage,
    alternateLocales: { 'zh-CN': pagePath, 'x-default': pagePath },
  });
}

export default async function InquiryPage({ params, searchParams }: PageProps) {
  const { locale } = await params;
  if (locale !== 'zh') notFound();
  const inquiryProduct = resolveInquiryProduct((await searchParams).product, 'zh');

  return (
    <main className="bg-[#f6f8fb] text-[#172033]">
      <JsonLd id="inquiry-page-jsonld" data={[
        getWebPageJsonLd({ path: pagePath, name: '提交工业炉项目情况', description: '提交新建、选型、改造与维修需求，资料不全也可先说明项目方向、主要问题和联系方式。' }),
        getBreadcrumbJsonLd([{ name: '首页', url: '/zh' }, { name: '提交项目情况', url: pagePath }]),
      ]} />
      <PageBanner
        locale="zh"
        title="提交项目情况"
        englishTitle="PROJECT INQUIRY"
        subtitle="资料不全也可以先提交，先判断方向，再逐步补充图纸和工艺条件"
        backgroundImage={heroImage}
        variant="compact"
      />

      <div className="border-b border-[#e5e9f0] bg-white">
        <div className="site-page-container flex min-h-[42px] items-center">
          <Breadcrumb locale="zh" currentLabel="提交项目情况" tone="dark" className="text-[13px]" />
        </div>
      </div>

      <section className="site-section">
        <div className="site-page-container grid gap-5 md:grid-cols-3">
          {preparationItems.map((item, index) => (
            <div
              key={item}
              className="flex min-w-0 gap-4 rounded-[6px] border border-[#dfe5ed] bg-white p-5 shadow-[0_8px_24px_rgba(15,35,75,0.04)]"
            >
              <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[#eaf2fb] text-brand-primary">
                <HiCheckCircle aria-hidden="true" className="h-5 w-5" />
              </span>
              <div className="min-w-0">
                <p className="text-[12px] font-semibold tracking-[0.14em] text-brand-primary">
                  第 {index + 1} 项
                </p>
                <p className="mt-2 text-[15px] leading-[1.75] text-[#4f5c70]">{item}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      <HomepageLeadForm
        key={inquiryProduct || 'general'}
        inquiryProduct={inquiryProduct}
        sectionId="project-inquiry-form"
        eyebrow="项目情况"
        pageType="独立询盘页"
        productTag={inquiryProduct || '热处理生产线与工业炉项目'}
        successProductTag="项目初步判断"
        sourceModule="project_inquiry_page"
      />
    </main>
  );
}
