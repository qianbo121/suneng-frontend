import type {
  ConditionField,
  ConditionGroup,
  PublicDirection,
  RawConditionScalar,
  RawConditions,
  WorkpieceRouterDisplayState,
  WorkpieceRouterResolveResponse,
} from '@/lib/api/workpiece-router';

export function getVisibleMatchingBasis(direction: PublicDirection) {
  return [
    ...new Set([...(direction.qualifyingConditions ?? []), ...direction.matchingBasis]),
  ].slice(0, 2);
}

export function getConditionValue(rawConditions: RawConditions, fieldId: string): unknown {
  return fieldId.split('.').reduce<unknown>((value, segment) => {
    if (!value || typeof value !== 'object' || Array.isArray(value)) return undefined;
    return (value as Record<string, unknown>)[segment];
  }, rawConditions);
}

export function setConditionValue(
  rawConditions: RawConditions,
  fieldId: string,
  value: RawConditionScalar | undefined,
): RawConditions {
  const segments = fieldId.split('.').filter(Boolean);
  if (!segments.length) return rawConditions;
  const next = structuredClone(rawConditions);
  let cursor: Record<string, unknown> = next;

  segments.forEach((segment, index) => {
    if (index === segments.length - 1) {
      if (value === undefined || value === '') delete cursor[segment];
      else cursor[segment] = value;
      return;
    }
    const nested = cursor[segment];
    if (!nested || typeof nested !== 'object' || Array.isArray(nested)) {
      cursor[segment] = {};
    }
    cursor = cursor[segment] as Record<string, unknown>;
  });

  return next;
}

export function isConditionAnswered(rawConditions: RawConditions, field: ConditionField) {
  const value = getConditionValue(rawConditions, field.id);
  return value === 'unknown' || value === true || value === false || value === 0 || Boolean(value);
}

export function getNextField(
  group: ConditionGroup | undefined,
  rawConditions: RawConditions,
  preferredFieldId?: string | null,
) {
  if (!group) return null;
  if (preferredFieldId) {
    const preferred = group.fields.find((field) => field.id === preferredFieldId);
    if (preferred) return preferred;
  }
  return (
    group.fields.find((field) => field.required && !isConditionAnswered(rawConditions, field)) ??
    group.fields[0] ??
    null
  );
}

export function getConditionProgress(response: WorkpieceRouterResolveResponse | null) {
  if (!response) return { completed: 0, total: 0 };
  const total = Math.min(response.totalGroups, 3);
  return {
    completed: Math.min(response.completedGroups, total),
    total,
  };
}

export function getCtaLabel(
  purposeSelected: boolean,
  response: WorkpieceRouterResolveResponse | null,
) {
  if (!purposeSelected) return '提交工况，获取初步判断';
  if (!response || response.displayState === 'insufficient_conditions') {
    return '继续补充关键工况';
  }
  if (
    response.displayState === 'single_direction' ||
    response.displayState === 'multiple_directions'
  ) {
    return '提交工况，获取工程确认';
  }
  return '提交工况，由工程师进一步判断';
}

export function shouldContinueConditions(response: WorkpieceRouterResolveResponse | null) {
  return response?.displayState === 'insufficient_conditions' && Boolean(response.nextQuestion);
}

export function getResultHeading(displayState: WorkpieceRouterDisplayState) {
  if (displayState === 'single_direction') return '当前更可能的行业设备方向';
  if (displayState === 'multiple_directions') return '当前可能的行业设备方向';
  if (displayState === 'insufficient_conditions') return '还需要补充关键工况';
  if (displayState === 'special_process_boundary') return '该工况属于专项工艺边界';
  if (displayState === 'invalid_input') return '已填条件存在矛盾';
  if (displayState === 'completed_pending_engineering') return '已完成初步条件判断';
  return '现有条件暂时无法收敛到明确设备方向';
}
