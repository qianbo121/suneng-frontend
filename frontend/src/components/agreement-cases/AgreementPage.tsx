import { FiBarChart2, FiBox, FiShield, FiUsers } from 'react-icons/fi';
import type { AgreementCase } from '@/lib/cases/agreement/reader';
import { MeasuredText } from './MeasuredText';
import { CaseHero, ProjectFigures, ProjectFeatures, CaseContact } from './ProjectSections';
import { Faq } from './Faq';
import { LineFlow } from '@/components/case-studies/fastener-mesh-belt/LineFlow';
import { ProjectFlow } from './ProjectFlow';
import styles from './page.module.css';
import { JsonLd } from '@/components/JsonLd';
import { caseSearchJsonLd } from '@/lib/cases/search-metadata';
import { agreementSearchContent } from '@/lib/cases/agreement/search';

export function AgreementPage({ data }: { data: AgreementCase }) {
  const english = data.locale === 'en';
  const compactFigures = data.metrics.length === 1 || data.metrics.length === 2;
  const label = (zh: string, en: string) => english ? en : zh;
  const search = agreementSearchContent(data);
  const flowHeading = label('项目配置与工艺流程', 'Equipment and process flow');

  return (
    <article data-project-case="" className={styles.page} data-agreement={data.slug}>
      <CaseHero data={data} image={search.image} compact={compactFigures} />

      <div className={`site-page-container ${styles.content}`}>
        <ProjectFigures data={data} compact={compactFigures} />

        <ProjectFeatures title={label('项目特点', 'Project features')} features={data.features} />

        <section id="process-flow" className={styles.section}>
          <h2>{flowHeading}</h2>
          {data.processCaption && <p className={styles.flowCaption}>{data.processCaption}</p>}
          {data.view ? <ProjectFlow steps={data.flow} view={data.view} film={data.view.animated ? '/case-media/' + data.slug + '/animation' : undefined} image={'/case-media/' + data.slug + '/cover.webp'} english={english} /> : <LineFlow english={english} />}
        </section>

        <div className={styles.cards}>
          <section>
            <h2><FiBarChart2 aria-hidden />{label('设备参数', 'Equipment specifications')}</h2>
            <table><tbody>{data.params.map(([name, value]) => <tr key={name}><th scope="row">{name}</th><td>{value}</td></tr>)}</tbody></table>
            {data.locale === 'zh' && data.slug === 'cylinder-liner-solution-aging' && (
              <p>设备介绍：<a className={styles.equipmentLink} href="/zh/products/detail/aluminum-solution-aging-line">铝合金固溶时效生产线</a></p>
            )}
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
        <CaseContact title={label('提交工件参数，核算产量与炉型', 'Share your part specifications to size the line')} english={english} />
      </div>
      <JsonLd id="case-search-jsonld" data={caseSearchJsonLd(search)} />
    </article>
  );
}
