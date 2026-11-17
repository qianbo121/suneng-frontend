/* Native links preserve search, filtering and history without JavaScript. */
/* eslint-disable @next/next/no-html-link-for-pages */
import { JsonLd } from '@/components/JsonLd';
import { HiOutlineMagnifyingGlass } from 'react-icons/hi2';
import { getCaseFilterOptions, getCaseResults } from '@/lib/cases/server';
import { caseListHref, hasCaseSearch } from '@/lib/cases/query';
import { CASE_FILTER_KEYS, type CaseQuery } from '@/lib/cases/types';
import { absoluteUrl } from '@/lib/seo/metadata';
import { getBreadcrumbJsonLd } from '@/lib/seo/jsonld';
import { CaseFilterRail, CaseMobileFilter, ActiveCaseFilters } from './CaseCatalogFilters';
import { CaseList } from './CaseList';
import { CaseContactBand } from './CaseContact';
import './cases.css';
import './case-catalog.css';

export function CaseIndexPage({ query }: { query: CaseQuery }) {
  const result = getCaseResults(query);
  const url = absoluteUrl(caseListHref(query));
  const filters = { query, locale: 'zh' as const, options: {
    workpiece: getCaseFilterOptions(query, 'workpiece'), equipment: getCaseFilterOptions(query, 'equipment'),
    process: getCaseFilterOptions(query, 'process'),
  } };
  return (
    <div className="case-page case-index-page case-catalog">
      <header className="case-list-hero case-container">
        <nav className="case-breadcrumb" aria-label="面包屑">
          <a href="/zh">首页</a><span aria-hidden="true">/</span><span aria-current="page">项目案例</span>
        </nav>
        <div className="catalog-heading">
          <div><h1>项目案例</h1><p className="case-hero-description">按工件、炉型和工艺，查找相似项目。</p></div>
          <div className="catalog-tools">
          <form className="catalog-search" action="/zh/case" method="get" role="search">
            {([...CASE_FILTER_KEYS, 'type', 'sort'] as const).map((key) => {
              const value = query[key];
              return value && !(key === 'sort' && value === 'published') ? <input key={key} type="hidden" name={key} value={value} /> : null;
            })}
            <button type="submit" aria-label="搜索案例"><HiOutlineMagnifyingGlass aria-hidden="true" /></button>
            <input type="search" name="q" defaultValue={query.q} aria-label="搜索项目案例" placeholder="搜索工件、炉型或工艺" />
          </form>
          <CaseMobileFilter {...filters} />
          </div>
        </div>
      </header>
      <div className="case-container catalog-layout">
        <CaseFilterRail {...filters} />
        <div className="catalog-main">
          <section aria-labelledby="case-results-heading">
            <CaseList key={caseListHref(query)} initial={result} query={query} selected={<ActiveCaseFilters query={query} locale="zh" />} />
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
                  name: item.listTitle || item.title,
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
