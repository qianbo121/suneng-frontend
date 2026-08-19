import { readFileSync } from 'node:fs';
import { join } from 'node:path';

/**
 * Promise.all 的解构顺序必须和查询顺序严格一一对应。
 * 错位不会报错，只会把落地页数据当成地区数据用——静默出错，最难查。
 * 2026-08-19 加地区查询时，同类错位已经让两处按调用次序喂值的 mock 崩过。
 */
const source = readFileSync(join(__dirname, 'shuju-growth-read.service.ts'), 'utf8');

// 解构名 → 它那条查询该返回的行类型
const EXPECTED: [string, string][] = [
  ['counts', 'CountRow'],
  ['daily', 'DailyRow'],
  ['sources', 'SourceRow'],
  ['sourceDetails', 'SourceRow'],
  ['landings', 'LandingRow'],
  ['regions', 'RegionRow'],
  ['pages', 'PageRow'],
  ['segments', 'SegmentRow'],
  ['funnelRows', 'FunnelRow'],
  ['botRows', 'BotRow'],
  ['pageFunnelRows', 'PageFunnelRow'],
  ['unverifiedRows', 'BotRow'],
];

describe('growth overview query wiring', () => {
  it('destructures the main Promise.all in exactly the order the queries run', () => {
    const start = source.indexOf('      unverifiedRows,\n    ] = await Promise.all([');
    expect(start).toBeGreaterThan(-1);

    const declared = source
      .slice(source.lastIndexOf('const [', start), start + 'unverifiedRows,'.length + 6)
      .split('\n')
      .map((line) => line.trim().replace(/,$/, ''))
      .filter((line) => line && line !== 'const [' && !line.includes(']'));

    const queryTypes = [...source.slice(start).matchAll(/\$queryRaw<(\w+)\[\]>/g)].map(
      (match) => match[1],
    );

    expect(declared).toEqual(EXPECTED.map(([name]) => name));
    expect(queryTypes.slice(0, EXPECTED.length)).toEqual(EXPECTED.map(([, type]) => type));
    // 数量也要对得上，多一条少一条都会让后面全体错位
    expect(queryTypes).toHaveLength(EXPECTED.length);
  });
});
