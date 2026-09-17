import 'server-only';
import fs from 'node:fs';
import path from 'node:path';
import { createHash } from 'node:crypto';
import { cache } from 'react';
import { prepareCaseBody } from './content';
import { PUBLIC_ENGLISH_CASE_SLUGS } from './public-case-allowlist';
import type { CaseMeta, CaseQuery } from './types';
import { CASE_PAGE_SIZE } from './types';

type EnglishCopy = {
  id: string; slug: string; number: number; title: string; summary: string;
  body: string; sourceFingerprint: string; translationStatus: 'complete';
  translatedAt: string; coverAlt: string; coverCaption: string;
};
export function caseSourceFingerprint(metadata: string, markdown: string) {
  return createHash('sha256').update(metadata).update('\0').update(markdown).digest('hex');
}

/** Source publication controls both languages; missing or stale translations fail closed. */
export function readEnglishCases(
  root: string,
  readBody = (filename: string) => prepareCaseBody(fs.readFileSync(filename, 'utf8'), 'en'),
  approved?: ReadonlySet<string>,
) {
  const sourceDir = path.join(root, 'cases');
  const englishDir = path.join(root, 'cases-en');
  if (!fs.existsSync(englishDir)) return [];
  const seen = new Set<string>();
  return fs.readdirSync(sourceDir).filter((file) => /^[a-z0-9-]+\.json$/.test(file)).sort().flatMap((file) => {
    const raw = fs.readFileSync(path.join(sourceDir, file), 'utf8');
    const source = JSON.parse(raw) as CaseMeta;
    // Check visibility before reading either language's body.
    if (source.publicationStatus !== 'published') return [];
    // English pages open only after the owner has approved the English copy too.
    if (approved && !approved.has(source.slug)) return [];
    // Some legacy Chinese filenames differ from their stable case ID.
    // Match translations by that ID, never by the source filename or title.
    if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(source.id)) return [];
    const copyPath = path.join(englishDir, `${source.id}.json`);
    if (!fs.existsSync(copyPath)) return [];
    const copy = JSON.parse(fs.readFileSync(copyPath, 'utf8')) as EnglishCopy;
    if (copy.translationStatus !== 'complete' || copy.id !== source.id || copy.slug !== source.slug) return [];
    if (!/^[a-z0-9-]+\.md$/.test(source.body) || copy.body !== `${source.id}.md`) return [];
    const markdown = fs.readFileSync(path.join(sourceDir, source.body), 'utf8');
    if (copy.sourceFingerprint !== caseSourceFingerprint(raw, markdown)) return [];
    const bodyPath = path.join(englishDir, copy.body);
    if (!fs.existsSync(bodyPath)) return [];
    if (seen.has(copy.slug)) throw new Error(`Duplicate English case: ${copy.slug}`);
    seen.add(copy.slug);
    const body = readBody(bodyPath);
    // Never spread arbitrary translation/source metadata into a public response.
    return [{
      id: source.id, slug: source.slug, title: copy.title, summary: copy.summary,
      contentType: source.contentType, projectStatus: source.projectStatus,
      projectYear: source.projectYear, sourceDate: source.sourceDate,
      datePublished: source.datePublished, dateModified: source.dateModified,
      cover: source.cover ? { src: source.cover.src, fit: source.cover.fit, alt: copy.coverAlt, caption: copy.coverCaption } : undefined,
      relatedCases: source.relatedCases ?? [],
      html: body.html, toc: body.toc,
      searchText: `${copy.title} ${copy.summary} ${body.plainText}`.normalize('NFKC').toLowerCase(),
    }];
  });
}
const developmentBodies = new Map<string, { markdown: string; body: ReturnType<typeof prepareCaseBody> }>();
function readDevelopmentEnglish(root: string) {
  const used = new Set<string>();
  const records = readEnglishCases(root, (filename) => {
    used.add(filename);
    const markdown = fs.readFileSync(filename, 'utf8');
    const previous = developmentBodies.get(filename);
    if (previous?.markdown === markdown) return previous.body;
    const body = prepareCaseBody(markdown, 'en');
    developmentBodies.set(filename, { markdown, body });
    return body;
  }, PUBLIC_ENGLISH_CASE_SLUGS);
  for (const filename of developmentBodies.keys()) if (!used.has(filename)) developmentBodies.delete(filename);
  return records;
}
let productionRecords: ReturnType<typeof readEnglishCases> | undefined;
export const getEnglishCases = cache(() => {
  const root = path.join(process.cwd(), 'content');
  if (process.env.NODE_ENV === 'development') return readDevelopmentEnglish(root);
  if (process.env.NODE_ENV !== 'production') return readEnglishCases(root, undefined, PUBLIC_ENGLISH_CASE_SLUGS);
  return productionRecords ??= readEnglishCases(root, undefined, PUBLIC_ENGLISH_CASE_SLUGS);
});
export function getEnglishCase(slug: string) {
  return getEnglishCases().find((item) => item.slug === slug);
}
export function englishCaseHref(query: CaseQuery, page = query.page) {
  const params = new URLSearchParams();
  if (query.q) params.set('q', query.q);
  if (query.type) params.set('type', query.type);
  if (query.sort !== 'relevance') params.set('sort', query.sort);
  if (page > 1) params.set('page', String(page));
  return `/en/case${params.size ? `?${params}` : ''}`;
}
export function getEnglishCaseResults(query: CaseQuery) {
  const terms = query.q.normalize('NFKC').toLowerCase().split(/\s+/).filter(Boolean);
  const records = getEnglishCases().filter((item) =>
    (!query.type || item.contentType === query.type) && terms.every((term) => item.searchText.includes(term)),
  ).sort((a, b) => {
    if (query.sort === 'year') return (b.projectYear ?? 0) - (a.projectYear ?? 0) || a.id.localeCompare(b.id);
    if (query.sort === 'relevance' && terms.length) {
      const score = (title: string) => terms.filter((term) => title.toLowerCase().includes(term)).length;
      const difference = score(b.title) - score(a.title);
      if (difference) return difference;
    }
    return (b.dateModified ?? '').localeCompare(a.dateModified ?? '') || a.id.localeCompare(b.id);
  });
  return { items: records.slice((query.page - 1) * CASE_PAGE_SIZE, query.page * CASE_PAGE_SIZE), total: records.length, totalPages: Math.ceil(records.length / CASE_PAGE_SIZE) };
}
