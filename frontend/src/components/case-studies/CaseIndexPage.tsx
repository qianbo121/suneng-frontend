/* Native links intentionally retain document navigation for GET filters and history restoration. */
/* eslint-disable @next/next/no-html-link-for-pages */
import { JsonLd } from '@/components/JsonLd';
import { HiOutlineArrowPath, HiOutlineMagnifyingGlass } from 'react-icons/hi2';
import { getCaseOptions, getCaseResults, getPublicCases } from '@/lib/cases/server';
import { caseListHref } from '@/lib/cases/query';
import { CASE_TYPE_LABELS, type CaseFilterKey, type CaseQuery } from '@/lib/cases/types';
import { absoluteUrl } from '@/lib/seo/metadata';
import { getBreadcrumbJsonLd } from '@/lib/seo/jsonld';
import { CaseList, CaseSelectSubmit } from './CaseList';
import { CaseFilterSelect } from './CaseFilterSelect';
import { CaseContactBand, CaseMobileContact } from './CaseContact';
import './cases.css';
import './case-c4.css';

const labels = {
  workpiece: '工件类型',
  process: '处理工艺',
  equipment: '设备类型',
  need: '项目需求',
};
const commonEquipment = ['台车炉', '网带炉', '箱式炉', '井式炉'];
export function CaseIndexPage({ query }: { query: CaseQuery }) {
  const result = getCaseResults(query);
  const options = getCaseOptions();
  // While only a few reviewed cases are public, offer shortcuts that can return results.
  const equipmentShortcuts = commonEquipment.filter(
    (equipment) => options.equipment.includes(equipment) || query.equipment === equipment,
  );
  const contentTypes = new Set(getPublicCases().map((item) => item.contentType));
  const showTypeFilter = contentTypes.size > 1 || Boolean(query.type);
  const url = absoluteUrl(caseListHref(query));
  function renderFilter(key: CaseFilterKey) {
    return (
      <CaseFilterSelect
        key={key}
        name={key}
        label={labels[key]}
        value={query[key]}
        options={[
          { value: '', label: labels[key] },
          ...(query[key] && !options[key].includes(query[key])
            ? [{ value: query[key], label: query[key] }]
            : []),
          ...options[key].map((value) => ({ value, label: value })),
        ]}
      />
    );
  }
  return (
    <div className="case-page case-index-page case-c4">
      <header className="case-list-hero">
        <div className="case-container">
          <nav className="case-breadcrumb" aria-label="面包屑">
            <a href="/zh">首页</a>
            <span aria-hidden="true">/</span>
            <span aria-current="page">项目案例</span>
          </nav>
          <div className="case-page-heading case-c4-heading">
            <div>
              <h1>项目案例</h1>
              <p className="case-hero-description">按工件、炉型和工艺，查找相似项目。</p>
            </div>
            <div className="case-c4-search" role="search">
              <input
                type="search"
                name="q"
                form="case-search-form"
                defaultValue={query.q}
                aria-label="搜索项目案例"
                placeholder="搜索工件、炉型或问题，如：铝管…"
                autoComplete="off"
              />
              <button type="submit" form="case-search-form" aria-label="搜索案例">
                <HiOutlineMagnifyingGlass aria-hidden="true" />
              </button>
            </div>
          </div>
          <form
            id="case-search-form"
            action="/zh/case"
            method="get"
            className="case-c4-filters"
            aria-label="案例筛选"
          >
            <input type="hidden" name="sort" value={query.sort} />
            <div className="case-c4-equipment-row">
              <span className="case-c4-filter-label">炉型</span>
              <nav className="case-c4-equipment" aria-label="常用炉型">
                {['', ...equipmentShortcuts].map((equipment) => (
                  <a
                    key={equipment}
                    href={caseListHref(query, { equipment, page: 1, from: 1 })}
                    aria-current={query.equipment === equipment ? 'page' : undefined}
                  >
                    {equipment || '全部炉型'}
                  </a>
                ))}
              </nav>
              <div className="case-c4-more-equipment">
                <CaseFilterSelect
                  name="equipment"
                  label="更多炉型"
                  value={query.equipment}
                  options={[
                    { value: '', label: '更多炉型' },
                    ...(query.equipment && !options.equipment.includes(query.equipment)
                      ? [{ value: query.equipment, label: query.equipment }]
                      : []),
                    ...options.equipment.map((value) => ({ value, label: value })),
                  ]}
                />
              </div>
            </div>
            <div className="case-c4-filter-row">
              {(['workpiece', 'process'] as const).map((key) => renderFilter(key))}
              <details className="case-c4-more-filters" open={Boolean(query.need || query.type)}>
                <summary>更多筛选</summary>
                <div className="case-c4-extra-filters">
                  {renderFilter('need')}
                  {showTypeFilter && (
                    <CaseFilterSelect
                      name="type"
                      label="内容类型"
                      value={query.type}
                      options={[
                        { value: '', label: '全部内容' },
                        { value: 'experience', label: CASE_TYPE_LABELS.experience },
                        { value: 'proposal', label: CASE_TYPE_LABELS.proposal },
                      ]}
                    />
                  )}
                </div>
              </details>
              <a href="/zh/case" className="case-c4-reset">
                <HiOutlineArrowPath aria-hidden="true" />
                重置
              </a>
              <p className="case-result-count" aria-live="polite">
                共 {result.total} 篇资料
              </p>
            </div>
            <noscript>
              <button className="case-button case-button-outline" type="submit">
                应用筛选
              </button>
            </noscript>
          </form>
        </div>
        <CaseSelectSubmit />
      </header>
      <div className="case-container case-list-content">
        <section className="case-results" aria-labelledby="case-results-heading">
          <CaseList key={caseListHref(query)} initial={result} query={query} />
        </section>
        <CaseContactBand />
      </div>
      <CaseMobileContact />
      <JsonLd
        id="case-list-jsonld"
        data={[
          {
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
          },
          getBreadcrumbJsonLd([
            { name: '首页', url: '/zh' },
            { name: '项目案例', url: '/zh/case' },
          ]),
        ]}
      />
    </div>
  );
}
