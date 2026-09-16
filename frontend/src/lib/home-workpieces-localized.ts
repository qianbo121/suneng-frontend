import englishCopy from './home-workpieces-en.json';
import type { WorkpieceRouterPublicCatalog } from './workpiece-router-public';

type WorkpieceCopy = { name: string; judgement: string; examples: Array<{ condition: string; direction: string; boundary: string }> };
const copy: Record<string, WorkpieceCopy> = englishCopy;
const categoryNames: Record<string, string> = {
  'welded-structures': 'Welded structures', 'gas-cylinders': 'Gas cylinders',
  'heavy-cast-forged': 'Heavy castings & forgings', 'shafts-gears': 'Shafts & gears',
  'engineering-wheels': 'Heavy equipment wheels', 'plate-strip-coil': 'Plate, strip & coil',
  'pipe-bar-wire': 'Pipe, bar & wire', 'fasteners-batch': 'Fasteners & small parts',
};

// Preserve catalog IDs and selection behavior. Display only the localized,
// reviewed source directions; never fall back to untranslated remote copy.
export function localizeHomeWorkpieces(catalog: WorkpieceRouterPublicCatalog): WorkpieceRouterPublicCatalog {
  return {
    ...catalog,
    publicDirectionExamplesEnabled: false,
    categories: catalog.categories.map((category) => ({
      ...category, label: categoryNames[category.id], name: categoryNames[category.id],
      cards: category.cards.map((card) => ({
        ...card, name: copy[card.id].name, alt: copy[card.id].name, judgement: copy[card.id].judgement,
      })),
    })),
    standardDirectionsByWorkpiece: Object.fromEntries(Object.entries(copy).map(([id, item]) => [id, {
      displayWorkpieceName: item.name, examples: item.examples,
    }])),
    difficultyByWorkpiece: Object.fromEntries(Object.entries(copy).map(([id, item]) => [id, [item.judgement]])),
    difficultyByRoute: {},
    difficultyByLogicUnit: {},
  };
}
