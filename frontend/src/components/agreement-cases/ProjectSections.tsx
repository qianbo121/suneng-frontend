import type { CSSProperties } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { FiArrowRight } from 'react-icons/fi';
import { Breadcrumb } from '@/components/layout/Breadcrumb';
import { WechatContactButton } from '@/components/lead/WechatContactButton';
import { CaseSourceLine } from '@/components/case-studies/CaseSourceLine';
import styles from './page.module.css';

function CaseTitle({ title, english }: { title: string; english: boolean }) {
  const split = title.search(/[：:]/);
  if (split < 0) return <h1>{title}</h1>;
  const subject = title.slice(0, split + 1);
  const question = title.slice(split + 1).trim();
  if (english) return <h1>{subject}{' '}<br />{question}</h1>;
  const words = new Intl.Segmenter('zh-CN', { granularity: 'word' }).segment(question);
  return <h1>{subject}<br />{Array.from(words, ({ index, segment }) =>
    <span className={styles.word} key={index}>{segment}</span>)}</h1>;
}

function Metric({ value, unit }: { value: string; unit: string }) {
  const split = value.search(/\d/);
  return <dd>{split > 0 && <small>{value.slice(0, split).replace('up to approximately ', 'max. approx. ').replace('approximately ', 'approx. ')}</small>}
    {value.slice(Math.max(0, split))}<wbr /><small> {unit}</small></dd>;
}

type FigureData = { locale: string; metrics: string[][]; note: string; work: string[]; figureHeading?: string; conditionsHeading?: string };

export function ProjectFigures({ data, compact }: { data: FigureData; compact: boolean }) {
  const english = data.locale === 'en';
  const metrics = <dl style={{ '--metrics': data.metrics.length } as CSSProperties}>
    {data.metrics.map(([name, value, unit]) => (
      <div key={name}><dt>{name}</dt><Metric value={value} unit={unit} /></div>
    ))}
  </dl>;
  const workpieces = <ul className={compact ? styles.conditionsList : styles.workpiece}>
    {data.work.map(line => {
      const separator = line.search(/[：:]/) + 1;
      return <li key={line}><b>{line.slice(0, separator)}</b><span>{line.slice(separator)}</span></li>;
    })}
  </ul>;

  if (!compact) return <>
    <section className={styles.capacity} aria-label={english ? 'Project figures' : '项目参数'}>
      {metrics}
      <p>{data.note}</p>
    </section>
    {data.work.length > 0 && workpieces}
  </>;

  return <section className={styles.overview} data-single-figure={data.metrics.length === 1 || undefined} aria-labelledby="case-figure-heading">
    <div className={styles.figureSide}>
      <h2 id="case-figure-heading">{data.figureHeading ?? (english ? 'Specified output' : '协议约定产量')}</h2>
      {metrics}
    </div>
    <div className={styles.conditionsSide}>
      <h2>{data.conditionsHeading ?? (english ? 'Parts and conditions' : '工件与条件')}</h2>
      {workpieces}
    </div>
    <p className={styles.figureNote}>{data.note}</p>
  </section>;
}

type HeroData = { slug: string; locale: string; heroAlt: string; title: string; summary: string; status?: string };

export function CaseHero({ data, image, compact = false, category, returnHref }: {
  data: HeroData; image?: string; compact?: boolean; category?: string; returnHref?: string;
}) {
  const english = data.locale === 'en';
  return (
    <header className={styles.hero} data-cover={image ? (english ? undefined : 'workpiece') : 'text'} data-compact-figures={compact || undefined}>
      {image && <Image fill priority unoptimized sizes="(max-width: 720px) 100vw, 56vw"
        className={styles.panorama} src={image} alt={data.heroAlt} />}
      <div className={`site-page-container ${styles.heroInner}`}>
        <div className={styles.copy}>
          <Breadcrumb locale={data.locale} tone="light" className={styles.category} currentLabel={category} items={[{ label: english ? 'Case studies' : '项目案例', href: returnHref }]} />
          <CaseTitle title={data.title} english={english} />
          <p className={styles.summary}>{data.summary}</p>
          {english ? (
            data.slug === 'fastener-mesh-belt-quenching-carburizing' && <p className={styles.projectState}>{data.status}</p>
          ) : (
            <CaseSourceLine slug={data.slug} className={styles.projectState} />
          )}
        </div>
      </div>
    </header>
  );
}

export function ProjectFeatures({ title, features }: { title: string; features: string[][] }) {
  return (
    <section className={styles.section}>
      <h2>{title}</h2>
      <div className={styles.features} data-count={features.length}>
        {features.map(([title, body]) => <div key={title}><h3>{title}</h3><p>{body}</p></div>)}
      </div>
    </section>
  );
}

export function CaseContact({ title, english = false }: { title: string; english?: boolean }) {
  return (
    <aside className={styles.cta}>
      <h2>{title}</h2>
      {english ? <Link href="/en/about#contact" className={styles.action}><FiArrowRight aria-hidden />Discuss your project</Link>
        : <WechatContactButton label="获取方案" className={styles.action} icon={<FiArrowRight aria-hidden />} />}
    </aside>
  );
}
