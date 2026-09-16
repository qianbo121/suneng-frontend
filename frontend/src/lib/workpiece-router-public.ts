import type { WorkpieceDisplayState } from '@/lib/workpiece-router';
import { takeDifficultyPoints } from '@/lib/workpiece-router-difficulty';

export type PublicWorkpieceCard = {
  id: string;
  name: string;
  image: string;
  alt: string;
  judgement: string;
  contentMode: string;
};

export type PublicWorkpieceCategory = {
  id: string;
  label: string;
  name: string;
  cards: PublicWorkpieceCard[];
};

export type PublicProcessRoute = {
  id: string;
  workpieceIds: string[];
  logicUnitId: string;
  label: string;
  contextOnly: boolean;
  uiPriority: number;
  hasRouteLabelOption: boolean;
  processVariants: Array<{
    id: string;
    processPurposeId: string;
    label: string;
  }>;
};

export type SearchSuggestion = {
  targetWorkpieceId: string | null;
  routeHint?: string;
  suggestionLabel: string;
  matchType: 'broad' | 'routed_alias' | 'canonical' | 'strong_alias' | 'fuzzy' | 'unlisted';
};

export type WorkpieceRouterPublicCatalog = {
  defaultCategoryId: string;
  defaultWorkpieceId: string;
  publicDirectionExamplesEnabled?: boolean;
  categories: PublicWorkpieceCategory[];
  routes: PublicProcessRoute[];
  difficultyByWorkpiece: Record<string, string[]>;
  difficultyByRoute: Record<string, string[]>;
  difficultyByLogicUnit: Record<string, string[]>;
  standardDirectionsByWorkpiece: Record<
    string,
    {
      displayWorkpieceName: string;
      examples: Array<{
        position?: number;
        condition: string;
        direction: string;
        adoption?: '采用' | '有条件采用';
        boundary?: string;
      }>;
    }
  >;
  search: {
    entries: Array<{
      targetWorkpieceId: string;
      canonical: string;
      strongAliases: string[];
      suggestionLabel: string;
    }>;
    routedAliases: Array<{
      term: string;
      targetWorkpieceId: string;
      routeHint: string;
      suggestionLabel: string;
    }>;
    broadRules: Array<{
      terms: string[];
      options: Array<{ type: 'workpiece' | 'unlisted'; id: string; label: string }>;
    }>;
  };
};

export type PublicProcessOption = {
  value: string;
  routeId: string;
  processPurposeId: string | null;
  label: string;
};

export type PublicWorkpieceResolution = {
  categoryId: string;
  workpieceId: string;
  workpieceName: string;
  logicUnitId: string | null;
  routeId: string | null;
  processPurposeId: string | null;
  processOptions: PublicProcessOption[];
  displayState: WorkpieceDisplayState;
  difficultyPoints: string[];
};

type SearchResult =
  | { kind: 'none'; suggestions: [] }
  | { kind: 'unique'; suggestions: [SearchSuggestion] }
  | { kind: 'ambiguous'; suggestions: SearchSuggestion[] };

function normalizeSearchTerm(value: string) {
  return value.trim().toLocaleLowerCase('zh-CN').replace(/\s+/g, '');
}

function optionValue(routeId: string, processPurposeId: string | null) {
  return `${routeId}::${processPurposeId ?? ''}`;
}

export function parseProcessOptionValue(value: string) {
  const [routeId, processPurposeId] = value.split('::');
  return { routeId, processPurposeId: processPurposeId || null };
}

export function findPublicWorkpiece(catalog: WorkpieceRouterPublicCatalog, workpieceId: string) {
  for (const category of catalog.categories) {
    const card = category.cards.find((item) => item.id === workpieceId);
    if (card) return { ...card, categoryId: category.id };
  }
  return null;
}

function eligibleRoutes(
  catalog: WorkpieceRouterPublicCatalog,
  workpieceId: string,
  routeHint?: string | null,
) {
  return catalog.routes
    .filter(
      (route) =>
        route.workpieceIds.includes(workpieceId) && (!route.contextOnly || route.id === routeHint),
    )
    .map((route, sourceOrder) => ({ route, sourceOrder }))
    .sort(
      (left, right) =>
        left.route.uiPriority - right.route.uiPriority || left.sourceOrder - right.sourceOrder,
    )
    .map(({ route }) => route);
}

function processOptionsFor(routes: PublicProcessRoute[]): PublicProcessOption[] {
  return routes.flatMap<PublicProcessOption>((route): PublicProcessOption[] => {
    if (route.processVariants.length > 0) {
      return route.processVariants.map((variant) => ({
        value: optionValue(route.id, variant.id),
        routeId: route.id,
        processPurposeId: variant.id,
        label: variant.label,
      }));
    }
    return route.hasRouteLabelOption
      ? [
          {
            value: optionValue(route.id, null),
            routeId: route.id,
            processPurposeId: null,
            label: route.label,
          },
        ]
      : [];
  });
}

function difficultyPointsFor(
  catalog: WorkpieceRouterPublicCatalog,
  workpieceId: string,
  candidateRoutes: PublicProcessRoute[],
  activeRoute: PublicProcessRoute | null,
) {
  if (activeRoute) {
    return takeDifficultyPoints(
      catalog.difficultyByRoute[activeRoute.id],
      catalog.difficultyByWorkpiece[workpieceId],
      catalog.difficultyByLogicUnit[activeRoute.logicUnitId],
    );
  }
  if (catalog.difficultyByWorkpiece[workpieceId]) {
    return takeDifficultyPoints(catalog.difficultyByWorkpiece[workpieceId]);
  }
  const logicUnitIds = new Set(candidateRoutes.map((route) => route.logicUnitId));
  if (logicUnitIds.size === 1) {
    return takeDifficultyPoints(catalog.difficultyByLogicUnit[[...logicUnitIds][0]]);
  }
  return takeDifficultyPoints();
}

