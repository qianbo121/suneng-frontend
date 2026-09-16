import { TECHNICAL_CONTENT_PUBLISHED } from '@/lib/publication-scope';
import Image from 'next/image';
import { CASE_EVIDENCE_ID, getCaseConnections, getEntryCases, splitEntryCases } from '@/lib/cases/product-relations';
import type { Locale } from '@/types/site';
import styles from './CaseEvidenceLinks.module.css';

export function EntryCaseEvidence({ entryPath, locale }: { entryPath: string; locale: Locale }) {
  if (!TECHNICAL_CONTENT_PUBLISHED) return null;
  const en = locale === 'en';
  const items = getEntryCases(entryPath, locale);
  const { featured, remaining } = splitEntryCases(items);
  if (!items.length && !entryPath.startsWith('/products/detail/')) return null;
  const cards = (records: typeof items) => <div className={styles.grid}>{records.map((item) => (
    <article className={styles.card} key={item.id} data-related-case={item.id}>
      <a className={styles.imageLink} href={item.href} aria-label={item.title} tabIndex={-1}>
        {item.cover ? <Image src={item.cover.src} alt={item.cover.alt} width={600} height={390} sizes="(max-width: 800px) calc(100vw - 52px), (max-width: 1280px) 31vw, 390px" style={{ objectFit: item.cover.fit ?? 'contain' }} />
          : <span className={styles.imageFallback}><span>{item.workpieceLabel}</span><small>{en ? 'See the application requirements' : '查看工件与配套要求'}</small></span>}
      </a>
      <div className={styles.cardBody}>
        <p className={styles.workpiece}>{item.workpieceLabel}</p>
        <h3><a href={item.href}>{item.title}</a></h3>
        <ul className={styles.tags} aria-label={en ? 'Review topics' : '核对要点'}>{item.focus.split(en ? ' and ' : item.focus.includes('、') ? '、' : '与').map((tag) => <li key={tag}>{tag}</li>)}</ul>
        <p className={styles.summary}>{item.summary.split(/(?<=[。！？])|(?<=[.!?])\s+/)[0]}</p>
        {item.note && <p className={styles.note}>{en ? 'Scope of this reference: ' : '本项参考范围：'}{item.note}</p>}
        <a className={styles.cardLink} href={item.href} aria-label={`${en ? 'View record' : '查看方案'}：${item.title}`}>{en ? 'View record' : '查看方案'} <span aria-hidden="true">{'>>'}</span></a>
      </div>
    </article>
  ))}</div>;
  return <section className={styles.section} id={CASE_EVIDENCE_ID} aria-labelledby={`${CASE_EVIDENCE_ID}-title`} data-entry-case-evidence={entryPath}>
    <h2 id={`${CASE_EVIDENCE_ID}-title`}>{en ? 'Related proposals and project records' : '相关方案与项目资料'}</h2>
    <p className={styles.intro}>{items.length
      ? (en ? 'Find related records by workpiece, configuration and site conditions.' : '从工件、配置和现场条件，查找相关方案。')
      : (en ? 'No directly matching public project record is currently available for this equipment. Send the material, required process, loading pattern and site conditions to confirm the scope.' : '当前公开资料中暂无与本设备直接匹配的项目记录。可提供材料、目标工艺、装料方式与现场条件，先确认设备和配套范围。')}</p>
    {cards(featured)}
    {remaining.length > 0 && <details className={styles.more}><summary><span className={styles.moreClosed}>{en ? `View all related records (${items.length})` : `查看全部相关资料（${items.length}篇）`}</span><span className={styles.moreOpen}>{en ? 'Show fewer records' : '收起更多资料'}</span><span aria-hidden="true">{' >>'}</span></summary>{cards(remaining)}</details>}
    {!items.length && <a href={`/${locale}/contact`}>{en ? 'Discuss your application' : '提交工况，确认适用条件'}</a>}
  </section>;
}

export function CaseProductConnections({ caseId, locale }: { caseId: string; locale: Locale }) {
  const items = getCaseConnections(caseId, locale);
  if (!items.length) return null;
  if (!TECHNICAL_CONTENT_PUBLISHED) return null;
  const en = locale === 'en';
  return <section id="case-product-connections" className={`${styles.section} ${styles.connections}`} aria-labelledby="case-product-connections-title">
    <h2 id="case-product-connections-title">{en ? 'Continue equipment and scope selection' : '继续确认设备与配套范围'}</h2>
    <p className={styles.intro}>{en ? 'Take the conditions in this record back to the relevant equipment or engineering entry below.' : '带着本篇的工况和配置条件，继续查看对应设备或工程入口。'}</p>
    <ul>{items.map((item) => <li key={item.href}><a href={item.href}>{item.name}</a> <span className={styles.focus}>{item.focus}</span>{item.note && <p className={styles.note}>{item.note}</p>}</li>)}</ul>
  </section>;
}
