import Image from 'next/image';
import Link from 'next/link';

import { buildProductImageAlt } from '@/lib/seo';
import { Locale } from '@/types/site';

type HeatTreatmentLinesProps = {
  locale: Locale;
};

type HeatTreatmentLineCard = {
  title: Record<Locale, string>;
  desc: Record<Locale, string>;
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

export function HeatTreatmentLines({ locale }: HeatTreatmentLinesProps) {
  const [mainLine] = heatTreatmentLines;
  const systemHref = locale === 'zh' ? '/zh/solutions/continuous-heat-treatment-line' : '/en/products';
  const quoteHref = locale === 'zh' ? '/zh/articles/gongye-lu-baojia-canshu' : '/en/contact';

  return (
    <section className="border-y border-[#e7ebf1] bg-[#f6f8fb] py-10 lg:py-14">
      <div className="mx-auto w-full max-w-[1480px] px-4 md:px-6 lg:px-8">
        <div className="overflow-hidden rounded-[6px] border border-[#dfe5ee] bg-white shadow-[0_22px_60px_rgba(15,23,42,0.08)]">
          <div className="grid gap-8 p-5 md:p-8 lg:grid-cols-2 lg:gap-12 lg:p-11">
            <div className="flex flex-col justify-center">
              <div className="flex items-center gap-3 text-[14px] font-semibold text-[#e60012]">
                <span className="h-6 w-[4px] bg-[#e60012]" aria-hidden="true" />
                {locale === 'en' ? 'System solution entry' : '系统级方案入口'}
              </div>
              <h2 className="mt-6 text-[30px] font-semibold leading-[1.18] text-[#101828] md:text-[38px] lg:whitespace-nowrap lg:text-[40px] xl:text-[44px]">
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
                <Link
                  href={quoteHref}
                  className="inline-flex min-h-[52px] items-center justify-center rounded-[3px] border border-[#c8d0dc] bg-white px-8 text-[15px] font-semibold text-[#101828] transition hover:border-[#98a2b3] hover:bg-[#f8fafc] sm:whitespace-nowrap"
                >
                  {locale === 'en' ? 'Submit line parameters' : '提交产线参数获取方案'}
                </Link>
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
              className="group relative block min-h-[280px] overflow-hidden rounded-[4px] bg-[#eef2f7] md:min-h-[390px] lg:min-h-[520px]"
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

        <div className="mt-4 rounded-[6px] border border-[#dfe5ee] bg-white p-5 shadow-[0_18px_50px_rgba(15,23,42,0.06)] md:p-7">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-3">
              <span className="h-6 w-[4px] bg-[#e60012]" aria-hidden="true" />
              <h3 className="text-[24px] font-semibold leading-tight text-[#101828]">
                {locale === 'en' ? 'Core production line types' : '核心生产线类型'}
              </h3>
            </div>
            <Link href={systemHref} className="text-[14px] font-medium text-[#667085] transition hover:text-[#e60012]">
              {locale === 'en' ? 'More solutions >' : '了解更多方案 >'}
            </Link>
          </div>

          <div className="mt-5 grid gap-4 lg:grid-cols-3">
            {heatTreatmentLines.map((item, index) => (
              <article
                key={item.slug}
                className="overflow-hidden rounded-[4px] border border-[#dfe5ee] bg-white transition hover:-translate-y-0.5 hover:shadow-[0_18px_42px_rgba(15,23,42,0.08)]"
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
                <Link href={`/${locale}/products/detail/${item.slug}`} className="block px-4 pb-5 pt-4 md:px-5 md:pb-6">
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
        </div>
      </div>
    </section>
  );
}
