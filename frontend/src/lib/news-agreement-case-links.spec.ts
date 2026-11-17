import { describe, expect, it } from 'vitest';
import { isHiddenCaseEntry } from './publication-scope';
import { prepareNewsArticleHtml } from './sanitize';

const references = [
  [
    "mesh-belt-screw-quenching-carburizing-output",
    "fastener-mesh-belt-quenching-carburizing"
  ],
  [
    "mesh-belt-line-cooling-tower-pump-supply",
    "roller-belt-cooling-water-supply"
  ],
  [
    "mesh-belt-line-cooling-tower-pump-supply",
    "roller-belt-stage-output"
  ],
  [
    "500mm-mesh-belt-austempering-hourly-output",
    "overseas-austemper"
  ],
  [
    "mesh-belt-quenching-tempering-output-addition",
    "roller-belt-stage-output"
  ],
  [
    "oil-quench-temper-300kg-whole-line-output",
    "overseas-oil-quench"
  ],
  [
    "mesh-belt-u-bolt-maximum-output-specification",
    "standard-parts-capacity"
  ],
  [
    "crankshaft-annual-pieces-hourly-throughput",
    "crankshaft-annual-output"
  ],
  [
    "bright-quenching-one-tonne-hour-selection-inputs",
    "bright-quench-design"
  ],
  [
    "steering-forging-shared-normalizing-quenching-furnace",
    "steering-forgings"
  ],
  [
    "aluminum-liner-solution-furnace-basket-weight",
    "cylinder-liner-solution-aging"
  ]
] as const;

describe('approved bilingual article case references', () => {
  it.each(['zh', 'en'])('preserves all eleven approved %s references in rendered article HTML', (locale) => {
    for (const [articleSlug, caseSlug] of references) {
      for (const prefix of ['', 'https://www.jssngyl.cn', 'https://jssngyl.cn']) {
        const href = `${prefix}/${locale}/case/${caseSlug}`;
        const html = prepareNewsArticleHtml(`<p>Website case <a href="${href}">${href}</a></p>`, { articleSlug, locale });
        expect(html).toContain(`href="${href}"`);
      }
    }
  });

  it('keeps unapproved sources, unrelated cases and other languages outside the exception', () => {
    for (const [slug, caseSlug] of references) {
      const source = `/en/news/${slug}`;
      expect(isHiddenCaseEntry(`/en/case/${caseSlug}`, '/en/news/other-article')).toBe(true);
      expect(isHiddenCaseEntry('/en/case/unpublished-project', source)).toBe(true);
      expect(isHiddenCaseEntry('/en/case/stainless-strip-annealing-supply-scope', source)).toBe(true);
      expect(isHiddenCaseEntry(`/en/case/${caseSlug}`, `/zh/news/${slug}`)).toBe(true);
      expect(isHiddenCaseEntry(`/en/case/${caseSlug}/extra`, source)).toBe(true);
    }
  });
});
