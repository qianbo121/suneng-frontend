import type { Metadata } from 'next';
import Image from 'next/image';
import { notFound } from 'next/navigation';
import {
  HiBeaker,
  HiBuildingOffice2,
  HiCog6Tooth,
  HiCube,
  HiPhone,
  HiTruck,
  HiUser,
  HiWrenchScrewdriver,
} from 'react-icons/hi2';

import { JsonLd } from '@/components/JsonLd';
import { Breadcrumb } from '@/components/layout/Breadcrumb';
import { ProductDetailGallery } from '@/components/products/ProductDetailGallery';
import { ProductLeadForm, ProductQuoteScrollButton } from '@/components/products/ProductLeadForm';
import { getStaticProductBySlug, STATIC_PRODUCTS, StaticProduct, StaticProductDetail } from '@/constants/static-products';
import { buildProductImageAlt } from '@/lib/seo';
import { getProductDetailJsonLd } from '@/lib/seo/jsonld';
import { buildMetadata } from '@/lib/seo/metadata';
import { PRODUCT_DETAIL_SEO } from '@/lib/seo/page-data';
import { Locale } from '@/types/site';

type ProductDetailPageProps = {
  params: Promise<{
    locale: string;
    slug: string;
  }>;
};

const industryIcons = [HiTruck, HiCog6Tooth, HiWrenchScrewdriver, HiBuildingOffice2, HiBeaker, HiCube, HiUser];
const processStepIcons = [
  '/images/products/detail-icons/icon_step_01.png',
  '/images/products/detail-icons/icon_step_02.png',
  '/images/products/detail-icons/icon_step_03.png',
  '/images/products/detail-icons/icon_step_04.png',
  '/images/products/detail-icons/icon_step_05.png',
];
const PRODUCTION_LINE_SLUGS = new Set(['roller-mesh-belt-line', 'copper-wire-annealing-line', 'annealing-solution-line']);

export const revalidate = 3600;

export function generateStaticParams() {
  return STATIC_PRODUCTS.flatMap((product) => [
    { locale: 'zh', slug: product.slug },
    { locale: 'en', slug: product.slug },
  ]);
}

export async function generateMetadata({ params }: ProductDetailPageProps): Promise<Metadata> {
  const { locale, slug } = await params;
  const currentLocale = (locale === 'en' ? 'en' : 'zh') as Locale;
  const product = getStaticProductBySlug(slug);

  if (!product) {
    notFound();
  }

  const seo = PRODUCT_DETAIL_SEO[slug];
  const title = seo?.title || product.detail?.title || product.name[currentLocale];
  const description = seo?.description || product.detail?.summary || product.summary[currentLocale];

  return buildMetadata({
    title,
    description,
    path: `/${currentLocale}/products/detail/${slug}`,
    pageKey: 'product-detail',
    keywords: seo?.keywords,
    image: product.image,
    other: seo?.descriptionExtended ? { 'description-extended': seo.descriptionExtended } : undefined,
    alternateLocales: {
      'zh-CN': `/zh/products/detail/${slug}`,
      'en-US': `/en/products/detail/${slug}`,
      'x-default': `/zh/products/detail/${slug}`,
    },
  });
}

function getFallbackDetail(product: StaticProduct, locale: Locale): StaticProductDetail {
  return {
    series: product.model,
    title: product.name[locale],
    breadcrumbSeries: product.category[locale],
    summary: product.summary[locale],
    sellingPoints: product.features.map((item) => item.title).slice(0, 4),
    quickTags: product.features.map((item) => item.title).slice(0, 4),
    ctaHighlights: ['源头工厂价格实惠', '20年行业经验沉淀', '24小时快速响应'],
    reasons: product.features.map((item) => ({ title: item.title, text: item.text })).slice(0, 4),
    customSpecs: product.specs,
    configurations: product.gallery.slice(0, 3).map((image, index) => ({
      image,
      title: `${product.name[locale]}配置 ${index + 1}`,
      specs: ['工作温度：按工艺定制', '有效尺寸：定制', '加热功率：按需求配置', '适用行业：工业热处理'],
    })),
    processSteps: [
      { title: '需求沟通', text: '了解工艺及产能需求' },
      { title: '方案确认', text: '确认配置清单与预算' },
      { title: '方案设计', text: '确定技术方案' },
      { title: '制造调试', text: '生产制造与验收' },
      { title: '交付安装', text: '安装调试与售后跟进' },
    ],
    processes: ['正火', '退火', '淬火', '回火', '固溶', '时效', '渗碳'],
    industries: product.industries.map((item) => item.title),
    leadBullets: ['免费方案定制', '按工艺需求精准匹配', '专业工程团队', '全流程跟踪售后保障'],
  };
}

