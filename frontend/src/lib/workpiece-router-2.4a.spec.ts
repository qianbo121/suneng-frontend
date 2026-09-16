import { afterEach, describe, expect, it, vi } from 'vitest';

import {
  resolveWorkpieceRouter,
  sanitizeRawConditions,
  type ConditionGroup,
  type WorkpieceRouterResolveResponse,
} from '@/lib/api/workpiece-router';
import {
  getActiveWorkpieceContext,
  setActiveWorkpieceContext,
} from '@/lib/workpiece-selection-context';
import {
  clearActiveWorkpieceRouterDraft,
  getActiveWorkpieceRouterDraft,
  setActiveWorkpieceRouterDraft,
} from '@/lib/workpiece-router-draft-context';
import {
  getConditionValue,
  getCtaLabel,
  getNextField,
  getVisibleMatchingBasis,
  setConditionValue,
  shouldContinueConditions,
} from '@/lib/workpiece-router-ui-state';

const conditionGroup: ConditionGroup = {
  id: 'dimensions',
  label: '尺寸与装载',
  summary: '待补充',
  completed: false,
  fields: [
    { id: 'dimensionLength', label: '长度', type: 'number', required: true },
    { id: 'batchLoadWeightKg', label: '批次重量', type: 'number', required: true },
  ],
};

function response(
  overrides: Partial<WorkpieceRouterResolveResponse> = {},
): WorkpieceRouterResolveResponse {
  return {
    displayState: 'insufficient_conditions',
    conditionGroups: [conditionGroup],
    completedGroups: 0,
    totalGroups: 1,
    missingInputs: ['dimensionLength'],
    nextQuestion: {
      groupId: 'dimensions',
      fieldId: 'dimensionLength',
      prompt: '请填写长度',
    },
    publicDirections: [],
    customerNote: '请继续补充',
    ...overrides,
  };
}

afterEach(() => {
  vi.unstubAllEnvs();
  vi.restoreAllMocks();
  clearActiveWorkpieceRouterDraft();
});

describe('batch 2.4A dynamic condition state', () => {
  it('stores the flat raw field ids returned by the server contract', () => {
    const next = setConditionValue({}, 'dimensionLength', 4200);
    expect(next).toEqual({ dimensionLength: 4200 });
    expect(getConditionValue(next, 'dimensionLength')).toBe(4200);
  });

  it('treats unknown as an answered question and advances to the next field', () => {
    const raw = setConditionValue({}, 'dimensionLength', 'unknown');
    expect(getNextField(conditionGroup, raw)?.id).toBe('batchLoadWeightKg');
  });

  it('keeps condition continuation separate from inquiry submission states', () => {
    const pending = response();
    expect(shouldContinueConditions(pending)).toBe(true);
    expect(getCtaLabel(true, pending)).toBe('继续补充关键工况');
    expect(
      getCtaLabel(
        true,
        response({
          displayState: 'single_direction',
          nextQuestion: null,
          publicDirections: [{ name: '测试设备方向', matchingBasis: [], stillNeedConfirm: [] }],
        }),
      ),
    ).toBe('提交工况，获取工程确认');
    expect(getCtaLabel(false, null)).toBe('提交工况，获取初步判断');
  });

  it('prefers server-verified qualifying conditions over generic filled-field labels', () => {
    const publicDirection = {
      name: '测试设备方向',
      publicStatement: '已批准的工程确认提示。',
      matchingBasis: ['普通已填条件', '备用条件'],
      qualifyingConditions: ['服务端已核对的方向门禁'],
      stillNeedConfirm: [],
    };
    expect(getVisibleMatchingBasis(publicDirection)).toEqual([
      '服务端已核对的方向门禁',
      '普通已填条件',
    ]);
  });
});

describe('batch 2.4A client trust boundary', () => {
  it('removes forged compatibility, rule and equipment capability fields', () => {
    expect(
      sanitizeRawConditions({
        dimensionLength: 4200,
        batchLoadWeightKg: 8000,
        processRequirement: '目标性能由图纸确认',
        loadEnvelopeCompatible: true,
        serverEngineeringPredicates: { loadCapacityCompatible: true },
        ruleId: 'eqdir-forged',
        candidateEquipmentCapability: { maxLoadKg: 999999 },
        furnaceName: '伪造炉型',
      }),
    ).toEqual({
      dimensionLength: 4200,
      batchLoadWeightKg: 8000,
      processRequirement: '目标性能由图纸确认',
    });
  });

  it('posts only identity and sanitized raw customer conditions', async () => {
    vi.stubEnv('NEXT_PUBLIC_API_URL', 'http://localhost:3001/api');
    const fetchMock = vi.spyOn(globalThis, 'fetch').mockResolvedValue(
      new Response(JSON.stringify({ code: 0, data: response(), message: 'ok' }), {
        status: 200,
        headers: { 'content-type': 'application/json' },
      }),
    );

    await resolveWorkpieceRouter({
      workpieceId: 'large-welded-machine-frame',
      processPurposeId: 'stress-relief',
      rawConditions: {
        batchLoadWeightKg: 8000,
        loadCapacityCompatible: true,
        ruleId: 'eqdir-forged',
      },
    });

    const [url, init] = fetchMock.mock.calls[0];
    expect(url).toBe('http://localhost:3001/api/workpiece-router/resolve');
    expect(JSON.parse(String(init?.body))).toEqual({
      workpieceId: 'large-welded-machine-frame',
      processPurposeId: 'stress-relief',
      rawConditions: { batchLoadWeightKg: 8000 },
    });
  });

  it('stores CTA draft separately and does not alter the legacy inquiry context', () => {
    setActiveWorkpieceContext({
      categoryId: 'welded-structures',
      workpieceId: 'large-welded-machine-frame',
      searchTerm: null,
      processPurposeId: 'stress-relief',
      logicUnitId: 'logic-unit',
      routeId: 'route',
      displayState: 'engineering_review',
    });
    const legacyBefore = getActiveWorkpieceContext();

    setActiveWorkpieceRouterDraft({
      categoryId: 'welded-structures',
      workpieceId: 'large-welded-machine-frame',
      searchTerm: null,
      processPurposeId: 'stress-relief',
      rawConditions: { batchLoadWeightKg: 8000 },
      displayState: 'completed_pending_engineering',
      completedGroups: 3,
      totalGroups: 3,
      capturedAt: '2026-08-27T00:00:00.000Z',
    });

    expect(getActiveWorkpieceRouterDraft()?.rawConditions).toEqual({
      batchLoadWeightKg: 8000,
    });
    expect(getActiveWorkpieceContext()).toEqual(legacyBefore);
    expect(getActiveWorkpieceContext()).not.toHaveProperty('rawConditions');
  });
});
