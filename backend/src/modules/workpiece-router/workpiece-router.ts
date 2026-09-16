import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

type CapabilityRequirements = {
  atmosphere?: string[];
  cooling?: string[];
  productionModes?: string[];
  loadingMethods?: string[];
  fastTransfer?: boolean;
  heavyLoad?: boolean;
  flatnessControl?: boolean;
  smallParts?: boolean;
};

type ProcessVariant = {
  id: string;
  processIds: string[];
  requirements: CapabilityRequirements;
};

type ProcessRoute = {
  id: string;
  workpieceIds: string[];
  logicUnitId: string;
  processStage: string;
  supportStatus: 'supported' | 'review' | 'unsupported';
  contextOnly?: boolean;
  requiredCapabilities: CapabilityRequirements;
  reviewed: boolean;
  reviewVersion: string;
  processVariants: ProcessVariant[];
};

type DirectionCandidate = {
  candidateId: string;
  condition: string;
  applicableRouteIds: string[];
  requirements: CapabilityRequirements;
  reviewed: boolean;
  reviewVersion: string;
};

type FurnaceCapability = {
  id: string;
  version: string;
  officialName: string;
  status: 'active' | 'conditional' | 'unsupported';
  allowedProcesses: string[];
  atmosphereCapabilities: string[];
  coolingCapabilities: string[];
  productionModes: string[];
  loadingMethods: string[];
  fastTransfer?: boolean;
  heavyLoad?: boolean;
  flatnessControl?: boolean;
  smallParts?: boolean;
  typicalCapacity: { limits: unknown[]; scopeNote: string; evidenceSource: string };
  restrictions: string[];
  effectiveFrom: string;
};

type DirectionApproval = {
  id: string;
  routeId: string;
  routeReviewVersion: string;
  processVariantId: string;
  candidateId: string;
  candidateReviewVersion: string;
  capabilityId: string;
  capabilityVersion: string;
  status: 'active' | 'suspended' | 'revoked';
  displayOrder: number;
  effectiveFrom: string;
  expiresAt?: string;
};

export type WorkpieceContextInput = {
  categoryId: string;
  workpieceId?: string;
  searchTerm?: string;
  processPurposeId?: string;
  logicUnitId?: string;
  routeId?: string;
};

export type ResolvedWorkpieceSelection = {
  sessionId?: string;
  categoryId: string;
  workpieceId?: string;
  searchTerm?: string;
  processPurposeId?: string;
  logicUnitId?: string;
  routeId?: string;
  displayState: 'approved' | 'insufficient_conditions' | 'engineering_review' | 'unsupported';
  capabilityVersion: string;
  displayedDirectionIds: Array<{
    approvalId: string;
    candidateId: string;
    capabilityId: string;
    officialName: string;
  }>;
  pagePath?: string;
};

export type WorkpieceRouterData = {
  manifest: {
    categories: Array<{ id: string; cards: Array<{ id: string }> }>;
  };
  routes: ProcessRoute[];
  logicUnits: Array<{
    id: string;
    candidateDirections: DirectionCandidate[];
  }>;
  whitelist: {
    schemaVersion: string;
    capabilities: FurnaceCapability[];
    directionApprovals: DirectionApproval[];
  };
};

let cachedData: WorkpieceRouterData | null = null;

function dataDirectory() {
  const candidates = [
    process.env.WORKPIECE_ROUTER_DATA_DIR,
    resolve(process.cwd(), 'data/workpiece-router'),
    resolve(process.cwd(), '../data/workpiece-router'),
  ].filter((candidate): candidate is string => Boolean(candidate));
  for (const candidate of candidates) {
    try {
      readFileSync(resolve(candidate, 'workpiece-card-manifest.json'));
      return candidate;
    } catch {
      // Try the next deployment or local-development path.
    }
  }
  throw new Error('Workpiece router data directory is unavailable');
}

function readJson<T>(directory: string, filename: string): T {
  return JSON.parse(readFileSync(resolve(directory, filename), 'utf8')) as T;
}

export function loadWorkpieceRouterData(): WorkpieceRouterData {
  if (cachedData) return cachedData;
  const directory = dataDirectory();
  cachedData = {
    manifest: readJson<WorkpieceRouterData['manifest']>(directory, 'workpiece-card-manifest.json'),
    routes: readJson<{ routes: ProcessRoute[] }>(directory, 'process-routes.json').routes,
    logicUnits: readJson<{ logicUnits: WorkpieceRouterData['logicUnits'] }>(
      directory,
      'logic-unit-content-seed.json',
    ).logicUnits,
    whitelist: readJson<WorkpieceRouterData['whitelist']>(
      directory,
      'furnace-capability-whitelist.json',
    ),
  };
  return cachedData;
}

function effectiveOn(dateText: string | undefined, now: Date, mode: 'from' | 'until') {
  if (!dateText) return mode === 'until';
  const timestamp = Date.parse(dateText);
  if (!Number.isFinite(timestamp)) return false;
  return mode === 'from' ? timestamp <= now.getTime() : timestamp >= now.getTime();
}

function requirementValues(capability: FurnaceCapability, key: string) {
  const mappedKey =
    key === 'atmosphere'
      ? 'atmosphereCapabilities'
      : key === 'cooling'
        ? 'coolingCapabilities'
        : key;
  return capability[mappedKey as keyof FurnaceCapability];
}

function capabilitiesMatch(requirements: CapabilityRequirements, capability: FurnaceCapability) {
  return Object.entries(requirements ?? {}).every(([key, required]) => {
    const actual = requirementValues(capability, key);
    if (Array.isArray(required)) {
      return Array.isArray(actual) && required.some((item) => actual.includes(item));
    }
    if (required === true) return actual === true;
    return true;
  });
}

