import productionLineHeroImages from './production-line-hero-images.json';
import fastener from './fastener-line-content.json';
import aluminumForging from './production-lines/aluminum-forging-heating-line.json';
import aluminumSolution from './production-lines/aluminum-solution-aging-line.json';
import strip from './production-lines/annealing-solution-line.json';
import copper from './production-lines/copper-wire-annealing-line.json';
import curing from './production-lines/cylinder-curing-line.json';
import forging from './production-lines/forging-waste-heat-qt-line.json';
import carburizing from './production-lines/mesh-belt-carbonitriding-line.json';
import cell from './production-lines/multi-furnace-quench-cell.json';
import mesh from './production-lines/roller-mesh-belt-line.json';
import track from './production-lines/track-shoe-press-quench-line.json';
import type { LineFormField, LineVariant, ProductionLineContent } from './production-line-types';
import { productionLineVariants } from './production-line-variants';

const fastenerTable = (table: typeof fastener.sections.comparison.table) => ({
  ...table,
  rows: table.rows.map(({ item, continuous, batch }) => ({ item, cells: [continuous, batch] })),
});

const fastenerPage: ProductionLineContent = {
  ...fastener,
  pageId: 'fastener-quench-temper-line',
  variant: 'mesh',
  sections: {
    ...fastener.sections,
    process: { ...fastener.sections.process, mode: 'linear' },
    comparison: {
      ...fastener.sections.comparison,
      table: fastenerTable(fastener.sections.comparison.table),
    },
    configuration: {
      ...fastener.sections.configuration,
      table: fastenerTable(fastener.sections.configuration.table),
    },
    inquiry: {
      ...fastener.sections.inquiry,
      form: {
        ...fastener.sections.inquiry.form,
        fields: fastener.sections.inquiry.form.fields.map((field) => ({
          ...field,
          name: field.name as LineFormField['name'],
        })),
      },
    },
  },
};

// Each imported document is independently editable; shared defaults only fill headings.
const imported = [
  mesh,
  copper,
  strip,
  track,
  forging,
  carburizing,
  cell,
  aluminumSolution,
  aluminumForging,
  curing,
];
const pages: ProductionLineContent[] = imported.map((document) => {
  const variant = productionLineVariants[document.variant as LineVariant];
  return {
    ...document,
    variant: document.variant as LineVariant,
    sections: {
      ...document.sections,
      workpieces: {
        ...document.sections.workpieces,
        title: document.sections.workpieces.title || variant.workpieceTitle,
      },
      process: {
        ...document.sections.process,
        mode: document.sections.process.mode as 'routes' | 'cell',
        title: document.sections.process.title || variant.processTitle,
      },
      configuration: {
        ...document.sections.configuration,
        title: document.sections.configuration.title || variant.configurationTitle,
      },
      inquiry: {
        ...document.sections.inquiry,
        form: {
          ...document.sections.inquiry.form,
          fields: document.sections.inquiry.form.fields.map((field) => ({
            ...field,
            name: field.name as LineFormField['name'],
          })),
        },
      },
    },
  };
});

// Keep public entry cards and the rendered detail hero on the same lightweight metadata.
export const productionLinePages: ProductionLineContent[] = [
  ...pages.slice(0, 5),
  fastenerPage,
  ...pages.slice(5),
].map((page) => ({
  ...page,
  images: {
    ...page.images,
    'hero-line': productionLineHeroImages[page.pageId as keyof typeof productionLineHeroImages],
  },
}));
const byId = new Map(productionLinePages.map((page) => [page.pageId, page]));
export function getProductionLineContent(pageId: string) {
  return byId.get(pageId);
}
