/* Native GET links preserve search state without requiring JavaScript. */
/* eslint-disable @next/next/no-html-link-for-pages */
import Image from 'next/image';
import { notFound } from 'next/navigation';
import { JsonLd } from '@/components/JsonLd';
import { NewsArticleContent } from '@/components/news/NewsArticleContent';
import { ListPagination } from '@/components/ui/ListPagination';
import { getEnglishCase, getEnglishCases, getEnglishCaseResults, englishCaseHref } from '@/lib/cases/english';
import { parseCaseQuery, type SearchParams } from '@/lib/cases/query';
import type { CaseQuery } from '@/lib/cases/types';
import { absoluteUrl, buildMetadata } from '@/lib/seo/metadata';
import { getBreadcrumbJsonLd, getOrganizationJsonLd } from '@/lib/seo/jsonld';
import { CaseToc } from './CaseToc';
import { CaseCoverCaption } from './CaseCoverCaption';
import { CaseProductConnections } from './CaseEvidenceLinks';
import { getEnglishCaseBuyerLinks } from '@/lib/cases/buyer-links-en';
import buyerGuideStyles from '@/components/products/BuyerSelectionGuide.module.css';
import './cases.css';
import './cases-en.css';

const labels = { proposal: 'Historical proposal', experience: 'Project experience' };
export function englishCaseMetadata(slug: string) {
  const item = getEnglishCase(slug);
  if (!item) notFound();
  return buildMetadata({
    title: item.title, description: item.summary, path: `/en/case/${slug}`, locale: 'en',
    type: 'article', image: item.cover?.src, publishedTime: item.datePublished, modifiedTime: item.dateModified,
    alternateLocales: { 'zh-CN': `/zh/case/${slug}`, 'en-US': `/en/case/${slug}`, 'x-default': `/zh/case/${slug}` },
  });
}
function backLink(value: SearchParams['returnTo']) {
  if (typeof value !== 'string' || value.length > 1800) return '/en/case';
  try {
    const url = new URL(value, 'https://case.local');
    return url.origin === 'https://case.local' && url.pathname === '/en/case'
      ? englishCaseHref(parseCaseQuery(url.searchParams)) : '/en/case';
  } catch { return '/en/case'; }
}
const formatDate = (value: string) => new Intl.DateTimeFormat('en-GB', {
  day: 'numeric', month: 'long', year: 'numeric', timeZone: 'UTC',
}).format(new Date(value));

export function EnglishCaseArticle({ slug, searchParams }: { slug: string; searchParams: SearchParams }) {
  const item = getEnglishCase(slug);
  if (!item) notFound();
  const back = backLink(searchParams.returnTo);
  const url = absoluteUrl(`/en/case/${slug}`);
  const related = getEnglishCases().filter((record) => item.relatedCases.includes(record.slug));
  const buyerLinks = getEnglishCaseBuyerLinks(slug);
  const toc = [...item.toc, ...(buyerLinks.length ? [{ id: 'case-buyer-selection', title: 'Compare selection and supporting requirements' }] : []), { id: 'case-product-connections', title: 'Equipment and engineering entries' }];
  return <div className="case-page case-detail-page case-english" lang="en">
    <div className="case-container">
      <nav className="case-breadcrumb" aria-label="Breadcrumb"><a href="/en">Home</a><span>/</span><a href={back}>Case studies</a><span>/</span><span aria-current="page">{item.title}</span></nav>
      <div className="case-article-layout">
        <article className="case-article">
          <header className="case-article-header">
            <p className="case-article-kind">{labels[item.contentType]}</p><h1>{item.title}</h1>
            <div className="case-article-dates">
              {item.sourceDate && <span>Source date: <time dateTime={item.sourceDate}>{formatDate(item.sourceDate)}</time></span>}
              {item.datePublished && <span>Published: <time dateTime={item.datePublished}>{formatDate(item.datePublished)}</time></span>}
              {item.dateModified && <span>Source updated: <time dateTime={item.dateModified}>{formatDate(item.dateModified)}</time></span>}
              <span>Source: Jiangsu Suneng Industrial Furnace Co., Ltd.</span>
            </div>
          </header>
          {item.cover && <figure className="case-article-cover"><div className="case-article-image"><Image src={item.cover.src} alt={item.cover.alt} fill sizes="(min-width: 1024px) 900px, 100vw" style={{ objectFit: item.cover.fit || 'contain' }} priority /></div><CaseCoverCaption caption={item.cover.caption} /></figure>}
          <aside aria-label="Evidence scope" className="case-article-source">
            <p>Record type: {labels[item.contentType]}</p>
            <p>{item.contentType === 'proposal' ? 'This historical technical proposal records design or agreed conditions. It does not establish delivery, actual output or acceptance results.' : 'This project experience record does not establish undisclosed performance, economic benefits or acceptance results.'}</p>
          </aside>
          <div className="case-article-body"><NewsArticleContent html={item.html} />
            {buyerLinks.length > 0 && <section id="case-buyer-selection" className={buyerGuideStyles.caseReturn} aria-labelledby="case-buyer-selection-title"><h2 id="case-buyer-selection-title">Compare selection and supporting requirements</h2>{buyerLinks.map((link) => <p key={link.href}>{link.text} <a href={link.href}>{link.label}</a></p>)}</section>}
            <CaseProductConnections caseId={item.id} locale="en" />
          </div>
        </article>
        <CaseToc items={toc} caseId={item.id} showContact={false} locale="en" />
      </div>
      <section className="case-english-resources" aria-labelledby="english-related"><h2 id="english-related">Continue your selection</h2>
        {related.map((record) => <p key={record.id}><a href={`/en/case/${record.slug}`}>{record.title}</a></p>)}
        <p><a href="/en/products">Explore industrial furnaces and heat-treatment lines</a></p>
        <p><a href="/en/contact">Discuss your workpiece, process and supply requirements</a></p>
        <p><a href={back}>← Back to case studies</a></p>
      </section>
    </div>
    <JsonLd id="case-article-jsonld" data={[
      { '@context': 'https://schema.org', '@type': 'Article', '@id': `${url}#article`, headline: item.title, description: item.summary, url, mainEntityOfPage: url, inLanguage: 'en-US', publisher: { '@id': getOrganizationJsonLd()['@id'] }, ...(item.datePublished ? { datePublished: item.datePublished } : {}), ...(item.dateModified ? { dateModified: item.dateModified } : {}), ...(item.cover ? { image: absoluteUrl(item.cover.src) } : {}) },
      getBreadcrumbJsonLd([{ name: 'Home', url: '/en' }, { name: 'Case studies', url: '/en/case' }, { name: item.title, url }]),
    ]} />
  </div>;
}

