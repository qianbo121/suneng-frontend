import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import { newsSearchText } from './news-search-text';
import { richTextToPlainText } from './sanitize';

describe('complete article search text', () => {
  it.each([
    '<p>工件<strong>尺寸</strong>与产能。</p><p>第二段。</p>',
    '<p title="a > b">A &lt; B &amp; C&nbsp;D</p>',
    '<div>参数<img src="x" onerror="alert(1)"><br>材质</div>',
    '<script>alert(1)</script><p>有效正文</p>',
    '<style>.hidden {display:none}</style><p>正文</p>',
    '<!-- hidden --><p>公开内容</p>',
    '<p>&not<strong>in;</strong></p>',
    '<table><thead><tr><th>工件</th></tr></thead><tbody><tr><td><strong>轴</strong></td></tr></tbody></table>',
    '<table>外部文字<tr><td>工件</td><td>尺寸</td></tr></table>',
    '<svg><title>图例</title></svg><p>正文</p>',
    '<p title="unterminated>正文',
    '<p>A < B</p>',
    '<p>A</p ><p>B<br class="line-break">C</p>',
    '<p>&lt;script&gt;只是文字&lt;/script&gt;</p>',
    '<p>第一段</p><template>不显示</template><p>第二段</p>',
  ])('matches the established text conversion for %s', (html) => {
    expect(newsSearchText(html)).toBe(richTextToPlainText(html));
  });

  it('preserves all searchable fields in saved bilingual article sources', () => {
    const fixture = (name: string) => JSON.parse(readFileSync(new URL(`../../tests/fixtures/${name}`, import.meta.url), 'utf8'));
    const samples = [
      ...fixture('news-seo-title-sources-20260920.json').cms,
      ...fixture('news-seo-repair-current-20261012.json').items,
      ...fixture('news-migration-public-sources-20260910.json'),
      fixture('news-overhaul-source-20261013.json'),
      fixture('news-reviewed-copy-source.json'),
      fixture('news-source-references-41.json'),
    ];
    for (const article of samples) {
      for (const key of ['titleZh', 'titleEn', 'summaryZh', 'summaryEn', 'contentZh', 'contentEn', 'seoDescriptionZh', 'seoDescriptionEn']) {
        expect(newsSearchText(article[key]), `${article.slug}: ${key}`).toBe(richTextToPlainText(article[key]));
      }
    }
  });
});
