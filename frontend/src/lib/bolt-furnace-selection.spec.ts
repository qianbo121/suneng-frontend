import DOMPurify from 'isomorphic-dompurify';
import { describe, expect, it } from 'vitest';
import { prepareNewsArticleHtml } from './sanitize';

const articleSlug = 'bolt-mesh-belt-quench-temper-capability';
const options = { articleSlug, locale: 'zh' as const };

describe('bolt furnace selection article section', () => {
  it.each(['<p>修订后的开头。</p><h2>规格怎么选？</h2>', '<p>改为无小标题的版本。</p>'])(
    'preserves the source and the stable link target after editorial changes: %s', (body) => {
      const html = prepareNewsArticleHtml(body, options);
      const root = DOMPurify.sanitize(html, { RETURN_DOM: true }) as HTMLElement;
      expect(root.querySelectorAll('h2#bolt-furnace-selection')).toHaveLength(1);
      expect(root.querySelector('p')?.textContent).toBe(body.slice(3, body.indexOf('</p>')));
      expect(root.querySelector('h2')?.id).toBe('bolt-furnace-selection');
      expect(prepareNewsArticleHtml(html, options)).toBe(html);
    },
  );

  it('limits the section to the Chinese bolt article', () => {
    const body = '<p>Source copy.</p>';
    expect(prepareNewsArticleHtml(body, { articleSlug, locale: 'en' })).toBe(body);
    expect(prepareNewsArticleHtml(body, { articleSlug: 'other', locale: 'zh' })).toBe(body);
  });
});
