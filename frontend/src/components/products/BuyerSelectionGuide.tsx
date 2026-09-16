import { TECHNICAL_CONTENT_PUBLISHED } from '@/lib/publication-scope';
import { buyerSelectionGuides } from '@/lib/buyer-selection-guides';
import { buyerSelectionCopyEn } from '@/lib/buyer-selection-guides-en';
import { getEnglishCase } from '@/lib/cases/english';
import { getCaseArticle } from '@/lib/cases/server';
import { localizeOrHideHref } from '@/lib/i18n/zh-only';
import type { Locale } from '@/types/site';
import styles from './BuyerSelectionGuide.module.css';

export function BuyerSelectionGuide({ guideKey, locale = 'zh' }: { guideKey: string; locale?: Locale }) {
  if (!TECHNICAL_CONTENT_PUBLISHED) return null;
  const source = buyerSelectionGuides[guideKey];
  if (!source) return null;
  const en = locale === 'en';
  const copy = en ? buyerSelectionCopyEn[guideKey] : undefined;
  const guide = copy ? { ...source, ...copy, points: source.points.map((point, index) => ({ ...point, ...copy.points[index] })) } : source;
  return (
    <section id={guide.id} className={styles.guide} aria-labelledby={`${guide.id}-title`} data-buyer-guide={guideKey}>
      <h2 id={`${guide.id}-title`}>{guide.title}</h2>
      <p className={styles.answer}>{guide.answer}</p>
      <div className={styles.tableScroll} tabIndex={0} role="region" aria-label={en ? 'Compare options; scroll horizontally' : `${guide.title}选项比较，可横向滚动`}>
        <table>
          <caption>{en ? 'Compare operating conditions before choosing a configuration' : '先比较适用条件，再确定配置'}</caption>
          <thead><tr><th scope="col">{en ? 'Option' : '可评估的选项'}</th><th scope="col">{en ? 'Suitable conditions' : '适用条件'}</th><th scope="col">{en ? 'Confirm before purchase' : '采购前需确认'}</th></tr></thead>
          <tbody>{guide.options.map((option) => <tr key={option.name}><th scope="row">{option.name}</th><td>{option.when}</td><td>{option.confirm}</td></tr>)}</tbody>
        </table>
      </div>
      {guide.points.map((point) => (
        <div className={styles.point} key={point.title}>
          <h3>{point.title}</h3>
          <p>{point.text}</p>
          <ul className={styles.links}>{point.cases.flatMap((item) => {
            const record = en ? getEnglishCase(item.slug) : getCaseArticle(item.slug);
            return record ? [<li key={item.slug}><a href={`/${locale}/case/${item.slug}`}>{en ? record.title : item.label}</a></li>] : [];
          })}</ul>
        </div>
      ))}
      <div className={styles.point}>
        <h3>{en ? 'Next step: prepare these inputs' : '采购下一步：准备这些资料'}</h3>
        <ol>{guide.next.map((item) => <li key={item}>{item}</li>)}</ol>
      </div>
      <aside className={styles.limits} aria-label={en ? 'Evidence limits' : '当前资料支持范围'}><strong>{en ? 'What these records do not establish' : '当前资料不能支持的结论'}</strong><p>{guide.limits}</p></aside>
      {!en && <ul className={styles.links}>{guide.related.map((item) => <li key={item.href}><a href={item.href}>{item.label}</a></li>)}</ul>}
      {en && <ul className={styles.links}>{guide.related.flatMap((item) => {
        const href = localizeOrHideHref(item.href, locale);
        const labels: Record<string, string> = { 'pit-furnace': 'Pit furnaces: loading and atmosphere conditions', 'bell-furnace': 'Bell furnaces: bases, lifting and cooling', 'shovel-furnace': 'Fork-handling furnaces: support and interlocks', 'trolley-furnace': 'Bogie-hearth furnaces: batch handling and loading', 'furnace-renovation-overhaul': 'Furnace renovation: diagnosis and supply scope' };
        const label = labels[item.href.split('/').at(-1) ?? ''];
        return href && label ? [<li key={href}><a href={href}>{label}</a></li>] : [];
      })}</ul>}
    </section>
  );
}