export function EnglishCaseIndex({ query }: { query: CaseQuery }) {
  const result = getEnglishCaseResults(query);
  const returnTo = englishCaseHref(query);
  return <div className="case-page case-index-page case-english" lang="en">
    <header className="case-list-hero"><div className="case-container">
      <nav className="case-breadcrumb" aria-label="Breadcrumb"><a href="/en">Home</a><span>/</span><span aria-current="page">Case studies</span></nav>
      <div className="case-page-heading"><h1>Case studies</h1><p className="case-hero-description">Find comparable workpieces, furnace arrangements and renovation requirements. Review the conditions, equipment scope and evidence behind each record.</p></div>
      <form action="/en/case" method="get" className="case-search-panel case-english-search" aria-label="Search case studies">
        <label>Search by title, workpiece or furnace<input type="search" name="q" defaultValue={query.q} placeholder="e.g. bogie-hearth furnace" /></label>
        <label>Record type<select name="type" defaultValue={query.type}><option value="">All records</option><option value="proposal">Historical proposals</option><option value="experience">Project experience</option></select></label>
        <label>Sort by<select name="sort" defaultValue={query.sort}><option value="relevance">Relevance</option><option value="updated">Source update</option><option value="year">Project year</option></select></label>
        <button className="case-button case-button-primary" type="submit">Search</button><a href="/en/case">Reset</a>
      </form>
    </div></header>
    <div className="case-container case-list-content"><section className="case-results" aria-labelledby="case-results-heading">
      <div className="case-results-top"><h2 id="case-results-heading">Project records</h2><p>{result.total} {result.total === 1 ? 'record' : 'records'} found</p></div>
      <div className="case-records">{result.items.map((item, index) => <article className="case-record" key={item.id} data-case-id={item.id}>
        <a className="case-record-content" href={`/en/case/${item.slug}?returnTo=${encodeURIComponent(returnTo)}`}>
          <figure className="case-record-cover"><div className="case-record-image">{item.cover ? <Image src={item.cover.src} alt={item.cover.alt} width={480} height={280} priority={index === 0} sizes="(max-width: 767px) calc(100vw - 36px), (max-width: 999px) 200px, (max-width: 1279px) 240px, 280px" style={{ objectFit: item.cover.fit ?? 'contain' }} /> : <div className="case-text-cover"><span>{item.title}</span><strong>{labels[item.contentType]}</strong></div>}</div></figure>
          <div className="case-record-copy"><h3>{item.title}</h3><p className="case-record-summary">{item.summary}</p><span className="case-record-cta">{item.contentType === 'proposal' ? 'View Proposal' : 'View Case'} <span aria-hidden="true">{'>>'}</span></span></div>
        </a>
      </article>)}</div>
      {!result.items.length && <div className="case-empty"><h3>{result.total ? 'No records on this page' : 'No matching records'}</h3><p>Try a shorter phrase or fewer conditions.</p><a href="/en/case">View all records</a></div>}
      <div className="case-pagination"><ListPagination locale="en" page={query.page} pageCount={result.totalPages} href={(page) => englishCaseHref(query, page)} ariaLabel="Case study pages" /></div>
    </section></div>
    <JsonLd id="case-list-jsonld" data={{ '@context': 'https://schema.org', '@type': 'CollectionPage', name: 'Case studies', inLanguage: 'en-US', url: absoluteUrl(returnTo), mainEntity: { '@type': 'ItemList', numberOfItems: result.items.length, itemListElement: result.items.map((item, index) => ({ '@type': 'ListItem', position: index + 1, url: absoluteUrl(`/en/case/${item.slug}`), name: item.title })) } }} />
  </div>;
}
