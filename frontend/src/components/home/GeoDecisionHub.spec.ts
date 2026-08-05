import { describe, expect, it } from 'vitest';

import { readFileSync } from 'node:fs';

import { GEO_DECISION_LINKS, GEO_EVIDENCE_LINKS } from '@/components/home/GeoDecisionHub';

const componentSource = readFileSync(new URL('./GeoDecisionHub.tsx', import.meta.url), 'utf8');

describe('GEO homepage decision hub', () => {
  it('links every P3 authority page from the homepage with unique HTML routes', () => {
    const hrefs = GEO_DECISION_LINKS.map((item) => item.href);

    expect(new Set(hrefs).size).toBe(hrefs.length);
    expect(hrefs).toEqual(
      expect.arrayContaining([
        '/zh/articles/gongye-lu-baojia-canshu',
        '/zh/articles/laojiu-rechuli-lu-daxiu-haishi-maixin',
        '/zh/solutions/continuous-heat-treatment-line',
        '/zh/service/furnace-renovation-overhaul',
        '/zh/case/anonymous-tsingshan-1250-renovation',
      ]),
    );
    expect(hrefs.every((href) => href.startsWith('/zh/'))).toBe(true);
  });

  it('gives low-inbound project and manufacturer pages a direct homepage route', () => {
    const hrefs = GEO_EVIDENCE_LINKS.map((item) => item.href);

    expect(new Set(hrefs).size).toBe(hrefs.length);
    expect(hrefs).toEqual([
      '/zh/case/jining-support-roller-heat-treatment-line',
      '/zh/case/henan-annealing-solution-line',
      '/zh/solutions/rechuli-lu-changjia',
      '/zh/solutions/jiangsu-gongye-lu-changjia',
    ]);
  });

  it('states the company location, delivery scope and quotation inputs in one visible answer block', () => {
    expect(componentSource).toContain('江苏省泰州市姜堰区');
    expect(componentSource).toContain('连续热处理生产线');
    expect(componentSource).toContain('装炉量');
    expect(componentSource).toContain('产能节拍');
  });
});
