import type { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import { notFound } from 'next/navigation';

import { localizeOrHideHref } from '@/lib/i18n/zh-only';
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
import { getProductDetailEn, pickDetail } from '@/constants/static-products-en';
import { getStaticProductBySlug, STATIC_PRODUCTS, StaticProduct, StaticProductDetail } from '@/constants/static-products';
import { buildProductImageAlt } from '@/lib/seo';
import { getFaqJsonLd, getProductDetailJsonLd } from '@/lib/seo/jsonld';
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
const quoteParamsPath = '/zh/articles/gongye-lu-baojia-canshu';
const repairOrReplacePath = '/zh/articles/laojiu-rechuli-lu-daxiu-haishi-maixin';

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
  const enDetail = getProductDetailEn(slug);
  const title =
    currentLocale === 'en'
      ? enDetail?.title || product.name.en
      : seo?.title || product.detail?.title || product.name[currentLocale];
  const description =
    currentLocale === 'en'
      ? enDetail?.summary || product.summary.en
      : seo?.description || product.detail?.summary || product.summary[currentLocale];
  const keywords =
    currentLocale === 'en'
      ? [
          product.name.en,
          'heat treatment furnace',
          'industrial furnace',
          'custom industrial furnace',
          'heat-treatment equipment',
        ]
      : seo?.keywords;

  return buildMetadata({
    title,
    description,
    path: `/${currentLocale}/products/detail/${slug}`,
    pageKey: 'product-detail',
    keywords,
    image: product.image,
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
    ctaHighlights: ['源头工厂直供', '成立于 2006 年', '8 小时响应 / 24 小时答复'],
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

  const zhDetail = product.detail || getFallbackDetail(product, currentLocale);
  const detail = pickDetail(zhDetail, getProductDetailEn(product.slug), currentLocale);
  const gallery = product.gallery.length ? product.gallery : [product.image];
  const isProductionLine = PRODUCTION_LINE_SLUGS.has(product.slug);
  const visibleReasons = isProductionLine ? detail.reasons.slice(0, 5) : detail.reasons;
  const specRows = detail.customSpecs.map((item) => ({
    ...item,
    key: item.key === '温度使用温度' ? '使用温度' : item.key,
  }));
  const specColumnSize = Math.ceil(specRows.length / 2);
  const specColumns = [specRows.slice(0, specColumnSize), specRows.slice(specColumnSize)];
  const geoSectionTitle =
    currentLocale === 'en'
      ? `${detail.title} — Selection & Process Fit`
      : product.slug === 'trolley-furnace'
        ? '台车炉选型与工艺适配'
        : product.slug === 'box-furnace'
          ? '箱式炉选型与工艺适配'
        : product.slug === 'mesh-belt-furnace'
          ? '网带炉选型与工艺适配'
        : product.slug === 'pit-furnace'
          ? '井式炉选型与工艺适配'
        : product.slug === 'bell-furnace'
          ? '罩式炉选型与工艺适配'
        : product.slug === 'roller-hearth-furnace'
          ? '辊底炉选型与工艺适配'
        : product.slug === 'pusher-furnace'
          ? '推杆炉选型与工艺适配'
        : product.slug === 'rotary-hearth-furnace'
          ? '转底炉选型与工艺适配'
        : product.slug === 'roller-mesh-belt-line'
          ? '托辊型网带生产线选型与工艺适配'
        : product.slug === 'copper-wire-annealing-line'
          ? '铜丝退火线选型与工艺适配'
        : product.slug === 'annealing-solution-line'
          ? '退火固溶生产线选型与工艺适配'
          : `${detail.title.replace('（非标定制）', '')}选型与工艺适配`;
  const showChinesePathLinks = currentLocale === 'zh';
  // Localize internal links to the current locale; drop links whose target is
  // Chinese-only when rendering English (avoids /en 404s and /zh cross-locale
  // bounces). In-page anchors (#...) are left untouched.
  const localizedHeroCtas = (detail.heroCtas ?? []).flatMap((item) => {
    if (item.href.startsWith('#')) return [item];
    const href = localizeOrHideHref(item.href, currentLocale);
    return href ? [{ ...item, href }] : [];
  });
  const parameterLinkHref = detail.parameterLink
    ? localizeOrHideHref(detail.parameterLink.href, currentLocale)
    : null;
  const leadFormContactHref = detail.leadForm?.contactHref
    ? (localizeOrHideHref(detail.leadForm.contactHref, currentLocale) ?? detail.leadForm.contactHref)
    : undefined;
  const scopedRelatedLinks = (detail.relatedLinks ?? [])
    .filter((item) => item.href.includes('/products/detail/'))
    .slice(0, 2)
    .flatMap((item) => {
      const href = localizeOrHideHref(item.href, currentLocale);
      return href ? [{ ...item, href }] : [];
    });

  return (
    <main className="bg-white text-[#202020]">
      <JsonLd
        id={`product-jsonld-${product.slug}`}
        data={getProductDetailJsonLd({
          slug: product.slug,
          path: `/${currentLocale}/products/detail/${product.slug}`,
          name: detail.title,
          alternateName: currentLocale === 'en' ? undefined : PRODUCT_DETAIL_SEO[product.slug]?.alternateName,
          description: detail.summary,
          image: gallery,
          keywords: currentLocale === 'en' ? undefined : PRODUCT_DETAIL_SEO[product.slug]?.keywords,
          additionalProperties: specRows.map((item) => ({ name: item.key, value: item.value })),
        }, currentLocale)}
      />
      {detail.faq?.length ? (
        <JsonLd id={`product-faq-jsonld-${product.slug}`} data={getFaqJsonLd(detail.faq)} />
      ) : null}

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

      <div className="mx-auto -mb-16 mt-7 max-w-[1440px] px-6 pb-6 xl:mb-0">
        {/* A. Hero 区：主图 480x360；信息列顶部内缩，与右侧卡片标题水平对齐。 */}
        <section className="flex flex-col gap-8 lg:flex-row lg:items-start lg:gap-6">
          <ProductDetailGallery
            locale={currentLocale}
            images={gallery}
            title={detail.title}
            fillMode={isProductionLine ? 'cover-left' : 'contain'}
          />

          <div className="min-w-0 flex-1 lg:pt-6">
            <p className="mb-3 text-[14px] font-normal uppercase leading-none text-[#e60012]">{detail.series}</p>
            <h1 className="mb-4 mt-[10px] text-[28px] font-semibold leading-[1.3] tracking-[-0.01em] text-[#111111] max-xl:text-[26px]">
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
            {localizedHeroCtas.length ? (
              <div className="mt-6 flex flex-wrap gap-3">
                {localizedHeroCtas.map((item, index) =>
                  item.href === '#product-lead-form' ? (
                    <ProductQuoteScrollButton
                      key={item.href}
                      locale={currentLocale}
                      label={currentLocale === 'en' ? undefined : item.title}
                      updateHash
                      variant="hero"
                      className="inline-flex min-h-[44px] items-center justify-center rounded-[4px] bg-[#c51624] px-5 text-[14px] font-semibold text-white transition hover:bg-[#a90f1b]"
                    />
                  ) : (
                    <a
                      key={item.href}
                      href={item.href}
                      className={
                        index === 0
                          ? 'inline-flex min-h-[44px] items-center justify-center rounded-[4px] bg-[#c51624] px-5 text-[14px] font-semibold text-white transition hover:bg-[#a90f1b]'
                          : 'inline-flex min-h-[44px] items-center justify-center rounded-[4px] border border-[#c51624] bg-white px-5 text-[14px] font-semibold text-[#c51624] transition hover:bg-[#fff5f5]'
                      }
                    >
                      {item.title}
                    </a>
                  ),
                )}
              </div>
            ) : null}
          </div>

          {/* B. 右侧报价咨询卡片：高度与主图一致，内部内容纵向均分。 */}
          <aside className="flex h-auto w-[320px] shrink-0 flex-col justify-between gap-6 rounded-[8px] border border-[#eef0f3] bg-white p-[24px] shadow-[0_2px_12px_rgba(0,0,0,0.04)] lg:h-[360px] lg:gap-0">
            <div>
              <h2 className="text-[18px] font-semibold leading-none text-[#111111]">
                {currentLocale === 'en' ? 'Request a Quote' : '报价方案咨询'}
              </h2>
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
            <ProductQuoteScrollButton
              locale={currentLocale}
              className="flex h-11 w-full items-center justify-center rounded-[4px] border border-[#c51624] bg-white text-[15px] font-medium text-[#c51624] transition hover:bg-[#fff5f5]"
            />
            <div className="flex items-center gap-[10px]">
              <span className="flex h-[32px] w-[32px] shrink-0 items-center justify-center rounded-full bg-[#fff1f2] text-[#e60012]">
                <HiPhone className="h-[16px] w-[16px]" />
              </span>
              <span className="text-[14px] leading-none text-[#8a8f99]">
                {currentLocale === 'en' ? 'Hotline:' : '咨询热线：'}
              </span>
              <strong className="-ml-1 text-[14px] font-semibold leading-none text-[#1a1d23]">+86-130-5298-6814</strong>
            </div>
          </aside>
        </section>

        {detail.workpieceCards?.length ? (
          <section className="mt-12">
            <SectionTitle>
              {detail.workpieceTitle || (currentLocale === 'en' ? 'Which Workpieces Suit This Furnace?' : '台车炉适合哪些工件？')}
            </SectionTitle>
            <div className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {detail.workpieceCards.map((item) => (
                <article key={item.title} className="rounded-[8px] border border-[#eef0f3] bg-white p-5">
                  <h3 className="text-[17px] font-semibold leading-[1.4] text-[#1a1d23]">{item.title}</h3>
                  <p className="mt-3 text-[14px] leading-[1.75] text-[#5f6673]">{item.text}</p>
                </article>
              ))}
            </div>
          </section>
        ) : null}

        {/* C. 为什么选择非标定制：桌面五列轻灰卡片，收紧卡片留白。 */}
        <section className="mt-12">
          <h2 className="mb-5 border-l-4 border-[#e60012] pl-3 text-[22px] font-semibold leading-[1.35] text-[#111827]">
            {currentLocale === 'en' ? 'Why Choose Custom-Engineered' : '为什么选择非标定制'}
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

        {detail.processCards?.length ? (
          <section className="mt-12">
            <SectionTitle>
              {detail.processCardsTitle || (currentLocale === 'en' ? 'Which Heat-Treatment Processes Can This Furnace Cover?' : '台车炉可覆盖哪些热处理工艺？')}
            </SectionTitle>
            <div className="mt-5 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {detail.processCards.map((item) => (
                <article key={item.title} className="rounded-[8px] border border-[#eef0f3] bg-[#fbfcfe] p-5">
                  <h3 className="text-[18px] font-semibold leading-[1.4] text-[#1a1d23]">{item.title}</h3>
                  <p className="mt-3 text-[14px] leading-[1.8] text-[#4a5160]">{item.text}</p>
                </article>
              ))}
            </div>
          </section>
        ) : null}

        {/* D. 核心定制参数表格：双列参数表，标签列 140px，统一行高和边框。 */}
        <section className="mt-12">
          <SectionTitle>{detail.parameterTitle || (currentLocale === 'en' ? 'Core Custom Parameters' : '核心定制参数')}</SectionTitle>
          <div className="mt-5 overflow-hidden rounded-[8px] border border-[#eef0f3] bg-white">
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
          {detail.parameterNote ? (
            <p className="mt-4 rounded-[6px] border border-[#eef0f3] bg-[#f7f8fa] px-4 py-3 text-[13px] leading-[1.8] text-[#5f6673]">
              {detail.parameterNote}
            </p>
          ) : null}
          {detail.parameterLink && parameterLinkHref ? (
            <Link
              href={parameterLinkHref}
              className="mt-4 inline-flex min-h-[42px] items-center justify-center rounded-[4px] border border-[#c51624] px-5 text-[14px] font-semibold text-[#c51624] transition hover:bg-[#fff5f5]"
            >
              {detail.parameterLink.title}
            </Link>
          ) : null}
          {showChinesePathLinks ? (
            <div className="mt-5 rounded-[8px] border border-[#dfe6f0] bg-[#fbfcfe] p-5">
              <h3 className="text-[18px] font-semibold leading-[1.4] text-[#111827]">报价与新旧设备判断</h3>
              <p className="mt-2 text-[14px] leading-[1.8] text-[#5f6673]">
                若正在比较新炉定制、旧炉改造或整炉大修，可先按参数清单整理资料，再判断老旧工业炉该修还是换。
              </p>
              <div className="mt-4 flex flex-wrap gap-3">
                <Link
                  href={quoteParamsPath}
                  className="inline-flex min-h-[40px] items-center justify-center rounded-[4px] border border-[#c51624] bg-white px-4 text-[13px] font-semibold text-[#c51624] transition hover:bg-[#fff5f5]"
                >
                  查看报价需要哪些参数
                </Link>
                <Link
                  href={repairOrReplacePath}
                  className="inline-flex min-h-[40px] items-center justify-center rounded-[4px] border border-[#d9e0ea] bg-white px-4 text-[13px] font-semibold text-[#1a1d23] transition hover:border-[#e60012] hover:text-[#e60012]"
                >
                  老旧工业炉该修还是换？
                </Link>
              </div>
            </div>
          ) : null}
        </section>

        {detail.structureComponents?.length ? (
          <section className="mt-12">
            <SectionTitle>{detail.structureTitle || (currentLocale === 'en' ? 'Main Structural Components' : '台车炉主要结构组成')}</SectionTitle>
            <div className="mt-5 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {detail.structureComponents.map((item) => (
                <article key={item.title} className="rounded-[8px] border border-[#eef0f3] bg-white p-5">
                  <h3 className="text-[18px] font-semibold leading-[1.4] text-[#1a1d23]">{item.title}</h3>
                  <p className="mt-3 text-[14px] leading-[1.8] text-[#4a5160]">{item.text}</p>
                </article>
              ))}
            </div>
          </section>
        ) : null}

        {detail.priceFactors?.length ? (
          <section className="mt-12">
            <SectionTitle>{detail.priceFactorsTitle || (currentLocale === 'en' ? 'What Factors Affect the Price?' : '台车炉价格受哪些因素影响？')}</SectionTitle>
            <p className="mt-4 max-w-[900px] text-[14px] leading-[1.85] text-[#5f6673]">
              {detail.priceFactorsIntro ||
                (currentLocale === 'en'
                  ? 'This is custom-engineered equipment; a fixed price cannot be quoted without parameters. The following factors materially affect the furnace structure, material selection, control system and delivery scope.'
                  : '台车炉通常为非标定制设备，不能脱离参数直接给出固定价格。以下因素会明显影响炉体结构、材料配置、控制系统和交付范围。')}
            </p>
            <div className="mt-[22px] grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
              {detail.priceFactors.map((item) => (
                <div key={item} className="rounded-[8px] border border-[#eef0f3] bg-[#fbfcfe] px-4 py-3 text-[14px] font-semibold leading-[1.65] text-[#1a1d23]">
                  {item}
                </div>
              ))}
            </div>
          </section>
        ) : null}

        {detail.comparisonRows?.length ? (
          <section className="mt-12">
            <SectionTitle>{detail.comparisonTitle || (currentLocale === 'en' ? 'How to Choose Between the Furnace Types?' : '台车炉和箱式炉怎么选？')}</SectionTitle>
            <div className="mt-5 overflow-x-auto rounded-[8px] border border-[#eef0f3] bg-white">
              <table className={`${detail.comparisonHeaders?.length === 3 ? 'min-w-[720px]' : 'w-full'} border-collapse text-left`}>
                <thead className="bg-[#f7f8fa]">
                  <tr>
                    {(detail.comparisonHeaders || (currentLocale === 'en' ? ['This furnace suits', 'The alternative suits'] : ['台车炉适合', '箱式炉适合'])).map((header) => (
                      <th key={header} className="border-b border-[#eef0f3] px-5 py-4 text-[15px] font-semibold text-[#1a1d23]">
                        {header}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {detail.comparisonRows.map((row) => {
                    const cells = detail.comparisonHeaders?.length === 3
                      ? [row.left, row.middle, row.right]
                      : detail.comparisonHeaders?.length === 2
                        ? [row.left, row.right || row.box || row.middle]
                        : [row.trolley || row.left, row.box || row.right || row.middle];

                    return (
                      <tr key={cells.join('-')} className="border-b border-[#eef0f3] last:border-b-0">
                        {cells.map((cell, index) => (
                          <td key={`${cell}-${index}`} className="px-5 py-4 text-[14px] leading-[1.8] text-[#4a5160]">
                            {cell}
                          </td>
                        ))}
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </section>
        ) : null}

        {detail.geoSections?.length ? (
          <section className="mt-12">
            <SectionTitle>{geoSectionTitle}</SectionTitle>
            <div className="mt-5 grid gap-4 lg:grid-cols-3">
              {detail.geoSections.map((section) => (
                <article key={section.title} className="rounded-[8px] border border-[#eef0f3] bg-white p-5">
                  <h3 className="mb-3 text-[17px] font-semibold leading-[1.4] text-[#1a1d23]">{section.title}</h3>
                  {section.text ? (
                    <p className="text-[14px] leading-[1.85] text-[#4a5160]">{section.text}</p>
                  ) : null}
                  {section.items?.length ? (
                    <ul className="grid gap-2 text-[14px] leading-[1.7] text-[#4a5160]">
                      {section.items.map((item) => (
                        <li key={item} className="flex gap-2">
                          <span className="mt-[10px] h-[4px] w-[4px] shrink-0 rounded-full bg-[#e60012]" />
                          <span>{item}</span>
                        </li>
                      ))}
                    </ul>
                  ) : null}
                </article>
              ))}
            </div>
          </section>
        ) : null}

        {!isProductionLine ? (
          /* E. 典型配置示例：纵向图文卡片，生产线详情页不展示该模块。 */
          <section className="mt-12">
            <SectionTitle>{currentLocale === 'en' ? 'Typical Configuration Examples' : '典型配置示例'}</SectionTitle>
            <div className="mt-5 grid gap-[20px] lg:grid-cols-3">
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
        <section className="mt-12">
          <SectionTitle>{detail.processStepsTitle || (currentLocale === 'en' ? 'Custom-Engineering Process' : '非标定制流程')}</SectionTitle>
          <div className="relative mt-5 grid gap-[16px] md:grid-cols-5">
            {detail.processSteps.map((item, index) => (
              <article key={item.title} className="relative flex items-center gap-3 rounded-[8px] border border-[#eef0f3] bg-white p-[18px]">
                <div className="relative h-[55px] w-[55px] shrink-0">
                  <Image
                    src={processStepIcons[index] || processStepIcons[0]}
                    alt=""
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
        {detail.industryCards?.length ? (
          <section className="mt-12">
            <SectionTitle>{currentLocale === 'en' ? 'Typical Application Industries' : '典型应用行业'}</SectionTitle>
            <div className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {detail.industryCards.map((item) => (
                <article key={item.title} className="rounded-[8px] border border-[#eef0f3] bg-white p-5">
                  <h3 className="text-[17px] font-semibold leading-[1.4] text-[#1a1d23]">{item.title}</h3>
                  <p className="mt-3 text-[14px] leading-[1.75] text-[#5f6673]">{item.text}</p>
                </article>
              ))}
            </div>
          </section>
        ) : (
          <section className="mt-12">
            <SectionTitle>{currentLocale === 'en' ? 'Applicable Processes / Industries' : '适用工艺 / 适用行业'}</SectionTitle>
            <div className="mt-5 space-y-[12px]">
              <div className="flex items-center gap-[12px]">
                <div className="flex h-[40px] w-[88px] shrink-0 items-center justify-center rounded-[4px] bg-[#e60012] text-[14px] font-medium text-white">
                  {currentLocale === 'en' ? 'Processes' : '适用工艺'}
                </div>
                <div className="flex flex-1 flex-wrap gap-[12px]">
                  {detail.processes.map((item) => (
                    <span key={item} className="flex h-[40px] items-center justify-center rounded-[4px] border border-[#e0e3e8] bg-white px-4 text-[14px] font-normal text-[#4a5160] transition-colors hover:border-[#e60012] hover:text-[#e60012]">
                      {item}
                    </span>
                  ))}
                </div>
              </div>
              <div className="flex items-center gap-[12px]">
                <div className="flex h-[40px] w-[88px] shrink-0 items-center justify-center rounded-[4px] bg-[#e60012] text-[14px] font-medium text-white">
                  {currentLocale === 'en' ? 'Industries' : '适用行业'}
                </div>
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
        )}

        {detail.scenarioCards?.length ? (
          <section className="mt-12">
            <SectionTitle>{currentLocale === 'en' ? 'Use Cases / Project Experience' : '案例 / 项目经验'}</SectionTitle>
            <p className="mt-4 max-w-[900px] text-[14px] leading-[1.85] text-[#5f6673]">
              {detail.scenarioIntro ||
                (currentLocale === 'en'
                  ? 'This page does not fabricate customer case studies. The following are common application scenarios only; specific projects can be confirmed with authorized materials during commercial discussion.'
                  : '当前页面不虚构客户案例。以下仅作为台车炉常见应用场景说明，具体项目可在商务沟通中结合授权资料进一步确认。')}
            </p>
            <div className="mt-5 grid gap-4 md:grid-cols-3">
              {detail.scenarioCards.map((item) => (
                <article key={item.title} className="rounded-[8px] border border-[#eef0f3] bg-[#fbfcfe] p-5">
                  <h3 className="text-[17px] font-semibold leading-[1.4] text-[#1a1d23]">{item.title}</h3>
                  <p className="mt-3 text-[14px] leading-[1.8] text-[#4a5160]">{item.text}</p>
                </article>
              ))}
            </div>
          </section>
        ) : null}

        {detail.faq?.length ? (
          <section className="mt-12">
            <SectionTitle>{currentLocale === 'en' ? 'FAQ' : '常见问题'}</SectionTitle>
            <div className="mt-5 grid gap-4">
              {detail.faq.map((item) => (
                <article key={item.question} className="rounded-[8px] border border-[#eef0f3] bg-white p-5">
                  <h3 className="text-[17px] font-semibold leading-[1.45] text-[#1a1d23]">{item.question}</h3>
                  <p className="mt-3 text-[14px] leading-[1.85] text-[#4a5160]">{item.answer}</p>
                </article>
              ))}
            </div>
          </section>
        ) : null}

        {scopedRelatedLinks.length ? (
          <section className="mt-12">
            <SectionTitle>{currentLocale === 'en' ? 'Related Pages' : '相关页面'}</SectionTitle>
            <div className="mt-5 grid gap-4 md:grid-cols-3">
              {scopedRelatedLinks.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className="rounded-[8px] border border-[#eef0f3] bg-white p-5 transition-all duration-200 hover:-translate-y-[2px] hover:border-[#e60012]"
                >
                  <h3 className="text-[16px] font-semibold leading-[1.4] text-[#1a1d23]">{item.title}</h3>
                  <p className="mt-2 text-[13px] leading-[1.75] text-[#6b7280]">{item.description}</p>
                </Link>
              ))}
            </div>
          </section>
        ) : null}

        {/* H. 提交需求表单：仅联系电话必填，提交反馈由客户端组件处理。 */}
        <ProductLeadForm
          locale={currentLocale}
          leadBullets={currentLocale === 'zh' ? detail.leadBullets : undefined}
          title={currentLocale === 'zh' ? detail.leadForm?.title : undefined}
          description={currentLocale === 'zh' ? detail.leadForm?.description : undefined}
          submitLabel={currentLocale === 'zh' ? detail.leadForm?.submitLabel : undefined}
          contactHref={leadFormContactHref}
          contactLabel={currentLocale === 'zh' ? detail.leadForm?.contactLabel : undefined}
          phone={detail.leadForm?.phone}
          email={detail.leadForm?.email}
        />
      </div>
    </main>
  );
}
