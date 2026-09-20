import { describe, expect, it } from 'vitest';

import baselineJson from '../../../data/workpiece-router/industry-baseline-versions.json';
import claimTemplatesJson from '../../../data/workpiece-router/industry-public-claim-templates.json';
import directionRulesJson from '../../../data/workpiece-router/industry-direction-rules.json';
import evidenceJson from '../../../data/workpiece-router/industry-evidence-registry.json';
import labelMappingJson from '../../../data/workpiece-router/industry-public-label-mapping.json';
import resolverConfigJson from '../../../data/workpiece-router/industry-resolver-config.json';
import {
  approvedBaselineSnapshotMatches,
  canonicalizeSnapshotValue,
  directionIsApprovedForPublic,
  directionPairKey,
  resolveIndustryDirectionRules,
  resolveWorkpieceDirections,
  searchWorkpieces,
  type EvidenceRecord,
  type IndustryDirectionRule,
  type PublicClaimTemplates,
  type PublicLabelMapping,
  type WorkpieceSelectionInput,
} from '../../tests/support/legacy-workpiece-router';

const rules = directionRulesJson.rules as unknown as IndustryDirectionRule[];
const evidence = evidenceJson.evidence as unknown as EvidenceRecord[];
const labelMapping = labelMappingJson as unknown as PublicLabelMapping;
const claimTemplates = claimTemplatesJson.templates as PublicClaimTemplates;
const priorityRules = rules.filter((rule) =>
  directionRulesJson.priorityCandidateRuleIds.includes(rule.ruleId as never),
);

function rulePair(rule: IndustryDirectionRule, index = 0) {
  return rule.allowedPairs[index];
}

function completeInput(rule: IndustryDirectionRule, pair = rulePair(rule)) {
  const input: Record<string, unknown> = {
    workpieceId: pair.workpieceId,
    routeId: pair.routeId,
    processPurposeId: pair.processVariantId,
  };
  for (const predicate of rule.matchCriteria) input[predicate.field] = predicate.allowedValues[0];
  if (rule.operationInference.mode === 'continuous') {
    Object.assign(input, {
      batchSize: 'large',
      targetThroughput: 'high',
      productMix: 'stable',
      changeoverFrequency: 'rare',
      cycleTimeExpectation: 'tight',
      loadingContinuity: 'continuous',
    });
  } else if (rule.operationInference.mode === 'batch') {
    Object.assign(input, {
      batchSize: 'medium',
      targetThroughput: 'medium',
      productMix: 'high_mix',
      changeoverFrequency: 'frequent',
      cycleTimeExpectation: 'flexible',
      loadingContinuity: 'discrete',
    });
  } else {
    input.treatmentScope = rule.operationInference.mode;
  }
  for (const field of rule.requiredProcessStages) input[field] = true;
  if (rule.requiredInputs.includes('quenchRequired')) {
    Object.assign(input, {
      quenchRequired: true,
      quenchMedium: 'oil',
      transferConstraint:
        rule.equipmentOutput.processChainProfile === 'solution_quench' ? 'rapid' : 'bounded',
      coolingRateRequirement:
        rule.equipmentOutput.processChainProfile === 'solution_quench'
          ? 'rapid'
          : 'process_defined',
      agitationOrFlowRequirement: 'process_defined',
      distortionConstraint: 'controlled',
    });
  }
  return input as WorkpieceSelectionInput;
}

function resolveInternal(input: Partial<WorkpieceSelectionInput>, activeRules = rules) {
  return resolveIndustryDirectionRules(input, {
    rules: activeRules,
    evidenceRecords: evidence,
    labelMapping,
    claimTemplates,
  });
}

