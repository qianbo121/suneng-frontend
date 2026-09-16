import Link from 'next/link';
import { Suspense } from 'react';
import { HiOutlineCursorArrowRays } from 'react-icons/hi2';

import { HomepageBottomLeadBar } from '@/components/home/HomepageBottomLeadBar';
import { HeatTreatmentToolCenter } from '@/components/home/HeatTreatmentToolCenter';
import { HomepageLeadForm } from '@/components/home/HomepageLeadForm';
import { HomepageTaskCards } from '@/components/home/HomepageTaskCards';
import { ProductTypesShowcase } from '@/components/home/ProductTypesShowcase';
import { WorkpieceRouter } from '@/components/home/WorkpieceRouter';
import { getNewsDecisionCenterData } from '@/lib/news-decision-center.server';
import { localizeHomeWorkpieces } from '@/lib/home-workpieces-localized';
import { mapNewsToHomeTopicArticles, type HomeTopicArticle } from '@/lib/home-article-topics';
import { newsUiText } from '@/lib/news-ui';
import { getWorkpieceRouterPublicCatalog } from '@/lib/workpiece-router-public.server';

import styles from './HomepageV2.module.css';
import toolStyles from './HeatTreatmentToolCenter.module.css';

const taskPaths = [
  {
    id: 'heat-treatment-line',
    title: '我要上热处理线',
    description: '工件、工艺和产量，整线按需配置',
    href: '/zh/products#continuous-furnace-title',
    image: '/images/home/scenario-01-heat-treatment-line-780.webp',
    imageAlt: '完整热处理生产线工程手绘图',
    imageWidth: 1653,
    imageHeight: 729,
    imageClassName: styles.taskImageLine,
  },
  {
    id: 'furnace-selection',
    title: '我要选一台炉',
    description: '按工件、工艺温度和装炉量初选炉型',
    href: '/zh/products',
    image: '/images/home/scenario-02-furnace-selection-780.webp',
    imageAlt: '井式炉、箱式炉与罩式炉工程手绘图',
    imageWidth: 1380,
    imageHeight: 693,
    imageClassName: styles.taskImageSelection,
  },
  {
    id: 'old-furnace-diagnosis',
    title: '旧炉出问题',
    description: '能耗高、温度不均这类老毛病——维修、改造还是换新？',
    href: '/zh/service/furnace-renovation-overhaul',
    image: '/images/home/scenario-03-old-furnace-diagnosis-20260825-780.webp',
    imageAlt: '带炉门密封结构标注的旧台车式热处理炉工程手绘图',
    imageWidth: 1670,
    imageHeight: 941,
    imageClassName: styles.taskImageDiagnosis,
  },
] as const;

async function HomepageArticles({ locale }: { locale: 'zh' | 'en' }) {
  const english = locale === 'en';
  let articles: HomeTopicArticle[];
  try {
    const { data } = await getNewsDecisionCenterData(locale);
    if (!data?.length) throw new Error('Articles unavailable');
    articles = mapNewsToHomeTopicArticles(data, locale);
  } catch {
    return (
      <section className={toolStyles.section}>
        <div className={toolStyles.container}>
          <h2>{newsUiText(locale, '工业炉选型与采购资料')}</h2>
          <p>{english ? 'Resources are temporarily unavailable. Please try again later.' : '资料暂时无法加载，请稍后重试。'}</p>
          <Link href={`/${locale}/news`}>{english ? 'Browse technical resources' : '查看技术资料'}</Link>
        </div>
      </section>
    );
  }
  return <HeatTreatmentToolCenter articles={articles} locale={locale} />;
}

function HomepageArticlesLoading({ locale }: { locale: 'zh' | 'en' }) {
  const english = locale === 'en';
  return (
    <section className={toolStyles.section} aria-busy="true" aria-label={newsUiText(locale, '工业炉选型与采购资料')}>
      <div className={toolStyles.container}>
        <header className={toolStyles.heading}>
          <h2>{newsUiText(locale, '工业炉选型与采购资料')}</h2>
        </header>
        <div className="mt-6 min-h-80 rounded-lg bg-slate-100 p-6" role="status">
          {english ? 'Loading technical resources…' : '正在加载技术资料…'}
        </div>
      </div>
    </section>
  );
}

export function HomepageV2({ locale = 'zh' }: { locale?: 'zh' | 'en' }) {
  const english = locale === 'en';
  const sourceCatalog = getWorkpieceRouterPublicCatalog();
  const workpieceRouterCatalog = english ? localizeHomeWorkpieces(sourceCatalog) : sourceCatalog;
  const englishTasks = [
    { title: 'Plan a heat-treatment line', description: 'Configure a complete line around your parts, process and output.', href: '/en/products#continuous-lines', imageAlt: 'Complete heat-treatment line engineering drawing' },
    { title: 'Choose a furnace', description: 'Start with your workpiece, process temperature and batch load.', href: '/en/products', imageAlt: 'Pit, box and bell furnace engineering drawing' },
    { title: 'Improve an existing furnace', description: 'High energy use or uneven temperatures? Assess repair, retrofit or replacement.', href: '/en/service', imageAlt: 'Existing trolley furnace engineering drawing' },
  ];
  const tasks = english ? taskPaths.map((item, index) => ({ ...item, ...englishTasks[index] })) : taskPaths;

  return (
    <div className={styles.page} lang={locale}>
      <section id="task-paths" className={styles.section}>
        <div className={`${styles.container} ${styles.entryContainer}`}>
          <div className={styles.entryHeading}>
            <div>
              <h2>{english ? 'What brings you here?' : '您是哪种情况？'}</h2>
            </div>
            <p>
              <HiOutlineCursorArrowRays className={styles.entryPromptIcon} aria-hidden="true" />
              <span>{english ? 'Choose your starting point' : '选择最接近您的情况'}</span>
            </p>
          </div>
          <HomepageTaskCards items={tasks} />
        </div>
      </section>

      <WorkpieceRouter catalog={workpieceRouterCatalog} locale={locale} />

      <ProductTypesShowcase locale={locale} />

      <Suspense fallback={<HomepageArticlesLoading locale={locale} />}>
        <HomepageArticles locale={locale} />
      </Suspense>

      <HomepageLeadForm locale={locale} />

      <HomepageBottomLeadBar locale={locale} />
    </div>
  );
}
