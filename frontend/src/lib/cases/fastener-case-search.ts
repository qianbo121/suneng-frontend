import { getVerifiedSitemapLastModified } from '@/lib/seo/verified-sitemap-revisions';
import { chineseCaseIntro } from './chinese-intros';
import { caseCatalogCover } from './catalog-entry';
import { FASTENER_CASE_PATH, FASTENER_CASE_TITLE } from './fastener-case-entry';
import { FASTENER_CASE_DESCRIPTION, FASTENER_CASE_QUESTIONS } from './fastener-case-content';
import { PUBLIC_ENGLISH_CASE_SLUGS } from './public-case-allowlist';
import type { CaseSearchContent } from './search-metadata';
import record from '../../../content/cases/fastener-mesh-belt-quenching-carburizing.json';

const intro = chineseCaseIntro(record.slug);
const cover = caseCatalogCover(record.slug, 'zh') ?? record.cover;

export const fastenerCaseSearchContent = {
  title: intro?.title ?? FASTENER_CASE_TITLE, description: intro?.summary ?? FASTENER_CASE_DESCRIPTION,
  path: FASTENER_CASE_PATH, locale: 'zh',
  datePublished: record.datePublished,
  dateModified: getVerifiedSitemapLastModified(FASTENER_CASE_PATH),
  image: cover.src, imageAlt: cover.alt,
  languages: { 'zh-CN': FASTENER_CASE_PATH, ...(PUBLIC_ENGLISH_CASE_SLUGS.has(record.slug) ? { 'en-US': '/en/case/' + record.slug } : {}), 'x-default': FASTENER_CASE_PATH },
  questions: FASTENER_CASE_QUESTIONS,
} satisfies CaseSearchContent;