function visibleDirections(
  route: ProcessRoute,
  variant: ProcessVariant,
  data: WorkpieceRouterData,
  now: Date,
) {
  const unit = data.logicUnits.find((item) => item.id === route.logicUnitId);
  if (!unit || !route.reviewed || route.supportStatus === 'unsupported') return [];
  const capabilityById = new Map(data.whitelist.capabilities.map((item) => [item.id, item]));

  return unit.candidateDirections
    .filter((candidate) => candidate.reviewed && candidate.applicableRouteIds.includes(route.id))
    .flatMap((candidate) =>
      data.whitelist.directionApprovals
        .filter((approval) => {
          const capability = capabilityById.get(approval.capabilityId);
          return Boolean(
            capability &&
            approval.status === 'active' &&
            effectiveOn(approval.effectiveFrom, now, 'from') &&
            effectiveOn(approval.expiresAt, now, 'until') &&
            approval.routeId === route.id &&
            approval.routeReviewVersion === route.reviewVersion &&
            approval.processVariantId === variant.id &&
            approval.candidateId === candidate.candidateId &&
            approval.candidateReviewVersion === candidate.reviewVersion &&
            approval.capabilityVersion === capability.version &&
            capability.status !== 'unsupported' &&
            effectiveOn(capability.effectiveFrom, now, 'from') &&
            variant.processIds.length > 0 &&
            variant.processIds.every((id) => capability.allowedProcesses.includes(id)) &&
            Array.isArray(capability.typicalCapacity?.limits) &&
            capability.typicalCapacity.limits.length >= 2 &&
            Boolean(capability.typicalCapacity.scopeNote) &&
            Boolean(capability.typicalCapacity.evidenceSource) &&
            (capability.status !== 'conditional' || capability.restrictions.length > 0) &&
            capabilitiesMatch(route.requiredCapabilities, capability) &&
            capabilitiesMatch(variant.requirements, capability) &&
            capabilitiesMatch(candidate.requirements, capability),
          );
        })
        .map((approval) => {
          const capability = capabilityById.get(approval.capabilityId)!;
          return {
            approvalId: approval.id,
            candidateId: candidate.candidateId,
            capabilityId: capability.id,
            officialName: capability.officialName,
            displayOrder: approval.displayOrder,
          };
        }),
    )
    .sort((left, right) => left.displayOrder - right.displayOrder)
    .slice(0, 3)
    .map((direction) => ({
      approvalId: direction.approvalId,
      candidateId: direction.candidateId,
      capabilityId: direction.capabilityId,
      officialName: direction.officialName,
    }));
}

export function resolveWorkpieceSelectionContext(
  input: WorkpieceContextInput,
  source: { sessionId?: string; pagePath?: string },
  data: WorkpieceRouterData = loadWorkpieceRouterData(),
  now = new Date(),
): ResolvedWorkpieceSelection {
  const category = data.manifest.categories.find((item) => item.id === input.categoryId);
  if (!category) throw new Error('Unknown workpiece category');

  if (!input.workpieceId) {
    if (!input.searchTerm?.trim()) throw new Error('Workpiece or search term is required');
    return {
      sessionId: source.sessionId,
      categoryId: category.id,
      searchTerm: input.searchTerm.trim(),
      displayState: 'engineering_review',
      capabilityVersion: data.whitelist.schemaVersion,
      displayedDirectionIds: [],
      pagePath: source.pagePath,
    };
  }

  if (!category.cards.some((card) => card.id === input.workpieceId)) {
    throw new Error('Workpiece does not belong to the supplied category');
  }

  const candidateRoutes = data.routes.filter(
    (route) =>
      route.reviewed &&
      route.workpieceIds.includes(input.workpieceId!) &&
      (!route.contextOnly || route.id === input.routeId),
  );
  let route = input.routeId
    ? candidateRoutes.find((candidate) => candidate.id === input.routeId)
    : undefined;
  if (input.routeId && !route) throw new Error('Unknown route for the supplied workpiece');
  if (!route && input.processPurposeId) {
    const matches = candidateRoutes.filter((candidate) =>
      candidate.processVariants.some((variant) => variant.id === input.processPurposeId),
    );
    if (matches.length !== 1) throw new Error('Process purpose does not identify one route');
    route = matches[0];
  }
  if (!route && candidateRoutes.length === 1) route = candidateRoutes[0];

  const variant = input.processPurposeId
    ? route?.processVariants.find((candidate) => candidate.id === input.processPurposeId)
    : undefined;
  if (input.processPurposeId && !variant) {
    throw new Error('Unknown process purpose for the supplied route');
  }
  if (input.logicUnitId && input.logicUnitId !== route?.logicUnitId) {
    throw new Error('Logic unit does not match the selected route');
  }

  const directions = route && variant ? visibleDirections(route, variant, data, now) : [];
  const displayState =
    route?.supportStatus === 'unsupported'
      ? 'unsupported'
      : directions.length > 0
        ? 'approved'
        : !route || (route.processVariants.length > 0 && !variant)
          ? 'insufficient_conditions'
          : 'engineering_review';

  return {
    sessionId: source.sessionId,
    categoryId: category.id,
    workpieceId: input.workpieceId,
    searchTerm: input.searchTerm?.trim() || undefined,
    processPurposeId: variant?.id,
    logicUnitId: route?.logicUnitId,
    routeId: route?.id,
    displayState,
    capabilityVersion: data.whitelist.schemaVersion,
    displayedDirectionIds: directions,
    pagePath: source.pagePath,
  };
}
