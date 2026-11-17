/* Native links keep every filter usable with JavaScript disabled. */
import { HiOutlineAdjustmentsHorizontal } from 'react-icons/hi2';
import { caseListHref } from '@/lib/cases/query';
import { homeWorkpieceCategories } from '@/lib/cases/facets';
import { homeWorkpieceCategoryNamesEn } from '@/lib/home-workpieces-localized';
import { CASE_TYPE_LABELS, type CaseQuery } from '@/lib/cases/types';
import './case-filters.css';

type Locale = 'zh' | 'en';
type FilterKey = 'workpiece' | 'equipment' | 'process';
type Option = { value: string; count: number };
type FilterProps = { query: CaseQuery; locale: Locale; options: Record<FilterKey, Option[]> };
const englishLabels: Record<string, string> = {
  ...Object.fromEntries(homeWorkpieceCategories.map(({ id, label }) => [label, homeWorkpieceCategoryNamesEn[id]])),
  网带炉: 'Mesh-belt furnace', 连续退火固溶线: 'Continuous annealing and solution line',
  铝合金固溶时效线: 'Aluminum solution and aging line',
  淬火: 'Quenching', 渗碳: 'Carburizing', 回火: 'Tempering', 退火: 'Annealing',
  固溶: 'Solution treatment', 时效: 'Aging', 调质: 'Quenching and tempering', 正火: 'Normalizing',
  '曲轴淬火+回火': 'Crankshaft quenching and tempering', 硝盐等温淬火整线: 'Salt-bath austempering',
  '保护气氛淬火+回火': 'Protective-atmosphere quenching and tempering',
  '油淬+回火整线': 'Oil quenching and tempering', '光亮淬火+回火': 'Bright quenching and tempering',
  淬火调质: 'Quench and temper treatment',
};
const text = {
  zh: { title: '按工件查找', filter: '筛选', more: '更多筛选', workpiece: '全部案例', equipment: '全部炉型', process: '全部工艺' },
  en: { title: 'Browse by workpiece', filter: 'Filters', more: 'More filters', workpiece: 'All cases', equipment: 'All furnace types', process: 'All processes' },
};
function label(locale: Locale, value: string) {
  return locale === 'zh' ? value : englishLabels[value] ?? value;
}
function href(query: CaseQuery, changes: Partial<CaseQuery>, locale: Locale) {
  return caseListHref(query, { ...changes, page: 1, from: 1 }).replace('/zh/case', '/' + locale + '/case');
}

function FilterFields({ locale, query, options }: FilterProps) {
  const words = text[locale];
  function links(key: FilterKey) {
    return options[key].map(({ value, count }) => (
      <a key={value} rel="nofollow" href={href(query, { [key]: value }, locale)}
        aria-current={query[key] === value ? 'page' : undefined}>
        <span>{value ? label(locale, value) : words[key]}</span><small>{count}</small>
      </a>
    ));
  }
  return <>
    <h2>{words.title}</h2>
    <nav className="catalog-workpieces" aria-label={words.title}>{links('workpiece')}</nav>
    <div className="catalog-more">
      <h3>{words.more}</h3>
      {(['equipment', 'process'] as const).map((key) => (
        <details key={key} className="catalog-pick">
          <summary aria-label={words[key] + (query[key] ? ' · ' + label(locale, query[key]) : '')}>
            {query[key] ? label(locale, query[key]) : words[key]}
          </summary>
          <nav aria-label={words[key]}>{links(key)}</nav>
        </details>
      ))}
    </div>
  </>;
}

export function CaseFilterRail(props: FilterProps) {
  return <aside className="catalog-rail" aria-label={text[props.locale].filter}><FilterFields {...props} /></aside>;
}
export function CaseMobileFilter(props: FilterProps) {
  return <details className="catalog-mobile-filter">
    <summary><HiOutlineAdjustmentsHorizontal aria-hidden="true" />{text[props.locale].filter}</summary>
    <div className="catalog-filter-panel"><FilterFields {...props} /></div>
  </details>;
}

export function ActiveCaseFilters({ query, locale }: Pick<FilterProps, 'query' | 'locale'>) {
  const keys = (['workpiece', 'equipment', 'process', 'need', 'type', 'q'] as const).filter(key => query[key]);
  if (!keys.length) return null;
  const zh = locale === 'zh';
  return <div className="catalog-active"><span>{zh ? '已选' : 'Selected'}</span>
    {keys.map((key) => {
      const value = query[key];
      const name = key === 'type' && query.type
        ? (zh ? CASE_TYPE_LABELS[query.type] : query.type === 'proposal' ? 'Historical proposal' : 'Project experience')
        : key === 'q' ? value : label(locale, value);
      return <a key={key} href={href(query, { [key]: '' }, locale)} rel="nofollow"
        aria-label={zh ? '移除筛选：' + name : 'Remove filter: ' + name}>{name}</a>;
    })}
    <a className="catalog-clear" href={href(query, { workpiece: '', equipment: '', process: '', need: '', type: '', q: '' }, locale)}>
      {zh ? '清除' : 'Clear'}
    </a>
  </div>;
}
