import Image from 'next/image';
import Link from 'next/link';

import { QuoteModalButton } from '@/components/lead/QuoteModalButton';
import { buildProductImageAlt } from '@/lib/seo';
import { ProductCategoryItem } from '@/types/home';
import { Locale } from '@/types/site';

type HeatTreatmentLinesProps = {
  locale: Locale;
  categories: ProductCategoryItem[];
};

type HeatTreatmentLineCard = {
  title: Record<Locale, string>;
  desc: Record<Locale, string>;
  image: string;
  slug: string;
};

type ProductCenterCard = {
  id: number;
  en: string;
  zh: string;
  feature: Record<Locale, string>;
  image: string;
  slug: string;
};

type FeatureItem = {
  title: Record<Locale, string>;
  desc: Record<Locale, string>;
};

const heatTreatmentLines: HeatTreatmentLineCard[] = [
  {
    title: { zh: '托辊型网带式电阻炉生产线', en: 'Roller Mesh Belt Heat Treatment Line' },
    desc: { zh: '连续退火回火，托辊输送与多温区控制', en: 'continuous annealing and tempering with roller conveying and multi-zone control' },
    image: '/images/products/roller-mesh-belt-line/gallery/line-01.jpg',
    slug: 'roller-mesh-belt-line',
  },
  {
    title: { zh: '铜丝自动化退火生产线', en: 'Copper Wire Automatic Annealing Line' },
    desc: { zh: '铜丝连续退火，放收线一体自动化生产', en: 'continuous copper wire annealing with automated pay-off and take-up' },
    image: '/images/products/copper-wire-annealing-line/gallery/line-01.jpg',
    slug: 'copper-wire-annealing-line',
  },
  {
    title: { zh: '退火固溶生产线', en: 'Annealing and Solution Treatment Line' },
    desc: { zh: '退火固溶多区控温，按材料与速度评估配置', en: 'multi-zone annealing and solution control by material and line speed' },
    image: '/images/products/annealing-solution-line/gallery/line-01.jpg',
    slug: 'annealing-solution-line',
  },
];

const singleFurnaceCards: ProductCenterCard[] = [
  { id: 1, en: 'BOX FURNACE', zh: '箱式炉', feature: { zh: '中小型零件退火淬火非标定制', en: 'custom annealing and quenching for small and medium workpieces' }, image: '/images/home/product-center/box-furnace-real.jpg', slug: 'box-furnace' },
  { id: 2, en: 'TROLLEY FURNACE', zh: '台车炉', feature: { zh: '大型工件与模具热处理承载设备', en: 'large workpiece and die heat treatment equipment' }, image: '/images/home/product-center/trolley-furnace-real.jpg', slug: 'trolley-furnace' },
  { id: 3, en: 'PIT FURNACE', zh: '井式炉', feature: { zh: '轴类杆类工件垂直均匀加热', en: 'vertical uniform heating for shaft and rod workpieces' }, image: '/images/home/product-center/pit-furnace-real.jpg', slug: 'pit-furnace' },
  { id: 4, en: 'BELL FURNACE', zh: '罩式炉', feature: { zh: '保护气氛与批量工件整体热处理', en: 'protective atmosphere heat treatment for batch workpieces' }, image: '/images/home/product-center/bell-furnace-real.jpg', slug: 'bell-furnace' },
  { id: 5, en: 'PUSHER FURNACE', zh: '推杆炉', feature: { zh: '料盘节拍推进连续热处理', en: 'continuous heat treatment with paced tray pushing' }, image: '/images/home/product-center/pusher-furnace-real.jpg', slug: 'pusher-furnace' },
  { id: 6, en: 'MESH BELT FURNACE', zh: '网带炉', feature: { zh: '小件零件连续退火回火生产', en: 'continuous annealing and tempering for small parts' }, image: '/images/home/product-center/mesh-belt-furnace-real.jpg', slug: 'mesh-belt-furnace' },
  { id: 7, en: 'ROLLER HEARTH FURNACE', zh: '辊底炉', feature: { zh: '板材棒材连续输送热处理', en: 'continuous roller conveying heat treatment for plates and bars' }, image: '/images/home/product-center/roller-hearth-furnace-real.jpg', slug: 'roller-hearth-furnace' },
  { id: 8, en: 'ROTARY HEARTH FURNACE', zh: '转底炉', feature: { zh: '环形炉底节拍式均匀加热', en: 'rhythmic uniform heating on a rotary hearth' }, image: '/images/home/product-center/rotary-hearth-furnace-real.jpg', slug: 'rotary-hearth-furnace' },
];

