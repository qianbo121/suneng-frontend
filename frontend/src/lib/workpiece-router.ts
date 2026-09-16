import capabilityWhitelistJson from '../../../data/workpiece-router/furnace-capability-whitelist.json';
import baselineVersionsJson from '../../../data/workpiece-router/industry-baseline-versions.json';
import publicDirectionSnapshotJson from '../../../data/workpiece-router/industry-public-direction-snapshot.json';
import resolverConfigJson from '../../../data/workpiece-router/industry-resolver-config.json';
import logicUnitContentJson from '../../../data/workpiece-router/logic-unit-content-seed.json';
import processRoutesJson from '../../../data/workpiece-router/process-routes.json';
import processTaxonomyJson from '../../../data/workpiece-router/process-taxonomy.json';
import searchVocabularyJson from '../../../data/workpiece-router/workpiece-search-vocabulary.json';
import workpieceManifestJson from '../../../data/workpiece-router/workpiece-card-manifest.json';
import workpieceOverridesJson from '../../../data/workpiece-router/workpiece-content-overrides.json';

import { takeDifficultyPoints } from '@/lib/workpiece-router-difficulty';

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

export type WorkpieceCard = {
  id: string;
  name: string;
  image: string;
  alt: string;
  judgement: string;
  contentMode: string;
};

export type WorkpieceCategory = {
  id: string;
  label: string;
  name: string;
  cards: WorkpieceCard[];
};

type ProcessVariant = {
  id: string;
  label: string;
  processIds: string[];
  requirements: CapabilityRequirements;
  processPurposeId: string;
  processConcept: 'treatment_purpose' | 'process_context';
};

type ProcessRoute = {
  id: string;
  workpieceIds: string[];
  logicUnitId: string;
  label: string;
  processStage: string;
  supportStatus: 'supported' | 'review' | 'unsupported';
  customerNote: string;
  contextOnly?: boolean;
  uiPriority?: number;
  requiredCapabilities: CapabilityRequirements;
  reviewed: boolean;
  reviewVersion: string;
  processVariants: ProcessVariant[];
  baselineEvidenceStatus:
    | 'verified'
    | 'partially_verified'
    | 'unverified'
    | 'special_process'
    | 'not_applicable';
  processBoundary: string;
  moduleDisposition: 'in_scope' | 'outside_furnace_module';
  companyCapabilityStatus: 'verified' | 'unknown' | 'not_supported';
  requiredInputs: string[];
  missingInputs: string[];
  assumptions: string[];
  evidenceRefs: string[];
  candidateEvidenceRefs: string[];
};

type DirectionCandidate = {
  candidateId: string;
  logicUnitId: string;
  condition: string;
  applicableRouteIds: string[];
  requirements: CapabilityRequirements;
  reviewed: boolean;
  reviewVersion: string;
};

