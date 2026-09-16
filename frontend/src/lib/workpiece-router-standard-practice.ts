export type StandardPracticeDirectionExample = {
  condition: string;
  direction: string;
};

export type StandardPracticeDirectionSet = {
  displayWorkpieceName: string;
  examples: StandardPracticeDirectionExample[];
};

type StandardPracticeRule = {
  ruleId: string;
  publicationEligibility: string;
  internalExecutionStatus: string;
  baselineEvidenceStatus: string;
  publicLabelDerivationKey: string;
  equipmentOutput: {
    furnaceArchitecture: string;
  };
  allowedPairs: Array<{
    routeId: string;
    workpieceId: string;
    processVariantId: string;
  }>;
};

type StandardPracticeRoute = {
  id: string;
  reviewed: boolean;
  processVariants: Array<{
    id: string;
    processPurposeId?: string | null;
    label: string;
  }>;
};

type PublicLabelMapping = {
  architectureLabels: Record<string, string>;
  combinationOverrides: Record<string, string>;
};

type ApprovedCandidate = {
  candidateRuleIds: string[];
  candidateRules: Array<{
    selectedPairs: Array<{
      pairKey: string;
      workpieceId: string;
      publicWorkpieceName: string;
      publicProcessPurposeName: string;
    }>;
  }>;
};

const STANDARD_PRACTICE_ARCHITECTURES = new Set([
  'car_bottom',
  'vertical_pit',
  'continuous_line',
  'roller_hearth',
  'bell',
  'continuous_strip_line',
  'mesh_belt',
  'conveyor',
]);

const SPECIAL_WORKPIECES = new Set([
  'seamless-aluminum-gas-cylinder',
  'seamless-steel-gas-cylinder',
  'welded-steel-gas-cylinder',
  'large-die-block-forging',
]);

function pairKey(pair: { workpieceId: string; routeId: string; processVariantId: string }) {
  return `${pair.workpieceId}|${pair.routeId}|${pair.processVariantId}`;
}

export function buildStandardPracticeDirections(input: {
  rules: StandardPracticeRule[];
  routes: StandardPracticeRoute[];
  labelMapping: PublicLabelMapping;
  approvedCandidate: ApprovedCandidate;
  workpieceNames: Record<string, string>;
}) {
  const approvedRuleIds = new Set(input.approvedCandidate.candidateRuleIds);
  const approvedPairPresentation = new Map(
    input.approvedCandidate.candidateRules.flatMap((rule) =>
      rule.selectedPairs.map((pair) => [pair.pairKey, pair] as const),
    ),
  );
  const routeById = new Map(
    input.routes.filter((route) => route.reviewed).map((route) => [route.id, route]),
  );
  const grouped = new Map<string, Map<string, string[]>>();
  const displayNames = new Map<string, string>();

  for (const rule of input.rules) {
    if (rule.publicationEligibility === 'blocked' || rule.internalExecutionStatus !== 'eligible') {
      continue;
    }
    if (!STANDARD_PRACTICE_ARCHITECTURES.has(rule.equipmentOutput.furnaceArchitecture)) continue;
    if (rule.baselineEvidenceStatus !== 'partially_verified' && !approvedRuleIds.has(rule.ruleId)) {
      continue;
    }

    const direction =
      input.labelMapping.combinationOverrides[rule.publicLabelDerivationKey] ??
      input.labelMapping.architectureLabels[rule.equipmentOutput.furnaceArchitecture];
    if (!direction) continue;

    for (const pair of rule.allowedPairs) {
      if (SPECIAL_WORKPIECES.has(pair.workpieceId)) continue;
      const route = routeById.get(pair.routeId);
      const approvedPresentation = approvedPairPresentation.get(pairKey(pair));
      const condition =
        approvedPresentation?.publicProcessPurposeName ??
        route?.processVariants.find(
          (variant) =>
            variant.id === pair.processVariantId ||
            variant.processPurposeId === pair.processVariantId,
        )?.label;
      if (!condition || !input.workpieceNames[pair.workpieceId]) continue;

      const byDirection = grouped.get(pair.workpieceId) ?? new Map<string, string[]>();
      const conditions = byDirection.get(direction) ?? [];
      if (!conditions.includes(condition)) conditions.push(condition);
      byDirection.set(direction, conditions);
      grouped.set(pair.workpieceId, byDirection);
      displayNames.set(
        pair.workpieceId,
        approvedPresentation?.publicWorkpieceName ?? input.workpieceNames[pair.workpieceId],
      );
    }
  }

  return Object.fromEntries(
    [...grouped.entries()].map(([workpieceId, byDirection]) => [
      workpieceId,
      {
        displayWorkpieceName: displayNames.get(workpieceId) ?? input.workpieceNames[workpieceId],
        examples: [...byDirection.entries()].slice(0, 3).map(([direction, conditions]) => ({
          condition: conditions.join('、'),
          direction,
        })),
      },
    ]),
  ) as Record<string, StandardPracticeDirectionSet>;
}
