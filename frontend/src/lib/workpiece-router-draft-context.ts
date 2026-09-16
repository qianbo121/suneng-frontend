import type { RawConditions, WorkpieceRouterDisplayState } from '@/lib/api/workpiece-router';

export type WorkpieceRouterDraftContext = {
  categoryId: string;
  workpieceId: string | null;
  searchTerm: string | null;
  processPurposeId: string | null;
  rawConditions: RawConditions;
  displayState: WorkpieceRouterDisplayState | 'purpose_unselected' | 'search_no_match';
  completedGroups: number;
  totalGroups: number;
  capturedAt: string;
};

const STORAGE_KEY = 'suneng_workpiece_router_draft_context_v1';
const EVENT_NAME = 'suneng:workpiece-router-draft-change';

let activeDraftContext: WorkpieceRouterDraftContext | null = null;

function cloneDraft(context: WorkpieceRouterDraftContext): WorkpieceRouterDraftContext {
  return JSON.parse(JSON.stringify(context)) as WorkpieceRouterDraftContext;
}

export function setActiveWorkpieceRouterDraft(context: WorkpieceRouterDraftContext) {
  activeDraftContext = cloneDraft(context);
  if (typeof window === 'undefined') return;
  try {
    window.sessionStorage.setItem(STORAGE_KEY, JSON.stringify(activeDraftContext));
  } catch {
    // A storage restriction must not block the existing inquiry entry.
  }
  window.dispatchEvent(new CustomEvent(EVENT_NAME, { detail: activeDraftContext }));
}

export function getActiveWorkpieceRouterDraft() {
  if (activeDraftContext) return cloneDraft(activeDraftContext);
  if (typeof window === 'undefined') return null;
  try {
    const stored = window.sessionStorage.getItem(STORAGE_KEY);
    if (!stored) return null;
    const parsed = JSON.parse(stored) as WorkpieceRouterDraftContext;
    if (!parsed.categoryId || !parsed.displayState) return null;
    activeDraftContext = parsed;
    return cloneDraft(activeDraftContext);
  } catch {
    return null;
  }
}

export function clearActiveWorkpieceRouterDraft() {
  activeDraftContext = null;
  if (typeof window === 'undefined') return;
  try {
    window.sessionStorage.removeItem(STORAGE_KEY);
  } catch {
    // Ignore storage restrictions.
  }
  window.dispatchEvent(new CustomEvent(EVENT_NAME, { detail: null }));
}

export function subscribeToWorkpieceRouterDraft(
  listener: (context: WorkpieceRouterDraftContext | null) => void,
) {
  const handler = (event: Event) => {
    listener((event as CustomEvent<WorkpieceRouterDraftContext | null>).detail);
  };
  window.addEventListener(EVENT_NAME, handler);
  return () => window.removeEventListener(EVENT_NAME, handler);
}
