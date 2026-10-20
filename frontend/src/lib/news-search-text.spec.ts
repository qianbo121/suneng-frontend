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

  it.each([
    ['unclosed tag with whitespace', `<p${' '.repeat(6400)}<p>x</p>`],
    ['unclosed attributes with whitespace', `<p a${' '.repeat(6400)}<b>`],
    ['unclosed quote with repeated tag starts', `<p title="${'<p '.repeat(6400)}`],
    ['valid long indentation', `before<p\n${' '.repeat(12800)}title="a > b">x</p>after`],
    ['quoted opening brackets', '<p title="<p attr=\'value\'>">x</p><p>y</p>'],
  ])('handles %s without stalling and preserves the established text', (_label, html) => {
    const expected = richTextToPlainText(html);
    const startedAt = performance.now();
    const actual = newsSearchText(html);

    expect(actual).toBe(expected);
    // A wide regression bound: the reported 6400-space input took about 60s.
    expect(performance.now() - startedAt).toBeLessThan(2000);
  });

  it.each([
    ['<p a"b>中文</p><i c">尾', '中文 尾'],
    ['<p title=x"y>保温</p><i z">完', '保温 完'],
    ['<p ="><b>中</b><i =">尾', '中尾'],
    ["<p a'b>中文</p><i c'>尾", '中文 尾'],
    ["<p title=x'y>保温</p><i z'>完", '保温 完'],
    ["<p ='><b>中</b><i ='>尾", '中尾'],
    ['a<pre>\nb</pre>', 'ab'],
    ['a<PRE>\r\nb</PRE>', 'ab'],
    ['a<pre class="snippet">\nb</pre>', 'ab'],
    ['a<pre>\n\nb</pre>', 'a b'],
  ])('preserves body text and parsed whitespace for %s', (html, expected) => {
    expect(richTextToPlainText(html)).toBe(expected);
    expect(newsSearchText(html)).toBe(expected);
  });

  it.each([
    ["\t<p ='\r\n='>=", ""],
    [" <p ='='x/>x<br>x", ""],
    ["\"<p ='=\"'/></p>>", "\""],
    ["<br><p =\"=\"\tx中/>'", ""],
    ["<p =\"=\">=\"", ""],
    ["<p ='='a/>=</p>=\"", ""],
    [">a<p =\"='=\"/>=\"", ">a"],
    ["=</i>&amp;<p =\"\t=\"\r\n=文\t/>'", "=&"],
  ])('does not index invisible text from malformed attributes: %s', (html, expected) => {
    expect(richTextToPlainText(html)).toBe(expected);
    expect(newsSearchText(html)).toBe(expected);
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