describe('workpiece router Batch 2.3 client trust boundary', () => {
  it('returns no rule when identity input is empty', () => {
    expect(resolveInternal({})).toEqual([]);
  });

  it('uses conditional_preview for partial input and never treats unknown as true', () => {
    const rule = priorityRules[0];
    const pair = rulePair(rule);
    const result = resolveInternal(
      {
        workpieceId: pair.workpieceId,
        routeId: pair.routeId,
        processPurposeId: pair.processVariantId,
      },
      [rule],
    );
    expect(result).toHaveLength(1);
    expect(result[0].resolutionStage).toBe('conditional_preview');
    expect(result[0].conditionEvaluation.every((item) => item.state !== 'true')).toBe(true);
    expect(result[0].publicClaims.conditional_preview).toContain('仍需工程复核');
  });

  it('tests omitted, null, unknown and false for every required input of all seven candidates', () => {
    expect(priorityRules).toHaveLength(7);
    for (const rule of priorityRules) {
      for (const field of rule.requiredInputs) {
        for (const replacement of ['omitted', null, 'unknown', false] as const) {
          const input = completeInput(rule) as unknown as Record<string, unknown>;
          if (replacement === 'omitted') delete input[field];
          else input[field] = replacement;
          const result = resolveInternal(input as Partial<WorkpieceSelectionInput>, [rule]);
          expect(
            result.some((direction) => direction.resolutionStage === 'matched_direction'),
            `${rule.ruleId}:${field}:${String(replacement)}`,
          ).toBe(false);
        }
      }
    }
  });

  it('does not let the client inject a false engineering result either', () => {
    const rule = priorityRules[0];
    const input = completeInput(rule) as unknown as Record<string, unknown>;
    input.loadCapacityCompatible = false;
    const result = resolveInternal(input as WorkpieceSelectionInput, [rule]);
    expect(result[0]).toMatchObject({
      resolutionStage: 'conditional_preview',
      missingInputs: expect.arrayContaining(['loadCapacityCompatible']),
    });
  });

  it('never matches an assumption that was not converted to an engineering predicate', () => {
    const original = priorityRules[0];
    const rule = { ...original, nonMatchableAssumptions: ['尚未转为可判断谓词的关键假设'] };
    expect(resolveInternal(completeInput(rule), [rule])[0].resolutionStage).toBe(
      'engineering_review',
    );
  });

  it('does not let posture or part form substitute for another axis', () => {
    const rule = priorityRules.find(
      (item) => item.ruleId === 'eqdir-carbon-steel-coil-bell-batch-v2',
    )!;
    const valid = completeInput(rule) as unknown as Record<string, unknown>;
    expect(resolveInternal(valid as WorkpieceSelectionInput, [rule])[0].resolutionStage).toBe(
      'conditional_preview',
    );
    for (const mutation of [
      { loadingOrientation: 'coil' },
      { loadingOrientation: 'roller_supported' },
      { partForm: 'suspended' },
    ]) {
      expect(resolveInternal({ ...valid, ...mutation } as WorkpieceSelectionInput, [rule])).toEqual(
        [],
      );
    }
  });

  it('does not substitute protective, bright and controlled process atmosphere', () => {
    const rule = rules.find((item) => item.ruleId === 'eqdir-carbon-steel-coil-bell-batch-v2')!;
    const base = completeInput(rule) as unknown as Record<string, unknown>;
    expect(resolveInternal(base as WorkpieceSelectionInput, [rule])[0].resolutionStage).toBe(
      'conditional_preview',
    );
    for (const atmosphereType of [
      'bright',
      'controlled_process_atmosphere',
      'controlled_carbon_potential',
    ]) {
      expect(
        resolveInternal({ ...base, atmosphereType } as WorkpieceSelectionInput, [rule]),
      ).toEqual([]);
    }
  });

  it('does not infer continuous equipment from customer preference alone', () => {
    const rule = priorityRules.find(
      (item) => item.ruleId === 'eqdir-long-products-roller-thermal-v2',
    )!;
    const pair = rulePair(rule);
    const result = resolveInternal(
      {
        workpieceId: pair.workpieceId,
        routeId: pair.routeId,
        processPurposeId: pair.processVariantId,
        operationPreference: 'continuous',
      },
      [rule],
    );
    expect(result[0].resolutionStage).toBe('conditional_preview');
    expect(result[0].missingInputs).toContain('operationInference');
  });

  it('requires every essential quench-temper stage and keeps the full chain', () => {
    const rule = rules.find((item) => item.ruleId === 'eqdir-wear-plate-quench-temper-line-v2')!;
    expect(rule.equipmentOutput.processChain).toEqual([
      'austenitizing',
      'transfer',
      'quench',
      'cleaning_if_required',
      'tempering',
      'final_cooling',
    ]);
    for (const stage of ['austenitizing', 'transfer', 'quench', 'tempering', 'final_cooling']) {
      const input = completeInput(rule) as unknown as Record<string, unknown>;
      delete input[stage];
      expect(resolveInternal(input as WorkpieceSelectionInput, [rule])[0].resolutionStage).toBe(
        'conditional_preview',
      );
    }
  });

  it('requires solution heating, rapid transfer and rapid cooling separately', () => {
    const rule = rules.find((item) => item.ruleId === 'eqdir-aluminum-plate-solution-quench-v2')!;
    expect(rule.equipmentOutput.processChain).toEqual([
      'solution_heating',
      'rapid_transfer',
      'rapid_cooling',
    ]);
    expect(rule.internalExecutionStatus).toBe('blocked');
    for (const stage of ['solution_heating', 'rapid_transfer', 'rapid_cooling']) {
      const input = completeInput(rule) as unknown as Record<string, unknown>;
      delete input[stage];
      expect(resolveInternal(input as WorkpieceSelectionInput, [rule])).toEqual([]);
    }
  });

  it('keeps multi-rule candidates deterministic by explicit priority', () => {
    const candidates = rules.filter((rule) =>
      rule.allowedPairs.some(
        (pair) =>
          pair.workpieceId === 'large-forged-shaft' &&
          pair.routeId === 'heavy-steel-normalize-temper-anneal' &&
          pair.processVariantId === 'normalizing',
      ),
    );
    const result = resolveInternal(
      {
        workpieceId: 'large-forged-shaft',
        routeId: 'heavy-steel-normalize-temper-anneal',
        processPurposeId: 'normalizing',
        batchSize: 'medium',
        targetThroughput: 'medium',
        productMix: 'high_mix',
        changeoverFrequency: 'frequent',
        cycleTimeExpectation: 'flexible',
        loadingContinuity: 'discrete',
      },
      candidates,
    );
    const priorities = result.map(
      (item) => candidates.find((rule) => rule.ruleId === item.ruleId)!.priority,
    );
    expect(priorities).toEqual([...priorities].sort((a, b) => a - b));
  });

  it('canonicalizes object key order without changing snapshot content', () => {
    expect(canonicalizeSnapshotValue({ b: 2, a: { d: 4, c: 3 } })).toBe(
      canonicalizeSnapshotValue({ a: { c: 3, d: 4 }, b: 2 }),
    );
  });

  it('does not match when dimensions and weight are provided but server compatibility remains unknown', () => {
    const rule = priorityRules[0];
    const input = {
      ...completeInput(rule),
      dimensions: { length: 1200, width: 600, height: 400 },
      weight: 1800,
    };
    expect(resolveInternal(input, [rule])[0]).toMatchObject({
      resolutionStage: 'conditional_preview',
      missingInputs: expect.arrayContaining(['loadEnvelopeCompatible', 'loadCapacityCompatible']),
    });
  });

  it.each(['loadEnvelopeCompatible', 'loadCapacityCompatible'] as const)(
    'ignores client-supplied %s=false and keeps the server result unknown',
    (field) => {
      const rule = priorityRules[0];
      const input = {
        ...completeInput(rule),
        dimensions: { length: 1200, width: 600, height: 400 },
        weight: 1800,
      };
      const untrusted = { ...input, [field]: false } as unknown as WorkpieceSelectionInput;
      const result = resolveInternal(untrusted, [rule]);
      expect(result[0]).toMatchObject({
        resolutionStage: 'conditional_preview',
        missingInputs: expect.arrayContaining([field]),
      });
    },
  );

  it('exposes no client option that can promote a rule to matched_direction', () => {
    const rule = priorityRules[0];
    const input = completeInput(rule);
    expect(resolveInternal(input, [rule])[0].resolutionStage).toBe('conditional_preview');
  });

  it('does not trust compatibility booleans supplied in frontend selection input', () => {
    const rule = priorityRules[0];
    const untrustedInput = completeInput(rule) as unknown as Record<string, unknown>;
    for (const field of rule.requiredEngineeringPredicates) untrustedInput[field] = true;
    const result = resolveInternal(untrustedInput as WorkpieceSelectionInput, [rule]);
    expect(result[0].resolutionStage).toBe('conditional_preview');
    expect(result[0].missingInputs).toEqual(
      expect.arrayContaining(rule.requiredEngineeringPredicates),
    );
  });
});