function SectionTitle({ children }: { children: string }) {
  return (
    <h2 className="text-[22px] font-semibold leading-[1.35] text-[#111827]">
      {children}
    </h2>
  );
}

export default async function ProductDetailPage({ params }: ProductDetailPageProps) {
  const { locale, slug } = await params;
  const currentLocale = (locale === 'en' ? 'en' : 'zh') as Locale;
  const product = getStaticProductBySlug(slug);

  if (!product) {
    notFound();
  }

  const detail = product.detail || getFallbackDetail(product, currentLocale);
  const gallery = product.gallery.length ? product.gallery : [product.image];
  const isProductionLine = PRODUCTION_LINE_SLUGS.has(product.slug);
  const visibleReasons = isProductionLine ? detail.reasons.slice(0, 5) : detail.reasons;
  const specRows = detail.customSpecs.map((item) => ({
    ...item,
    key: item.key === '温度使用温度' ? '使用温度' : item.key,
  }));
  const specColumnSize = Math.ceil(specRows.length / 2);
  const specColumns = [specRows.slice(0, specColumnSize), specRows.slice(specColumnSize)];

  return (
    <main className="bg-white text-[#202020]">
      <JsonLd
        id={`product-jsonld-${product.slug}`}
        data={getProductDetailJsonLd({
          slug: product.slug,
          path: `/${currentLocale}/products/detail/${product.slug}`,
          name: detail.title,
          alternateName: PRODUCT_DETAIL_SEO[product.slug]?.alternateName,
          description: detail.summary,
          image: gallery,
          keywords: PRODUCT_DETAIL_SEO[product.slug]?.keywords,
          additionalProperties: specRows.map((item) => ({ name: item.key, value: item.value })),
        })}
      />

      <div className="border-b border-[#edf0f4] bg-white">
        <div className="mx-auto flex min-h-[58px] max-w-[1440px] items-center px-8">
          <Breadcrumb
            locale={locale}
            tone="dark"
            className="text-[13px]"
            items={[
              { label: currentLocale === 'en' ? 'Product Center' : '产品中心', href: `/${locale}/products` },
              { label: detail.title },
            ]}
          />
        </div>
      </div>

      <div className="mx-auto mt-7 max-w-[1440px] px-6 pb-[48px]">
        {/* A. Hero 区：主图 480x360；信息列顶部内缩，与右侧卡片标题水平对齐。 */}
        <section className="flex flex-col gap-8 lg:flex-row lg:items-start lg:gap-6">
          <ProductDetailGallery
            locale={currentLocale}
            images={gallery}
            title={detail.title}
            summary={detail.summary}
            fillMode={isProductionLine ? 'cover-left' : 'contain'}
          />

          <div className="min-w-0 flex-1 lg:pt-6">
            <p className="mb-3 text-[14px] font-normal uppercase leading-none text-[#e60012]">{detail.series}</p>
            <h1 className="mb-4 mt-[10px] whitespace-nowrap text-[28px] font-semibold leading-[1.3] tracking-[-0.01em] text-[#111111] max-xl:text-[26px]">
              {detail.title}
            </h1>
            <p className="mb-0 mt-[10px] max-w-[520px] text-[14px] leading-[1.8] text-[#4a5160]">{detail.summary}</p>
            <div className="mt-[15px] flex flex-wrap items-center gap-2">
              {detail.quickTags.map((item) => (
                <span key={item} className="whitespace-nowrap rounded-[4px] border border-[#e0e3e8] bg-white px-3 py-[5px] text-[13px] font-normal leading-[1.5] text-[#4a5160]">
                  {item}
                </span>
              ))}
            </div>
          </div>

          {/* B. 右侧快速询价方案卡片：高度与主图一致，内部内容纵向均分。 */}
          <aside className="flex h-auto w-[320px] shrink-0 flex-col justify-between gap-6 rounded-[8px] border border-[#eef0f3] bg-white p-[24px] shadow-[0_2px_12px_rgba(0,0,0,0.04)] lg:h-[360px] lg:gap-0">
            <div>
              <h2 className="text-[18px] font-semibold leading-none text-[#111111]">快速询价方案</h2>
              <ul className="mt-7 flex flex-col gap-[25px]">
                {detail.ctaHighlights.map((item) => (
                  <li key={item} className="flex items-center gap-[10px] text-[14px] leading-[12px] text-[#6b7280]">
                    <svg className="h-[14px] w-[14px] shrink-0 text-[#e60012]" viewBox="0 0 14 14" fill="none" aria-hidden="true">
                      <path d="M3 7.2 5.8 10 11 4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                    <span>{item.replace('经验', '信誉')}</span>
                  </li>
                ))}
              </ul>
            </div>
            <ProductQuoteScrollButton />
            <div className="flex items-center gap-[10px]">
              <span className="flex h-[32px] w-[32px] shrink-0 items-center justify-center rounded-full bg-[#fff1f2] text-[#e60012]">
                <HiPhone className="h-[16px] w-[16px]" />
              </span>
              <span className="text-[14px] leading-none text-[#8a8f99]">咨询热线：</span>
              <strong className="-ml-1 text-[14px] font-semibold leading-none text-[#1a1d23]">+86-139-1444-2520</strong>
            </div>
          </aside>
        </section>

        {/* C. 为什么选择非标定制：桌面五列轻灰卡片，收紧卡片留白。 */}
        <section className="mt-14">
          <h2 className="mb-5 border-l-4 border-[#e60012] pl-3 text-[22px] font-semibold leading-[1.35] text-[#111827]">
            为什么选择非标定制
          </h2>
          <div className="mt-5 grid gap-3 md:grid-cols-2 xl:grid-cols-5">
            {visibleReasons.map((item) => (
              <article key={item.title} className="rounded-lg border border-[#e0e3e8] bg-white px-3 py-4 transition-all duration-200 hover:-translate-y-[2px] hover:border-[#e60012]">
                <h3 className="mb-2 text-[16px] font-semibold leading-[1.4] text-[#1a1d23]">{item.title}</h3>
                <p className="max-w-[15em] text-[13px] font-normal leading-[1.7] text-[#6b7280]">{item.text}</p>
              </article>
            ))}
          </div>
        </section>

        {/* D. 核心定制参数表格：双列参数表，标签列 140px，统一行高和边框。 */}
        <section className="mt-[56px]">
          <SectionTitle>核心定制参数</SectionTitle>
          <div className="mt-[24px] overflow-hidden rounded-[8px] border border-[#eef0f3] bg-white">
            <div className="grid md:grid-cols-2">
              {specColumns.map((column, columnIndex) => (
                <div key={columnIndex} className={columnIndex === 1 ? 'border-l border-[#eef0f3]' : ''}>
                  {column.map((item, rowIndex) => (
                    <div
                      key={item.key}
                      className={`grid min-h-[52px] grid-cols-[140px_minmax(0,1fr)] items-center ${
                        rowIndex === column.length - 1 ? '' : 'border-b border-[#eef0f3]'
                      }`}
                    >
                      <div className="h-full bg-[#f7f8fa] px-[20px] py-[14px] text-[14px] font-medium leading-[1.7] text-[#4a5160]">{item.key}</div>
                      <div className="px-[20px] py-[14px] text-[14px] leading-[1.7] text-[#1a1d23]">{item.value}</div>
                    </div>
                  ))}
                </div>
              ))}
            </div>
          </div>
        </section>

        {!isProductionLine ? (
          /* E. 典型配置示例：纵向图文卡片，生产线详情页不展示该模块。 */
          <section className="mt-[56px]">
            <SectionTitle>典型配置示例</SectionTitle>
            <div className="mt-[24px] grid gap-[20px] lg:grid-cols-3">
              {detail.configurations.map((item) => (
                <article key={item.title} className="flex flex-col overflow-hidden rounded-[8px] border border-[#eef0f3] bg-white transition-all duration-200 hover:-translate-y-[2px] hover:shadow-[0_4px_16px_rgba(0,0,0,0.08)]">
                  <div className="relative aspect-[16/10] w-full bg-[#f4f6f9]">
                    <Image
                      src={item.image}
                      alt={buildProductImageAlt(currentLocale, item.title, currentLocale === 'en' ? 'typical configuration example' : '典型配置示例')}
                      fill
                      className="object-cover"
                      sizes="(min-width: 1024px) 33vw, 100vw"
                    />
                  </div>
                  <div className="p-[20px]">
                    <h3 className="mb-[14px] text-[17px] font-semibold leading-[1.35] text-[#1a1d23]">{item.title}</h3>
                    <ul className="text-[13px] leading-[1.9] text-[#4a5160]">
                      {item.specs.map((spec) => (
                        <li key={spec} className="flex gap-[6px]">
                          <span className="mt-[11px] h-[4px] w-[4px] shrink-0 rounded-full bg-[#e60012]" />
                          <span>{spec}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </article>
              ))}
            </div>
          </section>
        ) : null}

        {/* F. 非标定制流程：五列步骤卡，使用设计稿源文件 icon。 */}
        <section className="mt-[56px]">
          <SectionTitle>非标定制流程</SectionTitle>
          <div className="relative mt-[24px] grid gap-[16px] md:grid-cols-5">
            {detail.processSteps.map((item, index) => (
              <article key={item.title} className="relative flex items-center gap-3 rounded-[8px] border border-[#eef0f3] bg-white p-[18px]">
                <div className="relative h-[55px] w-[55px] shrink-0">
                  <Image
                    src={processStepIcons[index] || processStepIcons[0]}
                    alt={item.title}
                    fill
                    className="object-contain"
                    sizes="55px"
                  />
                </div>
                <div className="min-w-0">
                  <h3 className="mb-[6px] text-[16px] font-semibold leading-[1.35] text-[#1a1d23]">{item.title}</h3>
                  <p className="text-[13px] leading-[1.7] text-[#6b7280]">{item.text}</p>
                </div>
              </article>
            ))}
          </div>
        </section>

        {/* G. 适用工艺 / 适用行业：左侧红色标签，右侧内容固定 40px 高度。 */}
        <section className="mt-[56px]">
          <SectionTitle>适用工艺 / 适用行业</SectionTitle>
          <div className="mt-[24px] space-y-[12px]">
            <div className="flex items-center gap-[12px]">
              <div className="flex h-[40px] w-[88px] shrink-0 items-center justify-center rounded-[4px] bg-[#e60012] text-[14px] font-medium text-white">适用工艺</div>
              <div className="flex flex-1 flex-wrap gap-[12px]">
                {detail.processes.map((item) => (
                  <span key={item} className="flex h-[40px] items-center justify-center rounded-[4px] border border-[#e0e3e8] bg-white px-4 text-[14px] font-normal text-[#4a5160] transition-colors hover:border-[#e60012] hover:text-[#e60012]">
                    {item}
                  </span>
                ))}
              </div>
            </div>
            <div className="flex items-center gap-[12px]">
              <div className="flex h-[40px] w-[88px] shrink-0 items-center justify-center rounded-[4px] bg-[#e60012] text-[14px] font-medium text-white">适用行业</div>
              <div className="flex flex-1 flex-wrap gap-[12px]">
                {detail.industries.map((item, index) => {
                  const Icon = industryIcons[index % industryIcons.length];
                  return (
                    <span key={item} className="flex h-[40px] items-center justify-center gap-[6px] rounded-[4px] border border-[#e0e3e8] bg-white px-4 text-[14px] font-normal text-[#4a5160] transition-colors hover:border-[#e60012] hover:text-[#e60012]">
                      <Icon className="h-[16px] w-[16px]" />
                      {item}
                    </span>
                  );
                })}
              </div>
            </div>
          </div>
        </section>

        {/* H. 提交需求表单：仅联系电话必填，提交反馈由客户端组件处理。 */}
        <ProductLeadForm leadBullets={detail.leadBullets} />
      </div>
    </main>
  );
}
