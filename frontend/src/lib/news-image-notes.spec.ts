import { describe, expect, it } from 'vitest';
import { prepareNewsArticleHtml } from './sanitize';
import { newsImageNoteReplacements } from './news-image-notes';

describe('public news image notes', () => {
  it('removes the reviewed notes in both languages while retaining their technical sentences', () => {
    for (const [note, replacement] of Object.entries(newsImageNoteReplacements)) {
      const html = prepareNewsArticleHtml(`<p>${note}</p><p>工艺温度按材料确认。</p>`);
      expect(html).not.toContain(note);
      if (replacement) expect(html).toContain(replacement);
      expect(html).toContain('工艺温度按材料确认。');
    }
  });

  it('preserves images, links, and unrelated technical limitations', () => {
    const html = prepareNewsArticleHtml(
      '<p><img src="/images/example.webp" alt="设备示意">画面呈现的是整线询价方法，非具体客户项目。</p>' +
        '<p>工艺示意图不能替代实际装炉试验；温度以项目协议为准。</p>' +
        '<p><a href="/zh/products">查看设备</a></p>',
    );
    expect(html).toContain('/images/example.webp');
    expect(html).toContain('设备示意');
    expect(html).not.toContain('非具体客户项目');
    expect(html).toContain('工艺示意图不能替代实际装炉试验；温度以项目协议为准。');
    expect(html).toContain('href="/zh/products"');
  });
});
