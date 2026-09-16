import { describe, expect, it } from 'vitest';

import directionRulesJson from '../../../data/workpiece-router/industry-direction-rules.json';
import approvedCandidateJson from '../../../data/workpiece-router/industry-public-baseline-candidate-batch2.5-candidate-v2.json';
import labelMappingJson from '../../../data/workpiece-router/industry-public-label-mapping.json';
import routesJson from '../../../data/workpiece-router/process-routes.json';
import manifestJson from '../../../data/workpiece-router/workpiece-card-manifest.json';
import { buildStandardPracticeDirections } from '@/lib/workpiece-router-standard-practice';

const workpieceNames = Object.fromEntries(
  manifestJson.categories.flatMap((category) =>
    category.cards.map((card) => [card.id, card.name] as const),
  ),
);

const directions = buildStandardPracticeDirections({
  rules: directionRulesJson.rules,
  routes: routesJson.routes,
  labelMapping: labelMappingJson,
  approvedCandidate: approvedCandidateJson,
  workpieceNames,
});

describe('industry standard-practice direction examples', () => {
  it('covers ordinary whole-component workpieces without opening special processes', () => {
    expect(Object.keys(directions)).toHaveLength(36);
    for (const workpieceId of [
      'seamless-aluminum-gas-cylinder',
      'seamless-steel-gas-cylinder',
      'welded-steel-gas-cylinder',
      'large-die-block-forging',
      'aluminum-alloy-plate',
      'stainless-steel-plate',
    ]) {
      expect(directions).not.toHaveProperty(workpieceId);
    }
  });

  it('gives the default welded workpiece a common car-bottom direction', () => {
    expect(directions['large-welded-machine-frame'].examples).toEqual(
      expect.arrayContaining([expect.objectContaining({ direction: '台车式去应力处理炉' })]),
    );
  });

  it('keeps the approved narrowed name and standard direction for forged flanges', () => {
    expect(directions['large-forged-flange']).toMatchObject({
      displayWorkpieceName: '大型锻制法兰',
      examples: [
        {
          condition: '正火、单独回火、退火',
          direction: '台车式周期炉',
        },
      ],
    });
  });

  it('returns at most three public examples and leaks no internal rule identifiers', () => {
    for (const item of Object.values(directions))
      expect(item.examples.length).toBeLessThanOrEqual(3);
    expect(JSON.stringify(directions)).not.toContain('eqdir-');
    expect(JSON.stringify(directions)).not.toMatch(/局部焊后|现场焊后/);
  });
});
