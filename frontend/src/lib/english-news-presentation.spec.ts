import { describe, expect, it } from 'vitest';
import { localizeEnglishNewsPresentation as localize } from './english-news-presentation';

describe('English article presentation corrections', () => {
  it('updates only the available English service link and its obsolete language label', () => {
    const input = '<a href="/zh/service/furnace-renovation-overhaul">Furnace Retrofit and Overhaul Services (Chinese)</a><a href="/zh/partner">Partners (Chinese)</a>';
    expect(localize(input)).toBe('<a href="/en/service/furnace-renovation-overhaul">Furnace Retrofit and Overhaul Services</a><a href="/en/partner">Partners</a>');
    expect(localize('<a href="https://www.jssngyl.cn/zh/service/furnace-renovation-overhaul/">Review</a>')).toContain('href="/en/service/furnace-renovation-overhaul"');
  });
  it('uses the reviewed English diagram without changing unrelated images or safety notes', () => {
    const html = '<img src="https://www.jssngyl.cn/uploads/2026/09/1790149369676-c3722071-50ea-46f9-b44d-378de3848595.webp" width="1448" height="1086"><img src="/unrelated.webp"><p>Follow project safety documents. Diagram labels are in Chinese; the checking logic is explained above in English.</p>';
    expect(localize(html, 'atmosphere-furnace-pressure-fluctuation-process-or-equipment')).toBe('<img src="/images/news/english/atmosphere-pressure-review.svg" width="1000" height="905"><img src="/unrelated.webp"><p>Follow project safety documents.</p>');
    expect(localize(html, 'unrelated')).toBe(html);
  });
  it('does not remove the language disclosure unless its original illustration is replaced', () => {
    const html = '<p> Diagram labels are in Chinese; the checking logic is explained above in English.</p>';
    expect(localize(html, 'atmosphere-furnace-pressure-fluctuation-process-or-equipment')).toBe(html);
  });
  it('translates inquiry keywords only in the matching articles', () => {
    expect(localize('标准版本与技术协议核对', 'gb-t-30825-2026-heat-treatment-furnace-procurement')).toBe('standard edition and technical agreement review');
    expect(localize('台车炉月产能核对', 'steel-annealing-500-tonnes-two-bogie-hearth-furnaces-capacity')).toBe('bogie-hearth furnace monthly capacity review');
    expect(localize('标准版本与技术协议核对', 'unrelated')).toBe('标准版本与技术协议核对');
  });
});
