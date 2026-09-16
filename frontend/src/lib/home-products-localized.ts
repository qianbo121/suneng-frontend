import { homeProductionLines, type HomeProductionLine } from './home-product-types';
import { productCenterProductionLines } from './products-landing-data';

const featuredLineIds = [
  'track-shoe-press-quench-line',
  'forging-waste-heat-qt-line',
  'fastener-quench-temper-line',
];
const featuredHomeLines = featuredLineIds.map((id) => {
  const line = productCenterProductionLines.find((item) => item.id === id);
  if (!line) throw new Error(`Missing featured homepage production line: ${id}`);
  return { ...line, summary: line.process };
});

const lineCopy = [
  {
    title: 'Mesh Belt Annealing & Tempering Line',
    applicable: 'Small and medium steel parts suitable for stable belt loading',
    summary: 'Continuous annealing or tempering of quenched parts',
    steps: ['Load', 'Heat', 'Soak', 'Cool', 'Unload', 'Inspect'],
    accentSteps: ['Heat', 'Soak'],
  },
  {
    title: 'Continuous Copper Wire Annealing Line',
    applicable: 'Copper and suitable copper-alloy wire',
    summary: 'Continuous annealing · Protected cooling',
    steps: ['Pay off', 'Guide', 'Anneal', 'Cool', 'Dry', 'Take up'],
    accentSteps: ['Anneal'],
  },
  {
    title: 'Strip Annealing & Solution Treatment Line',
    applicable: 'Stainless steel and suitable alloy strip',
    summary: 'Annealing or solution treatment · Controlled cooling',
    steps: ['Uncoil', 'Prepare', 'Heat', 'Soak', 'Cool', 'Recoil'],
    accentSteps: ['Heat', 'Soak'],
  },
] as const;

export function getHomeProductionLines(locale: 'zh' | 'en'): readonly HomeProductionLine[] {
  return locale === 'zh' ? featuredHomeLines : homeProductionLines.map((line, index) => ({
    ...line, ...lineCopy[index], imageAlt: lineCopy[index].title,
    temperatureNote: 'Temperature depends on the material and process',
    href: line.href.replace('/zh/', '/en/'),
  }));
}

// Captions follow the existing, reviewed six-stage animation sequence.
export const homeLineMotionCopyEn: Record<string, { stages: readonly string[]; note: string }> = {
  'roller-mesh-belt-line': {
    stages: ['Parts are spread on the mesh belt', 'Parts enter the heating zone', 'Parts pass through the soaking zone', 'Controlled cooling after heat treatment', 'Finished parts leave the belt', 'Inspect parts to the agreed requirements'],
    note: 'Process illustration; parameters depend on material and requirements.',
  },
  'copper-wire-annealing-line': {
    stages: ['Wire feeds from the payoff reel', 'Guides maintain the wire path', 'Wire passes through the annealing section', 'Wire cools under protection', 'Drying is provided where required', 'Annealed wire winds onto the take-up reel'],
    note: 'Process illustration; atmosphere and cooling depend on wire specifications.',
  },
  'annealing-solution-line': {
    stages: ['Strip feeds from the uncoiler', 'Prepare the strip for heating', 'Strip enters the heating section', 'Strip passes through the soaking section', 'Controlled cooling follows the hot zone', 'Treated strip is recoiled'],
    note: 'Process illustration; annealing and solution treatment use distinct recipes.',
  },
};
