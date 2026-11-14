import Link from 'next/link';
import { HiChevronDown } from 'react-icons/hi2';
import { Breadcrumb } from '@/components/layout/Breadcrumb';
import copy from '@/lib/cqi-9-page-content.json';
import styles from './Cqi9EquipmentPage.module.css';

export function Cqi9EquipmentPage({ locale }: { locale: 'zh' | 'en' }) {
  const c = copy[locale];
  const en = locale === 'en';
  const parent = `/${locale}/products/detail/fastener-quench-temper-line`;
  const [equipmentTitle, projectScope] = c.headers[1].split(/(?=[（(])/);
  const equipmentRows = c.rows.map(([label, equipment, buyer]) => {
    const [name, question] = label.split('\n');
    return { name, question, equipment, buyer };
  });
  const nav = [
    ['equipment', en ? 'Equipment & responsibilities' : '设备与分工'],
    ['acceptance', en ? 'Acceptance conditions' : '验收条件'],
    ['purchase', en ? 'Before purchase' : '采购前核对'],
    ['questions', en ? 'Questions' : '常见问题'],
  ];
  function referenced(text: string) {
    return text.split(/(\[1\]|\[2\])/).map((part, i) => /^\[[12]\]$/.test(part)
      ? <a key={i} className={styles.citation} href={`#reference-${part[1]}`} aria-label={`${en ? 'Reference' : '参考资料'} ${part[1]}`}>{part}</a>
      : part);
  }
  function heading(text: string) {
    if (en) return text;
    const phrases: Record<string, string[]> = {
      [c.scope_heading]: ['先把设备交付', '和买方的工作分清楚'],
      [c.table_heading]: ['设备能交付什么，', '买方还要落实什么'],
      [c.accept_heading]: ['炉温验收', '要把测量条件一起写清楚'],
      [c.purchase_heading]: ['买之前，', '把三件事写进技术协议'],
      [c.cta_heading]: ['把客户的审核要求', '和工件资料一起发来'],
      [c.faq[1][0]]: ['表格里的功能，', '每条苏能网带调质线都有吗？'],
    };
    return (phrases[text] ?? [text]).map(part => <span key={part} className={styles.headingPhrase}>{part}</span>);
  }
  return <article className={styles.page} lang={locale} data-cqi-page={locale}>
    {process.env.NODE_ENV === 'development' && <div className={styles.preview}>{en ? 'Local preview · Approved v2 copy · Not published' : '本地预览 · v2 文案 · 未上线'}</div>}
    <div className={`${styles.container} ${styles.breadcrumb}`}>
      <Breadcrumb locale={locale} tone="dark" currentLabel={en ? 'CQI-9 equipment support' : 'CQI-9 设备配合'} items={[
        { label: en ? 'Equipment & Production Lines' : '设备与生产线', href: `/${locale}/products` },
        { label: en ? 'Fastener Quench & Temper Line' : '紧固件调质生产线', href: parent },
      ]} />
    </div>
    <header className={`${styles.container} ${styles.hero}`}>
      <div>
        <p className={styles.eyebrow}>{c.subtitle}</p>
        <h1>{en ? c.title : <><span className={styles.titleLine}><span className={styles.headingPhrase}>CQI-9 审核：</span><span className={styles.headingPhrase}>苏能网带调质线</span></span><span className={styles.titleLine}>能配合哪些设备项目？</span></>}</h1>
        <div className={styles.heroBody}>
          <p>{c.lead}</p>
          <div className={styles.actions}>
            <a className={styles.heroPrimary} href="#consultation">{c.primary}</a>
            <Link className={styles.heroSecondary} href={parent}>{c.secondary}</Link>
          </div>
        </div>
      </div>
      <section className={styles.equipmentSummary} aria-labelledby="equipment-summary-title">
        <h2 id="equipment-summary-title">{equipmentTitle}<small>{projectScope}</small></h2>
        <dl>
          {equipmentRows.map(({ name, question }) => <div key={name}>
            <dt>{name}</dt>
            <dd>{question}</dd>
          </div>)}
        </dl>
      </section>
    </header>
    <nav className={styles.sectionNav} aria-label={en ? 'On this page' : '页内导航'}>
      <div className={styles.container}>{nav.map(([id, label]) => <a key={id} href={`#${id}`}>{label}</a>)}</div>
    </nav>
    <section className={`${styles.container} ${styles.scope}`} aria-labelledby="scope-title">
      <h2 id="scope-title">{heading(c.scope_heading)}</h2>
      <p>{referenced(c.scope)}</p>
    </section>
    <section id="equipment" className={`${styles.container} ${styles.section}`} aria-labelledby="equipment-title">
      <div className={styles.sectionHeading}><span className={styles.number}>01</span><h2 id="equipment-title">{heading(c.table_heading)}</h2></div>
      <p className={styles.intro}>{c.table_intro}</p>
      <table className={styles.table}>
        <caption className={styles.srOnly}>{c.table_heading}</caption>
        <thead><tr>{c.headers.map(h => <th key={h} scope="col">{h}</th>)}</tr></thead>
        <tbody>{equipmentRows.map(({ name, question, equipment, buyer }, i) => <tr key={name}>
          <th scope="row"><span className={styles.rowNumber} aria-hidden="true">{String(i + 1).padStart(2, '0')}</span><strong>{name}</strong><span className={styles.rowHint}>{question}</span></th>
          <td><span className={styles.mobileLabel} aria-hidden="true">{c.headers[1]}</span>{equipment}</td>
          <td><span className={styles.mobileLabel} aria-hidden="true">{c.headers[2]}</span>{buyer}</td>
        </tr>)}</tbody>
      </table>
    </section>
    <section id="acceptance" className={styles.acceptance} aria-labelledby="acceptance-title">
      <div className={`${styles.container} ${styles.acceptanceGrid}`}>
        <div className={styles.sectionHeading}><span className={styles.number}>02</span><h2 id="acceptance-title">{heading(c.accept_heading)}</h2></div>
        <div><p className={styles.criterion}>{c.accept}</p><p>{referenced(c.accept_limit)}</p></div>
      </div>
    </section>
    <section id="purchase" className={`${styles.container} ${styles.section}`} aria-labelledby="purchase-title">
      <div className={styles.sectionHeading}><span className={styles.number}>03</span><h2 id="purchase-title">{heading(c.purchase_heading)}</h2></div>
      <div className={styles.purchaseGrid}>{c.purchase.map(([title, text], i) => <div key={title} className={styles.purchaseItem}><span className={styles.purchaseNumber} aria-hidden="true">{String(i + 1).padStart(2, '0')}</span><h3>{title}</h3><p>{text}</p></div>)}</div>
    </section>
    <section id="questions" className={`${styles.container} ${styles.faq}`} aria-labelledby="questions-title">
      <div className={styles.sectionHeading}><span className={styles.number}>04</span><h2 id="questions-title">{c.faq_heading}</h2></div>
      <div>{c.faq.map(([question, answer], i) => <details key={question} open={i === 0}><summary><h3>{!en && i === 1 ? heading(question) : question}</h3><HiChevronDown aria-hidden="true" /></summary><p>{answer}</p></details>)}</div>
    </section>
    <section id="consultation" className={styles.consultation} aria-labelledby="consultation-title">
      <div className={`${styles.container} ${styles.consultationGrid}`}>
        <div><h2 id="consultation-title">{heading(c.cta_heading)}</h2><p>{c.cta}</p></div>
        <div className={styles.contactActions}>
          <Link className={styles.primary} href={`${parent}#inquiry`}>{c.cta_button}</Link>
          <a href="tel:+8613052986814">{c.phone}</a>
          <a href="mailto:997518512@qq.com">{c.email}</a>
        </div>
      </div>
    </section>
    <div className={`${styles.container} ${styles.endMatter}`}>
      <section aria-labelledby="related-title"><h2 id="related-title">{c.related_heading}</h2><div className={styles.related}>{c.links.map(([label, url]) => <Link className={styles.textLink} key={url} href={new URL(url).pathname}>{label}</Link>)}</div></section>
      <section className={styles.references} aria-labelledby="references-title"><h2 id="references-title">{c.refs_heading}</h2><ul>{c.refs.map(([label, url], i) => <li id={`reference-${i + 1}`} key={url}><a href={url} target="_blank" rel="noopener noreferrer">{label}<span className={styles.srOnly}>{en ? ' (opens in a new tab)' : '（新标签页打开）'}</span></a></li>)}</ul><p>{c.closing_note}</p></section>
    </div>
  </article>;
}
