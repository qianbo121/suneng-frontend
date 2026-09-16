import type { WorkpieceDisplayState } from '@/lib/workpiece-router';

export type WorkpieceSelectionContext = {
  categoryId: string;
  workpieceId: string | null;
  searchTerm: string | null;
  processPurposeId: string | null;
  logicUnitId: string | null;
  routeId: string | null;
  displayState: WorkpieceDisplayState;
};

const STORAGE_KEY = 'suneng_workpiece_selection_context_v1';
const EVENT_NAME = 'suneng:workpiece-selection-change';

let activeContext: WorkpieceSelectionContext | null = null;

export function setActiveWorkpieceContext(context: WorkpieceSelectionContext) {
  activeContext = context;
  if (typeof window === 'undefined') return;
  try {
    window.sessionStorage.setItem(STORAGE_KEY, JSON.stringify(context));
  } catch {
    // Storage restrictions must not interrupt workpiece selection or inquiry submission.
  }
  window.dispatchEvent(new CustomEvent(EVENT_NAME, { detail: context }));
}

export function getActiveWorkpieceContext() {
  if (activeContext) return activeContext;
  if (typeof window === 'undefined') return null;
  try {
    const stored = window.sessionStorage.getItem(STORAGE_KEY);
    if (!stored) return null;
    const parsed = JSON.parse(stored) as WorkpieceSelectionContext;
    if (!parsed.categoryId || !parsed.displayState) return null;
    activeContext = parsed;
    return activeContext;
  } catch {
    return null;
  }
}

export function subscribeToWorkpieceContext(
  listener: (context: WorkpieceSelectionContext) => void,
) {
  const handler = (event: Event) => {
    listener((event as CustomEvent<WorkpieceSelectionContext>).detail);
  };
  window.addEventListener(EVENT_NAME, handler);
  return () => window.removeEventListener(EVENT_NAME, handler);
}
