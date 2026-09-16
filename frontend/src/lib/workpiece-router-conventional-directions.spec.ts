import { describe, expect, it } from 'vitest';

import finalDirectionsJson from '../../../data/workpiece-router/industry-final-directions.json';
import workpieceManifestJson from '../../../data/workpiece-router/workpiece-card-manifest.json';

describe('industry final workpiece directions', () => {
  it('covers every homepage workpiece with exactly two visible conditions', () => {
    const workpieces = workpieceManifestJson.categories.flatMap((category) => category.cards);
    const directions = finalDirectionsJson.directions;

    expect(Object.keys(directions)).toHaveLength(workpieces.length);
    for (const workpiece of workpieces) {
      const entry = directions[workpiece.id as keyof typeof directions];
      expect(entry?.displayWorkpieceName).toBe(workpiece.name);
      expect(entry?.examples).toHaveLength(2);
      expect(entry?.examples.map((example) => example.position)).toEqual([1, 2]);
      expect(new Set(entry?.examples.map((example) => example.condition)).size).toBe(2);
      expect(entry?.examples.every((example) => example.direction.trim().length > 0)).toBe(true);
      expect(entry?.examples.every((example) => example.boundary.trim().length > 0)).toBe(true);
      expect(entry?.examples.every((example) => example.condition.length <= 12)).toBe(true);
      expect(entry?.examples.every((example) => example.direction.length <= 11)).toBe(true);
    }
  });

  it('keeps all nine conditional conditions and their boundaries explicit', () => {
    const conditional = Object.entries(finalDirectionsJson.directions).flatMap(
      ([workpieceId, entry]) =>
        entry.examples
          .filter((example) => example.adoption === '有条件采用')
          .map((example) => `${workpieceId}#${example.position}`),
    );
    expect(conditional.sort()).toEqual(
      [
        'structural-steel-component#2',
        'large-die-block-forging#2',
        'medium-heavy-steel-plate#2',
        'stainless-steel-plate#2',
        'structural-section-steel#1',
        'structural-section-steel#2',
        'track-link#1',
        'track-link#2',
        'welded-pipe-spool#2',
      ].sort(),
    );
  });

  it('removes the disputed or weak public examples from the finalized dataset', () => {
    const serialized = JSON.stringify(finalDirectionsJson.directions);
    expect(serialized).not.toContain('高强钢焊接构件焊后消氢处理');
    expect(serialized).not.toContain('齿前退火');
    expect(serialized).not.toContain('稳定化处理（仅钛或铌稳定化奥氏体不锈钢');
    expect(finalDirectionsJson.directions['gear-shaft'].examples[1].condition).toContain(
      '整体调质',
    );
    expect(finalDirectionsJson.directions['spline-shaft'].examples[1].condition).toContain(
      '整体调质',
    );
    expect(finalDirectionsJson.directions['structural-section-steel'].displayWorkpieceName).toBe(
      '需热处理型钢',
    );
    expect(finalDirectionsJson.directions['wire-rod-coil'].examples[1].condition).toBe(
      '成卷软化/等温退火',
    );
    expect(finalDirectionsJson.directions['steel-wire-coil'].examples[1].condition).toBe(
      '冷拔后再结晶退火',
    );
    expect(finalDirectionsJson.directions['small-coil-springs'].examples[0].condition).toBe(
      '冷卷后去应力回火',
    );
    expect(finalDirectionsJson.directions['self-drilling-screws'].examples[0].condition).toContain(
      '碳氮共渗',
    );
  });
});