const featureItems: FeatureItem[] = [
  {
    title: { zh: '工艺链集成', en: 'Process chain' },
    desc: { zh: '加热、冷却、清洗与输送协同配置', en: 'heating, cooling, cleaning and conveying' },
  },
  {
    title: { zh: '按节拍配置', en: 'Rhythm planning' },
    desc: { zh: '按产能、速度与停留时间评估方案', en: 'capacity, speed and dwell-time planning' },
  },
  {
    title: { zh: '适配多类工件', en: 'Workpiece fit' },
    desc: { zh: '覆盖带材、线材、标准件与机械零件', en: 'strip, wire, standard and machined parts' },
  },
  {
    title: { zh: '控制系统配套', en: 'Control systems' },
    desc: { zh: '温度、速度、联锁、报警', en: 'temperature, speed, interlock and alarms' },
  },
];

export function buildProductCenterCards(categories: ProductCategoryItem[]) {
  if (!categories.length) return singleFurnaceCards;

  const cmsBySlug = new Map(categories.map((item) => [item.slug, item]));
  return singleFurnaceCards.map((item) => {
    const cmsItem = cmsBySlug.get(item.slug);
    if (!cmsItem) return item;

    return {
      ...item,
      id: cmsItem.id,
      en: cmsItem.name.en || item.en,
      zh: cmsItem.name.zh || item.zh,
      image: cmsItem.image || item.image,
    };
  });
}

