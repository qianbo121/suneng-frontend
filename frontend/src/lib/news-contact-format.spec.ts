import { describe, expect, it } from 'vitest';
import DOMPurify from 'isomorphic-dompurify';
import { normalizeNewsContactFormat } from './news-contact-format';

function format(html: string) {
  const root = DOMPurify.sanitize(html, { RETURN_DOM: true }) as HTMLElement;
  const report = normalizeNewsContactFormat(root);
  return { html: root.innerHTML, root, report };
}
const phone = '+86-130-5298-6814';
const email = '997518512@qq.com';
const linkedEmail = `<a href="mailto:${email}" rel="noopener noreferrer" title="邮箱">${email}</a>`;

describe('Chinese article contact display', () => {
  it('places the email immediately below the telephone without trailing punctuation', () => {
    const result = format(`<p>咨询电话：${phone}；邮箱：${linkedEmail}。</p>`);
    expect(result.html).toBe(`<p>咨询电话：${phone}<br>邮箱：${linkedEmail}</p>`);
    expect(result.report.unhandledBlocks).toEqual([]);
  });
  it('preserves tel/mailto links, attributes and rich formatting', () => {
    const tel = `<a href="tel:+8613052986814" title="电话"><strong>${phone}</strong></a>`;
    const result = format(`<p style="color:navy">电话：${tel} | 邮箱：${linkedEmail}。</p>`);
    expect(result.html).toBe(`<p style="color:navy">电话：${tel}<br>邮箱：${linkedEmail}</p>`);
  });
  it('accepts spaces and en dashes in the public telephone', () => {
    const result = format(`<p>咨询电话：+86 130–5298–6814；邮箱：${email}。</p>`);
    expect(result.html).toContain(`+86 130–5298–6814<br>邮箱：${email}</p>`);
  });
  it('reorders email-first paragraphs and preserves the website link', () => {
    const result = format(`<p>公开邮箱：${linkedEmail}</p><p>联系电话：${phone}。</p><p>官网：<a href="https://www.jssngyl.cn">官网</a></p>`);
    expect(result.html).toBe(`<p>联系电话：${phone}<br>公开邮箱：${linkedEmail}</p><p>官网：<a href="https://www.jssngyl.cn">官网</a></p>`);
  });
  it('handles a consultation line whose values have no individual labels', () => {
    const result = format(`<p>江苏苏能工业炉工程技术团队<br>咨询：${phone}｜${linkedEmail}<br>官网：<a href="https://www.jssngyl.cn">官网</a></p>`);
    expect(result.report.unhandledBlocks).toEqual([]);
    expect(result.html).toContain(`<p>咨询电话：${phone}<br>邮箱：${linkedEmail}</p>`);
    expect(result.html).toContain('江苏苏能工业炉工程技术团队');
    expect(result.html).toContain('<a href="https://www.jssngyl.cn">官网</a>');
  });
  it('compacts separate contact paragraphs without losing their attributes', () => {
    const input = `<p class="telephone">公开联系电话：${phone}</p><p class="mailbox">官方邮箱：${linkedEmail}</p>`;
    const result = format(input);
    expect(result.html).toBe(`<p class="telephone">公开联系电话：${phone}<br><span class="mailbox">官方邮箱：${linkedEmail}</span></p>`);
    expect(result.report.changedBlocks).toBe(1);
  });
  it('extracts an existing contact footer after intact consultation prose', () => {
    const result = format(`<p>咨询前可准备工艺流程草图。苏能电话：${phone}；邮箱：${linkedEmail}。</p>`);
    expect(result.html).toBe(`<p>咨询前可准备工艺流程草图。</p><p>苏能电话：${phone}<br>邮箱：${linkedEmail}</p>`);
  });
  it('preserves a service boundary following the contact clause', () => {
    const result = format(`<p>可致电 <strong>${phone}</strong>，或发送资料至 <strong>${linkedEmail}</strong>。苏能不直接提供按件收费的热处理加工。</p>`);
    expect(result.html).toBe(`<p>苏能不直接提供按件收费的热处理加工。</p><p>咨询电话：<strong>${phone}</strong><br>邮箱：<strong>${linkedEmail}</strong></p>`);
  });
  it('keeps the intent of a contact clause embedded in a document request', () => {
    const result = format(`<p>咨询时请准备工件材料与尺寸重量、工艺曲线、装炉方式、产量、能源和项目地址，可致电 ${phone}，或发送至 ${linkedEmail}，用于核对需求范围和下一步资料。</p>`);
    expect(result.html).toContain('<p>咨询时请准备工件材料与尺寸重量、工艺曲线、装炉方式、产量、能源和项目地址，用于核对需求范围和下一步资料。</p>');
    expect(result.html).toContain(`<p>咨询电话：${phone}<br>邮箱：${linkedEmail}</p>`);
    expect(result.report.unhandledBlocks).toEqual([]);
  });
  it('preserves the inquiry link while extracting its phone/email alternative', () => {
    const result = format(`<p>费用、周期仍需确认。可<a href="/zh/inquiry" title="设备情况">提交设备情况</a>，或通过电话<a href="tel:+8613052986814">${phone}</a>、邮箱${linkedEmail}联系。</p>`);
    expect(result.html).toContain('<p>费用、周期仍需确认。可<a href="/zh/inquiry" title="设备情况">提交设备情况</a>。</p>');
    expect(result.html).toContain(`<p>电话：<a href="tel:+8613052986814">${phone}</a><br>邮箱：${linkedEmail}</p>`);
  });
  it('does not add another contact footer when an old CTA repeats existing contact values', () => {
    const result = format(`<p>如需开始台车炉方案沟通，可将上文“最小信息包”的六项资料整理为 PDF 或压缩包，发送至 ${email}；也可致电 ${phone}，先说明工件、工艺和项目所在地。</p><p>产品参考：台车炉</p><p>公开联系电话：${phone}</p><p>官方邮箱：${email}</p>`);
    expect(result.html).toContain('整理为 PDF 或压缩包，先说明工件、工艺和项目所在地。');
    expect(result.html.split(phone).length - 1).toBe(1);
    expect(result.html.split(email).length - 1).toBe(1);
  });
  it('does not invent an email for phone-only contact clauses', () => {
    const result = format(`<p><a href="/zh/contact">联系苏能工程团队</a>，公开联系电话：${phone}。</p>`);
    expect(result.html).toBe(`<p><a href="/zh/contact">联系苏能工程团队</a></p><p>公开联系电话：${phone}</p>`);
    expect(result.html).not.toContain(email);
  });
  it('handles direct text in old div imports without flattening nested technical blocks', () => {
    const result = format(`<div><div>官方网站：<a href="https://www.jssngyl.cn">官网</a></div>；公开联系电话：${phone}。<p>测试工况：650 ℃，装载300 kg。</p></div>`);
    expect(result.html).toContain(`<p>公开联系电话：${phone}</p><p>测试工况：650 ℃，装载300 kg。</p>`);
    expect(result.html).toContain('<div>官方网站：<a href="https://www.jssngyl.cn">官网</a></div>');
  });
  it('excludes tables, code, figures, captions and headings', () => {
    const content = `电话：${phone}；邮箱：${email}。`;
    const input = `<h2>${content}</h2><table><tbody><tr><td>${content}</td></tr></tbody></table><pre><code>${content}</code></pre><figure><img src="/cover.webp" alt="技术图"><figcaption>${content}</figcaption></figure>`;
    const result = format(input);
    expect(result.html).toBe(input);
    expect(result.report.changedBlocks).toBe(0);
  });
  it('leaves unrecognized prose intact and reports it for review', () => {
    const input = `<p>设备记录里有 ${phone}，它是何含义需要确认。</p>`;
    const result = format(input);
    expect(result.html).toBe(input);
    expect(result.report.unhandledBlocks).toHaveLength(1);
  });
  it('places publication and technical credit immediately below contact lines', () => {
    const result = format(`<p>咨询电话：${phone}；邮箱：${linkedEmail}。</p><p>发布单位：江苏苏能工业炉有限公司</p><p>技术署名：江苏苏能工业炉工程技术团队</p>`);
    expect(result.html).toBe(`<p>咨询电话：${phone}<br>邮箱：${linkedEmail}<br>发布单位：江苏苏能工业炉有限公司<br>技术署名：江苏苏能工业炉工程技术团队</p>`);
    const repeated = format(result.html);
    expect(repeated.html).toBe(result.html);
    expect(repeated.report.changedBlocks).toBe(0);
  });
  it('retains paragraph identifiers, styles, classes and inline links in compact footer lines', () => {
    const result = format(`<p id="telephone" class="contact">电话：${phone}</p><p id="mailbox" class="mail" style="color:navy">邮箱：${linkedEmail}</p><p id="publisher" class="publisher">发布单位：<a href="/zh/about">江苏苏能工业炉有限公司</a></p><p id="credit" class="credit">技术署名：江苏苏能工业炉工程技术团队</p>`);
    expect(result.root.querySelector('#telephone')?.getAttribute('class')).toBe('contact');
    expect(result.root.querySelector('#mailbox')?.outerHTML).toBe(`<span id="mailbox" class="mail" style="color:navy">邮箱：${linkedEmail}</span>`);
    expect(result.root.querySelector('#publisher')?.getAttribute('class')).toBe('publisher');
    expect(result.root.querySelector('#credit')?.getAttribute('class')).toBe('credit');
    expect(result.root.querySelectorAll('p')).toHaveLength(1);
    expect(result.html).toContain('<a href="/zh/about">江苏苏能工业炉有限公司</a>');
    expect(format(result.html).html).toBe(result.html);
  });
  it('does not combine ordinary technical paragraphs or metadata without a contact block', () => {
    const input = `<p>咨询电话：${phone}</p><p>验收应按约定工况执行。</p><p>发布单位：江苏苏能工业炉有限公司</p><p>技术署名：江苏苏能工业炉工程技术团队</p>`;
    const result = format(input);
    expect(result.html).toBe(input);
    expect(result.report.changedBlocks).toBe(0);
    expect(result.html).not.toContain(email);
  });
  it('fixes punctuation and extra breaks in an existing four-line composite footer', () => {
    const result = format(`<p id="footer">咨询电话：${phone}。<br>邮箱：${linkedEmail}。<br><br>发布单位：江苏苏能工业炉有限公司<br><br>技术署名：江苏苏能工业炉工程技术团队</p>`);
    expect(result.html).toBe(`<p id="footer">咨询电话：${phone}<br>邮箱：${linkedEmail}<br>发布单位：江苏苏能工业炉有限公司<br>技术署名：江苏苏能工业炉工程技术团队</p>`);
    expect(format(result.html).html).toBe(result.html);
  });
  it('is idempotent for mixed old and new structures', () => {
    const first = format(`<p>公开邮箱：${linkedEmail}<br>联系电话：${phone}<br>也可通过<a href="/zh/contact">官网入口</a>提交资料。</p>`);
    const second = format(first.html);
    expect(second.html).toBe(first.html);
    expect(second.report.changedBlocks).toBe(0);
  });
  it('moves a legacy byline past the homepage below the contact block', () => {
    const credit = '技术署名：苏能工业炉工程技术团队&amp;唐荔';
    const website = '<p>官网：<a href="https://www.jssngyl.cn">https://www.jssngyl.cn</a></p>';
    const prose = '<p>同样功率不能单独证明使用寿命。</p>';
    const result = format(`${prose}<p id="credit" class="credit">${credit}</p>${website}<p>电话：${phone}<br>邮箱：${linkedEmail}</p>`);
    expect(result.html).toBe(`${prose}${website}<p>电话：${phone}<br>邮箱：${linkedEmail}<br><span id="credit" class="credit">${credit}</span></p>`);
    expect(format(result.html).html).toBe(result.html);
    expect(format(result.html).report.changedBlocks).toBe(0);
  });
  it('separates a combined homepage/byline and keeps the credit directly below email', () => {
    const result = format(`<p id="footer" class="credit">官网：<a href="https://www.jssngyl.cn" title="苏能官网">https://www.jssngyl.cn</a><br>技术署名：<strong>苏能工业炉工程技术团队&amp;唐荔</strong></p><p>电话：${phone}<br>邮箱：${linkedEmail}</p>`);
    expect(result.html).toBe(`<p id="footer" class="credit">官网：<a href="https://www.jssngyl.cn" title="苏能官网">https://www.jssngyl.cn</a></p><p>电话：${phone}<br>邮箱：${linkedEmail}<br><span class="credit">技术署名：<strong>苏能工业炉工程技术团队&amp;唐荔</strong></span></p>`);
    expect(result.root.querySelectorAll('#footer')).toHaveLength(1);
    expect(format(result.html).html).toBe(result.html);
    expect(format(result.html).report.changedBlocks).toBe(0);
  });
  it('does not move a preceding byline across technical prose or an unrelated link', () => {
    for (const separator of ['<p>验收应按约定工况执行。</p>', '<p>官网：<a href="https://example.com">https://example.com</a></p>']) {
      const input = `<p>技术署名：工程技术团队</p>${separator}<p>电话：${phone}<br>邮箱：${email}</p>`;
      expect(format(input).html).toBe(input);
    }
  });

});
