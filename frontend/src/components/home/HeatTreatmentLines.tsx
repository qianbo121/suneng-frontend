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

const heatTreatmentLines: HeatTreatmentLineCard[] = [
  {
    title: { zh: '托辊型网带式电阻炉生产线', en: 'Roller Mesh Belt Heat Treatment Line' },
    desc: { zh: '连续退火回火，托辊输送平稳控温均匀', en: 'continuous annealing and tempering with stable roller conveying' },
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
    desc: { zh: '退火固溶温控精准，提升材料组织均匀性', en: 'precise annealing and solution temperature control for uniform material structure' },
    image: '/images/products/annealing-solution-line/gallery/line-01.jpg',
    slug: 'annealing-solution-line',
  },
];

function LineCard({
  item,
  locale,
  featured = false,
}: {
  item: HeatTreatmentLineCard;
  locale: Locale;
  featured?: boolean;
}) {
  return (
    <Link
      href={`/${locale}/products/detail/${item.slug}`}
      className={`group relative block overflow-hidden rounded-[6px] border border-[#e5e7eb] bg-black shadow-[0_2px_12px_rgba(15,23,42,0.08)] ${
        featured ? 'min-h-[300px] lg:min-h-[360px]' : 'min-h-[174px] lg:min-h-[174px]'
      }`}
    >
      {/* 背景图层：保持设计稿一主两辅卡片比例，hover 仅做轻微缩放。 */}
      <Image
        src={item.image}
        alt={buildProductImageAlt(locale, item.title[locale], item.desc[locale])}
        fill
        priority
        unoptimized
        className="object-cover transition-transform duration-500 ease-out group-hover:scale-[1.04]"
        sizes={featured ? '(min-width: 1024px) 52vw, 100vw' : '(min-width: 1024px) 38vw, 100vw'}
      />
      <div className="absolute inset-0 bg-black/40" />
      <div className="absolute inset-0 bg-gradient-to-r from-black/64 via-black/28 to-transparent" />
      <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent" />

      {/* 文案层：左下对齐，按钮保持白色描边，贴合当前首页工业风视觉。 */}
      <div className={`absolute left-0 top-0 flex h-full flex-col justify-end ${featured ? 'p-5 lg:p-7' : 'p-5 lg:p-6'}`}>
        <h2 className={`${featured ? 'text-[24px] lg:text-[28px]' : 'text-[20px] lg:text-[22px]'} max-w-[15em] font-normal leading-[1.35] text-white`}>
          {item.title[locale]}
        </h2>
        <p className={`${featured ? 'mt-3' : 'mt-2'} max-w-[32em] text-[14px] leading-[1.75] text-white`}>
          {item.desc[locale]}
        </p>
        <span className="mt-4 inline-flex w-fit items-center rounded-[4px] border border-white/72 px-4 py-2 text-[13px] font-medium leading-none text-white transition-colors duration-200 group-hover:border-white group-hover:bg-white group-hover:text-[#111827]">
          {locale === 'en' ? 'View details ->' : '查看详情 →'}
        </span>
      </div>
    </Link>
  );
}

export function HeatTreatmentLines({ locale }: HeatTreatmentLinesProps) {
  const [mainLine, ...sideLines] = heatTreatmentLines;

  return (
    <section className="bg-white pb-0 pt-6 lg:pb-0 lg:pt-8">
      <div className="mx-auto w-full max-w-[1440px] px-4 md:px-5 lg:px-5 xl:px-4">
        {/* 热处理生产线模块：桌面一主两辅，移动端自然堆叠。 */}
        <div className="grid gap-3 lg:grid-cols-[1.08fr_0.86fr]">
          <LineCard item={mainLine} locale={locale} featured />
          <div className="grid gap-3">
            {sideLines.map((item) => (
              <LineCard key={item.slug} item={item} locale={locale} />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
