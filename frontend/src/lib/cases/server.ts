import 'server-only';
import fs from 'node:fs';
import path from 'node:path';
import { cache } from 'react';
import { prepareCaseBody } from './content';
import { caseEquipmentCategory, filterCases, paginateCases, toCaseCard } from './query';
import { CASE_FILTER_KEYS, type CaseMeta, type CaseQuery } from './types';

const contentDirectory = path.join(process.cwd(), 'content/cases');
const slugPattern = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

export function readCaseDirectory(
  directory: string,
  readBody = (filename: string) => prepareCaseBody(fs.readFileSync(filename, 'utf8')),
) {
  const ids = new Set<string>();
  const slugs = new Set<string>();
  return fs
    .readdirSync(directory)
    .filter((file) => file.endsWith('.json'))
    .sort()
    .flatMap((file) => {
      const raw = JSON.parse(fs.readFileSync(path.join(directory, file), 'utf8')) as CaseMeta;
      // Drafts are rejected before their body is read, rendered, indexed or serialized.
      if (raw.publicationStatus !== 'published') return [];
      if (
        !slugPattern.test(raw.slug) ||
        !raw.id ||
        !raw.title ||
        !raw.summary ||
        !/^[a-z0-9-]+\.md$/.test(raw.body)
      )
        throw new Error(`案例资料格式错误：${file}`);
      if (ids.has(raw.id) || slugs.has(raw.slug)) throw new Error(`案例编号或地址重复：${file}`);
      ids.add(raw.id);
      slugs.add(raw.slug);
      if (
        !['experience', 'proposal'].includes(raw.contentType) ||
        (raw.contentType === 'proposal' && raw.projectStatus !== 'proposal')
      )
        throw new Error(`方案记录的项目状态错误：${file}`);
      for (const key of [...CASE_FILTER_KEYS, 'materials', 'tags', 'facts'] as const)
        if (!Array.isArray(raw[key])) throw new Error(`案例分类或参数缺失：${file}`);
      if (raw.facts.length < 2 || raw.facts.length > 3)
        throw new Error(`案例摘要需要 2–3 个关键参数：${file}`);
      for (const date of [raw.sourceDate, raw.datePublished, raw.dateModified])
        if (date && !Number.isFinite(Date.parse(date))) throw new Error(`案例日期无效：${file}`);
      // Explicit public field projection: arbitrary internal properties never reach the search or client.
      const meta: CaseMeta = {
        id: raw.id,
        slug: raw.slug,
        title: raw.title,
        summary: raw.summary,
        body: raw.body,
        contentType: raw.contentType,
        publicationStatus: 'published',
        projectStatus: raw.projectStatus,
        workpiece: raw.workpiece,
        materials: raw.materials,
        process: raw.process,
        equipment: raw.equipment,
        need: raw.need,
        tags: raw.tags,
        publicCustomerName: raw.publicCustomerName,
        projectYear: raw.projectYear,
        sourceDate: raw.sourceDate,
        datePublished: raw.datePublished,
        dateModified: raw.dateModified,
        facts: raw.facts.map(({ label, value, unit, condition, attribute }) => ({
          label,
          value,
          unit,
          condition,
          attribute,
        })),
        participation: raw.participation,
        sourceSummary: raw.sourceSummary,
        coverTitle: raw.coverTitle,
        listTitle: raw.listTitle,
        listSummary: raw.listSummary,
        cover: raw.cover
          ? {
              src: raw.cover.src,
              alt: raw.cover.alt,
              caption: raw.cover.caption,
              fit: raw.cover.fit,
            }
          : undefined,
        author: raw.author,
        reviewer: raw.reviewer,
        relatedCases: raw.relatedCases,
        relatedLinks: raw.relatedLinks
          ?.filter(({ href }) => /^\/zh\//.test(href))
          .map(({ title, href }) => ({ title, href })),
      };
      const body = readBody(path.join(directory, meta.body));
      const searchText = [
        meta.title,
        meta.listTitle,
        meta.summary,
        meta.listSummary,
        meta.publicCustomerName,
        ...meta.workpiece,
        ...meta.materials,
        ...meta.process,
        ...meta.equipment,
        ...meta.need,
        ...meta.tags,
        ...meta.facts.flatMap((fact) => [
          fact.label,
          fact.value,
          fact.unit ?? '',
          fact.condition ?? '',
        ]),
        body.plainText,
      ]
        .filter(Boolean)
        .join(' ');
      return [{ ...meta, html: body.html, toc: body.toc, searchText }];
    });
}
// Re-read metadata and Markdown on every dev request so edits and withdrawals
// take effect immediately. Only reuse the sanitized strings/TOC for an unchanged
// body; never retain DOM nodes or accumulate previous versions of a file.
export function createCaseDirectoryReader(directory: string) {
  const bodies = new Map<string, { markdown: string; body: ReturnType<typeof prepareCaseBody> }>();
  return () => {
    const used = new Set<string>();
    const records = readCaseDirectory(directory, (filename) => {
      used.add(filename);
      const markdown = fs.readFileSync(filename, 'utf8');
      const previous = bodies.get(filename);
      if (previous?.markdown === markdown) return previous.body;
      const body = prepareCaseBody(markdown);
      bodies.set(filename, { markdown, body });
      return body;
    });
    for (const filename of bodies.keys()) {
      if (!used.has(filename)) bodies.delete(filename);
    }
    return records;
  };
}

const readDevelopmentCases = createCaseDirectoryReader(contentDirectory);
// Published case files are bundled into each immutable release. React cache()
// deduplicates a render, but does not share the parsed corpus between requests.
// Keep the sanitized strings once per production process; a new deployment
// starts a fresh process. Development still reads edits immediately.
let productionCases: ReturnType<typeof readCaseDirectory> | undefined;
export const getPublicCases = cache(() => {
  if (process.env.NODE_ENV === 'development') return readDevelopmentCases();
  if (process.env.NODE_ENV !== 'production') return readCaseDirectory(contentDirectory);
  return (productionCases ??= readCaseDirectory(contentDirectory));
});

export function getCaseArticle(slug: string) {
  return getPublicCases().find((item) => item.slug === slug);
}
export function getCaseResults(query: CaseQuery) {
  return paginateCases(filterCases(getPublicCases(), query).map(toCaseCard), query);
}
export function getCaseOptions() {
  const records = getPublicCases();
  return Object.fromEntries(
    CASE_FILTER_KEYS.map((key) => [
      key,
      [...new Set(records.flatMap((item) => item[key].map((value) =>
        key === 'equipment' ? caseEquipmentCategory(value) : value)))].sort((a, b) =>
        a.localeCompare(b, 'zh-CN'),
      ),
    ]),
  ) as Record<(typeof CASE_FILTER_KEYS)[number], string[]>;
}
