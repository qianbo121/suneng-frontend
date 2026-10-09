import { describe, expect, it } from 'vitest';
import { readFileSync } from 'node:fs';
import path from 'node:path';
import { createHash } from 'node:crypto';
import source from '../../tests/fixtures/news-source-references-41.json';
import { applyReviewedNewsCopy } from './news-reviewed-copy';
import { applyEnglishNewsCopy } from './english-news';
import type { NewsApiItem } from '@/types/news';

const original = source as NewsApiItem;

describe('reviewed engineering source references', () => {
  it('renders the matched proposal references in both languages without changing publication identity', async () => {
    const zh = await applyReviewedNewsCopy(original);
    const en = await applyEnglishNewsCopy(zh);
    expect(zh.contentZh).toContain('2020年10月17日');
    expect(zh.contentZh).toContain('原件第2—3页');
    expect(zh.contentZh).toContain('不代表签署终版或设备验收日期');
    expect(en.contentEn).toContain('17 October 2020');
    expect(en.contentEn).toContain('surviving 12-page document');
    expect(en.contentEn).toContain('not delivery or acceptance evidence');
    for (const key of ['id', 'slug', 'status', 'isPublished', 'publishDate', 'coverImage'] as const) {
      expect(zh[key]).toEqual(original[key]);
    }
  });

  it('does not replace a newer source edit or revive a withdrawn source', async () => {
    const edited = { ...original, contentZh: original.contentZh + '<p>New CMS revision</p>' };
    expect(await applyReviewedNewsCopy(edited)).toBe(edited);
    expect(await applyEnglishNewsCopy(edited)).toBe(edited);
    const withdrawn = { ...original, status: 'offline', isPublished: false } as NewsApiItem;
    expect(await applyReviewedNewsCopy(withdrawn)).toBe(withdrawn);
    expect(await applyEnglishNewsCopy(withdrawn)).toBe(withdrawn);
  });

  it('keeps the Henan translation matched after removing the unverified emergency capacity', () => {
    const root = path.join(process.cwd(), 'content');
    const metadata = readFileSync(path.join(root, 'cases/henan-annealing-solution.json'));
    const body = readFileSync(path.join(root, 'cases/henan-annealing-solution.md'));
    const enMeta = JSON.parse(readFileSync(path.join(root, 'cases-en/henan-annealing-solution.json'), 'utf8'));
    const enBody = readFileSync(path.join(root, 'cases-en/henan-annealing-solution.md'), 'utf8');
    expect(createHash('sha256').update(metadata).update('\0').update(body).digest('hex')).toBe(enMeta.sourceFingerprint);
    expect(body.toString()).not.toMatch(/55\s*kW/);
    expect(enBody).not.toMatch(/55\s*kW/);
    expect(body.toString()).toContain('实际同时运行负荷');
    expect(enBody).toContain('actual simultaneous load');
    expect(JSON.parse(metadata.toString()).publicationStatus).toBe('published');
  });
});
