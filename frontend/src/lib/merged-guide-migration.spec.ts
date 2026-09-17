import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it, vi } from 'vitest';
import revisions from './news-reviewed-copy.json';
import sourceArticles from '../../tests/fixtures/news-migration-public-sources-20260910.json';
import { applyReviewedNewsCopy } from './news-reviewed-copy';
import type { NewsApiItem } from '@/types/news';

vi.mock('server-only', () => ({}));
vi.mock('next/navigation', () => ({
  usePathname: () => '/zh/articles/laojiu-rechuli-lu-daxiu-haishi-maixin',
  permanentRedirect: (location: string) => { throw Object.assign(new Error('permanent redirect'), { location, status: 308 }); },
  notFound: () => { throw Object.assign(new Error('not found'), { status: 404 }); },
}));
// The guide is withdrawn at launch; check its content as it would be published.
vi.mock('@/lib/publication-scope', async (original) => ({
  ...(await original<typeof import('@/lib/publication-scope')>()),
  TECHNICAL_CONTENT_PUBLISHED: true,
}));
import OldFurnaceGuide from '@/app/[locale]/articles/laojiu-rechuli-lu-daxiu-haishi-maixin/page';

describe('merged guide keeps the historical entrance connected to full content', () => {
  it('keeps the historical authority URL as a complete standalone page', async () => {
    const html = renderToStaticMarkup(await OldFurnaceGuide({ params: Promise.resolve({ locale: 'zh' }) }));
    expect(html).toContain('热处理炉大修厂家怎么选？');
    expect(html).toContain('资料更新与来源');
    expect(html).not.toMatch(/未登记公开署名|发布复核：|内容复核：/);
    expect(html).toContain('id="decision-table"');
    expect(html).toContain('id="partial"');
    expect(html.replace(/<script\b[^>]*>[\s\S]*?<\/script>/g, '').replace(/<[^>]*>/g, '').length).toBeGreaterThan(3500);
  });
  it('does not create an English equivalent for Chinese-only content', async () => {
    await expect(OldFurnaceGuide({ params: Promise.resolve({ locale: 'en' }) })).rejects.toMatchObject({ status: 404 });
  });
  it('applies the actual published source and keeps all four authority links in its public body', async () => {
    const source = sourceArticles.find((article) => article.id === 21)! as NewsApiItem;
    const result = await applyReviewedNewsCopy(source);
    expect(result.slug).toBe(revisions['21'].slug);
    expect(result.contentZh).toBe(revisions['21'].contentZh);
    for (const slug of ['rechuli-lu-luchen-fanxin', 'rechuli-lu-dian-gai-ran-yure-huishou', 'rechuli-lu-kongzhi-xitong-shengji', 'rechuli-lu-tingchan-chongqi-banqian-fuchan']) {
      expect(result.contentZh).toContain(`href="/zh/solutions/${slug}"`);
    }
    for (const term of ['结构与安全', '工艺适配', '总投入', '验收条件', '初次沟通', '停产窗口']) expect(result.contentZh).toContain(term);
  });
});