export function HeatTreatmentLines({ locale, categories }: HeatTreatmentLinesProps) {
  const [mainLine] = heatTreatmentLines;
  const systemHref = locale === 'zh' ? '/zh/solutions/continuous-heat-treatment-line' : '/en/products';
  const productCenterCards = buildProductCenterCards(categories);

  return (
    <section className="bg-white py-8">
      <div className="mx-auto w-full max-w-[1480px] px-4 md:px-6 lg:px-8">
        <div className="overflow-hidden rounded-[6px] border border-[#dfe5ee] bg-white">
          <div className="grid gap-8 p-5 md:p-7 lg:grid-cols-2 lg:gap-10 lg:p-9">
            <div className="flex flex-col justify-center">
              <h2 className="text-[30px] font-semibold leading-[1.18] text-[#101828] md:text-[38px] lg:whitespace-nowrap lg:text-[40px] xl:text-[44px]">
                {locale === 'en' ? 'Continuous Heat Treatment Line Solutions' : '连续热处理生产线解决方案'}
              </h2>
              <p className="mt-5 max-w-[650px] text-[16px] leading-[1.9] text-[#667085] md:text-[18px]">
                {locale === 'en'
                  ? 'Plan integrated line systems around annealing, solution treatment, normalizing, tempering, quench heating, cleaning, cooling, conveying and control systems.'
                  : '围绕退火、固溶、正火、回火、淬火加热、清洗、冷却、输送与控制系统，按工件形态、产能节拍、温度制度和现场条件评估连续式热处理生产线方案。'}
              </p>

              <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                <Link
                  href={systemHref}
                  className="inline-flex min-h-[52px] items-center justify-center rounded-[3px] bg-[#e60012] px-8 text-[15px] font-semibold text-white transition hover:bg-[#c51624] sm:whitespace-nowrap"
                >
                  {locale === 'en' ? 'View line solutions' : '查看连续热处理生产线方案'}
                </Link>
                <QuoteModalButton
                  locale={locale}
                  className="inline-flex min-h-[52px] items-center justify-center rounded-[3px] border border-[#c8d0dc] bg-white px-8 text-[15px] font-semibold text-[#101828] transition hover:border-[#98a2b3] hover:bg-[#f8fafc] sm:whitespace-nowrap"
                />
              </div>

              <div className="mt-9 grid grid-cols-2 border-t border-[#d8dee8] pt-7 sm:grid-cols-4">
                {featureItems.map((item) => (
                  <div
                    key={item.title.zh}
                    className="border-r border-[#e1e6ee] px-4 py-2 text-[#101828] first:pl-0 last:border-r-0"
                  >
                    <p className="text-[16px] font-semibold leading-tight sm:whitespace-nowrap">{item.title[locale]}</p>
                    <p className="mt-2 text-[13px] leading-[1.5] text-[#7a8596]">{item.desc[locale]}</p>
                  </div>
                ))}
              </div>
            </div>

            <Link
              href={`/${locale}/products/detail/${mainLine.slug}`}
              aria-label={mainLine.title[locale]}
              className="group relative block h-[280px] overflow-hidden rounded-[4px] bg-[#eef2f7] md:h-[360px] lg:h-[390px] xl:h-[410px]"
            >
              <Image
                src={mainLine.image}
                alt={buildProductImageAlt(locale, mainLine.title[locale], mainLine.desc[locale])}
                fill
                priority
                unoptimized
                className="object-cover transition-transform duration-700 ease-out group-hover:scale-[1.018]"
                sizes="(min-width: 1024px) 760px, 100vw"
              />
            </Link>
          </div>
        </div>

        <div className="mt-5 rounded-[6px] border border-[#dfe5ee] bg-white p-6 md:p-8 lg:mt-6">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-3">
              <span className="h-6 w-[4px] bg-[#e60012]" aria-hidden="true" />
              <h3 className="text-[24px] font-semibold leading-tight text-[#101828]">
                {locale === 'en' ? 'Product Center' : '产品中心'}
              </h3>
            </div>
            <Link
              href={systemHref}
              className="text-[16px] font-normal leading-none text-[#333333] transition-opacity hover:opacity-80"
            >
              {locale === 'en' ? (
                <>
                  View More <span className="text-[#FF0000]">&gt;&gt;</span>
                </>
              ) : (
                <>
                  查看更多 <span className="text-[#FF0000]">&gt;&gt;</span>
                </>
              )}
            </Link>
          </div>

          <div className="mt-6 grid gap-5 lg:grid-cols-3">
            {heatTreatmentLines.map((item, index) => (
              <article
                key={item.slug}
                className="overflow-hidden rounded-[4px] border border-[#dfe5ee] bg-white transition hover:-translate-y-0.5"
              >
                <Link
                  href={`/${locale}/products/detail/${item.slug}`}
                  aria-label={item.title[locale]}
                  className="group relative block aspect-[16/9] overflow-hidden bg-[#eef2f7]"
                >
                  <Image
                    src={item.image}
                    alt={buildProductImageAlt(locale, item.title[locale], item.desc[locale])}
                    fill
                    unoptimized
                    className="object-cover transition-transform duration-700 ease-out group-hover:scale-[1.02]"
                    sizes="(min-width: 1024px) 440px, 100vw"
                  />
                </Link>
                <Link href={`/${locale}/products/detail/${item.slug}`} className="block px-5 pb-6 pt-5 md:px-6 md:pb-7">
                  <div className="flex items-baseline gap-3">
                    <span className="text-[28px] font-semibold leading-none text-[#e60012]">0{index + 1}</span>
                    <h4 className="text-[20px] font-semibold leading-[1.35] text-[#101828] transition hover:text-[#e60012]">
                      {item.title[locale]}
                    </h4>
                  </div>
                  <p className="mt-3 text-[15px] leading-[1.7] text-[#667085]">{item.desc[locale]}</p>
                </Link>
              </article>
            ))}
          </div>

          <div className="mt-6 lg:mt-7">
            <div className="grid grid-cols-2 border-l border-t border-[#ebebeb] lg:grid-cols-4">
              {productCenterCards.map((item) => (
                <Link
                  key={item.slug}
                  href={`/${locale}/products/detail/${item.slug}`}
                  className="group flex min-h-[210px] flex-col border-b border-r border-[#ebebeb] bg-white px-5 py-5 transition-colors duration-300 hover:bg-[#fcfcfc] lg:min-h-[238px] lg:px-6 lg:py-6"
                >
                  <p className="text-[10px] font-medium uppercase tracking-[0.16em] text-[#9aa0a6]">
                    {item.en}
                  </p>
                  <h5 className="mt-2 text-[17px] font-semibold leading-[1.4] text-[#1f1f1f] lg:text-[18px]">
                    {locale === 'en' ? item.en : item.zh}
                  </h5>
                  <div className="relative mt-4 flex min-h-0 flex-1 items-center justify-center">
                    <div className="relative h-[96px] w-full max-w-[206px] lg:h-[118px] lg:max-w-[226px]">
                      <Image
                        src={item.image}
                        alt={buildProductImageAlt(locale, locale === 'en' ? item.en : item.zh, item.feature[locale])}
                        fill
                        unoptimized
                        className="scale-[1.24] object-contain transition-transform duration-500 ease-out group-hover:scale-[1.32]"
                        sizes="(min-width: 1024px) 226px, 45vw"
                      />
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
