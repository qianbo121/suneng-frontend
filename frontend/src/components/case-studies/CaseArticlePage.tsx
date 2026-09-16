import { getEnglishCase } from '@/lib/cases/english';
import type { Metadata } from 'next';
import Link from 'next/link';
import Image from 'next/image';
import { notFound } from 'next/navigation';
import { JsonLd } from '@/components/JsonLd';
import { NewsArticleContent } from '@/components/news/NewsArticleContent';
import { absoluteUrl, buildMetadata } from '@/lib/seo/metadata';
import { getBreadcrumbJsonLd, getOrganizationJsonLd } from '@/lib/seo/jsonld';
import { getCaseArticle, getPublicCases } from '@/lib/cases/server';
import { safeCaseReturn, type SearchParams } from '@/lib/cases/query';
import { CASE_TYPE_LABELS } from '@/lib/cases/types';
import { getCaseBuyerLinks } from '@/lib/buyer-selection-guides';
import buyerGuideStyles from '@/components/products/BuyerSelectionGuide.module.css';
import { CaseMobileContact } from './CaseContact';
import { CaseProductConnections } from './CaseEvidenceLinks';
import {
  AnnealingCaseResources,
  ANNEALING_RESOURCES_ID,
  CASE_RESOURCES_ID,
  caseLinkResource,
} from './AnnealingCaseResources';
import './cases.css';
import './case-c4.css';
import './case-reading.css';

export function caseArticleMetadata(slug: string): Metadata {
  const item = getCaseArticle(slug);
  if (!item) return { title: '未找到案例', robots: { index: false, follow: true } };
  return buildMetadata({
    title: item.title,
    description: item.summary,
    path: `/zh/case/${item.slug}`,
    pageKey: 'case',
    keywords: item.tags,
    type: 'article',
    image: item.cover?.src,
    publishedTime: item.datePublished,
    modifiedTime: item.dateModified,
    alternateLocales: {
      'zh-CN': `/zh/case/${item.slug}`,
      ...(getEnglishCase(slug) ? { 'en-US': `/en/case/${item.slug}` } : {}),
      'x-default': `/zh/case/${item.slug}`,
    },
  });
}

export function CaseArticlePage({
  slug,
  searchParams,
}: {
  slug: string;
  searchParams: SearchParams;
}) {
  const item = getCaseArticle(slug);
  if (!item) notFound();
  const backHref = safeCaseReturn(searchParams.returnTo);
  const buyerLinks = getCaseBuyerLinks(slug);
  const url = absoluteUrl(`/zh/case/${item.slug}`);
  const organization = getOrganizationJsonLd();
  const related = getPublicCases().filter((record) => item.relatedCases?.includes(record.slug));
  const isSupportRoller = slug === 'jining-support-roller-heat-treatment-line';
  const hasCuratedResources = slug === 'henan-annealing-solution-line' || isSupportRoller;
  const resourcesId = hasCuratedResources ? ANNEALING_RESOURCES_ID : CASE_RESOURCES_ID;
  // Move the existing lead into the reading header without rewriting its content.
  const lead = item.html.match(/^(\s*<p>[\s\S]*?<\/p>)([\s\S]*)$/);
  const introHtml = lead?.[1] ?? '';
  const bodyHtml = lead?.[2] ?? item.html;
  const resourceLinks = [
    ...related.map((record) => ({ title: record.title, href: `/zh/case/${record.slug}` })),
    ...(item.relatedLinks ?? []).filter((link) => !link.href.startsWith('/zh/products/detail/')),
    { title: '工业炉与热处理生产线', href: '/zh/products' },
  ];
  const resourceItems = resourceLinks
    .filter((link, index) => resourceLinks.findIndex((other) => other.href === link.href) === index)
    .map(caseLinkResource);
  return (
    <div className="case-page case-detail-page case-c4 case-reading">
      <div className="case-container">
        <nav className="case-breadcrumb" aria-label="面包屑">
          <Link href="/zh">首页</Link>
          <span>/</span>
          <a href={backHref}>项目案例</a>
          <span>/</span>
          <span aria-current="page">{item.title}</span>
        </nav>
        <div className="case-article-layout">
          <article className="case-article">
            <header className="case-article-header" data-has-cover={Boolean(item.cover)}>
              <div className="case-reading-heading">
                <p className="case-c4-article-meta">
                  {[...item.materials.slice(0, 1), ...item.process.slice(0, 2)].join(' · ')}
                </p>
                <h1>{item.title}</h1>
                {(item.author || item.reviewer) && (
                  <p className="case-byline">
                    {item.author && `作者：${item.author}`}
                    {item.reviewer && `　复核：${item.reviewer}`}
                  </p>
                )}
                {introHtml && (
                  <div className="case-reading-intro">
                    <NewsArticleContent html={introHtml} />
                  </div>
                )}
              </div>
              {item.cover && (
                <figure className="case-article-cover">
                  <div className="case-article-image">
                    <Image
                      src={item.cover.src}
                      alt={item.cover.alt}
                      fill
                      priority
                      sizes="(max-width: 767px) 88px, 200px"
                      style={{ objectFit: item.cover.fit || 'contain' }}
                    />
                  </div>
                </figure>
              )}
            </header>
            <div className="case-article-body" id="case-article-content">
              <NewsArticleContent html={bodyHtml} />
              {buyerLinks.length > 0 && (
                <section
                  id="case-buyer-selection"
                  aria-labelledby="case-buyer-selection-title"
                  className={buyerGuideStyles.caseReturn}
                >
                  <h2 id="case-buyer-selection-title">继续判断选型与配套</h2>
                  {buyerLinks.map((link) => (
                    <p key={link.href}>
                      {link.text} <a href={link.href}>{link.label}</a>
                    </p>
                  ))}
                </section>
              )}
              <CaseProductConnections caseId={item.id} locale="zh" />
            </div>
          </article>
        </div>
        <AnnealingCaseResources
          compact
          backHref={backHref}
          caseId={item.id}
          sourceSummary={item.sourceSummary}
          variant={isSupportRoller ? 'support-roller' : 'annealing'}
          sectionId={resourcesId}
          items={hasCuratedResources ? undefined : resourceItems}
          context={
            hasCuratedResources && !(isSupportRoller && item.contentType === 'proposal')
              ? undefined
              : `${item.listTitle || item.title} · ${CASE_TYPE_LABELS[item.contentType]}`
          }
        />
      </div>
      <CaseMobileContact caseId={item.id} />
      <JsonLd
        id="case-article-jsonld"
        data={[
          {
            '@context': 'https://schema.org',
            '@type': 'Article',
            '@id': `${url}#article`,
            headline: item.title,
            description: item.summary,
            url,
            mainEntityOfPage: url,
            inLanguage: 'zh-CN',
            publisher: { '@id': organization['@id'] },
            ...(item.author ? { author: { '@type': 'Person', name: item.author } } : {}),
            ...(item.datePublished ? { datePublished: item.datePublished } : {}),
            ...(item.dateModified ? { dateModified: item.dateModified } : {}),
            ...(item.cover ? { image: absoluteUrl(item.cover.src) } : {}),
          },
          getBreadcrumbJsonLd([
            { name: '首页', url: '/zh' },
            { name: '项目案例', url: '/zh/case' },
            { name: item.title, url },
          ]),
        ]}
      />
    </div>
  );
}