export function resolvePublicWorkpieceSelection(
  catalog: WorkpieceRouterPublicCatalog,
  input: {
    workpieceId: string;
    routeId?: string | null;
    processPurposeId?: string | null;
    routeHint?: string | null;
  },
): PublicWorkpieceResolution {
  const workpiece = findPublicWorkpiece(catalog, input.workpieceId);
  if (!workpiece) throw new Error(`Unknown public workpiece: ${input.workpieceId}`);

  const candidates = eligibleRoutes(catalog, input.workpieceId, input.routeHint);
  let activeRoute = input.routeId
    ? (candidates.find((route) => route.id === input.routeId) ?? null)
    : null;
  if (!activeRoute && input.routeHint) {
    activeRoute = candidates.find((route) => route.id === input.routeHint) ?? null;
  }
  if (!activeRoute && candidates.length === 1) activeRoute = candidates[0];

  let activePurpose = input.processPurposeId ?? null;
  if (
    activeRoute &&
    activePurpose &&
    !activeRoute.processVariants.some(
      (variant) => variant.id === activePurpose || variant.processPurposeId === activePurpose,
    )
  ) {
    activePurpose = null;
  }
  if (activeRoute && !activePurpose && activeRoute.processVariants.length === 1) {
    activePurpose = activeRoute.processVariants[0].id;
  }

  return {
    categoryId: workpiece.categoryId,
    workpieceId: workpiece.id,
    workpieceName: workpiece.name,
    logicUnitId: activeRoute?.logicUnitId ?? null,
    routeId: activeRoute?.id ?? null,
    processPurposeId: activePurpose,
    processOptions: processOptionsFor(candidates),
    displayState:
      !activeRoute || (activeRoute.processVariants.length > 0 && !activePurpose)
        ? 'insufficient_inputs'
        : 'engineering_review',
    difficultyPoints: difficultyPointsFor(catalog, input.workpieceId, candidates, activeRoute),
  };
}

function exactSuggestions(catalog: WorkpieceRouterPublicCatalog, term: string) {
  const normalized = normalizeSearchTerm(term);
  const broad = catalog.search.broadRules.find((rule) =>
    rule.terms.some((item) => normalizeSearchTerm(item) === normalized),
  );
  if (broad) {
    return broad.options.map<SearchSuggestion>((option) => ({
      targetWorkpieceId: option.type === 'workpiece' ? option.id : null,
      suggestionLabel: option.label,
      matchType: option.type === 'workpiece' ? 'broad' : 'unlisted',
    }));
  }

  const routed = catalog.search.routedAliases.filter(
    (item) => normalizeSearchTerm(item.term) === normalized,
  );
  if (routed.length > 0) {
    return routed.map<SearchSuggestion>((item) => ({
      targetWorkpieceId: item.targetWorkpieceId,
      routeHint: item.routeHint,
      suggestionLabel: item.suggestionLabel,
      matchType: 'routed_alias',
    }));
  }

  return catalog.search.entries.flatMap<SearchSuggestion>((entry) => {
    if (normalizeSearchTerm(entry.canonical) === normalized) {
      return [
        {
          targetWorkpieceId: entry.targetWorkpieceId,
          suggestionLabel: entry.suggestionLabel,
          matchType: 'canonical',
        },
      ];
    }
    if (entry.strongAliases.some((alias) => normalizeSearchTerm(alias) === normalized)) {
      return [
        {
          targetWorkpieceId: entry.targetWorkpieceId,
          suggestionLabel: entry.suggestionLabel,
          matchType: 'strong_alias',
        },
      ];
    }
    return [];
  });
}

export function searchPublicWorkpieces(
  catalog: WorkpieceRouterPublicCatalog,
  term: string,
): SearchResult {
  const normalized = normalizeSearchTerm(term);
  if (!normalized) return { kind: 'none', suggestions: [] };
  const exact = exactSuggestions(catalog, term);
  if (exact.length === 1) return { kind: 'unique', suggestions: [exact[0]] };
  if (exact.length > 1) return { kind: 'ambiguous', suggestions: exact };

  const fuzzy: SearchSuggestion[] = [];
  for (const item of catalog.search.routedAliases) {
    if (normalizeSearchTerm(item.term).includes(normalized)) {
      fuzzy.push({
        targetWorkpieceId: item.targetWorkpieceId,
        routeHint: item.routeHint,
        suggestionLabel: item.suggestionLabel,
        matchType: 'routed_alias',
      });
    }
  }
  for (const entry of catalog.search.entries) {
    const terms = [entry.canonical, ...entry.strongAliases].map(normalizeSearchTerm);
    if (terms.some((value) => value.includes(normalized))) {
      fuzzy.push({
        targetWorkpieceId: entry.targetWorkpieceId,
        suggestionLabel: entry.suggestionLabel,
        matchType: 'fuzzy',
      });
    }
  }
  const deduplicated = fuzzy.filter(
    (item, index, items) =>
      items.findIndex(
        (candidate) =>
          candidate.targetWorkpieceId === item.targetWorkpieceId &&
          candidate.routeHint === item.routeHint,
      ) === index,
  );
  if (deduplicated.length === 1) return { kind: 'unique', suggestions: [deduplicated[0]] };
  if (deduplicated.length > 1) {
    return { kind: 'ambiguous', suggestions: deduplicated.slice(0, 8) };
  }
  return { kind: 'none', suggestions: [] };
}