describe('workpiece router batch-2.2.1 local and field process boundaries', () => {
  it.each([
    ['local', 'large-welded-machine-frame'],
    ['field', 'pressure-vessel-shell'],
  ] as const)(
    'keeps %s PWHT in engineering_review without ordinary furnace or company claims',
    (scope, workpieceId) => {
      const publicResult = resolveWorkpieceDirections({
        workpieceId,
        routeId: 'welded-stress-relief',
        processPurposeId: 'post-weld-heat-treatment',
        treatmentScope: scope,
      });
      expect(publicResult.displayState).toBe('engineering_review');
      expect(publicResult.publicIndustryDirections).toEqual([]);
      expect(publicResult.industryDirections).toEqual([]);

      const rule = rules.find((item) => item.operationInference.mode === scope)!;
      const input = completeInput(
        rule,
        rule.allowedPairs.find((pair) => pair.workpieceId === workpieceId)!,
      );
      const internalResult = resolveInternal({ ...input, treatmentScope: scope }, [rule]);
      expect(internalResult).toHaveLength(1);
      expect(internalResult[0]).toMatchObject({
        publicClaimScope: 'process_system_direction',
        resolutionStage: 'conditional_preview',
        companyCapabilityStatus: 'unknown',
        productHref: null,
      });
      expect(internalResult[0].equipmentOutput.operationMode).toBe(scope);
      expect(internalResult[0].publicLabel).not.toMatch(/台车|井式|箱式|辊底/);
      expect(Object.values(internalResult[0].publicClaims).join('')).not.toContain('苏能可提供');
    },
  );

  it.each([
    ['gear-shaft', 'shaft-gear-local-hardening-external'],
    ['track-roller', 'undercarriage-local-hardening-external'],
    ['steel-pins', 'steel-pin-local-hardening-external'],
  ] as const)(
    'uses outside_module as the special_process_boundary for %s local induction hardening',
    (workpieceId, routeId) => {
      const result = resolveWorkpieceDirections({
        workpieceId,
        routeId,
        processPurposeId: 'local-surface-hardening',
      });
      expect(result.displayState).toBe('outside_module');
      expect(result.industryDirections).toEqual([]);
      expect(result.publicIndustryDirections).toEqual([]);
      expect(result.companyCapabilityStatus).toBe('unknown');
    },
  );

  it('keeps online welded-pipe seam treatment outside ordinary furnace directions end to end', () => {
    const result = resolveWorkpieceDirections({
      workpieceId: 'welded-steel-pipe',
      routeId: 'welded-pipe-local-seam-treatment-external',
      processPurposeId: 'local-weld-seam-treatment',
    });
    expect(result).toMatchObject({
      routeId: 'welded-pipe-local-seam-treatment-external',
      processPurposeId: 'local-weld-seam-treatment',
      displayState: 'outside_module',
      companyCapabilityStatus: 'unknown',
      industryDirections: [],
      publicIndustryDirections: [],
    });
    expect(result.processLabels).toEqual(['在线局部焊缝热处理']);
    expect(JSON.stringify(result)).not.toMatch(/台车式|井式|辊底式|箱式|产品链接|苏能可提供/);
  });
});

