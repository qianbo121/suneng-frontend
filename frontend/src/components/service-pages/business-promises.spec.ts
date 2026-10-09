import { createRequire } from 'node:module';
import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it, vi } from 'vitest';

vi.mock('next/navigation', () => ({
  useParams: () => ({ locale: 'zh' }),
  usePathname: () => '/zh/service',
  notFound: () => { throw new Error('404'); },
}));

import { QuoteContent } from '@/components/geo-pages/reviewed/QuoteContent';
import FurnaceRenovationPage from '@/app/[locale]/service/furnace-renovation-overhaul/page';
import { ServicePageView } from './ServicePages';

const load = createRequire(import.meta.url);
const { JSDOM }: { JSDOM: new (html: string) => { window: { document: Document } } } =
  createRequire(load.resolve('isomorphic-dompurify'))('jsdom');
const documentOf = (html: string) => new JSDOM(html).window.document;

function singleText(doc: Document, selector: string) {
  const nodes = doc.querySelectorAll(selector);
  expect(nodes, selector).toHaveLength(1);
  return nodes[0].textContent ?? '';
}

describe('restored business conditions stay qualified and within their original pages', () => {
  it('keeps the usual one-day response attached to an initial judgment and its conditions', () => {
    const doc = documentOf(renderToStaticMarkup(createElement(QuoteContent)));
    const text = singleText(doc, '#process .notice p');
    expect(text).toContain('通常 1 个工作日内进行初步判断');
    expect(text).toContain('具体回复时间以项目复杂度和资料完整度为准');
    expect(text).toContain('现场条件');
    expect(text).toContain('可能需要进一步勘查');
    expect(text).not.toMatch(/1 个工作日内.{0,8}(正式报价|形成报价|完成设计)/);
  });

  it.each(['zh', 'en'] as const)('%s overhaul rendering retains both warranty clocks, contract priority and exclusions', async (locale) => {
    const doc = documentOf(renderToStaticMarkup(await FurnaceRenovationPage({ params: Promise.resolve({ locale }) })));
    const term = singleText(doc, '#acceptance [data-warranty-term]');
    const exclusions = singleText(doc, '#acceptance [data-warranty-exclusions]');
    const acceptance = doc.querySelector('#acceptance')!.textContent ?? '';
    if (locale === 'zh') {
      for (const condition of ['通常', '最终验收合格后 12 个月', '设备发货后 18 个月', '以先到者为准', '具体起算时间、适用范围及分项期限以合同为准']) expect(term).toContain(condition);
      for (const condition of ['设计、制造、材料和安装质量', '合同质保', '加热元件、密封件、热电偶', '正常易损耗件', '违规操作、擅自改造、超载超温', '通常不在通用质保范围内']) expect(exclusions).toContain(condition);
      expect(acceptance).toContain('改造部分、保留旧件及易损件');
    } else {
      for (const condition of ['normally', '12 months after final acceptance', '18 months after shipment', 'whichever comes first', 'contract', 'start date', 'applicable scope', 'separate component periods']) expect(term).toContain(condition);
      for (const condition of ['design, manufacturing, materials or installation quality', 'contractual warranty', 'Normal wear', 'heating elements, seals and thermocouples', 'improper operation', 'unauthorized modifications', 'overloading', 'excessive temperatures', 'normally outside']) expect(exclusions).toContain(condition);
      expect(acceptance).toContain('retained old parts');
      expect(term + exclusions).not.toMatch(/[\u3400-\u9fff]/);
    }
  });

  it.each(['zh', 'en'] as const)('%s directory distinguishes hotline response and handling-plan reply from site visits', (locale) => {
    const doc = documentOf(renderToStaticMarkup(createElement(ServicePageView, { kind: 'overview', locale })));
    const response = singleText(doc, '#service-process [data-service-response-policy]');
    const contract = singleText(doc, '#service-process [data-service-response-contract]');
    if (locale === 'zh') {
      for (const condition of ['客户服务热线 8 小时内响应', '技术服务团队 24 小时内答复处理方案', '现场上门服务依据合同约定、设备状态、现场工况和服务距离安排']) expect(response).toContain(condition);
      for (const condition of ['问题影响等级', '合同约定的服务条款', '停产损失补偿', '以合同条款为准']) expect(contract).toContain(condition);
      expect(response).not.toMatch(/(8|24) 小时内(上门|到场|解决|修复)/);
    } else {
      for (const condition of ['hotline responds within 8 hours', 'technical service team replies with a handling plan within 24 hours', 'On-site visits', 'contract, equipment status, site conditions and service distance']) expect(response).toContain(condition);
      for (const condition of ['impact level', 'service terms agreed in the contract', 'production-loss matters', 'subject to the contract terms']) expect(contract).toContain(condition);
      expect(response + contract).not.toMatch(/[\u3400-\u9fff]/);
    }
  });

  it.each(['installation', 'relocation'] as const)('does not expand the restored response policy to the %s page', (kind) => {
    for (const locale of ['zh', 'en'] as const) {
      const doc = documentOf(renderToStaticMarkup(createElement(ServicePageView, { kind, locale })));
      expect(doc.querySelector('[data-service-response-policy]')).toBeNull();
      expect(doc.querySelector('[data-service-response-contract]')).toBeNull();
    }
  });
});
