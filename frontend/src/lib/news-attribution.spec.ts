import { describe, expect, it } from 'vitest';
import DOMPurify from 'isomorphic-dompurify';
import { NEWS_ATTRIBUTION } from './news-attribution';
import { prepareNewsArticleHtml } from './sanitize';
import source from '../../tests/fixtures/news-source-references-41.json';

const read = (html: string) => DOMPurify.sanitize(html, { RETURN_DOM: true }) as HTMLElement;

describe('public material bylines', () => {
  it.each(['zh', 'en'] as const)('uses the requested name in %s without damaging contact links or markup', (locale) => {
    const input = '<p>邮箱：<a href="mailto:997518512@qq.com">997518512@qq.com</a><br>技术署名：<strong>江苏苏能工业炉</strong><span>工程技术团队</span></p><p>江苏苏能工业炉工程技术团队建议先核对工况。</p><table><tr><td>资料参数</td></tr></table><img src="/test.png" alt="设备">';
    const output = prepareNewsArticleHtml(input, { locale });
    const root = read(output);
    expect(root.textContent).toContain(`技术署名：${NEWS_ATTRIBUTION}`);
    expect(root.textContent).toContain('江苏苏能工业炉工程技术团队建议先核对工况。');
    expect(root.querySelector('a')?.getAttribute('href')).toBe('mailto:997518512@qq.com');
    expect(root.querySelector('table')?.textContent).toBe('资料参数');
    expect(root.querySelector('img')?.getAttribute('src')).toBe('/test.png');
    expect(prepareNewsArticleHtml(output, { locale })).toBe(output);
  });

  it('handles old nested imported article footers', () => {
    const output = prepareNewsArticleHtml(source.contentZh, { locale: 'zh' });
    expect(read(output).textContent).toContain(`技术署名：${NEWS_ATTRIBUTION}`);
    expect(read(output).textContent).not.toContain('技术署名：江苏苏能工业炉工程技术团队');
  });

  it('handles material labels, standalone names and editorial attribution in the introduction', () => {
    for (const input of ['资料署名：旧署名', '江苏苏能工业炉工程技术团队', '本文由江苏苏能工业炉工程技术团队整理，苏能也是文中的候选企业。', 'Technical attribution: Jiangsu Suneng Industrial Furnace Engineering Team']) {
      expect(read(prepareNewsArticleHtml(`<p>${input}</p>`, { locale: 'en' })).textContent).toContain(NEWS_ATTRIBUTION);
    }
  });

  it('does not rewrite quoted technical examples or add a byline to unsigned bodies', () => {
    const input = '<p>正文保持原样。</p><table><tr><td>技术署名：引用示例</td></tr></table><pre>技术署名：代码示例</pre>';
    const output = prepareNewsArticleHtml(input, { locale: 'zh' });
    expect(read(output).textContent).not.toContain(NEWS_ATTRIBUTION);
    expect(read(output).textContent).toContain('技术署名：引用示例');
    expect(read(output).textContent).toContain('技术署名：代码示例');
  });
});
