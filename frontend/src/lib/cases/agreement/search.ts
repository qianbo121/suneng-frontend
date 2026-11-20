import { getVerifiedPublicationDay, getVerifiedSitemapLastModified } from '@/lib/seo/verified-sitemap-revisions';
import { PUBLIC_ENGLISH_CASE_SLUGS } from '../public-case-allowlist';
import type { CaseSearchContent } from '../search-metadata';
import type { AgreementCase } from './reader';

export function agreementSearchContent(data: AgreementCase): CaseSearchContent {
  const zh = '/zh/case/' + data.slug;
  const en = '/en/case/' + data.slug;
  const path = data.locale === 'en' ? en : zh;
  return {
    title: data.title, description: data.summary, seoTitle: data.seoTitle,
    seoDescription: data.seoDescription,
    datePublished: data.datePublished ?? getVerifiedPublicationDay(path),
    dateModified: getVerifiedSitemapLastModified(path) ?? data.dateModified,
    path, locale: data.locale === 'en' ? 'en' : 'zh',
    image: data.heroImage,
    imageAlt: data.heroAlt, questions: data.faq,
    languages: { 'zh-CN': zh, ...(PUBLIC_ENGLISH_CASE_SLUGS.has(data.slug) ? { 'en-US': en } : {}), 'x-default': zh },
  };
}
