import { describe, expect, it, vi } from 'vitest';
import * as sanitizeHelpers from './sanitize';
import { getNewsSummary } from './news-summary';
import type { NewsApiItem } from '@/types/news';

const article = {
  id: 30, titleZh: '连续线和周期炉怎么选？', slug: 'shuju-news-30',
  publishDate: '2026-08-28', categoryId: 1,
  summaryZh: '画面用两条抽象路径呈现连续生产与周期装炉的选择关系，只表达本文的炉型初筛逻辑。',
  contentZh: '<p>根据工件、产能节拍和换型需求，分别比较连续线与周期炉。</p><h2>配置条件</h2>',
} as NewsApiItem;

describe('news summaries', () => {
  it('does not parse a long unused body when a safe summary is available', () => {
    const sanitize = vi.spyOn(sanitizeHelpers, 'richTextToPlainText');
    try {
      const item = {
        ...article,
        summaryZh: '<p>已确认的摘要。</p>',
        contentZh: '<p>无需为摘要解析的长正文。</p>'.repeat(1000),
      };
      expect(getNewsSummary('zh', item)).toBe('已确认的摘要。');
      expect(sanitize.mock.calls.length).toBeLessThanOrEqual(2);
    } finally {
      sanitize.mockRestore();
    }
  });

  it('replaces a cover caption with an article summary for cards and search', () => {
    expect(getNewsSummary('zh', article)).toBe('根据工件、产能节拍和换型需求，分别比较连续线与周期炉。');
    expect(getNewsSummary('zh', article, true)).not.toContain('画面');
  });
  it('prefers a dedicated search description, without overriding a valid card summary', () => {
    const item = { ...article, summaryZh: '文章摘要。', seoDescriptionZh: '搜索摘要。' };
    expect(getNewsSummary('zh', item)).toBe('文章摘要。');
    expect(getNewsSummary('zh', item, true)).toBe('搜索摘要。');
  });
  it('removes image-only lead paragraphs and unsafe rich-text markup', () => {
    const item = { ...article, summaryZh: '', contentZh: '<div>画面说明<br><br>选型正文。</div><script>alert(1)</script>' };
    expect(getNewsSummary('zh', item)).toBe('选型正文。');
  });
});
