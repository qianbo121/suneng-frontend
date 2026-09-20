import { describe, expect, it } from 'vitest';

import manifestJson from '../../../data/workpiece-router/workpiece-card-manifest.json';
import { DEFAULT_WORKPIECE_DIFFICULTY_POINTS } from '@/lib/workpiece-router-difficulty';
import {
  resolvePublicWorkpieceSelection,
  type WorkpieceRouterPublicCatalog,
} from '@/lib/workpiece-router-public';
import { resolveWorkpieceDirections } from '../../tests/support/legacy-workpiece-router';

describe('workpiece router difficulty points', () => {
  it('keeps all current workpieces populated before process selection', () => {
    const cards = manifestJson.categories.flatMap((category) => category.cards);

    for (const card of cards) {
      expect(resolveWorkpieceDirections({ workpieceId: card.id }).difficultyPoints).toHaveLength(3);
    }
  });

  it('uses a stable fallback when a future workpiece has no dedicated or inherited copy', () => {
    const catalog: WorkpieceRouterPublicCatalog = {
      defaultCategoryId: 'future-category',
      defaultWorkpieceId: 'future-workpiece',
      categories: [
        {
          id: 'future-category',
          label: '未来分类',
          name: '未来分类',
          cards: [
            {
              id: 'future-workpiece',
              name: '未来工件',
              image: '/future.webp',
              alt: '未来工件',
              judgement: '待工程确认',
              contentMode: 'inherited',
            },
          ],
        },
      ],
      routes: [],
      difficultyByWorkpiece: {},
      difficultyByRoute: {},
      difficultyByLogicUnit: {},
      standardDirectionsByWorkpiece: {},
      search: { entries: [], routedAliases: [], broadRules: [] },
    };

    expect(
      resolvePublicWorkpieceSelection(catalog, { workpieceId: 'future-workpiece' })
        .difficultyPoints,
    ).toEqual([...DEFAULT_WORKPIECE_DIFFICULTY_POINTS]);
  });
});
