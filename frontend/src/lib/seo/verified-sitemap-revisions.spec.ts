import { describe, expect, it } from 'vitest';
import revisions from './verified-sitemap-revisions.json';
import { getVerifiedPublicationDay, getVerifiedSitemapLastModified, verifiedSitemapDay } from './verified-sitemap-revisions';

// Independently reviewed release evidence, not build/commit timestamps:
// e6dbe0a5: six resource links accepted on 2026-10-20 (P30 superseded below).
// b1e4b375: P29's own verified content change on 2026-10-15.
// 002699af: six pages accepted after the 2026-10-21 07:33:05–07:34:05 UTC release.
// fd81a5de: four product pages accepted on 2026-11-14, including two revised October entries.
// Detailed receipts remain in the local frozen post-release review packet.
const acceptedGroups = [
  { date: '2026-10-20', source: 'e6dbe0a5df9b9d44cf91e8812ea44c951121ba11', paths: [
    '/zh/products/detail/box-furnace', '/en/products/detail/box-furnace',
    '/zh/products/detail/trolley-furnace',
  ] },
  { date: '2026-10-15', source: 'b1e4b3759f0da4062948578f93ec2f7952e98577', paths: [
    '/zh/solutions/jiangsu-gongye-lu-changjia',
  ] },
  { date: '2026-10-21', source: '002699af38ec989816262d95bfcdbef37459a711', paths: [
    '/zh/products/detail/roller-hearth-furnace',
    '/zh/solutions/continuous-heat-treatment-line', '/zh/solutions/rechuli-lu-changjia',
  ] },
  { date: '2026-11-14', source: 'fd81a5de7d8a60af137f472263e1fec4f161cc3d', paths: [
    '/zh/products/detail/mesh-belt-furnace', '/en/products/detail/mesh-belt-furnace',
    '/zh/products/detail/fastener-quench-temper-line', '/zh/products/detail/mesh-belt-carbonitriding-line',
  ] },
  { date: '2026-11-15', source: '5248fac668a2d8445d430b3c99f58c86b958fe93', paths: [
    '/zh/products/detail/pit-furnace', '/en/products/detail/pit-furnace',
  ] },
  { date: '2026-11-15', source: 'f74a70e6ecbaa56893869d76d82d1f89aa7154d4', paths: [
    '/zh/products/detail/annealing-solution-line', '/en/products/detail/annealing-solution-line',
    '/en/case', '/en/case/stainless-strip-annealing-supply-scope',
  ] },
  { date: '2026-11-16', source: '9cb72d65e3e6710926c4430d426f67f163a13643', paths: [
    '/zh/case',
    '/en/products/detail/fastener-quench-temper-line',
  ] },
  { date: '2026-09-25', source: '0c0593a81ff4168dccdb9689129ec8ddc7a0af40', release: 'f0c49b68069cedb8d76c25e07b498835bcd0bdb8', paths: [
    '/zh/service/furnace-relocation-restart',
    '/zh/service/selection-retrofit-guide',
  ] },
  { date: '2026-10-05', source: '4edd89718a89b396f6e064dea24310f6b494b845', paths: [
    '/zh/products',
  ] },
  { date: '2026-10-09', source: '882bbc72ecdd682e18febb67e764ff6fb50c3131', release: '3b95c32bd364c6c35505468d6d922b0749ddeaaf', paths: [
    '/zh/service',
  ] },
  { date: '2026-10-10', source: '6b8de877ff9e00546b55db36f0ebf46e0c4d24da', release: 'c57999806f09290c34e49d88d3ebcb96b9d643a6', paths: [
    '/zh/products/detail/copper-wire-annealing-line/inquiry-checklist',
  ] },
  { date: '2026-10-15', source: 'b1e4b3759f0da4062948578f93ec2f7952e98577', paths: [
    '/zh/inquiry',
  ] },
  { date: '2026-10-20', source: '509ca1e4f5de4624a884567d9b7aacc0fe7291d5', release: '1fadaac1f47d3e7dbeda9030d2fd1dbeaeb0d09c', paths: [
    '/en/about',
  ] },
  { date: '2026-11-09', source: '1e73ae4cb4e2fc244452f9d208eda8d3de9539ff', paths: [
    '/zh/products/detail/pusher-furnace',
    '/zh/service/installation-after-sales',
  ] },
  { date: '2026-11-11', source: 'f06596865b4ea9ceda18e8e708f61d373479adb2', paths: [
    '/zh',
  ] },
  { date: '2026-11-14', source: '209445979f8cd14db400a14775f6bf433769b0fa', paths: [
    '/en/products/detail/aluminum-forging-heating-line',
    '/en/products/detail/bell-furnace',
    '/en/products/detail/copper-wire-annealing-line',
    '/en/products/detail/cylinder-curing-line',
    '/en/products/detail/forging-waste-heat-qt-line',
    '/en/products/detail/multi-furnace-quench-cell',
    '/en/products/detail/roller-mesh-belt-line',
    '/en/products/detail/track-shoe-press-quench-line',
    '/en/products/detail/trolley-furnace',
    '/zh/products/detail/aluminum-forging-heating-line',
    '/zh/products/detail/bell-furnace',
    '/zh/products/detail/copper-wire-annealing-line',
    '/zh/products/detail/cylinder-curing-line',
    '/zh/products/detail/forging-waste-heat-qt-line',
    '/zh/products/detail/multi-furnace-quench-cell',
    '/zh/products/detail/roller-mesh-belt-line',
    '/zh/products/detail/track-shoe-press-quench-line',
  ] },
  { date: '2026-11-14', source: '3c5838eef3ec4025b5e31937803a616d2d8890e8', paths: [
    '/en',
    '/en/articles/special-industrial-furnace-procurement-assessment',
    '/en/products',
    '/en/products/detail/copper-wire-annealing-line/inquiry-checklist',
    '/en/products/detail/pusher-furnace',
    '/en/products/detail/roller-hearth-furnace',
    '/en/products/detail/rotary-hearth-furnace',
    '/en/service',
    '/en/service/furnace-relocation-restart',
    '/en/service/furnace-renovation-overhaul',
    '/en/service/installation-after-sales',
    '/en/service/selection-retrofit-guide',
    '/zh/about',
    '/zh/products/detail/rotary-hearth-furnace',
    '/zh/service/industrial-furnace-parts-purchasing',
  ] },
  { date: '2026-11-15', source: '184f6c49c0591029d3050abdbfcdf63b401c3262', paths: [
    '/en/products/detail/aluminum-solution-aging-line',
    '/en/products/detail/mesh-belt-carbonitriding-line',
    '/zh/products/detail/aluminum-solution-aging-line',
  ] },
  { date: '2026-11-15', source: 'f74a70e6ecbaa56893869d76d82d1f89aa7154d4', release: '5248fac668a2d8445d430b3c99f58c86b958fe93', paths: [
    '/en/news',
    '/zh/news',
  ] },
  { date: '2026-11-15', source: 'f16e01b4cf7661e94717606ba8def638349a8083', paths: [
    '/en/products/detail/elevator-hearth-furnace',
    '/en/products/detail/gas-nitriding-furnace',
    '/en/products/detail/shovel-furnace',
    '/en/products/detail/walking-beam-furnace',
    '/zh/products/detail/elevator-hearth-furnace',
    '/zh/products/detail/gas-nitriding-furnace',
    '/zh/products/detail/shovel-furnace',
    '/zh/products/detail/walking-beam-furnace',
  ] },
  { date: '2026-11-16', source: 'e2a686f5662f1c9bc959b3fe7d9d1537c60df993', paths: [
    '/en/about',
    '/en/case/stainless-strip-annealing-supply-scope',
    '/en/news/bearing-steel-wire-spheroidizing-pit-bell-furnace-selection',
    '/en/news/bolt-mesh-belt-quench-temper-capability',
    '/en/news/bolts-nuts-shared-heat-treatment-line-loading-transfer',
    '/en/news/carbon-steel-self-drilling-screw-carburizing-line-selection',
    '/en/news/coil-annealing-soaking-time-start',
    '/en/news/cold-coiled-compression-spring-stress-relief-furnace-manufacturers',
    '/en/news/custom-heat-treatment-furnace-chamber-process',
    '/en/news/fastener-mesh-belt-furnace-manufacturers',
    '/en/news/fastener-quench-temper-line-furnace-maker-or-integrator',
    '/en/news/gas-cylinder-curing-oven-slow-heating',
    '/en/news/gas-trolley-furnace-operation-maintenance-documents',
    '/en/news/grade-10-nut-mesh-belt-line-capability',
    '/en/news/heat-treatment-basket-turnover-quantity',
    '/en/news/heat-treatment-line-integrator-or-furnace-maker',
    '/en/news/heat-treatment-line-multi-supplier-responsibility-acceptance',
    '/en/news/heat-treatment-line-turnkey-supply-scope',
    '/en/news/industrial-furnace-cooling-water-total-branch-flow',
    '/en/news/jiangsu-industrial-furnace-process-fit',
    '/en/news/long-bolt-quench-temper-pit-mesh-belt-furnace-selection',
    '/en/news/long-gas-cylinder-curing-oven-mandrel-trolley-selection',
    '/en/news/mesh-belt-furnace-carbon-cleaning-review',
    '/en/news/mesh-belt-furnace-oil-fume-treatment-checklist',
    '/en/news/mesh-belt-furnace-quality-tracking-checklist',
    '/en/news/mesh-belt-quenching-furnace-principle-process-checklist',
    '/en/news/multi-station-curing-oven-independent-operation',
    '/en/news/outsourced-quench-tank-washer-problem-responsibility',
    '/en/news/resistance-heating-element-power-surface-loading-life',
    '/en/news/self-tapping-screw-carbonitriding-line-selection',
    '/en/news/shuju-news-21',
    '/en/news/suneng-furnace-manufacturing-system-integration',
    '/en/news/suneng-industrial-furnace-types-heat-treatment-lines',
    '/en/news/titanium-alloy-thick-plate-roller-hearth-furnace-selection',
    '/en/news/variable-volume-bogie-furnace-gas-consumption-comparison',
    '/en/news/wheel-hub-mould-preheating-furnace-changeover-selection',
    '/en/products/detail/aluminum-forging-heating-line',
    '/en/products/detail/aluminum-solution-aging-line',
    '/en/products/detail/cylinder-curing-line',
    '/en/products/detail/fastener-quench-temper-line',
    '/en/products/detail/fastener-quench-temper-line/cqi-9',
    '/en/products/detail/forging-waste-heat-qt-line',
    '/en/products/detail/mesh-belt-carbonitriding-line',
    '/en/products/detail/track-shoe-press-quench-line',
    '/en/service/furnace-renovation-overhaul',
    '/zh/about',
    '/zh/news/heat-treatment-line-fat-single-machine-acceptance',
    '/zh/news/outsourced-quench-tank-washer-problem-responsibility',
    '/zh/news/red-adhesive-curing-test-oven-temperature-records',
    '/zh/news/shuju-news-25',
    '/zh/news/shuju-news-26',
  ] },
];
const releasedCases = [
  'bright-quench-design', 'crankshaft-annual-output', 'cylinder-liner-solution-aging',
  'fastener-mesh-belt-quenching-carburizing', 'overseas-austemper', 'overseas-oil-quench',
  'roller-belt-cooling-water-supply', 'roller-belt-stage-output', 'standard-parts-capacity', 'steering-forgings',
];
const now = new Date('2026-10-22T12:00:00Z');

describe('verified sitemap revision evidence', () => {
  it('allows only the reviewed page, language, day and source combinations', () => {
    const accepted = Object.fromEntries(acceptedGroups.flatMap((group) => group.paths.map((path) =>
      [path, { modifiedOn: group.date, sourceCommit: group.source, ...(group.release ? { releaseCommit: group.release } : {}) }])));
    for (const slug of releasedCases) {
      for (const locale of ['zh', 'en']) {
        const path = `/${locale}/case/${slug}`;
        const firstPublished = path !== '/zh/case/fastener-mesh-belt-quenching-carburizing';
        accepted[path] = { modifiedOn: '2026-11-15', sourceCommit: '184f6c49c0591029d3050abdbfcdf63b401c3262',
          ...(firstPublished ? { publishedOn: '2026-11-15' } : {}) };
        expect(getVerifiedPublicationDay(path, new Date('2026-11-15T12:00:00Z'))).toBe(firstPublished ? '2026-11-15' : undefined);
      }
    }
    expect(revisions).toEqual(accepted);
    for (const [path, revision] of Object.entries(accepted)) {
      expect(getVerifiedSitemapLastModified(path, new Date(revision.modifiedOn))).toBe(revision.modifiedOn);
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