describe('workpiece router Batch 2.3 pending-blocked boundary', () => {
  it('does not produce internal candidates for any of the 17 pending-blocked rules', () => {
    const pendingRules = rules.filter((rule) => rule.internalExecutionStatus === 'pending_blocked');
    expect(pendingRules).toHaveLength(17);
    for (const rule of pendingRules) {
      expect(resolveInternal(completeInput(rule), [rule])).toEqual([]);
    }
  });
});

describe('workpiece router batch-2.2 approval intersection and tamper gates', () => {
  const currentSnapshot = {
    resolverVersion: resolverConfigJson.resolverVersion,
    ...resolverConfigJson.snapshot,
  };
  const draft = baselineJson.versions.find(
    (item) => item.baselineVersion === baselineJson.currentDraftVersion,
  )!;

  it('invalidates resolver, rules, evidence, names, copy, priority and approved scope independently', () => {
    expect(approvedBaselineSnapshotMatches(draft, currentSnapshot)).toBe(true);
    for (const key of [
      'resolverVersion',
      'ruleSetHash',
      'evidenceSnapshotHash',
      'publicLabelMappingHash',
      'publicClaimTemplateHash',
      'rulePriorityHash',
      'approvedScopeHash',
    ] as const) {
      expect(
        approvedBaselineSnapshotMatches(draft, { ...currentSnapshot, [key]: 'sha256:tampered' }),
      ).toBe(false);
    }
  });

  it('publishes only the approved rule and pair intersection with verified pair evidence', () => {
    const sourceRule = priorityRules[0];
    const rule = { ...sourceRule, publicationEligibility: 'conditional_public' as const };
    const direction = resolveInternal(completeInput(rule), [rule])[0];
    const appIds = new Set(rule.pairEvidence[direction.pairKey].applicationMappingRefs);
    const appId = [...appIds][0];
    const verifiedEvidence = evidence.map((item) =>
      item.evidenceId === appId
        ? {
            ...item,
            status: 'current' as const,
            accessLevel: 'full_text' as const,
            verificationStatus: 'full_text_verified' as const,
          }
        : item,
    );
    const approved = {
      ...draft,
      publicationStatus: 'approved' as const,
      locked: true,
      lockedAt: '2026-08-27T16:30:00+08:00',
      approvedRuleIds: [rule.ruleId],
      approvedPairKeys: [direction.pairKey],
    };
    expect(
      directionIsApprovedForPublic({
        direction,
        rule,
        baseline: approved,
        evidence: verifiedEvidence,
        currentSnapshot,
      }),
    ).toBe(true);
    expect(
      directionIsApprovedForPublic({
        direction,
        rule,
        baseline: { ...approved, approvedPairKeys: ['wrong|pair|key'] },
        evidence: verifiedEvidence,
        currentSnapshot,
      }),
    ).toBe(false);
    for (const publicationEligibility of ['internal_only', 'blocked'] as const) {
      expect(
        directionIsApprovedForPublic({
          direction,
          rule: { ...rule, publicationEligibility },
          baseline: approved,
          evidence: verifiedEvidence,
          currentSnapshot,
        }),
      ).toBe(false);
    }
    expect(
      directionIsApprovedForPublic({
        direction,
        rule: { ...rule, internalExecutionStatus: 'pending_blocked' },
        baseline: approved,
        evidence: verifiedEvidence,
        currentSnapshot,
      }),
    ).toBe(false);
    expect(
      directionIsApprovedForPublic({
        direction,
        rule,
        baseline: approved,
        evidence: verifiedEvidence.map((item) =>
          appIds.has(item.evidenceId) ? { ...item, status: 'withdrawn' } : item,
        ) as EvidenceRecord[],
        currentSnapshot,
      }),
    ).toBe(false);
  });

  it('keeps unsigned internal rules out of the public runtime and preserves search', () => {
    const result = resolveWorkpieceDirections({
      workpieceId: 'large-forged-shaft',
      routeId: 'heavy-steel-normalize-temper-anneal',
      processPurposeId: 'normalizing',
    });
    expect(result.industryDirections).toEqual([]);
    expect(result.publicIndustryDirections).toEqual([]);
    expect(searchWorkpieces('大型焊接机架').kind).toBe('unique');
    expect(searchWorkpieces('气瓶').kind).toBe('ambiguous');
  });

  it('uses the exact pair key order stored in approval scope', () => {
    const pair = priorityRules[0].allowedPairs[0];
    expect(directionPairKey(pair)).toBe(
      `${pair.workpieceId}|${pair.routeId}|${pair.processVariantId}`,
    );
  });
});
