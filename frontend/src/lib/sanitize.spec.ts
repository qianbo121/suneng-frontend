import { describe, it, expect } from 'vitest';

import { prepareNewsArticleHtml, richTextToPlainText, sanitizeRichTextHtml } from './sanitize';

describe('sanitizeRichTextHtml', () => {
  it('strips <script> from HTML content', () => {
    const out = sanitizeRichTextHtml('<p>ok</p><script>alert(1)</script>');
    expect(out).not.toContain('<script');
    expect(out).toContain('ok');
  });

  it('removes event-handler attributes (onerror)', () => {
    const out = sanitizeRichTextHtml('<img src="x" onerror="alert(1)">').toLowerCase();
    expect(out).not.toContain('onerror');
  });

  it('drops javascript: scheme hrefs', () => {
    const out = sanitizeRichTextHtml('<a href="javascript:alert(1)">x</a>').toLowerCase();
    expect(out).not.toContain('javascript:');
  });

  it('preserves safe formatting markup', () => {
    const out = sanitizeRichTextHtml('<p><b>bold</b> text</p>');
    expect(out).toContain('<b>bold</b>');
  });

  it('escapes raw < and paragraph-wraps plain text', () => {
    expect(sanitizeRichTextHtml('a < b')).toContain('&lt;');
    expect(sanitizeRichTextHtml('line one\n\nline two')).toContain('<p>');
  });

  it('returns an empty string for nullish input', () => {
    expect(sanitizeRichTextHtml('')).toBe('');
    expect(sanitizeRichTextHtml(null)).toBe('');
  });
});

describe('richTextToPlainText', () => {
  it('normalizes plain bilingual text while preserving comparison symbols', () => {
    expect(richTextToPlainText('  温度 > 500 °C\n\tHeat treatment  ')).toBe(
      '温度 > 500 °C Heat treatment',
    );
    expect(richTextToPlainText('A &lt; B &amp; C')).toBe('A < B & C');
    expect(richTextToPlainText('A\u0000B')).toBe('AB');
  });

  it('removes rich-text markup and preserves readable spacing', () => {
    expect(
      richTextToPlainText(
        '<div><img src="/cover.webp" alt="cover"></div><div>第一段<br><br>第二段</div>',
      ),
    ).toBe('第一段 第二段');
  });

  it('decodes HTML entities and removes unsafe content', () => {
    expect(richTextToPlainText('<script>alert(1)</script><p>A&nbsp;&amp;&nbsp;B</p>')).toBe(
      'A & B',
    );
  });

  it('returns an empty string for nullish input', () => {
    expect(richTextToPlainText('')).toBe('');
    expect(richTextToPlainText(null)).toBe('');
  });
});

describe('prepareNewsArticleHtml', () => {
  it('renders Markdown headings, lists and tables as readable article structure', () => {
    const out = prepareNewsArticleHtml(
      '## 报价边界\n\n- 炉体\n- 冷却\n\n| 项目 | 范围 |\n| --- | --- |\n| 安装 | 单列 |',
    );
    expect(out).toContain('<h2>报价边界</h2>');
    expect(out).toContain('<li>冷却</li>');
    expect(out).toContain('<table>');
    expect(out).not.toContain('##');
  });

  it('converts imported Markdown paragraphs while preserving safe rich text', () => {
    const out = prepareNewsArticleHtml(
      '<p>开场<strong>说明</strong></p><p>## 一、报价边界</p><p>正文<a href="/zh/products">产品</a></p>',
    );
    expect(out).toContain('<h2>一、报价边界</h2>');
    expect(out).toContain('<strong>说明</strong>');
    expect(out).toContain('href="/zh/products"');
  });

  it('keeps code literal and sanitizes links after Markdown conversion', () => {
    const out = prepareNewsArticleHtml(
      '# 正文标题\n\n[链接](javascript:alert)\n\n```text\n## 示例代码\n```',
    );
    expect(out).toContain('<h2>正文标题</h2>');
    expect(out).not.toContain('<h1>');
    expect(out).not.toContain('javascript:');
    expect(out).toContain('## 示例代码');
  });

  it('promotes editor heading text beside nested lists without losing their contents', () => {
    const out = prepareNewsArticleHtml(
      '<div>## 统一能力事实<br><div><ul><li><div>成立于2006年</div></li></ul></div>## 联系方式<br><br>电话：130-5298-6814</div>',
    );
    expect(out).toContain('<h2>统一能力事实</h2>');
    expect(out).toContain('<h2>联系方式</h2>');
    expect(out).toContain('<ul><li><div>成立于2006年</div></li></ul>');
    expect(out).toContain('电话：130-5298-6814');
    expect(out).not.toContain('##');
  });

  it('removes only the body image that matches the separately rendered cover', () => {
    const out = prepareNewsArticleHtml(
      '<p><img src="https://www.jssngyl.cn/uploads/cover.webp" alt="封面"></p><p>正文</p><img src="/uploads/diagram.webp" alt="图解">',
      { coverImage: '/uploads/cover.webp' },
    );

    expect(out).not.toContain('cover.webp');
    expect(out).toContain('diagram.webp');
    expect(richTextToPlainText(out)).toBe('正文');
  });

  it('keeps a leading image when it is not the separately rendered cover', () => {
    const out = prepareNewsArticleHtml('<img src="/uploads/diagram.webp" alt="图解"><p>正文</p>', {
      coverImage: '/uploads/cover.webp',
    });

    expect(out).toContain('diagram.webp');
  });

  it('promotes existing break-delimited labels without changing article copy', () => {
    const input =
      '<div>开场说明。<br><br>苏能四包三清约定法<br><br>第一包：备件包<br><br>备件正文。<br><br>合同附件怎样核对<br><br>备件包<br>• 至少写清：型号</div>';
    const out = prepareNewsArticleHtml(input);

    expect(out).toContain('<h2>苏能四包三清约定法</h2>');
    expect(out).toContain('<h3>第一包：备件包</h3>');
    expect(out).toContain('<h2>合同附件怎样核对</h2>');
    expect(out).toContain('<h4>备件包</h4>');
    expect(richTextToPlainText(out)).toBe(richTextToPlainText(input));
  });
});

describe('English news mobile comparison tables', () => {
  const table =
    '<table><thead><tr><th>Object</th><th>Limit</th></tr></thead><tbody><tr><td>Load excluding saddles</td><td>200 tonnes</td></tr></tbody></table>';
  it('retains complete values and column relationships in labelled mobile cards', () => {
    const result = prepareNewsArticleHtml(table, { stackSimpleTables: true });
    expect(result).toContain('class="furnace-decision-table"');
    expect(result).toContain('data-label="Object">Load excluding saddles');
    expect(result).toContain('data-label="Limit">200 tonnes');
    expect(result).toContain('<th>Limit</th>');
  });
  it('leaves existing tables unchanged unless requested and does not flatten merged cells', () => {
    expect(prepareNewsArticleHtml(table)).not.toContain('data-label');
    expect(
      prepareNewsArticleHtml(table.replace('<td>200', '<td colspan="2">200'), {
        stackSimpleTables: true,
      }),
    ).not.toContain('furnace-decision-table');
  });
});
