import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { afterEach, describe, expect, it, vi } from 'vitest';
vi.mock('server-only', () => ({}));
vi.mock('react', async (original) => ({ ...(await original<typeof import('react')>()), cache: (fn: unknown) => fn }));
import { caseSourceFingerprint, readEnglishCases, getEnglishCases, getEnglishCaseResults, englishCaseHref } from './english';
import { parseCaseQuery } from './query';
import { PUBLIC_ENGLISH_CASE_SLUGS } from './public-case-allowlist';

const temporary: string[] = [];
afterEach(() => temporary.splice(0).forEach((dir) => fs.rmSync(dir, { recursive: true, force: true })));
function fixture() {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), 'suneng-case-en-'));
  temporary.push(root);
  fs.mkdirSync(path.join(root, 'cases')); fs.mkdirSync(path.join(root, 'cases-en'));
  const source = { id: 'example', slug: 'original-address', title: '源标题', body: 'example.md', publicationStatus: 'published', contentType: 'proposal', projectStatus: 'proposal', sourceDate: '2021-11-02', dateModified: '2026-09-12', cover: { src: '/images/example.webp', alt: '示意图', caption: '示意图', fit: 'contain' }, internalCost: 'do-not-expose' };
  const raw = JSON.stringify(source); const markdown = '## 参数\n\n600kg是否含工装未说明。';
  const copy = { id: source.id, slug: source.slug, number: 1, title: 'Does the 600 kg rating include fixtures?', summary: 'Fixture inclusion was not specified.', body: 'example.md', sourceFingerprint: caseSourceFingerprint(raw, markdown), translationStatus: 'complete', translatedAt: '2026-09-12', coverAlt: 'Workpiece illustration', coverCaption: 'Reference illustration', privateNote: 'do-not-expose' };
  fs.writeFileSync(path.join(root, 'cases/example.json'), raw);
  fs.writeFileSync(path.join(root, 'cases/example.md'), markdown);
  fs.writeFileSync(path.join(root, 'cases-en/example.json'), JSON.stringify(copy));
  fs.writeFileSync(path.join(root, 'cases-en/example.md'), '## Capacity\n\nFixture inclusion was not specified.\n\n| Rating | Value |\n| --- | --- |\n| Proposed load | 600 kg |\n<script>unsafe()</script>');
  return { root, source, copy };
}
describe('English counterparts follow source authority', () => {
  it('matches a legacy Chinese filename through its stable case ID', () => {
    const { root } = fixture();
    fs.renameSync(path.join(root, 'cases/example.json'), path.join(root, 'cases/legacy-source-name.json'));
    expect(readEnglishCases(root).map((item) => item.id)).toEqual(['example']);
  });
  it('preserves source identity, dates, image and proposal status without serializing private fields', () => {
    const { root, source, copy } = fixture();
    const records = readEnglishCases(root);
    expect(records).toHaveLength(1);
    expect(records[0]).toMatchObject({ id: source.id, slug: source.slug, title: copy.title, sourceDate: source.sourceDate, dateModified: source.dateModified, contentType: 'proposal', projectStatus: 'proposal', cover: { src: source.cover.src, fit: source.cover.fit } });
    expect(records[0].datePublished).toBeUndefined();
    expect(records[0].html).toContain('Project parameters; scroll horizontally');
    expect(records[0].html).not.toContain('<script>');
    expect(JSON.stringify(records)).not.toContain('do-not-expose');
    expect(records[0].searchText).toContain('fixture inclusion was not specified');
  });
  it('rejects withdrawn sources before reading either language body, even if English says complete', () => {
    const { root, source } = fixture();
    fs.writeFileSync(path.join(root, 'cases/example.json'), JSON.stringify({ ...source, publicationStatus: 'draft' }));
    fs.unlinkSync(path.join(root, 'cases/example.md'));
    fs.unlinkSync(path.join(root, 'cases-en/example.md'));
    expect(readEnglishCases(root)).toEqual([]);
  });
  it.each(['title', 'body', 'identity', 'incomplete', 'missing'])('hides stale or unavailable English after %s changes', (change) => {
    const { root, source, copy } = fixture();
    if (change === 'title') fs.writeFileSync(path.join(root, 'cases/example.json'), JSON.stringify({ ...source, title: '更新后的源标题' }));
    if (change === 'body') fs.appendFileSync(path.join(root, 'cases/example.md'), '\n追加条件');
    if (change === 'identity') fs.writeFileSync(path.join(root, 'cases-en/example.json'), JSON.stringify({ ...copy, slug: 'other-address' }));
    if (change === 'incomplete') fs.writeFileSync(path.join(root, 'cases-en/example.json'), JSON.stringify({ ...copy, translationStatus: 'draft' }));
    if (change === 'missing') fs.unlinkSync(path.join(root, 'cases-en/example.md'));
    expect(readEnglishCases(root)).toEqual([]);
  });
  it('keeps a complete, current translation private until the owner approves its English page', () => {
    const { root, source } = fixture();
    // Without approval the source body is never read, so its absence cannot matter.
    fs.unlinkSync(path.join(root, 'cases/example.md'));
    expect(readEnglishCases(root, undefined, new Set())).toEqual([]);
    expect(() => readEnglishCases(root, undefined, new Set([source.slug]))).toThrow();
  });
  it("keeps English search limited to approved pages without losing query state", () => {
    expect(getEnglishCases().map((item) => item.slug)).toEqual([...PUBLIC_ENGLISH_CASE_SLUGS]);
    const query=parseCaseQuery({q:'fixture'});
    expect(getEnglishCaseResults(query).items).toEqual([]);
    const page=new URL(englishCaseHref(query,2),'https://example.test');
    expect(page.searchParams.get('q')).toBe('fixture');
    expect(page.searchParams.get('page')).toBe('2');
  });
});
