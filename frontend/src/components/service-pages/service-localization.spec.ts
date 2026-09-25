import { describe, expect, it } from 'vitest';
import * as content from './service-content';
import { renovationFaqs, repairSystems } from '../engineering/engineering-content';
import { localizeServiceContent, serviceHref } from './service-localization';
import { getEnglishProductionLineContent } from '@/lib/production-line-content-en';
import { englishProductionLines } from '@/lib/english-production-lines';

function compare(source: unknown, translated: unknown) {
  if (typeof source === 'string') {
    expect(typeof translated).toBe('string');
    expect(translated).not.toMatch(/[\u3400-\u9fff]/);
    if (!/[\u3400-\u9fff]/.test(source)) expect(translated).toBe(serviceHref(source, 'en'));
  } else if (Array.isArray(source)) {
    expect(translated).toHaveLength(source.length);
    source.forEach((item, i) => compare(item, (translated as unknown[])[i]));
  } else if (source && typeof source === 'object') {
    expect(Object.keys(translated as object)).toEqual(Object.keys(source));
    Object.entries(source).forEach(([key, item]) => compare(item, (translated as Record<string, unknown>)[key]));
  } else expect(translated).toEqual(source);
}

describe('service and product content source consistency', () => {
  it('uses verified English service articles while preserving Chinese-only links and query state', () => {
    const articles = [
      '/zh/news/gong-ye-lu-gai-zao-yan-shou-kan-na-xie-zhi-biao-cong-wen-du-jun-yun-xing-neng-hao-dao-kong-zhi-xi-tong-wen-ding-xing',
      '/zh/news/re-chu-li-lu-jie-neng-gai-zao-duo-shao-qian-fei-yong-gou-cheng-yu-suan-ying-xiang-yin-su-he-xun-jia-qian-zhun-bei',
    ];
    for (const path of articles) {
      expect(serviceHref(path, 'en')).toBe(path.replace('/zh/', '/en/'));
      expect(serviceHref(`${path}/?source=service#checklist`, 'en'))
        .toBe(`${path.replace('/zh/', '/en/')}/?source=service#checklist`);
      expect(serviceHref(path, 'zh')).toBe(path);
    }
    const untranslated = '/zh/news/not-yet-translated?source=service#details';
    expect(serviceHref(untranslated, 'en')).toBe(untranslated);
  });
  it('keeps service records, assets, tables and FAQ scope tied to the Chinese source', () => {
    const source = { ...content, renovationFaqs, repairSystems };
    const before = JSON.stringify(source);
    compare(source, localizeServiceContent(source, 'en'));
    expect(JSON.stringify(source)).toBe(before);
    expect(localizeServiceContent(source, 'zh')).toBe(source);
  });
  it('preserves material service boundaries in translation', () => {
    const faq = localizeServiceContent(renovationFaqs, 'en');
    expect(faq.find((item) => item.question.includes('electricity can'))?.answer).toContain('not guarantees');
    expect(localizeServiceContent(content.servicePages.relocation, 'en').faqs[0].answer).toContain('verify them again');
    expect(localizeServiceContent(content.warrantyItems, 'en')[0].text).toContain('as agreed in the contract');
  });
  it('uses the same translated product source for the page and search summary', () => {
    for (const line of englishProductionLines) {
      const page = getEnglishProductionLineContent(line.slug)!;
      expect(line.seoTitle).toBe(page.seo.title);
      expect(line.description).toBe(page.seo.description);
      expect(line.title).toBe(page.sections.overview.title);
    }
  });
});
