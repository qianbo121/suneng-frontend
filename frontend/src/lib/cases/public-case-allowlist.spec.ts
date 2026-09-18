import fs from 'node:fs';
import path from 'node:path';
import { describe, expect, it, vi } from 'vitest';
vi.mock('server-only', () => ({}));
vi.mock('react', async (original) => ({ ...(await original<typeof import('react')>()), cache: (fn: unknown) => fn }));
import { readEnglishCases } from './english';
import englishSlugs from './english-slugs.json';
import { PUBLIC_CASE_SLUGS, PUBLIC_ENGLISH_CASE_SLUGS, REVIEWED_PUBLIC_CASES } from './public-case-allowlist';

const content = path.join(process.cwd(), 'content');
const sources = fs
  .readdirSync(path.join(content, 'cases'))
  .filter((file) => file.endsWith('.json'))
  .map((file) => JSON.parse(fs.readFileSync(path.join(content, 'cases', file), 'utf8')) as {
    id: string; slug: string; publicationStatus: string;
  });
const sorted = (values: Iterable<string>) => [...values].sort();

describe('owner-approved public cases', () => {
  it('publishes exactly the approved source files, and nothing else', () => {
    const published = sources.filter((item) => item.publicationStatus === 'published');
    expect(sorted(published.map((item) => item.slug))).toEqual(sorted(PUBLIC_CASE_SLUGS));
    // The 147 proposal drafts were retired for rewriting; the two that several
    // governance specs read as their fact baseline stay unpublished.
    expect(sources).toHaveLength(3);
    expect(sorted(sources.filter((item) => item.publicationStatus === 'draft').map((item) => item.slug)))
      .toEqual(['anonymous-tsingshan-1250-renovation', 'jining-support-roller-heat-treatment-line']);
  });

  it('records each approval against the matching source identity', () => {
    const bySlug = new Map(sources.map((item) => [item.slug, item]));
    expect(new Set(REVIEWED_PUBLIC_CASES.map((item) => item.slug)).size).toBe(REVIEWED_PUBLIC_CASES.length);
    for (const item of REVIEWED_PUBLIC_CASES) {
      expect(bySlug.get(item.slug)?.id, item.slug).toBe(item.id);
      expect(item.batch).toBeGreaterThanOrEqual(1);
      expect(item.approvedBy.trim()).not.toBe('');
      expect(item.approvedAt).toMatch(/^\d{4}-\d{2}-\d{2}$/);
      expect(Number.isFinite(Date.parse(item.approvedAt))).toBe(true);
    }
  });

  it('opens English only for approved pages with a complete, current translation', () => {
    for (const slug of PUBLIC_ENGLISH_CASE_SLUGS) {
      expect(PUBLIC_CASE_SLUGS.has(slug)).toBe(true);
      expect(englishSlugs).toContain(slug);
    }
    // A stale fingerprint would silently hide an approved English page.
    expect(sorted(readEnglishCases(content, undefined, PUBLIC_ENGLISH_CASE_SLUGS).map((item) => item.slug)))
      .toEqual(sorted(PUBLIC_ENGLISH_CASE_SLUGS));
  });

  it('probes real, still-private drafts in the release contract', () => {
    const release = fs.readFileSync(path.join(process.cwd(), '..', 'ops/releases/frontend_release.py'), 'utf8');
    const block = release.match(/DRAFT_CASE_PATHS = \[([\s\S]*?)\n\]/)?.[1] ?? '';
    const drafts = [...block.matchAll(/'\/(zh|en)\/case\/([a-z0-9-]+)'/g)].map((m) => ({ locale: m[1], slug: m[2] }));
    expect(drafts.length).toBeGreaterThanOrEqual(3);
    const bySlug = new Map(sources.map((item) => [item.slug, item]));
    for (const { locale, slug } of drafts) {
      expect(bySlug.get(slug)?.publicationStatus, slug).toBe('draft');
      expect(PUBLIC_CASE_SLUGS.has(slug), slug).toBe(false);
      if (locale === 'en') expect(englishSlugs, slug).toContain(slug);
    }
  });

  it('matches the release contract that checks the live site', () => {
    const release = fs.readFileSync(path.join(process.cwd(), '..', 'ops/releases/frontend_release.py'), 'utf8');
    const block = release.match(/APPROVED_CASES = \{([\s\S]*?)\n\}/)?.[1] ?? '';
    const listed = (locale: string) =>
      [...(block.match(new RegExp(`'${locale}':\\s*\\[([^\\]]*)\\]`))?.[1] ?? '').matchAll(/'([a-z0-9-]+)'/g)].map((m) => m[1]);
    expect(sorted(listed('zh'))).toEqual(sorted(PUBLIC_CASE_SLUGS));
    expect(sorted(listed('en'))).toEqual(sorted(PUBLIC_ENGLISH_CASE_SLUGS));
  });
});
