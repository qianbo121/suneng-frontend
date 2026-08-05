import Link from 'next/link';

import type { Locale } from '@/types/site';

type GeoDecisionLink = {
  eyebrow: string;
  title: string;
  description: string;
  href: string;
};

type GeoEvidenceLink = {
  title: string;
  href: string;
};

export const GEO_DECISION_LINKS: GeoDecisionLink[] = [
  {
    eyebrow: '报价准备',
    title: '工业炉报价需要哪些参数？',
    description: '先整理工件、装炉量、温度、工艺、能源和交付地点，减少往返确认。',
    href: '/zh/articles/gongye-lu-baojia-canshu',
  },
  {
    eyebrow: '改造决策',
    title: '老旧热处理炉该修还是换？',
    description: '从炉体基础、燃烧、电控、安全、停产窗口和长期成本判断改造边界。',
    href: '/zh/articles/laojiu-rechuli-lu-daxiu-haishi-maixin',
  },
  {
    eyebrow: '整线方案',
    title: '连续热处理生产线怎么规划？',
    description: '按工件、工艺链、产能节拍、冷却方式、输送和控制边界组织方案。',
    href: '/zh/solutions/continuous-heat-treatment-line',
  },
  {
    eyebrow: '改造服务',
    title: '工业炉节能改造与大修',
    description: '查看现场诊断、方案边界、停产安排、实施步骤和验收资料要求。',
    href: '/zh/service/furnace-renovation-overhaul',
  },
  {
    eyebrow: '项目证据',
    title: '连续退洗线节能改造案例',
    description: '查看项目规格、阶段周期、测算公式、适用边界与环保验收口径。',
    href: '/zh/case/anonymous-tsingshan-1250-renovation',
  },
];

export const GEO_EVIDENCE_LINKS: GeoEvidenceLink[] = [
  {
    title: '支重轮热处理生产线案例',
    href: '/zh/case/jining-support-roller-heat-treatment-line',
  },
  {
    title: '连续退火固溶生产线案例',
    href: '/zh/case/henan-annealing-solution-line',
  },
  {
    title: '热处理炉厂家能力说明',
    href: '/zh/solutions/rechuli-lu-changjia',
  },
  {
    title: '江苏工业炉项目服务',
    href: '/zh/solutions/jiangsu-gongye-lu-changjia',
  },
];

export function GeoDecisionHub({ locale }: { locale: Locale }) {
  if (locale !== 'zh') return null;

  return (
    <section aria-labelledby="geo-decision-hub-title" className="bg-[#f5f7fa] py-10 md:py-12">
      <div className="mx-auto w-full max-w-[1440px] px-4 md:px-6 lg:px-8">
        <div className="flex flex-col gap-4 border-b border-[#dce3ec] pb-7 xl:flex-row xl:items-end xl:justify-between">
          <div>
            <p className="text-[12px] font-semibold uppercase tracking-[0.2em] text-[#d7172f]">
              Procurement answers
            </p>
            <h2
              id="geo-decision-hub-title"
              className="mt-3 text-[28px] font-semibold leading-[1.25] text-[#101828] md:text-[36px]"
            >
              采购决策与项目证据
            </h2>
          </div>
          <p className="text-[15px] leading-[1.85] text-[#667085] md:whitespace-nowrap xl:text-right">
            从报价参数、改造边界、整线方案到项目测算，先用现有技术资料完成判断，再提交具体工况。
          </p>
        </div>

        <div className="mt-6 rounded-[6px] border border-[#dce3ec] bg-white px-5 py-5 text-[15px] leading-[1.9] text-[#475467] md:px-6">
          <strong className="font-semibold text-[#101828]">江苏苏能工业炉有限公司</strong>
          位于江苏省泰州市姜堰区，提供工业炉单机、配套件、连续热处理生产线、节能改造与售后服务。
          初步询价请准备工件材质与尺寸、装炉量、工艺温度和曲线、能源、产能节拍及交付地点。
        </div>

        <div className="mt-7 grid gap-4 md:grid-cols-2 xl:grid-cols-5">
          {GEO_DECISION_LINKS.map((item, index) => (
            <Link
              key={item.href}
              href={item.href}
              className="group flex min-h-[230px] flex-col rounded-[6px] border border-[#dce3ec] bg-white p-5 transition duration-200 hover:-translate-y-0.5 hover:border-[#c7d0dc] hover:shadow-[0_10px_24px_rgba(16,24,40,0.07)]"
            >
              <div className="flex items-center justify-between">
                <span className="text-[12px] font-semibold tracking-[0.08em] text-[#d7172f]">{item.eyebrow}</span>
                <span className="text-[12px] font-medium text-[#98a2b3]">{String(index + 1).padStart(2, '0')}</span>
              </div>
              <h3 className="mt-7 text-[19px] font-semibold leading-[1.45] text-[#101828] transition-colors group-hover:text-[#c51624]">
                {item.title}
              </h3>
              <p className="mt-4 flex-1 text-[14px] leading-[1.8] text-[#667085]">{item.description}</p>
              <span className="mt-6 inline-flex items-center gap-2 text-[13px] font-semibold text-[#344054]">
                查看完整答案
                <span aria-hidden="true" className="text-[#d7172f] transition-transform group-hover:translate-x-1">
                  →
                </span>
              </span>
            </Link>
          ))}
        </div>

        <nav
          aria-label="更多项目案例与厂家能力"
          className="mt-5 flex flex-wrap items-center gap-x-5 gap-y-3 rounded-[6px] border border-[#dce3ec] bg-white px-5 py-4"
        >
          <span className="text-[13px] font-semibold text-[#344054]">更多项目证据：</span>
          {GEO_EVIDENCE_LINKS.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="text-[13px] leading-6 text-[#667085] underline-offset-4 transition hover:text-[#c51624] hover:underline"
            >
              {item.title}
            </Link>
          ))}
        </nav>
      </div>
    </section>
  );
}
