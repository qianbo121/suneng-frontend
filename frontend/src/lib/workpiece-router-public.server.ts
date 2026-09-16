import 'server-only';

import publicSnapshot from '../../../data/workpiece-router/industry-public-direction-snapshot.json';
import baselines from '../../../data/workpiece-router/industry-baseline-versions.json';
import finalDirectionsJson from '../../../data/workpiece-router/industry-final-directions.json';

import logicUnitContentJson from '../../../data/workpiece-router/logic-unit-content-seed.json';
import processRoutesJson from '../../../data/workpiece-router/process-routes.json';
import searchVocabularyJson from '../../../data/workpiece-router/workpiece-search-vocabulary.json';
import workpieceManifestJson from '../../../data/workpiece-router/workpiece-card-manifest.json';
import workpieceOverridesJson from '../../../data/workpiece-router/workpiece-content-overrides.json';

import type {
  PublicWorkpieceCategory,
  WorkpieceRouterPublicCatalog,
} from '@/lib/workpiece-router-public';

type RawRoute = {
  id: string;
  workpieceIds: string[];
  logicUnitId: string;
  label: string;
  processStage: string;
  reviewed: boolean;
  contextOnly?: boolean;
  uiPriority?: number;
  processVariants: Array<{
    id: string;
    processPurposeId?: string | null;
    label: string;
  }>;
};

const manifest = workpieceManifestJson as {
  defaultCategoryId: string;
  defaultWorkpieceId: string;
  categories: PublicWorkpieceCategory[];
};
const routes = (processRoutesJson as { routes: RawRoute[] }).routes;
const logicUnits = logicUnitContentJson as {
  logicUnits: Array<{ id: string; difficultyPoints: string[] }>;
};
const overrides = workpieceOverridesJson as {
  overrides: Array<{ workpieceId: string; difficultyPoints: string[] }>;
  routeContentOverrides: Array<{ routeId: string; difficultyPoints: string[] }>;
};
const search = searchVocabularyJson as WorkpieceRouterPublicCatalog['search'];
// The finalized homepage copy was confirmed separately from formal publication.
// Keep the remote publication gate independent of that curated display content.
const publicDirectionExamplesEnabled = Boolean(
  publicSnapshot.publicBaselineVersion && publicSnapshot.rules.length &&
  baselines.publicBaselineVersion === publicSnapshot.publicBaselineVersion &&
  baselines.versions.some((version) =>
    version.baselineVersion === publicSnapshot.publicBaselineVersion &&
    version.publicationStatus === 'approved' && version.locked &&
    version.approvedBy && version.approvedAt && version.lockedAt),
);

const publicCatalog: WorkpieceRouterPublicCatalog = {
  defaultCategoryId: manifest.defaultCategoryId,
  defaultWorkpieceId: manifest.defaultWorkpieceId,
  categories: manifest.categories,
  routes: routes
    .filter((route) => route.reviewed)
    .map((route) => ({
      id: route.id,
      workpieceIds: route.workpieceIds,
      logicUnitId: route.logicUnitId,
      label: route.label,
      contextOnly: route.contextOnly === true,
      uiPriority: route.uiPriority ?? 100,
      hasRouteLabelOption:
        route.processVariants.length === 0 && route.processStage === 'requires_confirmation',
      processVariants: route.processVariants.map((variant) => ({
        id: variant.id,
        processPurposeId: variant.processPurposeId ?? variant.id,
        label: variant.label,
      })),
    })),
  difficultyByWorkpiece: Object.fromEntries(
    overrides.overrides.map((item) => [item.workpieceId, item.difficultyPoints]),
  ),
  difficultyByRoute: Object.fromEntries(
    overrides.routeContentOverrides.map((item) => [item.routeId, item.difficultyPoints]),
  ),
  difficultyByLogicUnit: Object.fromEntries(
    logicUnits.logicUnits.map((item) => [item.id, item.difficultyPoints]),
  ),
  standardDirectionsByWorkpiece: finalDirectionsJson.directions as
    WorkpieceRouterPublicCatalog['standardDirectionsByWorkpiece'],
  publicDirectionExamplesEnabled,
  search: {
    entries: search.entries.map((entry) => ({
      targetWorkpieceId: entry.targetWorkpieceId,
      canonical: entry.canonical,
      strongAliases: entry.strongAliases,
      suggestionLabel: entry.suggestionLabel,
    })),
    routedAliases: search.routedAliases.map((entry) => ({
      term: entry.term,
      targetWorkpieceId: entry.targetWorkpieceId,
      routeHint: entry.routeHint,
      suggestionLabel: entry.suggestionLabel,
    })),
    broadRules: search.broadRules.map((rule) => ({
      terms: rule.terms,
      options: rule.options.map((option) => ({
        type: option.type,
        id: option.id,
        label: option.label,
      })),
    })),
  },
};

export function getWorkpieceRouterPublicCatalog() {
  return publicCatalog;
}
