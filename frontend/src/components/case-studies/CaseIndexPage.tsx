/* Native links preserve search, filtering and history without JavaScript. */
/* eslint-disable @next/next/no-html-link-for-pages */
import { JsonLd } from '@/components/JsonLd';
import { HiOutlineAdjustmentsHorizontal, HiOutlineMagnifyingGlass } from 'react-icons/hi2';
import { getCaseFilterOptions, getCaseResults, getPublicCases } from '@/lib/cases/server';
import { caseListHref, hasCaseSearch } from '@/lib/cases/query';
import { CASE_FILTER_KEYS, CASE_TYPE_LABELS, type CaseFilterKey, type CaseQuery } from '@/lib/cases/types';
import { absoluteUrl } from '@/lib/seo/metadata';
import { getBreadcrumbJsonLd } from '@/lib/seo/jsonld';
import { CaseList } from './CaseList';
import { CaseContactBand } from './CaseContact';
import './cases.css';
import './case-catalog.css';

const allLabels = { workpiece: '全部工件', equipment: '全部炉型', process: '全部工艺', need: '全部需求' };

export function CaseIndexPage({ query }: { query: CaseQuery }) {
  const result = getCaseResults(query);
  const url = absoluteUrl(caseListHref(query));
  const types = new Set(getPublicCases().map((item) => item.contentType));
  function choices(key: CaseFilterKey) {
    return (
      <nav className={key === 'workpiece' ? 'catalog-workpieces' : 'catalog-choices'} aria-label={allLabels[key]}>
        {getCaseFilterOptions(query, key).map(({ value, count }) => (
          <a key={value} href={caseListHref(query, { [key]: value, page: 1, from: 1 })}
            aria-current={query[key] === value ? 'page' : undefined}>
            <span>{value || allLabels[key]}</span><small>{count}</small>
          </a>
        ))}
      </nav>
    );
  }
  return (
    <div className="case-page case-index-page case-catalog">
      <header className="case-list-hero case-container">
        <nav className="case-breadcrumb" aria-label="面包屑">
          <a href="/zh">首页</a><span aria-hidden="true">/</span><span aria-current="page">项目案例</span>
        </nav>
        <div className="catalog-heading">
          <div><h1>项目案例</h1><p className="case-hero-description">按工件、炉型和工艺，查找相似项目。</p></div>
          <form className="catalog-search" action="/zh/case" method="get" role="search">
            {([...CASE_FILTER_KEYS, 'type', 'sort'] as const).map((key) => {
              const value = query[key];
              return value && value !== 'relevance' ? <input key={key} type="hidden" name={key} value={value} /> : null;
            })}
            <button type="submit" aria-label="搜索案例"><HiOutlineMagnifyingGlass aria-hidden="true" /></button>
            <input type="search" name="q" defaultValue={query.q} aria-label="搜索项目案例" placeholder="搜索工件、炉型或工艺" />
          </form>
        </div>
      </header>
      <div className="case-container catalog-layout">
        <aside className="catalog-rail" aria-label="案例筛选">
          <h2>按工件查找</h2>
          {choices('workpiece')}
          <div className="catalog-sections">
            <details open={Boolean(query.equipment)}>
              <summary>炉型</summary>{choices('equipment')}
            </details>
            <details open={Boolean(query.process)}>
              <summary>处理工艺</summary>{choices('process')}
            </details>
            <details className="catalog-extra" open={Boolean(query.need || query.type)}>
              <summary aria-label="更多筛选" title="更多筛选"><HiOutlineAdjustmentsHorizontal aria-hidden="true" /></summary>
              <h3>项目需求</h3>{choices('need')}
              {(types.size > 1 || query.type) && <nav className="catalog-choices" aria-label="内容类型">
                <h3>内容类型</h3>
                {(['', ...new Set([...types, ...(query.type ? [query.type] : [])])] as CaseQuery['type'][]).map((type) => (
                  <a key={type} href={caseListHref(query, { type, page: 1, from: 1 })}
                    aria-current={type === query.type ? 'page' : undefined}>{type ? CASE_TYPE_LABELS[type] : '全部内容'}</a>
                ))}
              </nav>}
            </details>
          </div>
          {hasCaseSearch(query) && <a className="catalog-reset" href="/zh/case">重置筛选</a>}
        </aside>
        <div className="catalog-main">
          <section aria-labelledby="case-results-heading">
            <CaseList key={caseListHref(query)} initial={result} query={query} />
          </section>
          <CaseContactBand />
        </div>
      </div>
      <JsonLd
        id="case-list-jsonld"
        data={[
          // Filtered views are excluded from the index, and an empty page is not a
          // collection worth describing; neither should claim to be one.
          ...(hasCaseSearch(query) || result.items.length === 0
            ? []
            : [{
              '@context': 'https://schema.org',
              '@type': 'CollectionPage',
              name: '项目案例',
              url,
              mainEntity: {
                '@type': 'ItemList',
                numberOfItems: result.items.length,
                itemListElement: result.items.map((item, index) => ({
                  '@type': 'ListItem',
                  position: index + 1,
                  url: absoluteUrl(`/zh/case/${item.slug}`),
                  name: item.title,
                })),
              },
            }]),
          getBreadcrumbJsonLd([
            { name: '首页', url: '/zh' },
            { name: '项目案例', url: '/zh/case' },
          ]),
        ]}
      />
    </div>
  );
}
