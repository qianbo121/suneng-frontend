import type { CSSProperties } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { FiArrowRight, FiBarChart2, FiBox, FiSettings, FiShield, FiUsers } from 'react-icons/fi';
import { Breadcrumb } from '@/components/layout/Breadcrumb';
import { WechatContactButton } from '@/components/lead/WechatContactButton';
import type { AgreementCase } from '@/lib/cases/agreement/reader';
import { MeasuredText } from './MeasuredText';
import { Faq } from './Faq';
import { LineFlow } from '@/components/case-studies/fastener-mesh-belt/LineFlow';
import { ProjectFlow } from './ProjectFlow';
import styles from './page.module.css';
import { JsonLd } from '@/components/JsonLd';
import { caseSearchJsonLd } from '@/lib/cases/search-metadata';
import { agreementSearchContent } from '@/lib/cases/agreement/search';

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

function ProjectFigures({ data, compact }: { data: AgreementCase; compact: boolean }) {
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
    {workpieces}
  </>;

  return <section className={styles.overview} data-single-figure={data.metrics.length === 1 || undefined} aria-labelledby="case-figure-heading">
    <div className={styles.figureSide}>
      <h2 id="case-figure-heading">{data.figureHeading ?? (english ? 'Specified output' : '协议约定产量')}</h2>
      {metrics}
    </div>
    <div className={styles.conditionsSide}>
      <h2>{english ? 'Parts and conditions' : '工件与条件'}</h2>
      {workpieces}
    </div>
    <p className={styles.figureNote}>{data.note}</p>
  </section>;
}

export function AgreementPage({ data }: { data: AgreementCase }) {
  const english = data.locale === 'en';
  const compactFigures = data.metrics.length === 1 || data.metrics.length === 2;
  const label = (zh: string, en: string) => english ? en : zh;
  const search = agreementSearchContent(data);
  const flowHeading = label('项目配置与工艺流程', 'Equipment and process flow');

  return (
    <article className={styles.page} data-agreement={data.slug}>
      <header className={styles.hero} data-compact-figures={compactFigures || undefined}>
        <Image fill priority unoptimized sizes="(max-width: 720px) 100vw, 64vw"
          className={styles.panorama} src={search.image} alt={data.heroAlt} />
        <div className={`site-page-container ${styles.heroInner}`}>
          <div className={styles.copy}>
            <Breadcrumb locale={data.locale} tone="light" className={styles.category} items={[{ label: label('项目案例', 'Case studies') }]} />
            <CaseTitle title={data.title} english={english} />
            <p className={styles.summary}>{data.summary}</p>
            <p className={styles.model}>
              <FiSettings aria-hidden />
              {data.model && <span>{label('设备型号：', 'Model: ')} {data.model}</span>}
              <span className={data.model ? styles.projectState : undefined}>{data.status}</span>
            </p>
          </div>
        </div>
      </header>

      <div className={`site-page-container ${styles.content}`}>
        <ProjectFigures data={data} compact={compactFigures} />

        <section className={styles.section}>
          <h2>{label('项目特点', 'Project features')}</h2>
          <div className={styles.features}>
            {data.features.map(([title, body]) => <div key={title}><h3>{title}</h3><p>{body}</p></div>)}
          </div>
        </section>

        <section id="process-flow" className={styles.section}>
          <h2>{flowHeading}</h2>
          {data.processCaption && <p className={styles.flowCaption}>{data.processCaption}</p>}
          {data.view ? <ProjectFlow steps={data.flow} view={data.view} film={data.view.animated ? '/case-media/' + data.slug + '/animation' : undefined} image={search.image} english={english} /> : <LineFlow english={english} />}
        </section>

        <div className={styles.cards}>
          <section>
            <h2><FiBarChart2 aria-hidden />{label('设备参数', 'Equipment specifications')}</h2>
            <table><tbody>{data.params.map(([name, value]) => <tr key={name}><th scope="row">{name}</th><td>{value}</td></tr>)}</tbody></table>
          </section>
          <section>
            <h2><FiUsers aria-hidden />{label('供货分工', 'Responsibilities')}</h2>
            <dl><dt>{label('苏能', 'Suneng')}</dt><dd>{data.supplier}</dd><dt>{label('买方', 'Buyer')}</dt><dd>{data.buyer}</dd></dl>
          </section>
          <section>
            <h2><FiBox aria-hidden />{data.slug === 'bright-quench-design' ? label('方案供货范围', 'Proposed scope of supply') : label('协议供货范围', 'Scope of supply')}</h2>
            <p>{data.scope}</p>
          </section>
          <section>
            <h2><FiShield aria-hidden />{label('验收办法', 'Acceptance procedure')}</h2>
            <dl><dt>{label('出厂前', 'At factory')}</dt><dd>{data.pre}</dd><dt>{label('买方现场', 'At site')}</dt><dd><MeasuredText text={data.site} /></dd></dl>
          </section>
        </div>

        <Faq questions={data.faq} en={english} intro={data.faqIntro} />
        <p className={styles.source}>{data.source}</p>
        <aside className={styles.cta}>
          <h2>{label('提交工件参数，核算产量与炉型', 'Share your part specifications to size the line')}</h2>
          {english ? <Link href="/en/about#contact" className={styles.action}><FiArrowRight aria-hidden />Discuss your project</Link>
            : <WechatContactButton label="获取方案" className={styles.action} icon={<FiArrowRight aria-hidden />} />}
        </aside>
      </div>
      <JsonLd id="case-search-jsonld" data={caseSearchJsonLd(search)} />
    </article>
  );
}
