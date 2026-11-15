import { FASTENER_CASE_SLUG } from '../fastener-case-entry';
import { fastenerCaseSearchContent } from '../fastener-case-search';
import { PUBLIC_ENGLISH_CASE_SLUGS } from '../public-case-allowlist';
import type { CaseSearchContent } from '../search-metadata';
import type { AgreementCase } from './reader';

export function agreementSearchContent(data: AgreementCase): CaseSearchContent {
  const zh = '/zh/case/' + data.slug;
  const en = '/en/case/' + data.slug;
  return {
    title: data.title, description: data.summary, seoTitle: data.seoTitle,
    seoDescription: data.seoDescription, datePublished: data.datePublished, dateModified: data.dateModified,
    path: data.locale === 'en' ? en : zh, locale: data.locale === 'en' ? 'en' : 'zh',
    image: data.slug === FASTENER_CASE_SLUG ? fastenerCaseSearchContent.image : '/case-media/' + data.slug + '/cover.webp',
    imageAlt: data.heroAlt, questions: data.faq,
    languages: { 'zh-CN': zh, ...(PUBLIC_ENGLISH_CASE_SLUGS.has(data.slug) ? { 'en-US': en } : {}), 'x-default': zh },
  };
}
