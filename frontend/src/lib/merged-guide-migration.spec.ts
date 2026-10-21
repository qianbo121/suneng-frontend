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
    // Visible dates are intentionally omitted. Guard the actual article sections
    // and decision evidence instead of counting incidental header/footer text.
    const sections = [...html.matchAll(/<section class="article-section" id="([^"]+)">([\s\S]*?)<\/section>/g)];
    expect(sections.map((section) => section[1])).toEqual([
      'criteria', 'comparison', 'projects', 'materials', 'process', 'faq',
    ]);
    const body = Object.fromEntries(sections.map((section) => [section[1], section[2]]));
    for (const term of ['优先大修', '优先局部改造', '评估买新炉']) expect(body.criteria).toContain(term);
    expect(body.comparison.match(/<tr>/g)).toHaveLength(10);
    for (const term of ['台车式轴承钢丝球化退火炉新建方案', '超大型燃气台车退火炉改造', 'PC200–PC400 支重轮新建连续热处理线']) {
      expect(body.projects).toContain(term);
    }
    expect(body.materials).toContain('资料不完整也可以先沟通，再确认是否需要现场勘查。');
    for (const term of ['先诊断，再报价', '工程量清单可核对', '停产计划可执行', '验收条件写完整', '项目证据能对上', '停产周期、节能效果和验收指标，均需结合设备现状和具体方案确认。']) {
      expect(body.process).toContain(term);
    }
    expect(body.faq).toContain('不能替代现场检测、风险评估和正式技术方案');
    expect(body.faq).toContain('原页面发布于 2026-06-13。');
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
