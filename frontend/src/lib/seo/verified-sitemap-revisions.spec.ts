import { describe, expect, it } from 'vitest';
import revisions from './verified-sitemap-revisions.json';
import { getVerifiedSitemapLastModified, verifiedSitemapDay } from './verified-sitemap-revisions';

// Independently reviewed release evidence, not build/commit timestamps:
// e6dbe0a5: six resource links accepted on 2026-10-20 (P30 superseded below).
// b1e4b375: P29's own verified content change on 2026-10-15.
// 002699af: six pages accepted after the 2026-10-21 07:33:05–07:34:05 UTC release.
// Detailed receipts remain in the local frozen post-release review packet.
const acceptedGroups = [
  { date: '2026-10-20', source: 'e6dbe0a5df9b9d44cf91e8812ea44c951121ba11', paths: [
    '/zh/products/detail/box-furnace', '/en/products/detail/box-furnace',
    '/zh/products/detail/pit-furnace', '/en/products/detail/pit-furnace',
    '/zh/products/detail/trolley-furnace',
  ] },
  { date: '2026-10-15', source: 'b1e4b3759f0da4062948578f93ec2f7952e98577', paths: [
    '/zh/solutions/jiangsu-gongye-lu-changjia',
  ] },
  { date: '2026-10-21', source: '002699af38ec989816262d95bfcdbef37459a711', paths: [
    '/zh/products/detail/annealing-solution-line', '/zh/products/detail/fastener-quench-temper-line',
    '/zh/products/detail/mesh-belt-carbonitriding-line', '/zh/products/detail/roller-hearth-furnace',
    '/zh/solutions/continuous-heat-treatment-line', '/zh/solutions/rechuli-lu-changjia',
  ] },
];
const now = new Date('2026-10-22T12:00:00Z');

describe('verified sitemap revision evidence', () => {
  it('allows only the reviewed page, language, day and source combinations', () => {
    const accepted = Object.fromEntries(acceptedGroups.flatMap((group) => group.paths.map((path) =>
      [path, { modifiedOn: group.date, sourceCommit: group.source }])));
    expect(revisions).toEqual(accepted);
    expect(Object.keys(revisions)).toHaveLength(12);
    for (const [path, revision] of Object.entries(accepted)) {
      expect(getVerifiedSitemapLastModified(path, now)).toBe(revision.modifiedOn);
    }
  });

  it.each(['', 'not-a-date', '2026-2-03', '2026-02-29', '2026-04-31', '2026-13-01',
    '2026-10-00', '2026-10-20T00:00:00Z', '2026-10-23', '2999-01-01'])
  ('omits invalid, invented-precision or future dates: %s', (value) => {
    expect(verifiedSitemapDay(value, now)).toBeUndefined();
  });

  it('preserves valid calendar days and only accepts leap day in a leap year', () => {
    expect(verifiedSitemapDay('2024-02-29', now)).toBe('2024-02-29');
    expect(verifiedSitemapDay('2026-10-22', now)).toBe('2026-10-22');
    expect(verifiedSitemapDay('2026-10-20', new Date('invalid'))).toBeUndefined();
    expect(getVerifiedSitemapLastModified('/zh/solutions/rechuli-lu-changjia', new Date('2026-10-20T23:59:59Z'))).toBeUndefined();
  });

  it.each(['/zh', '/en/products/detail/trolley-furnace', '/en/solutions/rechuli-lu-changjia',
    '/zh/products/detail/box-furnace/', '/zh/products/detail/box-furnace?x=1',
    'https://www.jssngyl.cn/zh/products/detail/box-furnace', '__proto__', 'toString'])
  ('does not extend the release evidence to unmatched paths: %s', (path) => {
    expect(getVerifiedSitemapLastModified(path, now)).toBeUndefined();
  });
});
