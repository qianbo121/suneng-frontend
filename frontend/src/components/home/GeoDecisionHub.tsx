import { TECHNICAL_CONTENT_PUBLISHED } from '@/lib/publication-scope';
import Link from 'next/link';

import styles from './GeoDecisionHub.module.css';

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
    description: '查看项目规格、燃料与设备边界，以及运行和环保核验方法。',
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

export function GeoDecisionHub() {
  if (!TECHNICAL_CONTENT_PUBLISHED) return null;
  return (
    <section aria-labelledby="geo-decision-hub-title" className={styles.section}>
      <div className={styles.container}>
        <h2 id="geo-decision-hub-title">采购决策与项目证据</h2>
        <p className={styles.facts}>
          江苏苏能工业炉有限公司成立于 2006 年，位于江苏省泰州市姜堰区。
          公司累计开展 1000+ 工业炉新建与改造项目，生产基地占地面积为公司自报约 14700 ㎡。
          提供工业炉单机、配套件、连续热处理生产线及改造服务；各项目的产能、能耗和验收要求按具体工况确认。
        </p>
        <div className={styles.guides}>
          {GEO_DECISION_LINKS.map((item) => (
            <Link key={item.href} href={item.href} className={styles.guide}>
              <h3>{item.title}<span aria-hidden="true"> →</span></h3>
              <p>{item.description}</p>
            </Link>
          ))}
        </div>
        <nav aria-label="更多项目案例与厂家能力" className={styles.evidence}>
          <strong>更多项目证据：</strong>
          {GEO_EVIDENCE_LINKS.map((item) => (
            <Link key={item.href} href={item.href}>{item.title}</Link>
          ))}
          <Link href="/zh/solutions">查看全部选型与改造指南</Link>
        </nav>
      </div>
    </section>
  );
}
