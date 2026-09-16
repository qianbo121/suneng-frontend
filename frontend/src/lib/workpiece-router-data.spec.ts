import { readFileSync, readdirSync, statSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';

import baselineJson from '../../../data/workpiece-router/industry-baseline-versions.json';
import directionRulesJson from '../../../data/workpiece-router/industry-direction-rules.json';
import evidenceJson from '../../../data/workpiece-router/industry-evidence-registry.json';
import ontologyJson from '../../../data/workpiece-router/industry-input-ontology.json';
import labelMappingJson from '../../../data/workpiece-router/industry-public-label-mapping.json';
import publicSnapshotJson from '../../../data/workpiece-router/industry-public-direction-snapshot.json';
import resolverConfigJson from '../../../data/workpiece-router/industry-resolver-config.json';
import routesJson from '../../../data/workpiece-router/process-routes.json';
import manifestJson from '../../../data/workpiece-router/workpiece-card-manifest.json';

const rules = directionRulesJson.rules;
const routes = routesJson.routes;
const cards = manifestJson.categories.flatMap((category) => category.cards);
const pairKey = (pair: { workpieceId: string; routeId: string; processVariantId: string }) =>
  `${pair.workpieceId}|${pair.routeId}|${pair.processVariantId}`;

function sourceFiles(root: string): string[] {
  return readdirSync(root).flatMap((name) => {
    const path = join(root, name);
    if (statSync(path).isDirectory()) return sourceFiles(path);
    return /\.(ts|tsx|js|jsx|json)$/.test(name) && !name.endsWith('.spec.ts') ? [path] : [];
  });
}

describe('workpiece router batch-2.2 data and publication boundary', () => {
  it('preserves the audited 45-image, 37-route and 52-purpose foundation', () => {
    expect(manifestJson.categories).toHaveLength(8);
    expect(cards).toHaveLength(45);
    expect(routes).toHaveLength(37);
    expect(routes.flatMap((route) => route.processVariants)).toHaveLength(52);
  });

  it('keeps part form, posture and presentation independent, and derives support on the server', () => {
    expect(ontologyJson.independentAxes.partForm).toEqual([
      'discrete_part',
      'plate',
      'long_product',
      'coil',
      'strip',
      'irregular_assembly',
    ]);
    expect(ontologyJson.independentAxes.loadingOrientation).toEqual([
      'horizontal',
      'vertical',
      'flat',
      'suspended',
    ]);
    expect(ontologyJson.independentAxes).not.toHaveProperty('supportMethod');
    expect(ontologyJson.serverDerivedMaterialHandling).toMatchObject({
      directCustomerInputAllowed: false,
      outputField: 'supportMethod',
      values: [
        'mobile_hearth',
        'fixed_fixture',
        'roller',
        'mesh_belt',
        'tray_or_basket',
        'suspended',
        'coil_stack',
      ],
    });
    expect(ontologyJson.observableHandlingInputs).toHaveProperty('loadMovement');
    expect(ontologyJson.observableHandlingInputs).toHaveProperty('loadingAccess');
    expect(ontologyJson.observableHandlingInputs).toHaveProperty('baseSupportCondition');
    expect(ontologyJson.independentAxes.presentationState).toEqual([
      'coiled',
      'uncoiled',
      'stacked',
      'single_piece',
      'bulk_loaded',
    ]);
    expect(ontologyJson.forbiddenLegacyValues).toEqual(
      expect.arrayContaining(['coil', 'strip', 'roller_supported', 'fixture_supported']),
    );
  });

  it('separates atmosphere type from surface objective', () => {
    expect(ontologyJson.independentAxes.atmosphereType).toEqual([
      'air',
      'inert',
      'reducing',
      'protective',
      'controlled_carbon_potential',
      'controlled_carbon_nitrogen_potential',
    ]);
    expect(ontologyJson.independentAxes.surfaceObjective).toEqual([
      'normal',
      'low_oxidation',
      'bright',
      'scale_controlled',
    ]);
    expect(ontologyJson.independentAxes.atmosphereType).not.toContain('bright');
    expect(ontologyJson.independentAxes.atmosphereType).not.toContain(
      'controlled_process_atmosphere',
    );
  });

  it('migrates all 53 source rules to 56 executable rules with zero public eligibility', () => {
    expect(directionRulesJson.migration.originalRuleCount).toBe(53);
    expect(directionRulesJson.migration.originalRuleStatuses).toHaveLength(53);
    expect(directionRulesJson.migration.resultingRuleCount).toBe(56);
    expect(rules).toHaveLength(56);
    expect(rules.filter((rule) => rule.publicationEligibility === 'conditional_public')).toEqual(
      [],
    );
    expect(rules.filter((rule) => rule.publicationEligibility === 'internal_only')).toHaveLength(
      38,
    );
    expect(rules.filter((rule) => rule.publicationEligibility === 'blocked')).toHaveLength(18);
    expect(rules.filter((rule) => rule.internalExecutionStatus === 'eligible')).toHaveLength(21);
    expect(rules.filter((rule) => rule.internalExecutionStatus === 'pending_blocked')).toHaveLength(
      17,
    );
    expect(rules.filter((rule) => rule.internalExecutionStatus === 'blocked')).toHaveLength(18);
    expect(
      rules.find((rule) => rule.ruleId === 'eqdir-heavy-car-bottom-v1')?.publicationEligibility,
    ).toBe('internal_only');
  });

  it('never accepts a furnace support answer as a rule match input', () => {
    for (const rule of rules) {
      expect(rule.matchCriteria.some((criterion) => criterion.field === 'supportMethod')).toBe(
        false,
      );
      expect(rule.requiredInputs).not.toContain('supportMethod');
      expect(rule.handlingInference).toMatchObject({
        directAnswerAccepted: false,
        source: 'customer_observable_conditions',
      });
    }
    expect(ontologyJson.forbiddenClientInputs).toEqual(
      expect.arrayContaining(['supportMethod', 'serverEngineeringPredicates']),
    );
  });

  it('blocks every specified high-risk rule and keeps all seven candidates internal', () => {
    for (const ruleId of directionRulesJson.highRiskBlockedRuleIds) {
      expect(rules.find((rule) => rule.ruleId === ruleId)?.publicationEligibility).toBe('blocked');
    }
    expect(directionRulesJson.highRiskBlockedRuleIds).toHaveLength(17);
    expect(directionRulesJson.priorityCandidateRuleIds).toHaveLength(7);
    for (const ruleId of directionRulesJson.priorityCandidateRuleIds) {
      expect(rules.find((rule) => rule.ruleId === ruleId)?.publicationEligibility).toBe(
        'internal_only',
      );
    }
  });

  it('splits heavy car-bottom mappings and guards ductile iron by large-or-heavy truth', () => {
    const source = directionRulesJson.migration.originalRuleStatuses.find(
      (item) => item.sourceRuleId === 'eqdir-heavy-car-bottom-v1',
    );
    expect(source?.resultingRuleIds).toEqual([
      'eqdir-heavy-car-bottom-v1',
      'eqdir-heavy-hydrogen-relief-car-bottom-v2',
      'eqdir-heavy-ductile-iron-car-bottom-v2',
      'eqdir-heavy-normalize-temper-car-bottom-v2',
    ]);
    const ductile = rules.find((rule) => rule.ruleId === 'eqdir-heavy-ductile-iron-car-bottom-v2')!;
    expect(ductile.requiredEngineeringPredicates).toContain('largeOrHeavy');
    expect(ductile.allowedPairs.every((pair) => pair.workpieceId === 'ductile-iron-casting')).toBe(
      true,
    );
  });

  it('enumerates allowed pairs and their illegal complement without implicit Cartesian products', () => {
    const allowedPairs = rules.flatMap((rule) => rule.allowedPairs);
    const allowed = new Set(allowedPairs.map(pairKey));
    for (const rule of rules) {
      expect(new Set(rule.allowedPairs.map(pairKey)).size).toBe(rule.allowedPairs.length);
    }
    expect(allowed.size).toBeLessThanOrEqual(allowedPairs.length);
    const routeUniverse = routes.flatMap((route) =>
      route.workpieceIds.flatMap((workpieceId) =>
        route.processVariants.map((variant) => `${workpieceId}|${route.id}|${variant.id}`),
      ),
    );
    const illegalComplement = routeUniverse.filter((key) => !allowed.has(key));
    expect(illegalComplement.length).toBeGreaterThan(0);
    expect(allowed.has('aluminum-alloy-plate|plate-batch-anneal-normalize|normalizing')).toBe(
      false,
    );
    expect(
      allowed.has('medium-heavy-steel-plate|aluminum-plate-anneal-aging|artificial-aging'),
    ).toBe(false);
    expect(
      allowed.has(
        'wear-resistant-steel-plate|aluminum-plate-solution-quench-review|solution-quench',
      ),
    ).toBe(false);
  });

  it('uses exact equipment fields and derives every public label from their combination', () => {
    for (const rule of rules) {
      expect(rule).not.toHaveProperty('publicLabel');
      expect(rule).not.toHaveProperty('publicLabelKey');
      expect(rule.equipmentOutput.operationMode).not.toContain('_or_');
      expect(rule.equipmentOutput.furnaceArchitecture).not.toContain('_or_');
      expect(rule.publicLabelDerivationKey).toBe(
        `${rule.equipmentOutput.operationMode}|${rule.equipmentOutput.furnaceArchitecture}|${rule.equipmentOutput.processChainProfile}`,
      );
      expect(
        labelMappingJson.combinationOverrides[
          rule.publicLabelDerivationKey as keyof typeof labelMappingJson.combinationOverrides
        ],
      ).toBeTruthy();
      expect(rule.equipmentOutput.materialHandling).toHaveProperty('supportMethod');
      expect(rule.equipmentOutput.atmosphereCapability).toHaveProperty('atmosphereTypes');
      expect(rule.equipmentOutput).toHaveProperty('coolingIntegration');
    }
    expect(Object.values(labelMappingJson.combinationOverrides)).not.toContain('水平支撑周期炉');
    expect(Object.values(labelMappingJson.combinationOverrides)).not.toContain('辊道连续式炉');
    expect(Object.values(labelMappingJson.combinationOverrides)).toContain('辊底式连续热处理炉/线');
  });

  it('maps every critical assumption to predicates or a non-matchable guard', () => {
    for (const rule of rules) {
      expect(rule.assumptionPolicies).toHaveLength(rule.assumptions.length);
      for (const policy of rule.assumptionPolicies) {
        if (policy.disposition === 'required_engineering_predicates') {
          expect(policy.predicateIds.length).toBeGreaterThan(0);
          expect(
            policy.predicateIds.every((id) => rule.requiredEngineeringPredicates.includes(id)),
          ).toBe(true);
        } else {
          expect(rule.nonMatchableAssumptions).toContain(policy.text);
        }
      }
    }
  });

  it('classifies DOE as taxonomy, downgrades Surface, and keeps only one mapping unverified', () => {
    expect(
      evidenceJson.evidence.find(
        (item) => item.evidenceId === 'tech-us-doe-process-heating-sourcebook3-2015',
      ),
    ).toMatchObject({
      evidenceType: 'taxonomy_reference',
      status: 'current',
      verificationStatus: 'full_text_verified',
    });
    const mappings = evidenceJson.evidence.filter(
      (item) => item.evidenceType === 'application_mapping',
    );
    expect(mappings).toHaveLength(14);
    expect(
      mappings.filter(
        (item) => item.status === 'current' && item.verificationStatus === 'full_text_verified',
      ),
    ).toHaveLength(13);
    expect(
      mappings.find((item) => item.evidenceId === 'candidate-appmap-heavy-car-bottom'),
    ).toMatchObject({
      evidenceRole: 'equipment_capability_reference',
      directPairSupport: false,
    });
    expect(
      mappings
        .filter((item) => item.status === 'unverified' && item.verificationStatus === 'unverified')
        .map((item) => item.evidenceId),
    ).toEqual(['candidate-appmap-long-products-roller-quench-temper']);
  });

  it('stores the complete unsigned approval record and all snapshot hashes', () => {
    const draft = baselineJson.versions.find(
      (item) => item.baselineVersion === baselineJson.currentDraftVersion,
    )!;
    expect(draft).toMatchObject({
      publicationStatus: 'draft',
      approvedRuleIds: [],
      approvedPairKeys: [],
      approvedScopeHash: resolverConfigJson.snapshot.approvedScopeHash,
      publicClaimTemplateHash: resolverConfigJson.snapshot.publicClaimTemplateHash,
      publicLabelMappingHash: resolverConfigJson.snapshot.publicLabelMappingHash,
      rulePriorityHash: resolverConfigJson.snapshot.rulePriorityHash,
      ruleSetHash: resolverConfigJson.snapshot.ruleSetHash,
      evidenceSnapshotHash: resolverConfigJson.snapshot.evidenceSnapshotHash,
      resolverVersion: resolverConfigJson.resolverVersion,
      approvedBy: null,
      approvedRole: null,
      approvedAt: null,
      lockedAt: null,
      locked: false,
    });
    expect(baselineJson.publicBaselineVersion).toBeNull();
  });

  it('does not place internal rules, evidence or labels in the public snapshot or app source', () => {
    expect(publicSnapshotJson).toMatchObject({
      publicBaselineVersion: null,
      rules: [],
      evidence: [],
      labels: {},
      claimTemplates: {},
    });
    const publicSource = [join(process.cwd(), 'src/app'), join(process.cwd(), 'src/components')]
      .flatMap(sourceFiles)
      .map((path) => readFileSync(path, 'utf8'))
      .join('\n');
    const serverCatalogSource = readFileSync(
      join(process.cwd(), 'src/lib/workpiece-router-public.server.ts'),
      'utf8',
    );
    expect(serverCatalogSource.startsWith("import 'server-only';")).toBe(true);
    expect(publicSource).not.toContain('industry-direction-rules.json');
    expect(publicSource).not.toContain('industry-evidence-registry.json');
    expect(publicSource).not.toContain('candidate-appmap-');
    expect(publicSource).not.toContain('eqdir-heavy-car-bottom-v1');
  });

  it('keeps gas-cylinder, aluminum-cylinder transfer, ADI and local-treatment routes excluded', () => {
    const excluded = new Set(directionRulesJson.excludedRouteIds);
    const usedRoutes = new Set(
      rules.flatMap((rule) => rule.allowedPairs.map((pair) => pair.routeId)),
    );
    for (const route of routes.filter(
      (item) =>
        item.id.includes('gas-cylinder') ||
        item.id === 'aluminum-cylinder-solution-quench' ||
        item.id === 'ductile-iron-austempering-review' ||
        item.moduleDisposition === 'outside_furnace_module',
    )) {
      expect(excluded.has(route.id)).toBe(true);
      expect(usedRoutes.has(route.id)).toBe(false);
    }
  });
});
