import { apiPost, safeApiGet } from '@/lib/api/client';

export type RawConditionScalar = string | number | boolean;
export type RawConditions = Record<string, RawConditionScalar | Record<string, unknown>>;

export type WorkpieceRouterDisplayState =
  | 'insufficient_conditions'
  | 'single_direction'
  | 'multiple_directions'
  | 'completed_pending_engineering'
  | 'engineering_review'
  | 'no_match'
  | 'invalid_input'
  | 'special_process_boundary';

export type ConditionOption = {
  value: string | boolean;
  label: string;
};

export type ConditionField = {
  id: string;
  label: string;
  type: 'text' | 'number' | 'choice' | 'boolean_choice';
  required: boolean;
  unit?: string;
  placeholder?: string;
  options?: ConditionOption[];
};

export type ConditionGroup = {
  id: string;
  label: string;
  summary: string;
  completed: boolean;
  fields: ConditionField[];
};

export type PublicDirection = {
  name: string;
  resolutionStage?: 'conditional_preview' | 'matched_direction';
  publicStatement?: string;
  matchingBasis: string[];
  stillNeedConfirm: string[];
  qualifyingConditions?: string[];
};

export type WorkpieceRouterResolveResponse = {
  displayState: WorkpieceRouterDisplayState;
  conditionGroups: ConditionGroup[];
  completedGroups: number;
  totalGroups: number;
  missingInputs: string[];
  nextQuestion: {
    groupId: string;
    fieldId: string;
    prompt: string;
  } | null;
  publicDirections: PublicDirection[];
  customerNote: string;
  /** Only browser-test fixtures may set this. The production API omits it. */
  testState?: true;
};

export type WorkpieceRouterResolveRequest = {
  workpieceId: string;
  processPurposeId: string;
  rawConditions: RawConditions;
};

export type PublicDirectionExample = {
  position?: number;
  condition: string;
  direction: string;
  adoption?: '采用' | '有条件采用';
  boundary?: string;
};

export type WorkpieceDirectionExamplesResponse = {
  workpieceId: string;
  displayWorkpieceName?: string;
  examples: PublicDirectionExample[];
  customerNote: string;
};

const ALLOWED_RAW_CONDITION_ROOTS = new Set([
  'materialFamily',
  'materialGrade',
  'applicableStandard',
  'drawingRequirement',
  'weldingProcedure',
  'processRequirement',
  'maximumThickness',
  'dimensionLength',
  'dimensionWidth',
  'dimensionHeight',
  'dimensionDiameter',
  'dimensionUnit',
  'singlePieceWeightKg',
  'fixtureWeightKg',
  'batchLoadWeightKg',
  'centerOfGravityX',
  'centerOfGravityY',
  'centerOfGravityZ',
  'supportSpanMm',
  'shaftEquivalentSectionMm',
  'shaftSlendernessRatio',
  'allowableDeflectionMm',
  'horizontalLoadingAllowed',
  'supportPointCount',
  'supportPointLayout',
  'entryPath',
  'partForm',
  'loadingOrientation',
  'presentationState',
  'atmosphereType',
  'surfaceObjective',
  'quenchRequired',
  'quenchMedium',
  'transferConstraint',
  'coolingRateRequirement',
  'agitationOrFlowRequirement',
  'distortionConstraint',
  'priorHeatTreatmentState',
  'temperingPurpose',
  'drawingOrProcessCardConfirmed',
  'treatmentChainMode',
  'pipeTreatmentScope',
  'coilProcessingForm',
  'coatingState',
  'wearPlateConstruction',
  'fastenerMaterialClass',
  'nutConstruction',
  'wholeComponentQuenchTemper',
  'integrationPreference',
  'austenitizing',
  'transfer',
  'quench',
  'cleaning_if_required',
  'tempering',
  'final_cooling',
  'solution_heating',
  'rapid_transfer',
  'rapid_cooling',
  'batchQuantity',
  'batchSize',
  'targetThroughput',
  'productMix',
  'changeoverFrequency',
  'cycleTimeExpectation',
  'loadingContinuity',
  'operationPreference',
  'loadMovement',
  'loadingAccess',
  'baseSupportCondition',
  'continuousContactAllowed',
  'floorLoadingRequired',
  'suspensionAllowed',
  'stackingAllowed',
  'bulkLoadingSuitable',
  'treatmentScope',
  'localProcessType',
]);

function cloneSafeValue(value: unknown): unknown {
  if (typeof value === 'string' || typeof value === 'boolean') return value;
  if (typeof value === 'number' && Number.isFinite(value)) return value;
  if (!value || typeof value !== 'object' || Array.isArray(value)) return undefined;

  const cloned = Object.fromEntries(
    Object.entries(value)
      .map(([key, nested]) => [key, cloneSafeValue(nested)] as const)
      .filter(
        (entry): entry is [string, string | number | boolean | Record<string, unknown>] =>
          entry[1] !== undefined,
      ),
  );
  return cloned;
}

export function sanitizeRawConditions(rawConditions: RawConditions): RawConditions {
  return Object.fromEntries(
    Object.entries(rawConditions)
      .filter(([key]) => ALLOWED_RAW_CONDITION_ROOTS.has(key))
      .map(([key, value]) => [key, cloneSafeValue(value)] as const)
      .filter(
        (entry): entry is [string, RawConditionScalar | Record<string, unknown>] =>
          entry[1] !== undefined,
      ),
  );
}

export function resolveWorkpieceRouter(request: WorkpieceRouterResolveRequest) {
  return apiPost<WorkpieceRouterResolveResponse, WorkpieceRouterResolveRequest>(
    '/workpiece-router/resolve',
    {
      body: {
        workpieceId: request.workpieceId,
        processPurposeId: request.processPurposeId,
        rawConditions: sanitizeRawConditions(request.rawConditions),
      },
      timeoutMs: 5000,
    },
  );
}

export async function getWorkpieceDirectionExamples(workpieceId: string) {
  const result = await safeApiGet<WorkpieceDirectionExamplesResponse>(
    `/workpiece-router/examples/${encodeURIComponent(workpieceId)}`,
    { cache: 'no-store', timeoutMs: 5000 },
  );
  if (!result.data) throw new Error(result.error ?? 'Unable to load public direction examples');
  return result.data;
}