type LogicUnit = {
  id: string;
  difficultyPoints: string[];
  candidateDirections: Array<Omit<DirectionCandidate, 'logicUnitId'>>;
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
  equipmentFamilyId?: string;
  publicDisplayAuthorized?: boolean;
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

export type WorkpieceCapabilityWhitelist = {
  schemaVersion: string;
  capabilities: FurnaceCapability[];
  directionApprovals: DirectionApproval[];
};

export type ProcessOption = {
  value: string;
  routeId: string;
  processPurposeId: string | null;
  label: string;
};

type ClaimLevel = 'numeric_parameter' | 'process_constraint' | 'equipment_direction';

export type TriState = 'true' | 'false' | 'unknown';

type DirectionPredicate = {
  field:
    | 'partForm'
    | 'loadingOrientation'
    | 'presentationState'
    | 'atmosphereType'
    | 'surfaceObjective'
    | 'treatmentScope';
  operator: 'in';
  allowedValues: string[];
  requiredForMatch: boolean;
};

type AllowedPair = {
  workpieceId: string;
  routeId: string;
  processVariantId: string;
};

export type EquipmentDirectionOutput = {
  operationMode: string;
  furnaceArchitecture: string;
  materialHandling: {
    supportMethod: string;
    loadingOrientation: string | null;
    presentationState: string;
  };
  atmosphereCapability: {
    atmosphereTypes: string[];
    surfaceObjectives: string[];
  };
  processChainProfile: string;
  processChain: string[];
  coolingIntegration: string;
};

export type IndustryDirectionRule = {
  ruleId: string;
  baselineVersion: string;
  logicUnitId: string;
  allowedPairs: AllowedPair[];
  equipmentFamilyId: string;
  publicLabelDerivationKey: string;
  publicationEligibility: 'conditional_public' | 'internal_only' | 'blocked';
  internalExecutionStatus: 'eligible' | 'pending_blocked' | 'blocked';
  publicClaimScope:
    | 'equipment_taxonomy'
    | 'conditional_engineering_direction'
    | 'process_system_direction';
  conditions: string[];
  matchCriteria: DirectionPredicate[];
  equipmentOutput: EquipmentDirectionOutput;
  operationInference: {
    mode: string;
    requiredSignals: string[];
    preferenceInput: 'operationPreference';
    preferenceCanDecide: false;
  };
  handlingInference: {
    decisionTableVersion: string;
    expectedSupportMethod: string;
    requiredSignals: string[];
    directAnswerAccepted: false;
    source: 'customer_observable_conditions';
  };
  requiredProcessStages: string[];
  requiredEngineeringPredicates: string[];
  assumptionPolicies: Array<{
    text: string;
    disposition: 'required_engineering_predicates' | 'non_matchable_assumption';
    predicateIds: string[];
  }>;
  nonMatchableAssumptions: string[];
  pairEvidence: Record<
    string,
    {
      taxonomyRefs: string[];
      applicationMappingRefs: string[];
      processBoundaryRefs: string[];
      normativeStandardRefs: string[];
      companyCapabilityRefs: string[];
    }
  >;
  candidateEvidenceRefs: string[];
  derivedFrom: string[];
  assumptions: string[];
  requiredInputs: string[];
  evidenceRefs: string[];
  sourceDirectSupport: string[];
  engineeringDerivation: string[];
  unverifiedEngineeringAssumptions: string[];
  evidenceSupportScope: string;
  baselineEvidenceStatus: 'verified' | 'partially_verified' | 'unverified';
  claimLevel: ClaimLevel;
  confidence: 'conditional';
  priority: number;
  supersedesRuleIds: string[];
  sourceRuleIds: string[];
};

export type EvidenceRecord = {
  evidenceId: string;
  evidenceType:
    | 'taxonomy_reference'
    | 'application_mapping'
    | 'process_boundary'
    | 'normative_standard'
    | 'company_capability';
  status: 'current' | 'future_effective' | 'withdrawn' | 'replaced' | 'unverified';
  accessLevel: 'metadata_only' | 'full_text' | 'clause_verified';
  verificationStatus: 'metadata_verified' | 'full_text_verified' | 'clause_verified' | 'unverified';
  supportedClaimLevels?: ClaimLevel[];
};

type BaselineVersion = {
  baselineVersion: string;
  publicationStatus: 'draft' | 'pending_approval' | 'approved' | 'superseded' | 'withdrawn';
  locked: boolean;
  lockedAt?: string | null;
  approvedBy?: string | null;
  approvedRole?: string | null;
  resolverVersion?: string;
  approvedRuleIds?: string[];
  approvedPairKeys?: string[];
  approvedScopeHash?: string;
  publicClaimTemplateHash?: string;
  publicLabelMappingHash?: string;
  rulePriorityHash?: string;
  ruleSetHash?: string;
  evidenceSnapshotHash?: string;
};

export type IndustryDirection = {
  directionId: string;
  equipmentFamilyId: string;
  publicLabel: string;
  publicLabelDerivationKey: string;
  pairKey: string;
  publicationEligibility: IndustryDirectionRule['publicationEligibility'];
  publicClaimScope: IndustryDirectionRule['publicClaimScope'];
  resolutionStage: 'conditional_preview' | 'matched_direction' | 'engineering_review';
  conditionEvaluation: Array<{
    field: string;
    state: TriState;
    requiredForMatch: boolean;
    category: 'axis' | 'operation' | 'handling' | 'engineering' | 'process_stage';
  }>;
  conditionalMessage: string | null;
  publicClaims: {
    conditional_preview: string;
    matched_direction: string;
    engineering_review: string;
  };
  equipmentOutput: EquipmentDirectionOutput;
  conditions: string[];
  derivedFrom: string[];
  assumptions: string[];
  requiredInputs: string[];
  missingInputs: string[];
  reviewInputs: string[];
  evidenceRefs: string[];
  sourceDirectSupport: string[];
  engineeringDerivation: string[];
  unverifiedEngineeringAssumptions: string[];
  evidenceSupportScope: string;
  baselineEvidenceStatus: IndustryDirectionRule['baselineEvidenceStatus'];
  ruleId: string;
  baselineVersion: string;
  confidence: 'conditional';
  companyCapabilityStatus: 'verified' | 'unknown' | 'not_supported';
  productHref: null;
};

export type WorkpieceDisplayState =
  | 'industry_direction'
  | 'conditional_directions'
  | 'insufficient_inputs'
  | 'special_process'
  | 'outside_module'
  | 'engineering_review'
  | 'unverified';

export type WorkpieceSelectionInput = {
  workpieceId: string;
  routeId?: string | null;
  processPurposeId?: string | null;
  routeHint?: string | null;
  materialFamily?: string | null;
  materialGrade?: string | null;
  dimensions?: Record<string, number | null> | null;
  weight?: number | null;
  partForm?:
    | 'discrete_part'
    | 'plate'
    | 'long_product'
    | 'coil'
    | 'strip'
    | 'irregular_assembly'
    | null;
  loadingOrientation?: 'horizontal' | 'vertical' | 'flat' | 'suspended' | null;
  presentationState?: 'coiled' | 'uncoiled' | 'stacked' | 'single_piece' | 'bulk_loaded' | null;
  loadMovement?: 'stationary' | 'through_process' | 'either' | 'unknown' | null;
  loadingAccess?: 'crane_or_forklift' | 'conveyor_feed' | 'manual_or_basket' | 'unknown' | null;
  baseSupportCondition?:
    | 'broad_base'
    | 'line_contact'
    | 'distributed_small_parts'
    | 'fixture_required'
    | 'no_base_support'
    | 'unknown'
    | null;
  continuousContactAllowed?: boolean | 'unknown' | null;
  floorLoadingRequired?: boolean | 'unknown' | null;
  suspensionAllowed?: boolean | 'unknown' | null;
  stackingAllowed?: boolean | 'unknown' | null;
  bulkLoadingSuitable?: boolean | 'unknown' | null;
  batchQuantity?: number | null;
  batchSize?: 'small' | 'medium' | 'large' | 'unknown' | null;
  targetThroughput?: 'low' | 'medium' | 'high' | 'unknown' | null;
  productMix?: 'stable' | 'few_variants' | 'high_mix' | 'unknown' | null;
  changeoverFrequency?: 'rare' | 'periodic' | 'frequent' | 'unknown' | null;
  cycleTimeExpectation?: 'flexible' | 'regular' | 'tight' | 'unknown' | null;
  loadingContinuity?: 'discrete' | 'intermittent' | 'continuous' | 'unknown' | null;
  operationPreference?: 'batch' | 'continuous' | 'no_preference' | 'unknown' | null;
  atmosphereType?:
    | 'air'
    | 'inert'
    | 'reducing'
    | 'protective'
    | 'controlled_carbon_potential'
    | 'controlled_carbon_nitrogen_potential'
    | null;
  surfaceObjective?: 'normal' | 'low_oxidation' | 'bright' | 'scale_controlled' | null;
  quenchRequired?: boolean | 'unknown' | null;
  quenchMedium?: 'water' | 'oil' | 'polymer' | 'gas' | 'air' | 'other' | 'unknown' | null;
  transferConstraint?: 'rapid' | 'bounded' | 'no_special_constraint' | 'unknown' | null;
  coolingRateRequirement?: 'rapid' | 'controlled' | 'slow' | 'process_defined' | 'unknown' | null;
  agitationOrFlowRequirement?: 'required' | 'not_required' | 'process_defined' | 'unknown' | null;
  distortionConstraint?: 'strict' | 'controlled' | 'standard' | 'unknown' | null;
  integrationPreference?: 'integrated' | 'separate' | 'no_preference' | 'unknown' | null;
  austenitizing?: boolean | 'unknown' | null;
  transfer?: boolean | 'unknown' | null;
  quench?: boolean | 'unknown' | null;
  cleaning_if_required?: boolean | 'unknown' | null;
  tempering?: boolean | 'unknown' | null;
  final_cooling?: boolean | 'unknown' | null;
  solution_heating?: boolean | 'unknown' | null;
  rapid_transfer?: boolean | 'unknown' | null;
  rapid_cooling?: boolean | 'unknown' | null;
  treatmentScope?: 'whole_component' | 'local' | 'field' | null;
  baselineVersion?: string | null;
  now?: Date;
};

export type WorkpieceResolution = {
  categoryId: string;
  workpieceId: string;
  workpieceName: string;
  logicUnitId: string | null;
  routeId: string | null;
  processPurposeId: string | null;
  candidateRoutes: string[];
  processOptions: ProcessOption[];
  processLabels: string[];
  industryDirections: IndustryDirection[];
  publicIndustryDirections: IndustryDirection[];
  requiredInputs: string[];
  missingInputs: string[];
  assumptions: string[];
  derivedFrom: string[];
  evidenceRefs: string[];
  baselineEvidenceStatus: ProcessRoute['baselineEvidenceStatus'] | null;
  companyCapabilityStatus: ProcessRoute['companyCapabilityStatus'];
  displayState: WorkpieceDisplayState;
  customerNote: string;
  difficultyPoints: string[];
  selectionFactors: Array<{ label: string; description: string }>;
  baselineVersion: string;
};

export type SearchSuggestion = {
  targetWorkpieceId: string | null;
  routeHint?: string;
  suggestionLabel: string;
  matchType: 'broad' | 'routed_alias' | 'canonical' | 'strong_alias' | 'fuzzy' | 'unlisted';
};

type SearchResult =
  | { kind: 'none'; suggestions: [] }
  | { kind: 'unique'; suggestions: [SearchSuggestion] }
  | { kind: 'ambiguous'; suggestions: SearchSuggestion[] };

const manifest = workpieceManifestJson as {
  schemaVersion: string;
  defaultCategoryId: string;
  defaultWorkpieceId: string;
  categories: WorkpieceCategory[];
};
const routes = (processRoutesJson as { routes: ProcessRoute[] }).routes;
export type PublicLabelMapping = {
  architectureLabels: Record<string, string>;
  combinationOverrides: Record<string, string>;
};
export type PublicClaimTemplates = {
  conditional_preview: string;
  matched_direction: string;
  engineering_review: string;
};
const publicSnapshot = publicDirectionSnapshotJson as {
  publicBaselineVersion: string | null;
  rules: IndustryDirectionRule[];
  evidence: EvidenceRecord[];
  labels: Partial<PublicLabelMapping>;
  claimTemplates: Partial<PublicClaimTemplates>;
};
const directionRules = publicSnapshot.rules;
const evidenceRecords = publicSnapshot.evidence;
const baselineVersions = baselineVersionsJson as {
  currentDraftVersion: string;
  publicBaselineVersion: string | null;
  versions: BaselineVersion[];
};
const publicLabelMapping: PublicLabelMapping = {
  architectureLabels: publicSnapshot.labels.architectureLabels ?? {},
  combinationOverrides: publicSnapshot.labels.combinationOverrides ?? {},
};
const publicClaimTemplates = publicSnapshot.claimTemplates as Partial<PublicClaimTemplates>;
const resolverConfig = resolverConfigJson as {
  resolverVersion: string;
  snapshot: {
    ruleSetHash: string;
    evidenceSnapshotHash: string;
    publicLabelMappingHash: string;
    publicClaimTemplateHash: string;
    rulePriorityHash: string;
    approvedScopeHash: string;
  };
};
const taxonomy = processTaxonomyJson as {
  processes: Array<{ id: string; label: string }>;
};
const logicUnits = (logicUnitContentJson as { logicUnits: LogicUnit[] }).logicUnits;
const overrides = workpieceOverridesJson as {
  overrides: Array<{ workpieceId: string; difficultyPoints: string[] }>;
  routeContentOverrides: Array<{ routeId: string; difficultyPoints: string[] }>;
};
const whitelist = capabilityWhitelistJson as WorkpieceCapabilityWhitelist;
const vocabulary = searchVocabularyJson as {
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

export const workpieceCategories = manifest.categories;
export const defaultWorkpieceCategoryId = manifest.defaultCategoryId;
export const defaultWorkpieceId = manifest.defaultWorkpieceId;

const workpieces = manifest.categories.flatMap((category) =>
  category.cards.map((card) => ({ ...card, categoryId: category.id })),
);
const workpieceById = new Map(workpieces.map((workpiece) => [workpiece.id, workpiece]));
const processById = new Map(taxonomy.processes.map((process) => [process.id, process.label]));
const logicUnitById = new Map(logicUnits.map((unit) => [unit.id, unit]));
const evidenceById = new Map(evidenceRecords.map((evidence) => [evidence.evidenceId, evidence]));
const directionRuleById = new Map(directionRules.map((rule) => [rule.ruleId, rule]));

const SELECTION_FACTORS = [
  { label: '材质与牌号', description: '先确认处理目的和适用工艺边界' },
  { label: '尺寸与重量', description: '决定有效空间、承载与进出料条件' },
  { label: '装炉与节拍', description: '决定周期式或连续式设备方向' },
] as const;

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

function eligibleRoutes(workpieceId: string, routeHint?: string | null) {
  return routes
    .filter(
      (route) =>
        route.reviewed &&
        route.workpieceIds.includes(workpieceId) &&
        (!route.contextOnly || route.id === routeHint),
    )
    .map((route, sourceOrder) => ({ route, sourceOrder }))
    .sort(
      (left, right) =>
        (left.route.uiPriority ?? 100) - (right.route.uiPriority ?? 100) ||
        left.sourceOrder - right.sourceOrder,
    )
    .map(({ route }) => route);
}

function processOptionsFor(candidateRoutes: ProcessRoute[]): ProcessOption[] {
  return candidateRoutes.flatMap<ProcessOption>((route): ProcessOption[] => {
    if (route.processVariants.length > 0) {
      return route.processVariants.map((variant) => ({
        value: optionValue(route.id, variant.id),
        routeId: route.id,
        processPurposeId: variant.id,
        label: variant.label,
      }));
    }
    if (route.processStage === 'requires_confirmation') {
      return [
        {
          value: optionValue(route.id, null),
          routeId: route.id,
          processPurposeId: null,
          label: route.label,
        },
      ];
    }
    return [];
  });
}

function effectiveOn(dateText: string | undefined, now: Date, mode: 'from' | 'until') {
  if (!dateText) return mode === 'until';
  const timestamp = Date.parse(dateText);
  if (!Number.isFinite(timestamp)) return false;
  return mode === 'from' ? timestamp <= now.getTime() : timestamp >= now.getTime();
}

function isProvided(value: unknown) {
  if (value === null || value === undefined) return false;
  if (typeof value === 'string') return value.trim().length > 0;
  if (typeof value === 'number') return Number.isFinite(value);
  if (Array.isArray(value)) return value.length > 0;
  if (typeof value === 'object') return Object.values(value).some(isProvided);
  return true;
}

function evaluateCriterion(
  predicate: DirectionPredicate,
  input: Partial<WorkpieceSelectionInput>,
): TriState {
  const value = input[predicate.field];
  if (!isProvided(value) || String(value) === 'unknown') return 'unknown';
  return typeof value === 'string' && predicate.allowedValues.includes(value) ? 'true' : 'false';
}

function triStateBoolean(value: unknown): TriState {
  if (value === true) return 'true';
  if (value === false) return 'false';
  return 'unknown';
}

function concreteValueState(value: unknown): TriState {
  if (value === false) return 'false';
  return isProvided(value) && value !== 'unknown' ? 'true' : 'unknown';
}

export function canonicalizeSnapshotValue(value: unknown): string {
  if (Array.isArray(value)) {
    return `[${value.map((item) => canonicalizeSnapshotValue(item)).join(',')}]`;
  }
  if (value && typeof value === 'object') {
    return `{${Object.entries(value as Record<string, unknown>)
      .sort(([left], [right]) => left.localeCompare(right))
      .map(([key, item]) => `${JSON.stringify(key)}:${canonicalizeSnapshotValue(item)}`)
      .join(',')}}`;
  }
  return JSON.stringify(value);
}

export function directionPairKey(pair: AllowedPair) {
  return `${pair.workpieceId}|${pair.routeId}|${pair.processVariantId}`;
}

function evidenceIsVerifiedType(
  evidenceId: string,
  evidenceType: EvidenceRecord['evidenceType'],
  records: Map<string, EvidenceRecord>,
) {
  const evidence = records.get(evidenceId);
  return Boolean(
    evidence &&
    evidence.evidenceType === evidenceType &&
    evidence.status === 'current' &&
    evidence.accessLevel !== 'metadata_only' &&
    ['full_text_verified', 'clause_verified'].includes(evidence.verificationStatus),
  );
}

function ruleHasAuditableEvidenceTrace(rule: IndustryDirectionRule, records = evidenceById) {
  return (
    rule.claimLevel === 'equipment_direction' &&
    rule.derivedFrom.length > 0 &&
    rule.assumptions.length > 0 &&
    rule.requiredInputs.length > 0 &&
    rule.evidenceRefs.length > 0 &&
    rule.evidenceRefs.some((evidenceId) => records.has(evidenceId)) &&
    rule.sourceDirectSupport.length > 0 &&
    rule.engineeringDerivation.length > 0 &&
    rule.unverifiedEngineeringAssumptions.length > 0 &&
    rule.evidenceSupportScope.length > 0
  );
}

export function publicationEvidenceReady(
  rule: IndustryDirectionRule,
  pairKey: string,
  records: Map<string, EvidenceRecord>,
) {
  const pairEvidence = rule.pairEvidence[pairKey];
  return Boolean(
    pairEvidence &&
    pairEvidence.taxonomyRefs.some((id) =>
      evidenceIsVerifiedType(id, 'taxonomy_reference', records),
    ) &&
    pairEvidence.applicationMappingRefs.some((id) =>
      evidenceIsVerifiedType(id, 'application_mapping', records),
    ) &&
    rule.assumptions.length > 0 &&
    rule.requiredInputs.length > 0,
  );
}

export function approvedBaselineSnapshotMatches(
  version: {
    resolverVersion?: string;
    ruleSetHash?: string;
    evidenceSnapshotHash?: string;
    publicLabelMappingHash?: string;
    publicClaimTemplateHash?: string;
    rulePriorityHash?: string;
    approvedScopeHash?: string;
  },
  currentSnapshot: {
    resolverVersion: string;
    ruleSetHash: string;
    evidenceSnapshotHash: string;
    publicLabelMappingHash: string;
    publicClaimTemplateHash: string;
    rulePriorityHash: string;
    approvedScopeHash: string;
  },
) {
  return (
    version.resolverVersion === currentSnapshot.resolverVersion &&
    version.ruleSetHash === currentSnapshot.ruleSetHash &&
    version.evidenceSnapshotHash === currentSnapshot.evidenceSnapshotHash &&
    version.publicLabelMappingHash === currentSnapshot.publicLabelMappingHash &&
    version.publicClaimTemplateHash === currentSnapshot.publicClaimTemplateHash &&
    version.rulePriorityHash === currentSnapshot.rulePriorityHash &&
    version.approvedScopeHash === currentSnapshot.approvedScopeHash
  );
}

export function directionIsApprovedForPublic({
  direction,
  rule,
  baseline,
  evidence,
  currentSnapshot,
}: {
  direction: IndustryDirection;
  rule: IndustryDirectionRule;
  baseline: BaselineVersion;
  evidence: EvidenceRecord[];
  currentSnapshot: Parameters<typeof approvedBaselineSnapshotMatches>[1];
}) {
  const approvedRules = baseline.approvedRuleIds ?? [];
  const approvedPairs = baseline.approvedPairKeys ?? [];
  return Boolean(
    baseline.publicationStatus === 'approved' &&
    baseline.locked === true &&
    isProvided(baseline.lockedAt) &&
    rule.publicationEligibility === 'conditional_public' &&
    rule.internalExecutionStatus === 'eligible' &&
    approvedRules.includes(rule.ruleId) &&
    approvedPairs.includes(direction.pairKey) &&
    approvedBaselineSnapshotMatches(baseline, currentSnapshot) &&
    publicationEvidenceReady(
      rule,
      direction.pairKey,
      new Map(evidence.map((record) => [record.evidenceId, record])),
    ),
  );
}

function baselineIsApprovedForPublicDisplay(versionId: string) {
  if (baselineVersions.publicBaselineVersion !== versionId) return false;
  const version = baselineVersions.versions.find((item) => item.baselineVersion === versionId);
  return Boolean(
    version?.publicationStatus === 'approved' &&
    version.locked === true &&
    approvedBaselineSnapshotMatches(version, {
      resolverVersion: resolverConfig.resolverVersion,
      ...resolverConfig.snapshot,
    }),
  );
}

function companyCapabilityFor(
  equipmentFamilyId: string,
  now: Date,
  activeWhitelist: WorkpieceCapabilityWhitelist,
): IndustryDirection['companyCapabilityStatus'] {
  const capability = activeWhitelist.capabilities.find(
    (item) =>
      item.equipmentFamilyId === equipmentFamilyId &&
      item.status !== 'unsupported' &&
      item.publicDisplayAuthorized === true &&
      effectiveOn(item.effectiveFrom, now, 'from'),
  );
  return capability ? 'verified' : 'unknown';
}

export function resolveIndustryDirectionRules(
  input: Partial<WorkpieceSelectionInput>,
  options: {
    versionId?: string;
    now?: Date;
    activeWhitelist?: WorkpieceCapabilityWhitelist;
    evidenceRecords?: EvidenceRecord[];
    rules?: IndustryDirectionRule[];
    labelMapping?: PublicLabelMapping;
    claimTemplates?: PublicClaimTemplates;
  } = {},
) {
  const routeId = input.routeId ?? null;
  const purposeId = input.processPurposeId ?? null;
  if (!input.workpieceId || !routeId || !purposeId) return [];
  const versionId =
    options.versionId ?? input.baselineVersion ?? baselineVersions.currentDraftVersion;
  const now = options.now ?? input.now ?? new Date();
  const activeWhitelist = options.activeWhitelist ?? whitelist;
  const activeEvidenceById = options.evidenceRecords
    ? new Map(options.evidenceRecords.map((evidence) => [evidence.evidenceId, evidence]))
    : evidenceById;
  const activeRules = options.rules ?? directionRules;
  const activeLabels = options.labelMapping ?? publicLabelMapping;
  const activeTemplates = options.claimTemplates ?? publicClaimTemplates;

  function inferOperationMode(rule: IndustryDirectionRule): TriState {
    if (rule.operationInference.mode === 'local' || rule.operationInference.mode === 'field') {
      const scope = input.treatmentScope;
      if (!scope) return 'unknown';
      return scope === rule.operationInference.mode ? 'true' : 'false';
    }
    const values = rule.operationInference.requiredSignals.map(
      (field) => input[field as keyof WorkpieceSelectionInput],
    );
    if (values.some((value) => !isProvided(value) || value === 'unknown')) return 'unknown';
    const validSignals =
      ['small', 'medium', 'large'].includes(input.batchSize ?? '') &&
      ['low', 'medium', 'high'].includes(input.targetThroughput ?? '') &&
      ['stable', 'few_variants', 'high_mix'].includes(input.productMix ?? '') &&
      ['rare', 'periodic', 'frequent'].includes(input.changeoverFrequency ?? '') &&
      ['flexible', 'regular', 'tight'].includes(input.cycleTimeExpectation ?? '') &&
      ['discrete', 'intermittent', 'continuous'].includes(input.loadingContinuity ?? '');
    if (!validSignals) return 'false';
    const continuity = input.loadingContinuity;
    if (rule.operationInference.mode === 'continuous') {
      return continuity === 'continuous' &&
        input.targetThroughput === 'high' &&
        ['medium', 'large'].includes(input.batchSize ?? '') &&
        ['stable', 'few_variants'].includes(input.productMix ?? '') &&
        ['rare', 'periodic'].includes(input.changeoverFrequency ?? '') &&
        ['regular', 'tight'].includes(input.cycleTimeExpectation ?? '')
        ? 'true'
        : 'false';
    }
    return ['discrete', 'intermittent'].includes(continuity ?? '') ? 'true' : 'false';
  }

  function processInputState(rule: IndustryDirectionRule, field: string): TriState {
    const value = input[field as keyof WorkpieceSelectionInput];
    if (rule.requiredProcessStages.includes(field)) return triStateBoolean(value);
    if (field === 'quenchRequired') return triStateBoolean(value);
    if (field === 'transferConstraint') {
      const allowed =
        rule.equipmentOutput.processChainProfile === 'solution_quench'
          ? ['rapid']
          : ['rapid', 'bounded'];
      return concreteValueState(value) === 'unknown'
        ? 'unknown'
        : allowed.includes(String(value))
          ? 'true'
          : 'false';
    }
    if (field === 'coolingRateRequirement') {
      const allowed =
        rule.equipmentOutput.processChainProfile === 'solution_quench'
          ? ['rapid']
          : ['rapid', 'process_defined'];
      return concreteValueState(value) === 'unknown'
        ? 'unknown'
        : allowed.includes(String(value))
          ? 'true'
          : 'false';
    }
    return concreteValueState(value);
  }

  function derivePublicLabel(rule: IndustryDirectionRule) {
    const key = rule.publicLabelDerivationKey;
    return (
      activeLabels.combinationOverrides[key] ??
      `${activeLabels.architectureLabels[rule.equipmentOutput.furnaceArchitecture] ?? rule.equipmentOutput.furnaceArchitecture}${rule.equipmentOutput.operationMode === 'batch' ? '周期炉' : '热处理设备'}`
    );
  }

  function renderClaims(
    label: string,
    missingInputs: string[],
    reviewInputs: string[],
  ): IndustryDirection['publicClaims'] {
    const conditionSummary =
      missingInputs.length > 0 ? `尚需确认：${missingInputs.join('、')}` : '已列条件均已确认';
    const reviewSummary =
      reviewInputs.length > 0 ? reviewInputs.join('、') : missingInputs.join('、') || '工程边界';
    const replace = (template: string | undefined) =>
      (template ?? '')
        .replaceAll('{equipmentLabel}', label)
        .replaceAll('{conditionSummary}', conditionSummary)
        .replaceAll('{reviewSummary}', reviewSummary);
    return {
      conditional_preview: replace(activeTemplates.conditional_preview),
      matched_direction: replace(activeTemplates.matched_direction),
      engineering_review: replace(activeTemplates.engineering_review),
    };
  }

  return activeRules
    .filter(
      (rule) =>
        rule.baselineVersion === versionId &&
        rule.internalExecutionStatus === 'eligible' &&
        rule.allowedPairs.some(
          (item) =>
            item.workpieceId === input.workpieceId &&
            item.routeId === routeId &&
            item.processVariantId === purposeId,
        ) &&
        ruleHasAuditableEvidenceTrace(rule, activeEvidenceById),
    )
    .map((rule) => {
      const axisEvaluations: IndustryDirection['conditionEvaluation'] = rule.matchCriteria.map(
        (criterion) => ({
          field: criterion.field,
          state: evaluateCriterion(criterion, input),
          requiredForMatch: criterion.requiredForMatch,
          category: 'axis',
        }),
      );
      const operationEvaluation: IndustryDirection['conditionEvaluation'][number] = {
        field: 'operationInference',
        state: inferOperationMode(rule),
        requiredForMatch: true,
        category: 'operation',
      };
      const handlingEvaluation: IndustryDirection['conditionEvaluation'][number] = {
        field: 'materialHandlingInference',
        state: 'unknown',
        requiredForMatch: true,
        category: 'handling',
      };
      const engineeringEvaluations: IndustryDirection['conditionEvaluation'] =
        rule.requiredEngineeringPredicates.map((field) => ({
          field,
          state: 'unknown',
          requiredForMatch: true,
          category: 'engineering',
        }));
      const otherProcessInputs = rule.requiredInputs.filter((field) =>
        [
          'quenchRequired',
          'quenchMedium',
          'transferConstraint',
          'coolingRateRequirement',
          'agitationOrFlowRequirement',
          'distortionConstraint',
        ].includes(field),
      );
      const processEvaluations: IndustryDirection['conditionEvaluation'] = [
        ...rule.requiredProcessStages,
        ...otherProcessInputs,
      ]
        .filter((field, index, items) => items.indexOf(field) === index)
        .map((field) => ({
          field,
          state: processInputState(rule, field),
          requiredForMatch: true,
          category: 'process_stage',
        }));
      return {
        rule,
        evaluations: [
          ...axisEvaluations,
          operationEvaluation,
          handlingEvaluation,
          ...engineeringEvaluations,
          ...processEvaluations,
        ],
      };
    })
    .filter(
      ({ evaluations }) =>
        !evaluations.some((item) => item.category === 'axis' && item.state === 'false') &&
        !evaluations.some((item) => item.category === 'operation' && item.state === 'false'),
    )
    .sort(
      (left, right) =>
        left.rule.priority - right.rule.priority ||
        left.rule.ruleId.localeCompare(right.rule.ruleId),
    )
    .slice(0, 3)
    .map<IndustryDirection>(({ rule, evaluations }) => {
      const missingInputs = evaluations
        .filter((item) => item.requiredForMatch && item.state === 'unknown')
        .map((item) => item.field);
      const reviewInputs = evaluations
        .filter((item) => item.requiredForMatch && item.state === 'false')
        .map((item) => item.field);
      const resolutionStage: IndustryDirection['resolutionStage'] =
        reviewInputs.length > 0 || rule.nonMatchableAssumptions.length > 0
          ? 'engineering_review'
          : missingInputs.length > 0
            ? 'conditional_preview'
            : 'matched_direction';
      const publicLabel = derivePublicLabel(rule);
      const pairKey = directionPairKey({
        workpieceId: input.workpieceId!,
        routeId,
        processVariantId: purposeId,
      });
      const publicClaims = renderClaims(publicLabel, missingInputs, reviewInputs);
      return {
        directionId: `direction:${rule.ruleId}`,
        equipmentFamilyId: rule.equipmentFamilyId,
        publicLabel,
        publicLabelDerivationKey: rule.publicLabelDerivationKey,
        pairKey,
        publicationEligibility: rule.publicationEligibility,
        publicClaimScope: rule.publicClaimScope,
        resolutionStage,
        conditionEvaluation: evaluations,
        conditionalMessage:
          resolutionStage === 'conditional_preview' ? publicClaims.conditional_preview : null,
        publicClaims,
        equipmentOutput: {
          ...rule.equipmentOutput,
          processChain: [...rule.equipmentOutput.processChain],
        },
        conditions: [...rule.conditions],
        derivedFrom: [...rule.derivedFrom, `route:${routeId}`, `processPurpose:${purposeId}`],
        assumptions: [...rule.assumptions],
        requiredInputs: [...rule.requiredInputs],
        missingInputs,
        reviewInputs,
        evidenceRefs: [...rule.evidenceRefs],
        sourceDirectSupport: [...rule.sourceDirectSupport],
        engineeringDerivation: [...rule.engineeringDerivation],
        unverifiedEngineeringAssumptions: [...rule.unverifiedEngineeringAssumptions],
        evidenceSupportScope: rule.evidenceSupportScope,
        baselineEvidenceStatus: rule.baselineEvidenceStatus,
        ruleId: rule.ruleId,
        baselineVersion: rule.baselineVersion,
        confidence: rule.confidence,
        companyCapabilityStatus: companyCapabilityFor(rule.equipmentFamilyId, now, activeWhitelist),
        productHref: null,
      };
    });
}

function industryDirectionsFor(
  route: ProcessRoute,
  purposeId: string | null,
  input: WorkpieceSelectionInput,
  versionId: string,
  now: Date,
  activeWhitelist: WorkpieceCapabilityWhitelist,
) {
  return resolveIndustryDirectionRules(
    { ...input, routeId: route.id, processPurposeId: purposeId },
    { versionId, now, activeWhitelist },
  );
}

function difficultyPointsFor(
  workpieceId: string,
  candidateRoutes: ProcessRoute[],
  activeRoute: ProcessRoute | null,
) {
  const workpieceOverride = overrides.overrides.find((item) => item.workpieceId === workpieceId);
  if (activeRoute) {
    return takeDifficultyPoints(
      overrides.routeContentOverrides.find((item) => item.routeId === activeRoute.id)
        ?.difficultyPoints,
      workpieceOverride?.difficultyPoints,
      logicUnitById.get(activeRoute.logicUnitId)?.difficultyPoints,
    );
  }
  if (workpieceOverride) return takeDifficultyPoints(workpieceOverride.difficultyPoints);
  const unitIds = new Set(candidateRoutes.map((route) => route.logicUnitId));
  if (unitIds.size === 1) {
    return takeDifficultyPoints(logicUnitById.get([...unitIds][0])?.difficultyPoints);
  }
  return takeDifficultyPoints();
}

export function resolveWorkpieceDirections(
  input: WorkpieceSelectionInput,
  activeWhitelist: WorkpieceCapabilityWhitelist = whitelist,
): WorkpieceResolution {
  const {
    workpieceId,
    routeId,
    processPurposeId,
    routeHint,
    baselineVersion = baselineVersions.currentDraftVersion,
    now = new Date(),
  } = input;
  const workpiece = workpieceById.get(workpieceId);
  if (!workpiece) throw new Error(`Unknown workpiece: ${workpieceId}`);

  const candidates = eligibleRoutes(workpieceId, routeHint);
  const options = processOptionsFor(candidates);
  let activeRoute = routeId ? (candidates.find((route) => route.id === routeId) ?? null) : null;

  if (!activeRoute && routeHint) {
    activeRoute = candidates.find((route) => route.id === routeHint) ?? null;
  }
  if (!activeRoute && candidates.length === 1) activeRoute = candidates[0];

  let activePurpose = processPurposeId ?? null;
  if (activeRoute && activePurpose) {
    if (!activeRoute.processVariants.some((variant) => variant.id === activePurpose)) {
      activePurpose = null;
    }
  }
  if (activeRoute && !activePurpose && activeRoute.processVariants.length === 1) {
    activePurpose = activeRoute.processVariants[0].id;
  }

  const activeVariant = activeRoute?.processVariants.find((item) => item.id === activePurpose);
  const activeBaselineVersion = baselineVersion ?? baselineVersions.currentDraftVersion;
  const industryDirections =
    activeRoute &&
    activeRoute.moduleDisposition === 'in_scope' &&
    activeRoute.baselineEvidenceStatus !== 'special_process' &&
    (activeVariant || activeRoute.processVariants.length === 0)
      ? industryDirectionsFor(
          activeRoute,
          activeVariant?.id ?? null,
          input,
          activeBaselineVersion,
          now,
          activeWhitelist,
        )
      : [];
  const activeBaseline = baselineVersions.versions.find(
    (version) => version.baselineVersion === activeBaselineVersion,
  );
  const publicIndustryDirections =
    baselineIsApprovedForPublicDisplay(activeBaselineVersion) && activeBaseline
      ? industryDirections.filter((direction) => {
          const rule = directionRuleById.get(direction.ruleId);
          return Boolean(
            rule &&
            directionIsApprovedForPublic({
              direction,
              rule,
              baseline: activeBaseline,
              evidence: evidenceRecords,
              currentSnapshot: {
                resolverVersion: resolverConfig.resolverVersion,
                ...resolverConfig.snapshot,
              },
            }),
          );
        })
      : [];
  const processLabels = activeVariant
    ? activeVariant.processIds.flatMap((id) => (processById.has(id) ? [processById.get(id)!] : []))
    : [];
  const displayState: WorkpieceDisplayState =
    activeRoute?.moduleDisposition === 'outside_furnace_module'
      ? 'outside_module'
      : activeRoute?.baselineEvidenceStatus === 'special_process'
        ? 'special_process'
        : input.treatmentScope === 'local' || input.treatmentScope === 'field'
          ? 'engineering_review'
          : publicIndustryDirections.length > 0
            ? publicIndustryDirections.length === 1 &&
              publicIndustryDirections[0].resolutionStage === 'matched_direction'
              ? 'industry_direction'
              : 'conditional_directions'
            : !activeRoute || (activeRoute.processVariants.length > 0 && !activeVariant)
              ? 'insufficient_inputs'
              : industryDirections.length > 0
                ? 'engineering_review'
                : 'unverified';

  const requiredInputs = [
    ...new Set(industryDirections.flatMap((direction) => direction.requiredInputs)),
  ];
  const missingInputs = [
    ...new Set(industryDirections.flatMap((direction) => direction.missingInputs)),
  ];
  const assumptions = [
    ...new Set(industryDirections.flatMap((direction) => direction.assumptions)),
  ];
  const derivedFrom = [
    ...new Set(industryDirections.flatMap((direction) => direction.derivedFrom)),
  ];
  const evidenceRefs = [
    ...new Set(industryDirections.flatMap((direction) => direction.evidenceRefs)),
  ];

  return {
    categoryId: workpiece.categoryId,
    workpieceId: workpiece.id,
    workpieceName: workpiece.name,
    logicUnitId: activeRoute?.logicUnitId ?? null,
    routeId: activeRoute?.id ?? null,
    processPurposeId: activeVariant?.id ?? null,
    candidateRoutes: candidates.map((route) => route.id),
    processOptions: options,
    processLabels,
    industryDirections,
    publicIndustryDirections,
    requiredInputs,
    missingInputs,
    assumptions,
    derivedFrom,
    evidenceRefs,
    baselineEvidenceStatus: activeRoute?.baselineEvidenceStatus ?? null,
    companyCapabilityStatus: activeRoute?.companyCapabilityStatus ?? 'unknown',
    displayState,
    customerNote:
      activeRoute?.customerNote ?? '请选择处理目的，再结合材质、尺寸、装炉量和生产节拍判断。',
    difficultyPoints: difficultyPointsFor(workpieceId, candidates, activeRoute),
    selectionFactors: SELECTION_FACTORS.map((factor) => ({ ...factor })),
    baselineVersion: activeBaselineVersion,
  };
}

function exactSuggestions(term: string): SearchSuggestion[] {
  const normalized = normalizeSearchTerm(term);
  const broad = vocabulary.broadRules.find((rule) =>
    rule.terms.some((item) => normalizeSearchTerm(item) === normalized),
  );
  if (broad) {
    return broad.options.map((option) => ({
      targetWorkpieceId: option.type === 'workpiece' ? option.id : null,
      suggestionLabel: option.label,
      matchType: option.type === 'workpiece' ? 'broad' : 'unlisted',
    }));
  }

  const routed = vocabulary.routedAliases.filter(
    (item) => normalizeSearchTerm(item.term) === normalized,
  );
  if (routed.length > 0) {
    return routed.map((item) => ({
      targetWorkpieceId: item.targetWorkpieceId,
      routeHint: item.routeHint,
      suggestionLabel: item.suggestionLabel,
      matchType: 'routed_alias',
    }));
  }

  return vocabulary.entries.flatMap<SearchSuggestion>((entry): SearchSuggestion[] => {
    if (normalizeSearchTerm(entry.canonical) === normalized) {
      return [
        {
          targetWorkpieceId: entry.targetWorkpieceId,
          suggestionLabel: entry.suggestionLabel,
          matchType: 'canonical' as const,
        },
      ];
    }
    if (entry.strongAliases.some((alias) => normalizeSearchTerm(alias) === normalized)) {
      return [
        {
          targetWorkpieceId: entry.targetWorkpieceId,
          suggestionLabel: entry.suggestionLabel,
          matchType: 'strong_alias' as const,
        },
      ];
    }
    return [];
  });
}

export function searchWorkpieces(term: string): SearchResult {
  const normalized = normalizeSearchTerm(term);
  if (!normalized) return { kind: 'none', suggestions: [] };
  const exact = exactSuggestions(term);
  if (exact.length === 1) return { kind: 'unique', suggestions: [exact[0]] };
  if (exact.length > 1) return { kind: 'ambiguous', suggestions: exact };

  const fuzzy: SearchSuggestion[] = [];
  for (const item of vocabulary.routedAliases) {
    if (normalizeSearchTerm(item.term).includes(normalized)) {
      fuzzy.push({
        targetWorkpieceId: item.targetWorkpieceId,
        routeHint: item.routeHint,
        suggestionLabel: item.suggestionLabel,
        matchType: 'routed_alias',
      });
    }
  }
  for (const entry of vocabulary.entries) {
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

export function findWorkpiece(workpieceId: string) {
  return workpieceById.get(workpieceId) ?? null;
}
